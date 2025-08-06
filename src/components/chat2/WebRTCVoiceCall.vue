<template>
  <div v-if="showCallInterface" class="voice-call-overlay">
    <!-- 来电界面 -->
    <div v-if="callState === 'incoming'" class="call-interface incoming-call">
      <div class="caller-info">
        <div class="caller-avatar">📞</div>
        <h3>{{ callerName }}</h3>
        <p>语音通话邀请</p>
      </div>
      <div class="call-actions">
        <button @click="acceptCall" class="accept-btn">接听</button>
        <button @click="rejectCall" class="reject-btn">拒绝</button>
      </div>
    </div>

    <!-- 拨号界面 -->
    <div v-if="callState === 'calling'" class="call-interface outgoing-call">
      <div class="caller-info">
        <div class="caller-avatar">📞</div>
        <h3>{{ targetName }}</h3>
        <p>正在呼叫...</p>
      </div>
      <div class="call-actions">
        <button @click="hangUp" class="reject-btn">挂断</button>
      </div>
    </div>

    <!-- 通话中界面 -->
    <div v-if="callState === 'connected'" class="call-interface active-call">
      <div class="caller-info">
        <div class="caller-avatar">🔊</div>
        <h3>{{ targetName || callerName }}</h3>
        <p>通话中 {{ formatCallDuration(callDuration) }}</p>
      </div>
      <div class="call-controls">
        <button @click="toggleMute" :class="{ active: isMuted }" class="control-btn">
          {{ isMuted ? '🔇' : '🎤' }}
        </button>
        <button @click="toggleSpeaker" :class="{ active: isSpeakerOn }" class="control-btn">
          {{ isSpeakerOn ? '🔊' : '🔈' }}
        </button>
        <button @click="hangUp" class="reject-btn">挂断</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { getWebSocket } from './websocket'

// Props
const props = defineProps({
  myUuid: String,
  myName: String,
  messageType: Object
})

// Emits
const emit = defineEmits(['call-ended', 'call-started'])

// 响应式数据
const showCallInterface = ref(false)
const callState = ref('idle') // idle, calling, incoming, connected
const callerName = ref('')
const targetName = ref('')
const targetUuid = ref('')
const isMuted = ref(false)
const isSpeakerOn = ref(false)
const callDuration = ref(0)
const callTimer = ref(null)

// WebRTC相关
const localStream = ref(null)
const remoteStream = ref(null)
const peerConnection = ref(null)
const iceCandidates = ref([])

// WebRTC配置
const rtcConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
}

// 计算属性
const formatCallDuration = computed(() => {
  return (duration) => {
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
})

// 初始化WebRTC
async function initWebRTC() {
  try {
    // 获取用户媒体（仅音频）
    localStream.value = await navigator.mediaDevices.getUserMedia({ 
      audio: true, 
      video: false 
    })
    
    // 创建RTCPeerConnection
    peerConnection.value = new RTCPeerConnection(rtcConfiguration)
    
    // 添加本地流
    localStream.value.getTracks().forEach(track => {
      peerConnection.value.addTrack(track, localStream.value)
    })
    
    // 监听远程流
    peerConnection.value.ontrack = (event) => {
      remoteStream.value = event.streams[0]
      playRemoteAudio()
    }
    
    // 监听ICE候选
    peerConnection.value.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignalingMessage({
          type: 'ice-candidate',
          candidate: event.candidate
        })
      }
    }
    
    // 监听连接状态
    peerConnection.value.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.value.connectionState)
      if (peerConnection.value.connectionState === 'connected') {
        callState.value = 'connected'
        startCallTimer()
      } else if (peerConnection.value.connectionState === 'disconnected' || 
                 peerConnection.value.connectionState === 'failed') {
        endCall()
      }
    }
    
  } catch (error) {
    console.error('初始化WebRTC失败:', error)
    alert('无法访问麦克风，请检查权限设置')
  }
}

// 发起语音通话
async function startCall(uuid, name) {
  targetUuid.value = uuid
  targetName.value = name
  callState.value = 'calling'
  showCallInterface.value = true
  
  await initWebRTC()
  
  // 发送通话邀请
  sendSignalingMessage({
    type: 'call-invite',
    from: props.myUuid,
    fromName: props.myName,
    to: uuid
  })
  
  emit('call-started')
}

// 接听电话
async function acceptCall() {
  await initWebRTC()
  
  // 发送接受通话消息
  sendSignalingMessage({
    type: 'call-accept',
    from: props.myUuid,
    to: targetUuid.value
  })
  
  callState.value = 'connected'
}

// 拒绝电话
function rejectCall() {
  sendSignalingMessage({
    type: 'call-reject',
    from: props.myUuid,
    to: targetUuid.value
  })
  
  endCall()
}

// 挂断电话
function hangUp() {
  sendSignalingMessage({
    type: 'call-hangup',
    from: props.myUuid,
    to: targetUuid.value
  })
  
  endCall()
}

// 结束通话
function endCall() {
  // 停止计时器
  if (callTimer.value) {
    clearInterval(callTimer.value)
    callTimer.value = null
  }
  
  // 关闭媒体流
  if (localStream.value) {
    localStream.value.getTracks().forEach(track => track.stop())
    localStream.value = null
  }
  
  // 关闭RTCPeerConnection
  if (peerConnection.value) {
    peerConnection.value.close()
    peerConnection.value = null
  }
  
  // 重置状态
  callState.value = 'idle'
  showCallInterface.value = false
  callDuration.value = 0
  callerName.value = ''
  targetName.value = ''
  targetUuid.value = ''
  isMuted.value = false
  isSpeakerOn.value = false
  
  emit('call-ended')
}

// 切换静音
function toggleMute() {
  if (localStream.value) {
    const audioTrack = localStream.value.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      isMuted.value = !audioTrack.enabled
    }
  }
}

// 切换扬声器（在实际应用中可能需要更复杂的实现）
function toggleSpeaker() {
  isSpeakerOn.value = !isSpeakerOn.value
  // 这里可以添加实际的扬声器切换逻辑
}

// 播放远程音频
function playRemoteAudio() {
  if (remoteStream.value) {
    const audioElement = new Audio()
    audioElement.srcObject = remoteStream.value
    audioElement.play().catch(console.error)
  }
}

// 开始通话计时
function startCallTimer() {
  callTimer.value = setInterval(() => {
    callDuration.value++
  }, 1000)
}

// 发送信令消息
function sendSignalingMessage(message) {
  const ws = getWebSocket()
  console.log('ws:', ws)
  console.log('props.messageType:', props.messageType)
  if (ws && ws.readyState === WebSocket.OPEN && props.messageType) {
    console.log('已经满足')
    const msgObj = {
      avatar: '',
      fromUsername: props.myName,
      from: props.myUuid,
      to: message.to || targetUuid.value,
      content: JSON.stringify(message),
      contentType: 6, // 新增：WebRTC信令消息类型
      type: 'webrtc-signal',
      messageType: 1,
      url: '',
      fileSuffix: '',
      file: new Uint8Array()
    }
    
    const errMsg = props.messageType.verify(msgObj)
    if (errMsg) {
      console.error('信令消息格式错误:', errMsg)
      return
    }
    console.log('信令消息:', msgObj)

    
    const messageBuffer = props.messageType.encode(props.messageType.create(msgObj)).finish()
    ws.send(messageBuffer)
  }
}

// 处理信令消息
function handleSignalingMessage(message) {
  const signalData = JSON.parse(message.content)
  console.log("处理信令消息:", signalData)

  switch (signalData.type) {
    case 'call-invite':
      // 收到通话邀请
      callerName.value = signalData.fromName
      targetUuid.value = signalData.from
      callState.value = 'incoming'
      showCallInterface.value = true
      break
      
    case 'call-accept':
      // 对方接受通话
      createOffer()
      break
      
    case 'call-reject':
      // 对方拒绝通话
      alert('对方拒绝了通话')
      endCall()
      break
      
    case 'call-hangup':
      // 对方挂断通话
      endCall()
      break
      
    case 'offer':
      handleOffer(signalData.offer)
      break
      
    case 'answer':
      handleAnswer(signalData.answer)
      break
      
    case 'ice-candidate':
      handleIceCandidate(signalData.candidate)
      break
  }
}

// 创建Offer
async function createOffer() {
  try {
    const offer = await peerConnection.value.createOffer()
    await peerConnection.value.setLocalDescription(offer)
    
    sendSignalingMessage({
      type: 'offer',
      offer: offer
    })
  } catch (error) {
    console.error('创建Offer失败:', error)
  }
}

// 处理Offer
async function handleOffer(offer) {
  try {
    await peerConnection.value.setRemoteDescription(offer)
    
    const answer = await peerConnection.value.createAnswer()
    await peerConnection.value.setLocalDescription(answer)
    
    sendSignalingMessage({
      type: 'answer',
      answer: answer
    })
  } catch (error) {
    console.error('处理Offer失败:', error)
  }
}

// 处理Answer
async function handleAnswer(answer) {
  try {
    await peerConnection.value.setRemoteDescription(answer)
  } catch (error) {
    console.error('处理Answer失败:', error)
  }
}

// 处理ICE候选
async function handleIceCandidate(candidate) {
  try {
    await peerConnection.value.addIceCandidate(candidate)
  } catch (error) {
    console.error('添加ICE候选失败:', error)
  }
}

// 暴露方法给父组件
defineExpose({
  startCall,
  handleSignalingMessage,
  endCall
})

// 组件卸载时清理资源
onBeforeUnmount(() => {
  endCall()
})
</script>

<style scoped>
.voice-call-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.call-interface {
  background: white;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  min-width: 300px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.caller-info {
  margin-bottom: 30px;
}

.caller-avatar {
  font-size: 60px;
  margin-bottom: 15px;
}

.caller-info h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #333;
}

.caller-info p {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.call-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.call-controls {
  display: flex;
  gap: 15px;
  justify-content: center;
  align-items: center;
}

.accept-btn {
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 15px 30px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.accept-btn:hover {
  background: #45a049;
}

.reject-btn {
  background: #f44336;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 15px 30px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.reject-btn:hover {
  background: #da190b;
}

.control-btn {
  background: #f0f0f0;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.3s;
}

.control-btn:hover {
  background: #e0e0e0;
}

.control-btn.active {
  background: #2196F3;
  color: white;
}

.incoming-call {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>