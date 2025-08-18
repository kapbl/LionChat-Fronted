<template>
  <div v-if="showCallInterface" class="video-call-overlay">
    <!-- 来电界面 -->
    <div v-if="callState === 'incoming'" class="call-interface incoming-call">
      <div class="caller-info">
        <div class="caller-avatar">📹</div>
        <h3>{{ callerName }}</h3>
        <p>视频通话邀请</p>
      </div>
      <div class="call-actions">
        <button @click="acceptCall" class="accept-btn">接听</button>
        <button @click="rejectCall" class="reject-btn">拒绝</button>
      </div>
    </div>

    <!-- 拨号界面 -->
    <div v-if="callState === 'calling'" class="call-interface outgoing-call">
      <div class="caller-info">
        <div class="caller-avatar">📹</div>
        <h3>{{ targetName }}</h3>
        <p>正在呼叫...</p>
      </div>
      <div class="call-actions">
        <button @click="hangUp" class="reject-btn">挂断</button>
      </div>
    </div>

    <!-- 通话中界面 -->
    <div v-if="callState === 'connected'" class="video-call-interface">
      <!-- 远程视频（主画面） -->
      <div class="remote-video-container">
        <video 
          ref="remoteVideo" 
          class="remote-video" 
          autoplay 
          playsinline
          :muted="false"
        ></video>
        
        <!-- 通话信息覆盖层 -->
        <div class="call-info-overlay">
          <div class="caller-name">{{ targetName || callerName }}</div>
          <div class="call-duration">{{ formatCallDuration(callDuration) }}</div>
        </div>
      </div>
      
      <!-- 本地视频（小窗口） -->
      <div class="local-video-container" :class="{ minimized: isLocalVideoMinimized }">
        <video 
          ref="localVideo" 
          class="local-video" 
          autoplay 
          playsinline 
          muted
        ></video>
        <button @click="toggleLocalVideoSize" class="toggle-size-btn">⤢</button>
      </div>
      
      <!-- 控制按钮 -->
      <div class="video-call-controls">
        <button @click="toggleMute" :class="{ active: isMuted }" class="control-btn" title="静音">
          {{ isMuted ? '🔇' : '🎤' }}
        </button>
        
        <button @click="toggleVideo" :class="{ active: !isVideoEnabled }" class="control-btn" title="关闭摄像头">
          {{ isVideoEnabled ? '📹' : '📷' }}
        </button>
        
        <button @click="switchCamera" class="control-btn" title="切换摄像头" v-if="hasMultipleCameras">
          🔄
        </button>
        
        <button @click="toggleSpeaker" :class="{ active: isSpeakerOn }" class="control-btn" title="扬声器">
          {{ isSpeakerOn ? '🔊' : '🔈' }}
        </button>
        
        <button @click="hangUp" class="reject-btn" title="挂断">📞</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
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
const isVideoEnabled = ref(true)
const isSpeakerOn = ref(false)
const isLocalVideoMinimized = ref(false)
const hasMultipleCameras = ref(false)
const currentCameraIndex = ref(0)
const availableCameras = ref([])
const callDuration = ref(0)
const callTimer = ref(null)

// 视频元素引用
const localVideo = ref(null)
const remoteVideo = ref(null)

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

// 获取可用摄像头
async function getAvailableCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    availableCameras.value = devices.filter(device => device.kind === 'videoinput')
    hasMultipleCameras.value = availableCameras.value.length > 1
  } catch (error) {
    console.error('获取摄像头列表失败:', error)
  }
}

// 初始化WebRTC
async function initWebRTC() {
  try {
    // 获取用户媒体（音频和视频）
    const constraints = {
      audio: true,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
        facingMode: 'user'
      }
    }
    
    localStream.value = await navigator.mediaDevices.getUserMedia(constraints)
    
    // 设置本地视频
    await nextTick()
    if (localVideo.value) {
      localVideo.value.srcObject = localStream.value
    }
    
    // 创建RTCPeerConnection
    peerConnection.value = new RTCPeerConnection(rtcConfiguration)
    
    // 添加本地流
    localStream.value.getTracks().forEach(track => {
      peerConnection.value.addTrack(track, localStream.value)
    })
    
    // 监听远程流
    peerConnection.value.ontrack = (event) => {
      remoteStream.value = event.streams[0]
      playRemoteVideo()
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
    
    // 获取可用摄像头
    await getAvailableCameras()
    
  } catch (error) {
    console.error('初始化WebRTC失败:', error)
    alert('无法访问摄像头或麦克风，请检查权限设置')
  }
}

// 发起视频通话
async function startCall(uuid, name) {
  targetUuid.value = uuid
  targetName.value = name
  callState.value = 'calling'
  showCallInterface.value = true
  
  await initWebRTC()
  
  // 发送通话邀请
  sendSignalingMessage({
    type: 'video-call-invite',
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
    type: 'video-call-accept',
    from: props.myUuid,
    to: targetUuid.value
  })
  
  callState.value = 'connected'
}

// 拒绝电话
function rejectCall() {
  sendSignalingMessage({
    type: 'video-call-reject',
    from: props.myUuid,
    to: targetUuid.value
  })
  
  endCall()
}

// 挂断电话
function hangUp() {
  sendSignalingMessage({
    type: 'video-call-hangup',
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
  
  // 清理视频元素
  if (localVideo.value) {
    localVideo.value.srcObject = null
  }
  if (remoteVideo.value) {
    remoteVideo.value.srcObject = null
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
  isVideoEnabled.value = true
  isSpeakerOn.value = false
  isLocalVideoMinimized.value = false
  
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

// 切换视频
function toggleVideo() {
  if (localStream.value) {
    const videoTrack = localStream.value.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      isVideoEnabled.value = videoTrack.enabled
    }
  }
}

// 切换摄像头
async function switchCamera() {
  if (!hasMultipleCameras.value || !localStream.value) return
  
  try {
    // 停止当前视频轨道
    const videoTrack = localStream.value.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.stop()
    }
    
    // 切换到下一个摄像头
    currentCameraIndex.value = (currentCameraIndex.value + 1) % availableCameras.value.length
    const selectedCamera = availableCameras.value[currentCameraIndex.value]
    
    // 获取新的视频流
    const newVideoStream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: selectedCamera.deviceId },
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      }
    })
    
    // 替换视频轨道
    const newVideoTrack = newVideoStream.getVideoTracks()[0]
    const sender = peerConnection.value.getSenders().find(s => 
      s.track && s.track.kind === 'video'
    )
    
    if (sender) {
      await sender.replaceTrack(newVideoTrack)
    }
    
    // 更新本地流
    const audioTrack = localStream.value.getAudioTracks()[0]
    localStream.value = new MediaStream([audioTrack, newVideoTrack])
    
    // 更新本地视频显示
    if (localVideo.value) {
      localVideo.value.srcObject = localStream.value
    }
    
  } catch (error) {
    console.error('切换摄像头失败:', error)
  }
}

// 切换扬声器
function toggleSpeaker() {
  isSpeakerOn.value = !isSpeakerOn.value
  // 这里可以添加实际的扬声器切换逻辑
}

// 切换本地视频窗口大小
function toggleLocalVideoSize() {
  isLocalVideoMinimized.value = !isLocalVideoMinimized.value
}

// 播放远程视频
function playRemoteVideo() {
  if (remoteStream.value && remoteVideo.value) {
    remoteVideo.value.srcObject = remoteStream.value
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
  if (ws && ws.readyState === WebSocket.OPEN && props.messageType) {
    const msgObj = {
      avatar: '',
      fromUsername: props.myName,
      from: props.myUuid,
      to: message.to || targetUuid.value,
      content: JSON.stringify(message),
      contentType: 7, // 新增：WebRTC视频信令消息类型
      type: 'webrtc-video-signal',
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
    
    const messageBuffer = props.messageType.encode(props.messageType.create(msgObj)).finish()
    ws.send(messageBuffer)
  }
}

// 处理信令消息
function handleSignalingMessage(message) {
  const signalData = JSON.parse(message.content)
  console.log("处理视频信令消息:", signalData)

  switch (signalData.type) {
    case 'video-call-invite':
      // 收到视频通话邀请
      callerName.value = signalData.fromName
      targetUuid.value = signalData.from
      callState.value = 'incoming'
      showCallInterface.value = true
      break
      
    case 'video-call-accept':
      // 对方接受通话
      createOffer()
      break
      
    case 'video-call-reject':
      // 对方拒绝通话
      alert('对方拒绝了视频通话')
      endCall()
      break
      
    case 'video-call-hangup':
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

// 组件卸载时清理
onBeforeUnmount(() => {
  endCall()
})
</script>

<style scoped>
.video-call-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--modal-overlay, rgba(0, 0, 0, 0.9));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.call-interface {
  background: var(--bg-secondary, white);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  min-width: 300px;
  box-shadow: 0 10px 30px var(--shadow-dark, rgba(0, 0, 0, 0.3));
}

.video-call-interface {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}

.remote-video-container {
  flex: 1;
  position: relative;
  background: var(--video-bg, #000);
  display: flex;
  align-items: center;
  justify-content: center;
}

.remote-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.call-info-overlay {
  position: absolute;
  top: 20px;
  left: 20px;
  color: var(--text-primary, white);
  z-index: 10;
}

.caller-name {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.call-duration {
  font-size: 16px;
  opacity: 0.9;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.local-video-container {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 200px;
  height: 150px;
  background: var(--video-bg, #000);
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid var(--border-light, rgba(255, 255, 255, 0.3));
  transition: all 0.3s ease;
  z-index: 10;
}

.local-video-container.minimized {
  width: 120px;
  height: 90px;
}

.local-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.toggle-size-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: var(--btn-overlay, rgba(0, 0, 0, 0.5));
  color: var(--text-primary, white);
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-call-controls {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 15px;
  background: var(--controls-bg, rgba(0, 0, 0, 0.7));
  padding: 15px 25px;
  border-radius: 50px;
  backdrop-filter: blur(10px);
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
  color: var(--text-primary, #333);
}

.caller-info p {
  margin: 0;
  color: var(--text-secondary, #666);
  font-size: 16px;
}

.call-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.accept-btn {
  background: var(--success-color, #4CAF50);
  color: var(--text-primary, white);
  border: none;
  border-radius: 50px;
  padding: 15px 30px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.accept-btn:hover {
  background: var(--success-hover, #45a049);
}

.reject-btn {
  background: var(--error-color, #f44336);
  color: var(--text-primary, white);
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reject-btn:hover {
  background: var(--error-hover, #da190b);
}

.control-btn {
  background: var(--btn-secondary, rgba(255, 255, 255, 0.2));
  color: var(--text-primary, white);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: var(--btn-secondary-hover, rgba(255, 255, 255, 0.3));
  transform: scale(1.1);
}

.control-btn.active {
  background: var(--error-color, #f44336);
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

/* 响应式设计 */
@media (max-width: 768px) {
  .local-video-container {
    width: 120px;
    height: 90px;
    top: 10px;
    right: 10px;
  }
  
  .local-video-container.minimized {
    width: 80px;
    height: 60px;
  }
  
  .video-call-controls {
    bottom: 20px;
    padding: 10px 20px;
  }
  
  .control-btn {
    width: 45px;
    height: 45px;
    font-size: 18px;
  }
  
  .reject-btn {
    width: 50px;
    height: 50px;
    font-size: 18px;
  }
  
  .call-info-overlay {
    top: 10px;
    left: 10px;
  }
  
  .caller-name {
    font-size: 20px;
  }
  
  .call-duration {
    font-size: 14px;
  }
}
</style>