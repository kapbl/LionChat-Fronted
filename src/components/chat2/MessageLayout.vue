<template>
    <div class="chat-container">
        <div class="chat-header chat-header-center">
            <div class="header-title-section">
                <span v-if="currentChatName" class="chat-title">{{ currentChatName }}</span>
                <span v-else class="chat-title">###</span>
                <!-- 群聊成员信息显示 -->
                <div v-if="currentChatName && currentChatType === 2" class="group-member-info">
                    <span class="member-count">
                        在线 {{ groupMemberInfo.onlineCount }} | 离线 {{ groupMemberInfo.offlineCount }}
                    </span>
                </div>
            </div>
            <div v-if="currentChatName" class="header-actions">
                <button v-if="currentChatType === 2" @click="showGroupInfoPanel" class="group-messages-btn"
                    title="查看群信息">
                    <svg width="20" height="20" viewBox="0 0 1055 1024" version="1.1"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M579.107188 899.691186a358.145837 358.145837 0 0 1-8.172455 75.715395 324.734916 324.734916 0 0 1-13.941247 48.073266H85.635106a103.357523 103.357523 0 0 1-14.662346 0 84.849316 84.849316 0 0 1-69.706237-98.30983 450.686875 450.686875 0 0 1 273.056155-339.877995 335.070669 335.070669 0 0 1-50.47693-41.34301 356.463272 356.463272 0 0 1 355.26144 356.944005z"
                            fill="currentColor"></path>
                        <path
                            d="M887.977927 494.673914a24.036633 24.036633 0 0 1-13.220149-3.845861 24.036633 24.036633 0 0 1-6.730257-33.170554 212.483839 212.483839 0 0 0-212.483839-326.177115 24.036633 24.036633 0 0 1-27.642128-19.710039 24.036633 24.036633 0 0 1 19.710039-27.642128 260.316739 260.316739 0 0 1 260.557106 399.729212 24.036633 24.036633 0 0 1-20.190772 10.816485zM981.720797 915.314997h-121.625365a24.036633 24.036633 0 1 1 0-48.073266h121.625365a25.478831 25.478831 0 0 0 25.719197-25.478832 10.816485 10.816485 0 0 0 0-2.644029v-3.365129a317.764293 317.764293 0 0 0-126.913424-201.426987 24.036633 24.036633 0 1 1 28.363228-38.69898 365.356827 365.356827 0 0 1 146.14273 233.876442v12.258683a73.552098 73.552098 0 0 1-73.311731 73.552098z"
                            fill="currentColor"></path>
                        <path
                            d="M808.176304 1023.479847H85.635106a50.236564 50.236564 0 0 1-14.42198 0 82.926385 82.926385 0 0 1-55.284257-34.612752 84.128217 84.128217 0 0 1-14.662346-63.456712 451.64834 451.64834 0 0 1 273.056155-340.118361 323.773451 323.773451 0 0 1-93.983237-94.704336 317.043194 317.043194 0 1 1 441.552955 92.300672l-2.884396 1.922931a453.811637 453.811637 0 0 1 273.296521 340.358728 103.357523 103.357523 0 0 1 1.201831 14.662346 85.330048 85.330048 0 0 1-85.330048 83.647484z m-722.541198-48.073266h722.541198a37.016415 37.016415 0 0 0 37.256782-37.016416 59.130118 59.130118 0 0 0 0-6.249524 403.334707 403.334707 0 0 0-243.971829-303.342313 48.073267 48.073267 0 0 1-26.680663-62.975979 48.073267 48.073267 0 0 1 14.902713-19.71004 13.700881 13.700881 0 0 1 3.605495-2.884396A269.210293 269.210293 0 1 0 301.243707 91.09884a269.210293 269.210293 0 0 0 0 452.129073 48.073267 48.073267 0 0 1 13.941247 67.302574 48.073267 48.073267 0 0 1-21.873336 18.027475A402.853975 402.853975 0 0 0 49.099423 932.381007a36.05495 36.05495 0 0 0 6.489891 27.401762 36.535683 36.535683 0 0 0 24.036634 15.143079 28.363227 28.363227 0 0 0 6.009158 0.480733z"
                            fill="currentColor"></path>
                    </svg>
                </button>
                <!-- 群聊查看群信息按钮 -->
                <!-- <button v-if="currentChatType === 2" @click="showGroupInfoPanel" class="group-info-btn" title="查看群信息">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                </button> -->
                <button @click="startVoiceCall" class="voice-call-btn" title="语音通话">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path
                            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z">
                        </path>
                    </svg>
                </button>
                <button @click="startVideoCall" class="video-call-btn" title="视频通话">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="23 7 16 12 23 17 23 7"></polygon>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                </button>
            </div>
        </div>
        <div class="messages" ref="messagesContainer">
            <div v-for="(msg, idx) in messages" :key="msg.messageId || idx"
                :class="['message', msg.from === MYUUID ? 'self' : 'other']"
                :ref="el => registerMessageElement(msg, el)">
                <div class="msg-bubble" @mouseenter="showMessageActions(msg, idx)" @mouseleave="hideMessageActions">
                    <span class="sender">{{ msg.fromUsername }}：</span>
                    <span v-if="msg.contentType === 2" class="content">
                        📎 文件：<a :href="msg.url" download>{{ msg.content }}</a> ({{ formatFileSize(msg.file?.length) }})
                    </span>
                    <span v-else-if="msg.contentType === 3" class="content">
                        🖼️ 图片：<img :src="msg.url" style="max-width: 200px; border-radius: 4px; cursor: pointer;"
                            @click="previewImage(msg.url)">
                    </span>
                    <span v-else-if="msg.contentType === 5" class="content">
                        🎥 视频：<video :src="msg.url" style="max-width: 200px; border-radius: 4px; cursor: pointer;"
                            @click="previewVideo(msg.url)"></video>
                    </span>
                    <span v-if="msg.contentType === 4" class="content">
                        🎤 语音消息：
                        <audio :src="msg.url" controls style="vertical-align: middle"></audio>
                        ({{ formatDuration(msg.duration) }})
                    </span>
                    <span v-else-if="msg.contentType === 13" class="content">
                        <img :src="msg.url" class="sticker-message" alt="贴纸"
                            style="max-width: 120px; max-height: 120px; border-radius: 8px;">
                    </span>
                    <span v-else class="content">{{ msg.content }}</span>

                    <div class="message-footer">
                        <span class="timestamp">{{ formatTime(msg.timestamp) }}</span>
                        <!-- 显示消息已读状态 -->
                        <span v-if="msg.from === MYUUID && msg.messageId" class="read-status">
                            <span v-if="isMessageRead(msg.messageId)" class="read-indicator">✓✓</span>
                            <span v-else class="unread-indicator">✓</span>
                        </span>
                    </div>

                    <!-- 消息悬停操作按钮 -->
                    <div v-if="hoveredMessageIndex === idx" class="message-actions"
                        :class="msg.from === MYUUID ? 'actions-left' : 'actions-right'">
                        <button class="action-btn emoji-btn" @click="showEmojiReaction(msg)" title="表情">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="m9 9 1.5 1.5L9 12"></path>
                                <path d="m15 9-1.5 1.5L15 12"></path>
                                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                            </svg>
                        </button>
                        <button class="action-btn ai-btn" @click="askAI(msg)" title="AI">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                                <path d="M2 17l10 5 10-5"></path>
                                <path d="M2 12l10 5 10-5"></path>
                            </svg>
                        </button>
                        <button class="action-btn more-btn" @click="showMoreOptions(msg)" title="更多">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="19" cy="12" r="1"></circle>
                                <circle cx="5" cy="12" r="1"></circle>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- 打字指示器 -->
            <div v-if="showTypingIndicator" class="message other">
                <div class="typing-indicator">
                    <span class="sender">{{ typingUser }}正在输入</span>
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="input-area-wrap">
            <div class="input-actions input-actions-top">
                <button class="input-action-btn" @click="toggleEmojiPanel" title="发送表情">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="m9 9 1.5 1.5L9 12" />
                        <path d="m15 9-1.5 1.5L15 12" />
                        <path d="M8 15s1.5 2 4 2 4-2 4-2" />
                    </svg>
                </button>

                <input type="file" ref="fileInput" style="display: none" @change="handleFileSelect">
                <button class="input-action-btn" @click="$refs.fileInput.click()" title="发送文件">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14,2 14,8 20,8" />
                    </svg>
                </button>

                <button class="input-action-btn" @click="toggleRecording" :class="{ recording: isRecording }"
                    title="语音消息">
                    <svg v-if="!isRecording" width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" x2="12" y1="19" y2="23" />
                        <line x1="8" x2="16" y1="23" y2="23" />
                    </svg>
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="6" height="6" x="9" y="9" rx="1" />
                    </svg>
                </button>

                <button class="input-action-btn" @click="openGamePanel" title="游戏">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <rect width="20" height="12" x="2" y="6" rx="2" />
                        <circle cx="8" cy="12" r="2" />
                        <path d="m16 11.5 1 1 4-4" />
                    </svg>
                </button>

                <button class="input-action-btn" @click="openStickerPanel" title="贴纸">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12.4 2.7c.9-.9 2.5-.9 3.4 0l5.5 5.5c.9.9.9 2.5 0 3.4L16 17l-4 4-7-7 4-4 3.4-5.3z" />
                        <path d="M13.5 6.5 17 10" />
                        <path d="M10.5 13.5 7 10" />
                        <path d="m16 16 2 2" />
                    </svg>
                </button>

                <button class="input-action-btn" @click="openGifPanel" title="动图">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        <path d="M3 7v10a2 2 0 0 0 2 2h14" />
                        <path d="M7 7h.01" />
                    </svg>
                </button>

                <button class="input-action-btn" @click="openSchedulePanel" title="预约">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                        <line x1="16" x2="16" y1="2" y2="6" />
                        <line x1="8" x2="8" y1="2" y2="6" />
                        <line x1="3" x2="21" y1="10" y2="10" />
                        <path d="M8 14h.01" />
                        <path d="M12 14h.01" />
                        <path d="M16 14h.01" />
                        <path d="M8 18h.01" />
                        <path d="M12 18h.01" />
                    </svg>
                </button>
            </div>
            <div v-if="showEmojiPanel" class="emoji-panel" ref="emojiPanelRef">
                <span v-for="emoji in emojiList" :key="emoji" class="emoji-item" @click="insertEmoji(emoji)">{{ emoji
                }}</span>
            </div>

            <!-- 贴纸面板 -->
            <div v-if="showStickerPanel" class="sticker-panel" ref="stickerPanelRef">
                <div class="sticker-header">选择贴纸</div>
                <div class="sticker-grid">
                    <div v-for="sticker in stickerList" :key="sticker.name" class="sticker-item"
                        @click="selectSticker(sticker)" @mouseenter="showStickerPreview(sticker, $event)"
                        @mouseleave="hideStickerPreview">
                        <img :src="sticker.url" :alt="sticker.name" class="sticker-image">
                    </div>
                </div>

                <!-- 贴纸预览 -->
                <div v-if="stickerPreview.show" class="sticker-preview" :style="stickerPreview.style">
                    <img :src="stickerPreview.url" class="sticker-preview-image">
                </div>
            </div>
            <div class="input-area">
                <div class="textarea-container">
                    <div class="resize-handle" @mousedown="startResize" title="拖拽调整大小"></div>
                    <textarea v-model="input" @keyup.enter="sendMessage" @input="handleInputChange"
                        placeholder="输入消息..." rows="1" class="msg-textarea" ref="textareaRef" />
                </div>
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
        <WebRTCVoiceCall v-if="MessageType" ref="voiceCallRef" :my-uuid="MYUUID" :my-name="myName"
            :message-type="MessageType" @call-started="onVoiceCallStarted" @call-ended="onVoiceCallEnded" />

        <!-- WebRTC视频通话组件 -->
        <WebRTCVideoCall v-if="MessageType" ref="videoCallRef" :my-uuid="MYUUID" :my-name="myName"
            :message-type="MessageType" @call-started="onVideoCallStarted" @call-ended="onVideoCallEnded" />

        <!-- 群信息面板 -->
        <div v-if="showGroupInfo" class="group-info-panel" @click="closeGroupInfoPanel">
            <div class="group-info-content" @click.stop>
                <div class="group-info-header">
                    <h3>群信息</h3>
                    <button class="close-btn" @click="closeGroupInfoPanel">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="group-description">
                    <h3>群组描述：</h3>
                    <p>{{ groupInfo }}</p>
                </div>
                <div class="group-info-body">
                    <div class="group-basic-info">
                        <h4>{{ currentChatName }}</h4>
                        <p class="group-stats">
                            在线成员：{{ groupMemberInfo.onlineCount }} |
                            离线成员：{{ groupMemberInfo.offlineCount }} |
                            总成员：{{ groupMembers.length }}
                        </p>
                    </div>
                    <div class="group-members-section">
                        <h5>群成员列表</h5>
                        <div class="members-list">
                            <div v-for="member in groupMembers" :key="member.uuid" class="member-item">
                                <div class="member-avatar">
                                    <div class="avatar-placeholder">{{ member.nickname }}</div>
                                    <!-- <div :class="['status-indicator', member.isOnline ? 'online' : 'offline']"></div> -->
                                </div>
                                <div class="member-info">
                                    <div class="member-name">{{ member.nickname }}</div>
                                    <!-- <div class="member-status">{{ member.isOnline ? '在线' : '离线' }}</div> -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { emojiList } from '@/components/chat2/emoji'
import { closeWebSocket, getWebSocket, initWebSocket } from '@/components/chat2/websocket'
import { formatFileSize } from '@/utils/format'
import protobuf from 'protobufjs'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { API_BASE_URL, MYUUID, TOUUID, chatMessages, currentChatID, currentChatTargetName, currentChatType, friendRequestInfo, friendResponseInfo, friends, groups, initializeChatMessages, myName, showFriendReplyRequest, showFriendRequest } from './state.js'

import { getMessageStorage } from './messageStorage.js'

import WebRTCVideoCall from './WebRTCVideoCall.vue'
import WebRTCVoiceCall from './WebRTCVoiceCall.vue'
import { ackManager } from './ackManager.js'

const route = useRoute()
const sessionKey = route.query.session || 'default'
// 获取消息存储管理器实例
const messageStorage = getMessageStorage(sessionKey)

const messages = computed(() => {
    const msgs = chatMessages.value[TOUUID.value] || []
    loadMessagesFromStorage(TOUUID.value)

    // 按时间戳排序消息，确保离线消息和实时消息正确排序
    return msgs.sort((a, b) => a.timestamp - b.timestamp)
})

// 监听聊天对象变化，自动标记未读消息为已读
watch(TOUUID, async (newChatId, oldChatId) => {
    if (newChatId && newChatId !== oldChatId) {
        await markCurrentChatMessagesAsRead()
        // 保存旧聊天的消息到本地存储
        if (oldChatId && chatMessages.value[oldChatId]) {
            saveMessagesToStorage(oldChatId, chatMessages.value[oldChatId])
        }
    }
}, { immediate: false })

// 监听chatMessages变化，自动保存到本地存储
watch(chatMessages, (newMessages, oldMessages) => {
    // 遍历所有聊天，检查是否有新消息需要保存
    Object.keys(newMessages).forEach(chatId => {
        const newChatMessages = newMessages[chatId] || []
        const oldChatMessages = (oldMessages && oldMessages[chatId]) || []

        // 如果消息数量发生变化，保存到本地存储
        if (newChatMessages.length !== oldChatMessages.length) {
            saveMessagesToStorage(chatId, newChatMessages)
        }
    })
}, { deep: true })

// 根据用户ID获取好友姓名
function getFriendNameById(userId) {
    const friend = friends.value.find(f => f.uuid === userId)
    return friend ? friend.name : null
}

// 保存消息到本地存储
function saveMessagesToStorage(chatId, messages) {
    console.log('saveMessagesToStorage', chatId, messages)

    if (!chatId || !Array.isArray(messages)) return
    try {
        messageStorage.saveChatMessages(chatId, messages)
        console.log(`已保存聊天 ${chatId} 的 ${messages.length} 条消息到本地存储`)
    } catch (error) {
        console.error('保存消息到本地存储失败:', error)
    }
}

// 从本地存储加载消息
function loadMessagesFromStorage(chatId) {
    if (!chatId) return []

    try {
        const messages = messageStorage.loadChatMessages(chatId)
        console.log(`从本地存储加载聊天 ${chatId} 的 ${messages.length} 条消息`)
        return messages
    } catch (error) {
        console.error('从本地存储加载消息失败:', error)
        return []
    }
}

// 加载所有历史消息
function loadAllHistoryMessages() {
    try {
        const allMessages = messageStorage.loadAllMessages()

        // 合并到当前的chatMessages中
        Object.keys(allMessages).forEach(chatId => {
            const storedMessages = allMessages[chatId]
            if (storedMessages && storedMessages.length > 0) {
                // 如果当前已有消息，需要合并并去重
                if (chatMessages.value[chatId]) {
                    const existingIds = new Set(chatMessages.value[chatId].map(msg => msg.messageId).filter(id => id))
                    const newMessages = storedMessages.filter(msg => !existingIds.has(msg.messageId))
                    chatMessages.value[chatId] = [...chatMessages.value[chatId], ...newMessages]
                } else {
                    chatMessages.value[chatId] = storedMessages
                }
            }
        })

        console.log(`成功加载 ${Object.keys(allMessages).length} 个聊天的历史消息`)
    } catch (error) {
        console.error('加载历史消息失败:', error)
    }
}

// 标记当前聊天对话的未读消息为已读
async function markCurrentChatMessagesAsRead() {
    if (!TOUUID.value) return

    const currentMessages = chatMessages.value[TOUUID.value] || []
    const unreadMessageIds = currentMessages
        .filter(msg => !msg.isRead && msg.from !== MYUUID.value) // 只标记别人发送的未读消息
        .map(msg => msg.messageId)
        .filter(id => id) // 过滤掉无效的messageId

    if (unreadMessageIds.length > 0) {
        await markMessagesAsRead(unreadMessageIds)
        console.log(`自动标记 ${unreadMessageIds.length} 条消息为已读`)
    }
}
const input = ref('')
const MessageType = ref(null)
let ws = null
const wsConnected = ref(false)
// 好友请求相关变量已移动到 state.js 中
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
// WebRTC视频通话
const videoCallRef = ref(null)
// 语音消息播放器
const showVoicePlayer = ref(false)
const currentVoiceUrl = ref('')
const currentVoiceSender = ref('')
const currentVoiceDuration = ref(0)
// ACK相关
const messagesContainer = ref(null)
const readMessageIds = ref(new Set()) // 已读消息ID集合

// 打字指示器相关
const showTypingIndicator = ref(false)

// 群信息面板相关
const showGroupInfo = ref(false)
const groupMembers = ref([])
const groupInfo = ref('')

// 群聊成员信息
const groupMemberInfo = ref({
    onlineCount: 0,
    offlineCount: 0,
    totalCount: 0
})
const typingUser = ref('')
const typingTimer = ref(null)

// 拖拽调整大小相关
const textareaRef = ref(null)
const isResizing = ref(false)
const startY = ref(0)

// 消息悬停操作相关
const hoveredMessageIndex = ref(-1)
const showEmojiReactionPanel = ref(false)
const selectedMessage = ref(null)
const startHeight = ref(0)

// 贴纸相关
const showStickerPanel = ref(false)
const stickerList = ref([])
const stickerPanelRef = ref(null)
const stickerPreview = ref({
    show: false,
    url: '',
    style: {}
})

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
        fromUsername: myName.value,
        from: MYUUID.value,
        to: TOUUID.value,
        content: fileData.fileName,
        contentType: contentType,
        type: type,
        messageType: currentChatType.value,
        url: URL.createObjectURL(new Blob([fileData.fileBuffer])),
        fileSuffix: fileData.suffix,
        file: fileData.fileBuffer,
        messageId: generateMessageId(), // 生成唯一消息ID
        isFragmented: false,
        fragmentIndex: 0,
        totalFragments: 0,
        timestamp: Date.now(),
        checksum: '',
        ackMessageIds: [],
        isRead: false,
        readTimestamp: 0
    }
    const messageBuffer = MessageType.value.encode(MessageType.value.create(msgObj)).finish()
    ws.send(messageBuffer)
    if (!chatMessages.value[TOUUID.value]) chatMessages.value[TOUUID.value] = []
    chatMessages.value[TOUUID.value].push({
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
        fromUsername: myName.value,
        from: MYUUID.value,
        to: TOUUID.value,
        content: '语音消息',
        contentType: 4,
        type: 'audio',
        messageType: currentChatType.value,
        url: URL.createObjectURL(audioBlob.value),
        file: voiceData.audioBuffer,
        messageId: generateMessageId(), // 生成唯一消息ID
        isFragmented: false,
        fragmentIndex: 0,
        totalFragments: 0,
        timestamp: Date.now(),
        checksum: '',
        ackMessageIds: [],
        isRead: false,
        readTimestamp: 0
    }

    const messageBuffer = MessageType.value.encode(MessageType.value.create(msgObj)).finish()
    ws.send(messageBuffer)

    if (!chatMessages.value[TOUUID.value]) chatMessages.value[TOUUID.value] = []
    chatMessages.value[TOUUID.value].push({
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
    //localStorage.setItem(`unreadCounts_${sessionKey}`, JSON.stringify(unreadCounts))
}

// 获取离线消息
async function getOfflineMessages() {
    try {
        const token = localStorage.getItem(`${sessionKey}`)
        if (!token) {
            console.error('No token found for session:', sessionKey)
            return
        }

        const resp = await fetch(`${API_BASE_URL}/v1/api/message/getUnreadMessage?page=1&limit=50`, {

            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        const data = await resp.json()
        console.log('离线消息:', data)

        if (data.code === 200 && data.data && data.data.messages) {
            const unreadMessageIds = []

            // 处理离线消息
            data.data.messages.forEach(message => {
                const offlineMsg = {
                    messageId: message.message_id,
                    from: message.sender_id,
                    to: message.receive_id,
                    content: message.content,
                    contentType: 1, // 假设都是文本消息
                    fromUsername: getFriendNameById(message.sender_id) || '未知用户',
                    timestamp: new Date(message.created_at).getTime(),
                    isRead: message.status === 1
                }

                // 确定聊天ID（私聊使用发送者ID）
                const chatId = message.sender_id

                // 添加到聊天记录
                if (!chatMessages.value[chatId]) {
                    chatMessages.value[chatId] = []
                }

                // 检查消息是否已存在（避免重复）
                const exists = chatMessages.value[chatId].some(msg =>
                    msg.messageId === offlineMsg.messageId
                )

                if (!exists) {
                    chatMessages.value[chatId].push(offlineMsg)
                    // 收集未读消息ID
                    if (!offlineMsg.isRead) {
                        unreadMessageIds.push(message.message_id)
                    }
                }
            })

            console.log(`成功加载 ${data.data.messages.length} 条离线消息`)

            // 自动标记所有未读离线消息为已读
            // if (unreadMessageIds.length > 0) {
            //     await markMessagesAsRead(unreadMessageIds)
            // }
        }
    } catch (error) {
        console.error('获取离线消息失败:', error)
    }
}

// 标记消息为已读
async function markMessagesAsRead(messageIds) {
    try {
        const token = localStorage.getItem(`${sessionKey}`)
        if (!token) {
            console.error('No token found for session:', sessionKey)
            return
        }
        const resp = await fetch(`${API_BASE_URL}/v1/api/message/markAsRead`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message_ids: messageIds
            })
        })

        const data = await resp.json()
        if (data.code === 200) {
            console.log(`成功标记 ${messageIds.length} 条消息为已读`)
            // 更新本地消息状态
            Object.keys(chatMessages.value).forEach(chatId => {
                chatMessages.value[chatId].forEach(msg => {
                    if (messageIds.includes(msg.messageId)) {
                        msg.isRead = true
                    }
                })
            })
            // 将消息存储到本地
            Object.keys(chatMessages.value).forEach(chatId => {
                const messages = chatMessages.value[chatId]
                if (messages && messages.length > 0) {
                    saveMessagesToStorage(chatId, messages)
                }
            })
        } else {
            console.error('标记消息已读失败:', data.message)
        }
    } catch (error) {
        console.error('标记消息已读请求失败:', error)
    }
}

onMounted(async () => {
    // 首先初始化并加载历史消息
    await initializeChatMessages(sessionKey)

    // 加载 proto
    const root = await protobuf.load('/message.proto')
    MessageType.value = root.lookup('protocol.Message')
    initWebSocket(sessionKey, handleWebSocketMessage, MYUUID.value, MessageType.value)
    ws = getWebSocket()
    if (ws) {
        wsConnected.value = ws.readyState === WebSocket.OPEN
        ws.addEventListener('open', async () => {
            wsConnected.value = true
            // WebSocket连接成功后获取离线消息
            await getOfflineMessages()
        })
        ws.addEventListener('close', () => (wsConnected.value = false))
    }

    // 如果WebSocket已经连接，立即获取离线消息
    if (wsConnected.value) {
        await getOfflineMessages()
    }

    // 初始化ACK管理器
    ackManager.init(MYUUID.value, MessageType.value)

    // 监听消息已读确认事件
    window.addEventListener('messagesAcked', handleMessagesAcked)
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
    const { from, to } = decoded;
    const isPrivateMessage = to === MYUUID.value;
    const chatId = isPrivateMessage ? from : to;
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
            case 7: // WebRTC视频信令消息
                handleWebRTCVideoSignaling(decoded);
                break;
            case 8: // 好友请求
                handleFriendRequest(decoded);
                break;
            case 9: // 好友回复
                handleFriendResponse(decoded);
                break;
            case 10: // ACK确认消息
                handleAckMessage(decoded);
                break;
            case 13: // 贴纸消息
                handleStickerMessage(decoded, chatId, isPrivateMessage);
                break;
            default:
                break;
        }
        //saveUnreadCounts();
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
    // 创建文件URL
    decoded.url = URL.createObjectURL(
        new Blob([decoded.file], { type: getMimeType(decoded.fileSuffix) })
    );
    updateUnreadCount(chatId, isPrivateMessage);
    addMessageToChat(chatId, decoded);
}

function handleImageMessage(decoded, chatId, isPrivateMessage) {
    // 创建图片URL
    decoded.url = URL.createObjectURL(
        new Blob([decoded.file], { type: getMimeType(decoded.fileSuffix) })
    );
    updateUnreadCount(chatId, isPrivateMessage);
    addMessageToChat(chatId, decoded);
}

function handleStickerMessage(decoded, chatId, isPrivateMessage) {
    // 直接使用content字段中的贴纸URL
    decoded.url = decoded.content;
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

// 处理加好友请求
function handleFriendRequest(decoded) {
    friendRequestInfo.value = {
        fromUsername: decoded.fromUsername,
        content: decoded.content,
        from: decoded.from
    };
    showFriendRequest.value = true;
}

//处理回复加好友请求
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

// WebRTC视频信令消息处理
function handleWebRTCVideoSignaling(decoded) {
    if (videoCallRef.value) {
        videoCallRef.value.handleSignalingMessage(decoded);
    }
}

// 发起语音通话
function startVoiceCall() {
    if (!TOUUID.value || !currentChatName.value) {
        alert('请先选择聊天对象');
        return;
    }

    if (voiceCallRef.value) {
        voiceCallRef.value.startCall(TOUUID.value, currentChatName.value);
    }
}

// 发起视频通话
function startVideoCall() {
    if (!TOUUID.value || !currentChatName.value) {
        alert('请先选择聊天对象');
        return;
    }

    if (videoCallRef.value) {
        videoCallRef.value.startCall(TOUUID.value, currentChatName.value);
    }
}

// 语音通话开始事件
function onVoiceCallStarted() {
    console.log('语音通话已开始');
}

// 语音通话结束事件
function onVoiceCallEnded() {
    console.log('语音通话已结束');
}

// 视频通话开始事件
function onVideoCallStarted() {
    console.log('视频通话已开始');
}

// 视频通话结束事件
function onVideoCallEnded() {
    console.log('视频通话已结束');
}

// 辅助函数
function updateUnreadCount(chatId, isPrivateMessage) {
    if (currentChatID.value !== chatId) {
        const targetCollection = isPrivateMessage ? friends.value : groups.value;
        const targetUpdate = targetCollection.find(item => item.uuid === chatId);
        if (targetUpdate) {
            console.log("更新未读消息数量")
            targetUpdate.unread++;
        }
    }
}

function addMessageToChat(chatId, decoded) {
    chatMessages.value[chatId] ??= [];
    // 为消息生成唯一ID（如果没有的话）
    if (!decoded.messageId) {
        decoded.messageId = generateMessageId()
    }
    chatMessages.value[chatId].push({
        ...decoded,
        timestamp: decoded.timestamp || Date.now()
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
    // 保存当前所有聊天的消息到本地存储
    Object.keys(chatMessages.value).forEach(chatId => {
        const messages = chatMessages.value[chatId]
        if (messages && messages.length > 0) {
            saveMessagesToStorage(chatId, messages)
        }
    })

    closeWebSocket()
    // 清理ACK管理器
    ackManager.destroy()
    // 移除事件监听
    window.removeEventListener('messagesAcked', handleMessagesAcked)
})

function formatTime(ts) {
    const date = new Date(ts)
    return date.toLocaleTimeString()
}

// 处理输入变化，显示打字指示器
function handleInputChange() {
    if (!input.value.trim()) {
        hideTypingIndicator()
        return
    }

    // 模拟显示打字指示器（在实际应用中，这里应该通过WebSocket发送打字状态给其他用户）
    showTypingIndicatorDemo()
}

// 显示打字指示器演示
function showTypingIndicatorDemo() {
    // 清除之前的定时器
    if (typingTimer.value) {
        clearTimeout(typingTimer.value)
    }

    // 显示打字指示器
    showTypingIndicator.value = true
    typingUser.value = '对方'

    // 3秒后自动隐藏
    typingTimer.value = setTimeout(() => {
        hideTypingIndicator()
    }, 3000)
}

// 隐藏打字指示器
function hideTypingIndicator() {
    showTypingIndicator.value = false
    typingUser.value = ''
    if (typingTimer.value) {
        clearTimeout(typingTimer.value)
        typingTimer.value = null
    }
}

function sendMessage() {
    // 发送消息时隐藏打字指示器
    hideTypingIndicator()
    if (!input.value.trim() || !MessageType.value || !wsConnected.value) return
    if (!TOUUID.value.trim()) {
        alert('请先选择聊天对象')
        return
    }
    // 消息体
    const msgObj = {
        avatar: '',
        fromUsername: myName.value,
        from: MYUUID.value,
        to: TOUUID.value,
        content: input.value,
        contentType: 1, // 文字
        type: '',
        messageType: currentChatType.value, // 单聊或群聊
        url: '',
        fileSuffix: '',
        file: new Uint8Array(),
        messageId: generateMessageId(), // 生成唯一消息ID
        isFragmented: false,
        fragmentIndex: 0,
        totalFragments: 0,
        timestamp: Date.now(),
        checksum: '',
        ackMessageIds: [],
        isRead: false,
        readTimestamp: 0
    }
    const errMsg = MessageType.value.verify(msgObj)
    if (errMsg) {
        alert('消息格式错误: ' + errMsg)
        return
    }
    const messageBuffer = MessageType.value.encode(MessageType.value.create(msgObj)).finish()
    ws.send(messageBuffer)
    // 本地也显示消息
    if (!chatMessages.value[TOUUID.value]) chatMessages.value[TOUUID.value] = []
    chatMessages.value[TOUUID.value].push({ ...msgObj, timestamp: Date.now() })
    input.value = ''
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

// 消息悬停操作函数
function showMessageActions(msg, index) {
    hoveredMessageIndex.value = index
}

function hideMessageActions() {
    hoveredMessageIndex.value = -1
}

function showEmojiReaction(msg) {
    selectedMessage.value = msg
    showEmojiReactionPanel.value = true
    console.log('显示表情反应面板:', msg)
}

function askAI(msg) {
    console.log('询问AI关于消息:', msg)
    // 这里可以集成AI功能，比如翻译、总结等
    alert(`AI功能开发中...\n消息内容: ${msg.content}`)
}

function showMoreOptions(msg) {
    console.log('显示更多选项:', msg)
    // 这里可以显示更多操作选项，如复制、转发、删除等
    const options = ['复制消息', '转发消息', '回复消息', '删除消息']
    const choice = prompt(`选择操作:\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}`)

    if (choice) {
        const index = parseInt(choice) - 1
        if (index >= 0 && index < options.length) {
            handleMessageAction(options[index], msg)
        }
    }
}

// 获取群聊成员信息
async function getGroupMemberInfo(groupId) {
    try {
        const token = localStorage.getItem(`${sessionKey}`)
        if (!token) {
            console.error('未找到认证令牌')
            return
        }

        const response = await fetch(`${API_BASE_URL}/v1/api/group/group-members-List?groupUUID=${groupId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        const data = await response.json()
        console.log(data)

        if (response.ok) {
            if (data.code === 0 && data.data) {
                const members = data.data.member || []
                // const onlineMembers = members.filter(member => member.isOnline)
                // const offlineMembers = members.filter(member => !member.isOnline)

                groupMemberInfo.value = {
                    // onlineCount: onlineMembers.length,
                    // offlineCount: offlineMembers.length,
                    totalCount: members.length
                }
                console.log('群聊成员信息更新:', groupMemberInfo.value)
            }
        } else {
            console.error('获取群聊成员信息失败:', response.statusText)
        }
    } catch (error) {
        console.error('获取群聊成员信息出错:', error)
    }
}

// 查看群消息功能
function showGroupMessages() {
    console.log('查看群消息功能')
    // 这里可以实现群消息管理功能，比如显示群公告、群文件等
    alert('群消息管理功能开发中...')
}

// 贴纸相关函数
function openStickerPanel() {
    showStickerPanel.value = !showStickerPanel.value
    if (showStickerPanel.value) {
        loadStickers()
        nextTick(() => {
            document.addEventListener('mousedown', handleStickerClickOutside)
        })
    } else {
        document.removeEventListener('mousedown', handleStickerClickOutside)
    }
}

function handleStickerClickOutside(e) {
    if (stickerPanelRef.value && !stickerPanelRef.value.contains(e.target)) {
        showStickerPanel.value = false
        document.removeEventListener('mousedown', handleStickerClickOutside)
    }
}

function loadStickers() {
    // 加载public/tiezhi目录中的贴纸
    const stickerFiles = [
        '242099158257925.63881ae888c67.gif',
        '6d245c158257925.63881ae889a0a.gif',
        '6d6f29158257925.63881ae88b3b8.gif',
        '76c530158257925.63881ae87cbee.gif',
        '8426b5158257925.63881ae88a654.gif',
        '97565d158257925.63881ae87de15.gif',
        'ab6b92158257925.63881ae8828b4.gif',
        'ce3ade158257925.63881ae88529f.gif',
        'd009e2158257925.63881ae88690c.gif',
        'd3fe2c158257925.63881ae887e25.gif',
        'f6ae3d158257925.63881ae8812b4.gif'
    ]

    stickerList.value = stickerFiles.map(filename => ({
        name: filename,
        url: `/tiezhi/${filename}`
    }))
}

function selectSticker(sticker) {
    // 发送贴纸消息
    sendStickerMessage(sticker)
    showStickerPanel.value = false
    document.removeEventListener('mousedown', handleStickerClickOutside)
}

// 发送贴纸消息
function sendStickerMessage(sticker) {
    if (!MessageType.value || !wsConnected.value) return
    const msgObj = {
        avatar: '',
        fromUsername: myName.value,
        from: MYUUID.value,
        to: TOUUID.value,
        content: sticker.url,
        contentType: 13,
        type: 'image',
        messageType: currentChatType.value,
        url: sticker.url,
        fileSuffix: '',
        file: new Uint8Array(),
        messageId: generateMessageId(), // 生成唯一消息ID
        isFragmented: false,
        fragmentIndex: 0,
        totalFragments: 0,
        timestamp: Date.now(),
        checksum: '',
        ackMessageIds: [],
        isRead: false,
        readTimestamp: 0
    }
    const messageBuffer = MessageType.value.encode(MessageType.value.create(msgObj)).finish()
    ws.send(messageBuffer)
    if (!chatMessages.value[TOUUID.value]) chatMessages.value[TOUUID.value] = []
    chatMessages.value[TOUUID.value].push({...msgObj,timestamp: Date.now()})
   

    // // 本地也显示消息
    // if (!chatMessages.value[TOUUID.value]) chatMessages.value[TOUUID.value] = []
    // chatMessages.value[TOUUID.value].push({ ...msgObj, timestamp: Date.now() })
}

// 群信息面板相关函数
function showGroupInfoPanel() {
    showGroupInfo.value = true
    loadGroupMembers()
}

function closeGroupInfoPanel() {
    showGroupInfo.value = false
}

async function loadGroupMembers() {
    if (!TOUUID.value || currentChatType.value !== 2) return
    try {
        const token = localStorage.getItem(`${sessionKey}`)
        if (!token) {
            console.error('未找到认证令牌')
            return
        }

        const response = await fetch(`${API_BASE_URL}/v1/api/group/group-members-List?groupUUID=${TOUUID.value}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        const data = await response.json()
        console.log(data.data.description)
        if (data.code == 0) {
            groupInfo.value = data.data.description || {}
            groupMembers.value = data.data.member || []
            console.log('群成员列表加载成功:', groupMembers.value)
        } else {
            console.error('获取群成员列表失败:', response.status)

        }
        // if (response.ok) {
        //     if (data.code === 0 && data.data) {
        //         const members = data.data.member || []
        //         // const onlineMembers = members.filter(member => member.isOnline)
        //         // const offlineMembers = members.filter(member => !member.isOnline)

        //         groupMemberInfo.value = {
        //             // onlineCount: onlineMembers.length,
        //             // offlineCount: offlineMembers.length,
        //             totalCount: members.length
        //         }
        //         console.log('群聊成员信息更新:', groupMemberInfo.value)
        //     }
        // } else {
        //     console.error('获取群聊成员信息失败:', response.statusText)
        // }
    } catch (error) {
        console.error('获取群聊成员信息出错:', error)
    }
}

function showStickerPreview(sticker, event) {
    const rect = event.target.getBoundingClientRect()
    const panelRect = stickerPanelRef.value.getBoundingClientRect()

    stickerPreview.value = {
        show: true,
        url: sticker.url,
        style: {
            position: 'absolute',
            left: `${rect.left - panelRect.left - 60}px`,
            top: `${rect.top - panelRect.top - 80}px`,
            zIndex: 1001
        }
    }
}

function hideStickerPreview() {
    stickerPreview.value.show = false
}

function handleMessageAction(action, msg) {
    switch (action) {
        case '复制消息':
            navigator.clipboard.writeText(msg.content)
            alert('消息已复制到剪贴板')
            break
        case '转发消息':
            alert('转发功能开发中...')
            break
        case '回复消息':
            input.value = `回复 @${msg.fromUsername}: ${msg.content}\n`
            break
        case '删除消息':
            if (confirm('确定要删除这条消息吗？')) {
                // 这里添加删除消息的逻辑
                alert('删除功能开发中...')
            }
            break
        default:
            console.log('未知操作:', action)
    }
}
onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside)
    // 清理拖拽事件监听器
    if (isResizing.value) {
        document.removeEventListener('mousemove', handleResize)
        document.removeEventListener('mouseup', stopResize)
        document.body.style.userSelect = ''
        document.body.style.cursor = ''
    }
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

// 语音消息播放函数
function playVoiceMessage(msg) {
    currentVoiceUrl.value = msg.url
    currentVoiceSender.value = msg.fromUsername
    currentVoiceDuration.value = msg.duration || 0
    showVoicePlayer.value = true
}

function closeVoicePlayer() {
    showVoicePlayer.value = false
    currentVoiceUrl.value = ''
    currentVoiceSender.value = ''
    currentVoiceDuration.value = 0
}

// 拖拽调整大小功能
function startResize(event) {
    event.preventDefault()
    isResizing.value = true
    startY.value = event.clientY
    startHeight.value = textareaRef.value.offsetHeight

    document.addEventListener('mousemove', handleResize)
    document.addEventListener('mouseup', stopResize)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'ns-resize'
}

function handleResize(event) {
    if (!isResizing.value) return

    const deltaY = startY.value - event.clientY // 向上拖拽为正值
    const newHeight = startHeight.value + deltaY

    // 限制最小和最大高度
    const minHeight = 40
    const maxHeight = 300
    const clampedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight))

    textareaRef.value.style.height = clampedHeight + 'px'
}

function stopResize() {
    isResizing.value = false
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
}

// ACK相关方法
// 生成消息唯一ID
function generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 注册消息元素到ACK管理器
function registerMessageElement(msg, el) {
    if (el && msg.messageId && msg.from !== MYUUID.value) {
        nextTick(() => {
            ackManager.registerMessageElement(msg.messageId, el, msg.from)
        })
    }
}

// 检查消息是否已读
function isMessageRead(messageId) {
    // 首先检查readMessageIds Set
    if (readMessageIds.value.has(messageId)) {
        return true
    }

    // 然后检查消息对象本身的isRead属性
    const currentMessages = chatMessages.value[TOUUID.value] || []
    const message = currentMessages.find(msg => msg.messageId === messageId)
    return message ? message.isRead : false
}

// 处理ACK确认消息
function handleAckMessage(decoded) {
    ackManager.handleAckMessage(decoded)
}

// 处理消息已读确认事件
function handleMessagesAcked(event) {
    const { messageIds } = event.detail
    messageIds.forEach(messageId => {
        readMessageIds.value.add(messageId)
    })
}

// 监听聊天对象变化，标记当前聊天为已读
watch(TOUUID, (newUuid, oldUuid) => {
    if (newUuid && newUuid !== oldUuid) {
        // 切换聊天时，标记当前聊天的所有消息为已读
        nextTick(() => {
            const currentMessages = messages.value
            if (currentMessages.length > 0) {
                ackManager.markChatAsRead(newUuid, currentMessages)
            }
        })

        // 如果切换到群聊，获取群聊成员信息
        if (currentChatType.value === 2 && newUuid) {
            getGroupMemberInfo(newUuid)
        }
    }
})

// 监听聊天类型变化
watch(currentChatType, (newType) => {
    if (newType === 2 && TOUUID.value) {
        // 切换到群聊时获取成员信息
        getGroupMemberInfo(TOUUID.value)
    } else if (newType === 1) {
        // 切换到私聊时重置群聊成员信息
        groupMemberInfo.value = {
            onlineCount: 0,
            offlineCount: 0,
            totalCount: 0
        }
    }
})

// 监听页面可见性变化
watch(() => document.hidden, (hidden) => {
    if (!hidden && TOUUID.value) {
        // 页面变为可见时，标记当前聊天为已读
        nextTick(() => {
            const currentMessages = messages.value
            if (currentMessages.length > 0) {
                ackManager.markChatAsRead(TOUUID.value, currentMessages)
            }
        })
    }
})
</script>

<style scoped>
.create-group-btn:hover {
    background: #369870;
}

.add-friend-btn {
    background: var(--accent-color, #42b983);
    color: var(--text-primary, #fff);
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
    border: 1px solid var(--border-color, #ddd);
    border-radius: 0;
    background: var(--bg-primary, #fafafa);
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
    color: var(--text-primary, #333);
    padding: 0 24px;
    /* border-bottom: 1px solid var(--border-color, #eee); */
    /* background: var(--bg-secondary, #f7f7f7); */
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

.header-title-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    text-align: center;
}

.chat-title {
    font-size: 20px;
    font-weight: bold;
    color: var(--text-primary, #333);
}

.group-member-info {
    display: flex;
    align-items: center;
}

.member-count {
    font-size: 12px;
    color: var(--text-secondary, #666);
    font-weight: normal;
}

.header-actions {
    display: flex;
    gap: 8px;
    align-items: center;
}

.group-messages-btn {
    background: var(--accent-color, #42b983);
    color: var(--text-primary, white);
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

.group-messages-btn:hover {
    background: var(--accent-hover, #369870);
    transform: scale(1.1);
}

.group-messages-btn:active {
    transform: scale(0.95);
}

.voice-call-btn {
    background: var(--accent-color, #42b983);
    color: var(--text-primary, white);
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
    background: var(--accent-hover, #369870);
    transform: scale(1.1);
}

.voice-call-btn:active {
    transform: scale(0.95);
}

.video-call-btn {
    background: var(--video-call-color, #4285f4);
    color: var(--text-primary, white);
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
    margin-left: 8px;
}

.video-call-btn:hover {
    background: var(--video-call-hover, #3367d6);
    transform: scale(1.1);
}

.video-call-btn:active {
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
    animation: bubbleAppear 0.3s ease-out;
    transition: all 0.2s ease;
}

.msg-bubble:hover {
    transform: scale(1.02);
    box-shadow: 0 2px 8px var(--shadow-light, rgba(0, 0, 0, 0.1));
}

@keyframes bubbleAppear {
    0% {
        opacity: 0;
        transform: scale(0.8) translateY(10px);
    }

    100% {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

@keyframes bubbleAppearRight {
    0% {
        opacity: 0;
        transform: scale(0.8) translateX(20px) translateY(10px);
    }

    100% {
        opacity: 1;
        transform: scale(1) translateX(0) translateY(0);
    }
}

@keyframes bubbleAppearLeft {
    0% {
        opacity: 0;
        transform: scale(0.8) translateX(-20px) translateY(10px);
    }

    100% {
        opacity: 1;
        transform: scale(1) translateX(0) translateY(0);
    }
}

/* 打字动画效果 */
@keyframes typing {

    0%,
    60%,
    100% {
        transform: translateY(0);
    }

    30% {
        transform: translateY(-10px);
    }
}

.typing-indicator {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: var(--bg-tertiary, #e6e6e6);
    border-radius: 16px;
    border-bottom-left-radius: 4px;
    margin-bottom: 12px;
    animation: bubbleAppearLeft 0.3s ease-out;
}

.typing-dots {
    display: flex;
    gap: 3px;
}

.typing-dot {
    width: 6px;
    height: 6px;
    background: var(--text-secondary, #888);
    border-radius: 50%;
    animation: typing 1.4s infinite;
}

.typing-dot:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
    animation-delay: 0.4s;
}

.message.self .msg-bubble {
    background: var(--msg-self-bg, #d1f5d3);
    color: var(--text-primary, #222);
    border-bottom-right-radius: 4px;
    border-bottom-left-radius: 16px;
    align-items: flex-end;
    animation: bubbleAppearRight 0.3s ease-out;
}

.message.other .msg-bubble {
    background: var(--msg-other-bg, #e6e6e6);
    color: var(--text-primary, #222);
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 16px;
    align-items: flex-start;
    animation: bubbleAppearLeft 0.3s ease-out;
}

.sender {
    font-weight: bold;
    margin-right: 6px;
}

.message-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 4px;
}

.timestamp {
    color: var(--text-secondary, #888);
    font-size: 12px;
}

.read-status {
    margin-left: 8px;
    font-size: 12px;
}

.read-indicator {
    color: var(--accent-color, #42b983);
    font-weight: bold;
}

.unread-indicator {
    color: var(--text-secondary, #888);
    font-weight: bold;
}

.input-area-wrap {
    display: flex;
    flex-direction: column;
    border-top: 1px solid var(--border-color, #eee);
    background: var(--bg-secondary, #fff);
    position: relative;
}

.input-actions-top {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0px 0 0 0;
    margin-left: 2px;
    margin-bottom: 1px;
    gap: 4px;
}

.input-area {
    display: flex;
    background: var(--bg-secondary, #fff);
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
    background: var(--bg-hover, #e6f7ff);
}

.textarea-container {
    flex: 1;
    position: relative;
    margin-right: 8px;
}

.resize-handle {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: transparent;
    cursor: ns-resize;
    z-index: 10;
    border-radius: 4px 4px 0 0;
    transition: background-color 0.2s;
}

.resize-handle:hover {
    background: var(--accent-color, #42b983);
    opacity: 0.3;
}

.resize-handle:active {
    background: var(--accent-color, #42b983);
    opacity: 0.6;
}

.input-area .msg-textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid var(--border-color, #ccc);
    border-radius: 4px;
    min-width: 0;
    min-height: 100px;
    max-height: 300px;
    resize: none;
    font-size: 16px;
    line-height: 1.5;
    overflow-y: auto;
    box-sizing: border-box;
    transition: border-color 0.2s;
}

.input-area .msg-textarea:focus {
    outline: none;
    border-color: var(--accent-color, #42b983);
}

.input-area button {
    padding: 8px 24px;
    border: none;
    background: var(--accent-color, #42b983);
    color: var(--text-primary, #fff);
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
    background: var(--accent-hover, #369870);
}

.ws-status {
    color: var(--error-color, #f00);
    text-align: center;
    padding: 8px;
}

.nav-item.active {
    background: var(--bg-hover, #e6f7ff);
    color: var(--accent-color, #42b983);
}

.emoji-panel {
    display: flex;
    flex-wrap: wrap;
    background: var(--bg-secondary, #fff);
    border: 1px solid var(--border-color, #eee);
    border-radius: 8px;
    box-shadow: 0 2px 8px var(--shadow-light, rgba(0, 0, 0, 0.08));
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
    background: var(--bg-hover, #e6f7ff);
}

/* 图片预览模态框样式 */
.image-preview-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--modal-overlay, rgba(0, 0, 0, 0.8));
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
    background: var(--modal-overlay, rgba(0, 0, 0, 0.8));
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
    background: var(--close-btn-bg, rgba(255, 255, 255, 0.8));
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
    background: var(--close-btn-hover, rgba(255, 255, 255, 1));
}

/* 消息悬停操作按钮样式 */
.msg-bubble {
    position: relative;
}

.message-actions {
    position: absolute;
    bottom: -35px;
    display: flex;
    gap: 4px;
    background: var(--bg-primary, #ffffff);
    border: 1px solid var(--border-color, #e3e5e8);
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 10;
    animation: fadeInDown 0.2s ease-out;
}

.message-actions.actions-left {
    left: -8px;
}

.message-actions.actions-right {
    right: -8px;
}

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.action-btn {
    background: none;
    border: none;
    color: var(--text-secondary, #6c757d);
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
}

.action-btn:hover {
    background: var(--bg-hover, #f8f9fa);
    color: var(--text-primary, #2c2c2c);
    transform: scale(1.1);
}

.action-btn:active {
    transform: scale(0.95);
}

.emoji-btn:hover {
    background: rgba(255, 193, 7, 0.1);
    color: var(--warning-color, #ffc107);
}

.ai-btn:hover {
    background: rgba(88, 101, 242, 0.1);
    color: var(--primary-color, #5865f2);
}

/* 贴纸面板样式 */
.sticker-panel {
    position: absolute;
    bottom: 60px;
    left: 0;
    width: 300px;
    max-height: 400px;
    background: var(--bg-primary, #ffffff);
    border: 1px solid var(--border-color, #e3e5e8);
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    overflow: hidden;
    animation: fadeInUp 0.3s ease-out;
}

.sticker-header {
    padding: 12px 16px;
    background: var(--bg-secondary, #f8f9fa);
    border-bottom: 1px solid var(--border-color, #e3e5e8);
    font-weight: 500;
    color: var(--text-primary, #2c2c2c);
    text-align: center;
}

.sticker-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    padding: 16px;
    max-height: 320px;
    overflow-y: auto;
}

.sticker-item {
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
}

.sticker-item:hover {
    transform: scale(1.05);
    border-color: var(--primary-color, #5865f2);
    box-shadow: 0 2px 8px rgba(88, 101, 242, 0.2);
}

.sticker-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(16px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 贴纸预览样式 */
.sticker-preview {
    position: absolute;
    background: var(--bg-primary, #ffffff);
    border: 1px solid var(--border-color, #e3e5e8);
    border-radius: 8px;
    padding: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    pointer-events: none;
    animation: fadeInUp 0.2s ease-out;
}

.sticker-preview-image {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 6px;
    display: block;
}

.more-btn:hover {
    background: rgba(108, 117, 125, 0.1);
    color: var(--text-primary, #2c2c2c);
}

/* 确保消息气泡在悬停时有足够的层级 */
.message:hover .msg-bubble {
    z-index: 5;
}

/* 群信息面板样式 */
.group-info-panel {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: flex-end;
    align-items: stretch;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
}

.group-info-content {
    width: 400px;
    background: var(--bg-primary, #ffffff);
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    animation: slideInRight 0.3s ease;
}

.group-info-header {
    padding: 20px;
    border-bottom: 1px solid var(--border-color, #e1e5e9);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-secondary, #f8f9fa);
}

.group-info-header h3 {
    margin: 0;
    color: var(--text-primary, #2c2c2c);
    font-size: 18px;
    font-weight: 600;
}

.close-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    color: var(--text-secondary, #6c757d);
    transition: all 0.2s ease;
}

.close-btn:hover {
    background: var(--bg-hover, #e9ecef);
    color: var(--text-primary, #2c2c2c);
}

.group-info-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}

.group-basic-info {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-color, #e1e5e9);
}

.group-basic-info h4 {
    margin: 0 0 8px 0;
    color: var(--text-primary, #2c2c2c);
    font-size: 20px;
    font-weight: 600;
}

.group-stats {
    margin: 0;
    color: var(--text-secondary, #6c757d);
    font-size: 14px;
}

.group-members-section h5 {
    margin: 0 0 16px 0;
    color: var(--text-primary, #2c2c2c);
    font-size: 16px;
    font-weight: 600;
}

.members-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.member-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background: var(--bg-secondary, #f8f9fa);
    border-radius: 8px;
    transition: all 0.2s ease;
}

.member-item:hover {
    background: var(--bg-hover, #e9ecef);
}

.member-avatar {
    position: relative;
    margin-right: 12px;
}

.avatar-placeholder {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--primary-color, #5865f2);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 16px;
}

.status-indicator {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid var(--bg-primary, #ffffff);
}

.status-indicator.online {
    background: #28a745;
}

.status-indicator.offline {
    background: #6c757d;
}

.member-info {
    flex: 1;
}

.member-name {
    font-weight: 600;
    color: var(--text-primary, #2c2c2c);
    margin-bottom: 2px;
}

.member-status {
    font-size: 12px;
    color: var(--text-secondary, #6c757d);
}

.group-description {
    background: var(--bg-secondary, #f8f9fa);
    border: 1px solid var(--border-color, #e9ecef);
    border-radius: 8px;
    padding: 16px;
    margin: 16px 0;
    transition: all 0.3s ease;
}

.group-description:hover {
    background: var(--bg-hover, #f1f3f4);
    border-color: var(--primary-color, #5865f2);
    box-shadow: 0 2px 8px rgba(88, 101, 242, 0.1);
}

.group-description h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary, #2c2c2c);
    display: flex;
    align-items: center;
}

.group-description h3::before {
    content: "📝";
    margin-right: 8px;
    font-size: 14px;
}

.group-description p {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    color: var(--text-secondary, #6c757d);
    background: var(--bg-primary, #ffffff);
    padding: 12px;
    border-radius: 6px;
    border: 1px solid var(--border-light, #f0f0f0);
    min-height: 20px;
}

.group-description p:empty::before {
    content: "暂无群组描述";
    color: var(--text-muted, #adb5bd);
    font-style: italic;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
    }

    to {
        transform: translateX(0);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .group-info-content {
        width: 100%;
        max-width: 400px;
    }
}
</style>