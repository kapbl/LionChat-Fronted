<template>
    <div class="chat-container">
        <div class="chat-header chat-header-center">
            <span v-if="currentChatName">{{ currentChatName }}</span>
            <span v-else>select</span>
            <div v-if="currentChatName" class="header-actions">
                <button @click="startVoiceCall" class="voice-call-btn" title="语音通话">
                    📞
                </button>
            </div>
        </div>
        <div class="messages">
            <div v-for="(msg, idx) in messages" :key="idx" :class="['message', msg.from === myUuid ? 'self' : 'other']">
                <div class="msg-bubble">
                    <span class="sender">{{ msg.fromUsername }}：</span>
                    <span v-if="msg.contentType === 2" class="content">
                        📎 文件：<a :href="msg.url" download>{{ msg.content }}</a> ({{ formatFileSize(msg.file?.length) }})
                    </span>
                    <span v-else-if="msg.contentType === 3" class="content">
                        🖼️ 图片：<img :src="msg.url" style="max-width: 200px; border-radius: 4px; cursor: pointer;" @click="previewImage(msg.url)">
                    </span>
                    <span v-else-if="msg.contentType === 5" class="content">
                        🎥 视频：<video :src="msg.url" style="max-width: 200px; border-radius: 4px; cursor: pointer;" @click="previewVideo(msg.url)"></video>
                    </span>
                    <span v-if="msg.contentType === 4" class="content">
                        🎤 语音消息：
                        <audio :src="msg.url" controls style="vertical-align: middle"></audio>
                        ({{ formatDuration(msg.duration) }})
                    </span>
                    <span v-else class="content">{{ msg.content }}</span>

                    <span class="timestamp">{{ formatTime(msg.timestamp) }}</span>
                </div>
            </div>
        </div>
        <div class="input-area-wrap">
            <div class="input-actions input-actions-top">
                <button class="input-action-btn" @click="toggleEmojiPanel" title="发送表情">😊</button>

                <input type="file" ref="fileInput" style="display: none" @change="handleFileSelect">
                <button class="input-action-btn" @click="$refs.fileInput.click()" title="发送文件">📄</button>

                <button class="input-action-btn" @click="toggleRecording" :class="{ recording: isRecording }"
                    title="语音消息">
                    {{ isRecording ? '⏹' : '🎤' }}
                </button>

                <button class="input-action-btn" @click="showNotImpl('视频')" title="发送视频">🎥</button>
            </div>
            <div v-if="showEmojiPanel" class="emoji-panel" ref="emojiPanelRef">
                <span v-for="emoji in emojiList" :key="emoji" class="emoji-item" @click="insertEmoji(emoji)">{{ emoji
                    }}</span>
            </div>
            <div class="input-area">
                <textarea v-model="input" @keyup.enter="sendMessage" placeholder="输入消息..." rows="1"
                    class="msg-textarea" />
                <button @click="sendMessage">发送</button>
            </div>
        </div>
        <div v-if="!wsConnected" class="ws-status">WebSocket 未连接</div>
        
        <!-- 图片预览模态框 -->
        <div v-if="showImagePreview" class="image-preview-modal" @click="closeImagePreview">
            <div class="image-preview-container">
                <img :src="previewImageUrl" class="preview-image" @click.stop>
                <button class="close-preview-btn" @click="closeImagePreview">×</button>
            </div>
        </div>
        
        <!-- 视频预览模态框 -->
        <div v-if="showVideoPreview" class="video-preview-modal" @click="closeVideoPreview">
            <div class="video-preview-container">
                <video :src="previewVideoUrl" class="preview-video" controls @click.stop></video>
                <button class="close-preview-btn" @click="closeVideoPreview">×</button>
            </div>
        </div>
        
        <!-- WebRTC语音通话组件 -->
        <WebRTCVoiceCall
            v-if="MessageType"
            ref="voiceCallRef"
            :my-uuid="myUuid"
            :my-name="myName"
            :message-type="MessageType"
            @call-started="onCallStarted"
            @call-ended="onCallEnded"
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import protobuf from 'protobufjs'
import { useRoute } from 'vue-router'
import { formatFileSize } from '@/utils/format'
import { emojiList } from '@/components/chat2/emoji'
import { initWebSocket, closeWebSocket, getWebSocket } from '@/components/chat2/websocket'
import { toUuid,currentChatTargetName,currentChatID } from './state.js'
import WebRTCVoiceCall from './WebRTCVoiceCall.vue'

const route = useRoute()
const sessionKey = route.query.session || 'default'
const chatMessages = ref({}) // { [uuid]: [msg, ...] }
const messages = computed(() => chatMessages.value[toUuid.value] || [])
const input = ref('')
const userinfo = JSON.parse(localStorage.getItem(`userinfo_${sessionKey}`) || '{}')
const myName = userinfo.nickname || '我'
const myUuid = userinfo.uuid
const MessageType = ref(null)
let ws = null
const wsConnected = ref(false)
// 当前消息类型，1=单聊，2=群聊
const messageType = ref(1)
// 加好友请求消息框
const showFriendRequest = ref(false)
const friendRequestInfo = ref({
    fromUsername: '',
    content: '',
    from: ''
})
// 加好友请求回复消息框
const showFriendReplyRequest = ref(false)
const friendResponseInfo = ref({
    fromUsername: '',
    content: '',
    from: ''
})
const currentChatName = computed(() => {
    return currentChatTargetName.value
})
// 文件传输
const fileInput = ref(null)
// const currentChatID = ref(0)
// 录制语音消息
const isRecording = ref(false)
const mediaRecorder = ref(null)
const audioChunks = ref([])
const audioBlob = ref(null)
const showEmojiPanel = ref(false)
const emojiPanelRef = ref(null)
// 图片和视频预览
const showImagePreview = ref(false)
const showVideoPreview = ref(false)
const previewImageUrl = ref('')
const previewVideoUrl = ref('')
// WebRTC语音通话
const voiceCallRef = ref(null)
async function handleFileSelect(event) {
    const file = event.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (e) => {
        const fileBuffer = new Uint8Array(e.target.result)
        const fileName = file.name
        const suffix = file.name.split('.').pop()
        sendFileMessage({
            fileName,
            fileBuffer,
            suffix
        })
    }
    reader.readAsArrayBuffer(file)
}
function sendFileMessage(fileData) {
    if (!MessageType.value || !wsConnected.value) return
    
    let contentType = 2; // 默认为文件类型
    let type = 'file';
    
    // 根据文件后缀判断类型
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'];
    if (imageExtensions.includes(fileData.suffix.toLowerCase())) {
        contentType = 3;
        type = 'image';
    } else if (videoExtensions.includes(fileData.suffix.toLowerCase())) {
        contentType = 5;
        type = 'video';
    }
    
    const msgObj = {
        avatar: '',
        fromUsername: myName,
        from: myUuid,
        to: toUuid.value,
        content: fileData.fileName,
        contentType: contentType,
        type: type,
        messageType: messageType.value,
        url: URL.createObjectURL(new Blob([fileData.fileBuffer])),
        fileSuffix : fileData.suffix,
        file: fileData.fileBuffer,
    }
    const messageBuffer = MessageType.value.encode(MessageType.value.create(msgObj)).finish()
    ws.send(messageBuffer)
    if (!chatMessages.value[toUuid.value]) chatMessages.value[toUuid.value] = []
    chatMessages.value[toUuid.value].push({
        ...msgObj,
        timestamp: Date.now()
    })
}
async function toggleRecording() {
    if (!isRecording.value) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            audioChunks.value = []
            mediaRecorder.value = new MediaRecorder(stream)

            mediaRecorder.value.ondataavailable = e => {
                audioChunks.value.push(e.data)
            }

            mediaRecorder.value.onstop = async () => {
                audioBlob.value = new Blob(audioChunks.value, { type: 'audio/webm' })
                const arrayBuffer = await audioBlob.value.arrayBuffer()
                sendVoiceMessage({
                    audioBuffer: new Uint8Array(arrayBuffer),
                    duration: Math.round(audioBlob.value.duration)
                })
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorder.value.start()
            isRecording.value = true
        } catch (e) {
            alert('麦克风访问被拒绝')
        }
    } else {
        mediaRecorder.value.stop()
        isRecording.value = false
    }
}
function sendVoiceMessage(voiceData) {
    if (!MessageType.value || !wsConnected.value) return
    const msgObj = {
        ...voiceData,
        avatar: '',
        fromUsername: myName,
        from: myUuid,
        to: toUuid.value,
        content: '语音消息',
        contentType: 4,
        type: 'audio',
        messageType: messageType.value,
        url: URL.createObjectURL(audioBlob.value),
        file: voiceData.audioBuffer
    }

    const messageBuffer = MessageType.value.encode(MessageType.value.create(msgObj)).finish()
    ws.send(messageBuffer)

    if (!chatMessages.value[toUuid.value]) chatMessages.value[toUuid.value] = []
    chatMessages.value[toUuid.value].push({
        ...msgObj,
        timestamp: Date.now()
    })
}
// 添加时长格式化工具
function formatDuration(seconds) {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = String(seconds % 60).padStart(2, '0')
    return `${mins}:${secs}`
}
// 保存未读消息计数到localStorage
function saveUnreadCounts() {
    const unreadCounts = {}
    // 保存好友的未读消息计数
    friends.value.forEach(friend => {
        if (friend.unread > 0) {
            unreadCounts[friend.uuid] = friend.unread
        }
    })
    // 保存群组的未读消息计数
    groups.value.forEach(group => {
        if (group.unread > 0) {
            unreadCounts[group.uuid] = group.unread
        }
    })
    localStorage.setItem(`unreadCounts_${sessionKey}`, JSON.stringify(unreadCounts))
}
// WebSocket 长轮询
onMounted(async () => {
    // 加载 proto
    const root = await protobuf.load('/message.proto')
    MessageType.value = root.lookup('protocol.Message')
    initWebSocket(sessionKey, handleWebSocketMessage, myUuid, MessageType.value)

    ws = getWebSocket()
    if (ws) {
        wsConnected.value = ws.readyState === WebSocket.OPEN
        ws.addEventListener('open', () => (wsConnected.value = true))
        ws.addEventListener('close', () => (wsConnected.value = false))
    }
})
// 添加分片管理器
const fragmentManager = new Map(); // 存储待重组的分片
// 处理 WebSocket 消息
function handleWebSocketMessage(event) {
    if (!MessageType.value) return;
    
    const buffer = new Uint8Array(event.data);
    const decodedBuffer = MessageType.value.decode(buffer);
    var decoded = decodedBuffer;
    if (decodedBuffer.isFragmented) {
        // 处理分片消息
        const completeMessage = handleFragmentedMessage(decodedBuffer);
        if (!completeMessage) {
            console.log("分片消息未完成")
            // 消息还未完整，等待更多分片
            return;
        }
        // 使用重组后的完整消息
        decoded = completeMessage;
    }
    
    const { from, to, file } = decoded;
    const isPrivateMessage = to === myUuid;
    const chatId = isPrivateMessage ? from : to;
    console.log(decoded)
    try {
        switch (decoded.contentType) {
            case 1: // 文本消息
                handleTextMessage(decoded, chatId, isPrivateMessage);
                break;
            case 2: // 文件消息
                handleFileMessage(decoded, chatId, isPrivateMessage);
                break;
            case 3: // 图片消息
                handleImageMessage(decoded, chatId, isPrivateMessage);
                break;
            case 4: // 音频消息
                handleAudioMessage(decoded, chatId, isPrivateMessage);
                break;
            case 5: // 视频消息
                handleVideoMessage(decoded, chatId, isPrivateMessage);
                break;
            case 6: // WebRTC信令消息
                handleWebRTCSignaling(decoded);
                break;
            case 8: // 好友请求
                handleFriendRequest(decoded);
                break;
            case 9: // 好友回复
                handleFriendResponse(decoded);
                break;
            default:
                console.log("未知消息类型")
                break;
        }
        
        saveUnreadCounts();
    } catch (e) {
         console.log("未知消息类型")
    }
}

// 分片消息处理函数
function handleFragmentedMessage(fragment) {
    const messageId = fragment.messageId;
    
    if (!fragmentManager.has(messageId)) {
        fragmentManager.set(messageId, {
            fragments: new Array(fragment.totalFragments),
            receivedCount: 0,
            timestamp: Date.now()
        });
    }
    
    const messageInfo = fragmentManager.get(messageId);
    
    // 检查是否已经收到过这个分片
    if (messageInfo.fragments[fragment.fragmentIndex]) {
        console.warn(`重复收到分片 ${fragment.fragmentIndex}`);
        return null;
    }
    
    // 存储分片
    messageInfo.fragments[fragment.fragmentIndex] = fragment;
    messageInfo.receivedCount++;
    
    console.log(`收到分片 ${fragment.fragmentIndex + 1}/${fragment.totalFragments}`);
    
    // 检查是否收到所有分片
    if (messageInfo.receivedCount === fragment.totalFragments) {
        const completeMessage = reassembleMessage(messageInfo.fragments);
        fragmentManager.delete(messageId);
        console.log('消息重组完成:', messageId);
        return completeMessage;
    }
    
    return null;
}

// 消息重组函数
function reassembleMessage(fragments) {
    // 按索引排序确保正确顺序
    fragments.sort((a, b) => a.fragmentIndex - b.fragmentIndex);
    
    // 拼接所有分片的file字段（这是序列化的protobuf数据）
    let totalSize = 0;
    fragments.forEach(fragment => {
        if (fragment.file) {
            totalSize += fragment.file.length;
        }
    });
    
    const serializedData = new Uint8Array(totalSize);
    let offset = 0;
    
    fragments.forEach(fragment => {
        if (fragment.file) {
            serializedData.set(fragment.file, offset);
            offset += fragment.file.length;
        }
    });
    
    // 关键步骤：反序列化protobuf数据恢复原始消息
    try {
        const originalMessage = MessageType.value.decode(serializedData);
        originalMessage.isFragmented = false;
        console.log(originalMessage)
        return originalMessage;
    } catch (error) {
        console.error('反序列化失败:', error);
        return null;
    }
}

// 重构后的消息处理函数
function handleTextMessage(decoded, chatId, isPrivateMessage) {
    updateUnreadCount(chatId, isPrivateMessage);
    addMessageToChat(chatId, decoded);
}

function handleFileMessage(decoded, chatId, isPrivateMessage) {
    console.log("type: ",decoded.fileSuffix)
    // 创建文件URL
    decoded.url = URL.createObjectURL(
        new Blob([decoded.file], { type: getMimeType(decoded.fileSuffix) })
    );
    console.log(decoded)
    updateUnreadCount(chatId, isPrivateMessage);
    addMessageToChat(chatId, decoded);
}

function handleImageMessage(decoded, chatId, isPrivateMessage) {
    console.log("图片消息: ", decoded.fileSuffix)
    // 创建图片URL
    decoded.url = URL.createObjectURL(
        new Blob([decoded.file], { type: getMimeType(decoded.fileSuffix) })
    );
    updateUnreadCount(chatId, isPrivateMessage);
    addMessageToChat(chatId, decoded);
}

function handleVideoMessage(decoded, chatId, isPrivateMessage) {
    decoded.url = URL.createObjectURL(
        new Blob([decoded.file], { type: getMimeType(decoded.fileSuffix) })
    );
    updateUnreadCount(chatId, isPrivateMessage);
    addMessageToChat(chatId, decoded);
}

function handleAudioMessage(decoded, chatId, isPrivateMessage) {
    decoded.url = URL.createObjectURL(
        new Blob([decoded.file], { getType: getMimeType(decoded.fileSuffix) })
    );
    updateUnreadCount(chatId, isPrivateMessage);
    addMessageToChat(chatId, decoded);
}

function handleFriendRequest(decoded) {
    friendRequestInfo.value = {
        fromUsername: decoded.fromUsername,
        content: decoded.content,
        from: decoded.from
    };
    showFriendRequest.value = true;
}

function handleFriendResponse(decoded) {
    friendResponseInfo.value = {
        fromUsername: decoded.fromUsername,
        content: decoded.content,
        from: decoded.from
    };
    showFriendReplyRequest.value = true;
}

// WebRTC信令消息处理
function handleWebRTCSignaling(decoded) {
    if (voiceCallRef.value) {
        voiceCallRef.value.handleSignalingMessage(decoded);
    }
}

// 发起语音通话
function startVoiceCall() {
    if (!toUuid.value || !currentChatName.value) {
        alert('请先选择聊天对象');
        return;
    }
    
    if (voiceCallRef.value) {
        voiceCallRef.value.startCall(toUuid.value, currentChatName.value);
    }
}

// 通话开始事件
function onCallStarted() {
    console.log('语音通话已开始');
}

// 通话结束事件
function onCallEnded() {
    console.log('语音通话已结束');
}

// 辅助函数
function updateUnreadCount(chatId, isPrivateMessage) {
    console.log(chatId)
    console.log(currentChatID.value)
    if (currentChatID.value !== chatId) {
        const targetCollection = isPrivateMessage ? friends.value : groups.value;
        const targetUpdate = targetCollection.find(item => item.uuid === chatId);
        if (targetUpdate) {
            targetUpdate.unread++;
        }
    }
}

function addMessageToChat(chatId, decoded) {
    chatMessages.value[chatId] ??= [];
    console.log("audio: ", decoded)
    chatMessages.value[chatId].push({
        ...decoded,
        timestamp: Date.now()
    });
}

function getMimeType(fileSuffix) {
    const mimeTypes = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'mp4': 'video/mp4',
        'avi': 'video/x-msvideo',
        'mov': 'video/quicktime',
        'wmv': 'video/x-ms-wmv',
        'flv': 'video/x-flv',
        'mkv': 'video/x-matroska',
        'pdf': 'application/pdf',
        'txt': 'text/plain',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
        '7z': 'application/x-7z-compressed',
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'aac': 'audio/aac',
        'flac': 'audio/flac',
        'ogg': 'audio/ogg',
        'm4a': 'audio/m4a',
    };
    return mimeTypes[fileSuffix?.toLowerCase()] || 'application/octet-stream';
}

// 定期清理过期的分片（可选）
setInterval(() => {
    const now = Date.now();
    const timeout = 30000; // 30秒超时
    
    for (const [messageId, messageInfo] of fragmentManager.entries()) {
        if (now - messageInfo.timestamp > timeout) {
            console.warn(`清理过期分片: ${messageId}`);
            fragmentManager.delete(messageId);
        }
    }
}, 10000); // 每10秒检查一次

onBeforeUnmount(() => {
    closeWebSocket()
})
function formatTime(ts) {
    const date = new Date(ts)
    return date.toLocaleTimeString()
}
// 发送消息
function sendMessage() {
    if (!input.value.trim() || !MessageType.value || !wsConnected.value) return
    if (!toUuid.value.trim()) {
        alert('请先选择聊天对象')
        return
    }
    // 消息体
    const msgObj = {
        avatar: '',
        fromUsername: myName,
        from: myUuid,
        to: toUuid.value,
        content: input.value,
        contentType: 1, // 文字
        type: '',
        messageType: messageType.value, // 单聊或群聊
        url: '',
        fileSuffix: '',
        file: new Uint8Array(),
    }
    const errMsg = MessageType.value.verify(msgObj)
    if (errMsg) {
        alert('消息格式错误: ' + errMsg)
        return
    }
    const messageBuffer = MessageType.value.encode(MessageType.value.create(msgObj)).finish()
    ws.send(messageBuffer)
    // 本地也显示消息
    if (!chatMessages.value[toUuid.value]) chatMessages.value[toUuid.value] = []
    chatMessages.value[toUuid.value].push({ ...msgObj, timestamp: Date.now() })
    input.value = ''
}
function showNotImpl(type) {
    alert(type + '功能暂未实现')
}
function toggleEmojiPanel() {
    showEmojiPanel.value = !showEmojiPanel.value
    if (showEmojiPanel.value) {
        nextTick(() => {
            document.addEventListener('mousedown', handleClickOutside)
        })
    } else {
        document.removeEventListener('mousedown', handleClickOutside)
    }
}
function handleClickOutside(e) {
    if (emojiPanelRef.value && !emojiPanelRef.value.contains(e.target)) {
        showEmojiPanel.value = false
        document.removeEventListener('mousedown', handleClickOutside)
    }
}
function insertEmoji(emoji) {
    input.value += emoji
    showEmojiPanel.value = false
    document.removeEventListener('mousedown', handleClickOutside)
}
onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside)
})

// 图片预览函数
function previewImage(url) {
    previewImageUrl.value = url
    showImagePreview.value = true
}

function closeImagePreview() {
    showImagePreview.value = false
    previewImageUrl.value = ''
}

// 视频预览函数
function previewVideo(url) {
    previewVideoUrl.value = url
    showVideoPreview.value = true
}

function closeVideoPreview() {
    showVideoPreview.value = false
    previewVideoUrl.value = ''
}
</script>

<style scoped>
.create-group-btn:hover {
    background: #369870;
}
.add-friend-btn {
    background: #42b983;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 4px 12px;
    font-size: 14px;
    cursor: pointer;
    margin-left: 8px;
    transition: background 0.2s;
}

.chat-container {
    flex: 1;
    margin: 0;
    border: 1px solid #ddd;
    border-radius: 0;
    background: #fafafa;
    display: flex;
    flex-direction: column;
    height: 100vh;
    min-width: 0;
}

.chat-header {
    height: 48px;
    line-height: 48px;
    font-size: 18px;
    font-weight: bold;
    color: #333;
    padding: 0 24px;
    border-bottom: 1px solid #eee;
    background: #f7f7f7;
}

.chat-header-center {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    letter-spacing: 2px;
    position: relative;
}

.chat-header-center > span {
    flex: 1;
    text-align: center;
}

.header-actions {
    display: flex;
    gap: 8px;
    align-items: center;
}

.voice-call-btn {
    background: #42b983;
    color: white;
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.voice-call-btn:hover {
    background: #369870;
    transform: scale(1.1);
}

.voice-call-btn:active {
    transform: scale(0.95);
}

.messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
}

.message {
    display: flex;
    margin-bottom: 12px;
}

.message.self {
    justify-content: flex-end;
}

.message.other {
    justify-content: flex-start;
}

.msg-bubble {
    padding: 8px 12px;
    border-radius: 16px;
    max-width: 80%;
    word-break: break-all;
    display: inline-block;
    position: relative;
}

.message.self .msg-bubble {
    background: #d1f5d3;
    color: #222;
    border-bottom-right-radius: 4px;
    border-bottom-left-radius: 16px;
    align-items: flex-end;
}

.message.other .msg-bubble {
    background: #e6e6e6;
    color: #222;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 16px;
    align-items: flex-start;
}

.sender {
    font-weight: bold;
    margin-right: 6px;
}

.timestamp {
    color: #888;
    font-size: 12px;
    margin-left: 8px;
}

.input-area-wrap {
    display: flex;
    flex-direction: column;
    border-top: 1px solid #eee;
    background: #fff;
    position: relative;
}

.input-actions-top {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 4px 0 0 0;
    margin-left: 2px;
    margin-bottom: 2px;
    gap: 4px;
}

.input-area {
    display: flex;
    padding: 12px 0 2px 0;
    background: #fff;
    align-items: flex-end;
}

.input-action-btn {

    background: none;
    border: none;
    font-size: 22px;
    cursor: pointer;
    padding: 4px 6px;
    border-radius: 4px;
    transition: background 0.2s;
}

.input-action-btn:hover {
    background: #e6f7ff;
}

.input-area .msg-textarea {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-right: 8px;
    min-width: 0;
    min-height: 100px;
    max-height: 200px;
    resize: none;
    font-size: 16px;
    line-height: 1.5;
    overflow-y: auto;
    box-sizing: border-box;
    transition: height 0.2s;
}

.input-area button {
    padding: 8px 24px;
    border: none;
    background: #42b983;
    color: #fff;
    border-radius: 4px;
    cursor: pointer;
    white-space: nowrap;
    height: 40px;
    align-self: flex-end;
    position: absolute;
    right: 16px;
    bottom: 12px;
    height: 40px;
    padding: 8px 20px;
    margin: 0;

}

.input-area button:hover {
    background: #369870;
}

.ws-status {
    color: #f00;
    text-align: center;
    padding: 8px;
}

.nav-item.active {
    background: #e6f7ff;
    color: #42b983;
}

.emoji-panel {
    display: flex;
    flex-wrap: wrap;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    padding: 8px 8px 0 8px;
    margin-bottom: 4px;
    max-width: 420px;
    max-height: 180px;
    overflow-y: auto;
    position: absolute;
    z-index: 10;
    left: 0;
    bottom: 60px;
}

.emoji-item {
    font-size: 22px;
    padding: 4px 6px;
    margin: 2px;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.15s;
}

.emoji-item:hover {
    background: #e6f7ff;
}

/* 图片预览模态框样式 */
.image-preview-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.image-preview-container {
    position: relative;
    max-width: 90%;
    max-height: 90%;
}

.preview-image {
    max-width: 100%;
    max-height: 100%;
    border-radius: 8px;
}

/* 视频预览模态框样式 */
.video-preview-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.video-preview-container {
    position: relative;
    max-width: 90%;
    max-height: 90%;
}

.preview-video {
    max-width: 50%;
    max-height: 100%;
    border-radius: 8px;
}

/* 关闭按钮样式 */
.close-preview-btn {
    position: absolute;
    top: -40px;
    right: 0;
    background: rgba(255, 255, 255, 0.8);
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background 0.2s;
}

.close-preview-btn:hover {
    background: rgba(255, 255, 255, 1);
}
</style>