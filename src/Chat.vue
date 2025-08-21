<template>
   <div class="chat-layout" :class="`${currentTheme}-theme`">
     <!-- Discord风格三栏布局 -->
     <!-- 服务器列表 -->
     <ServerList 
       :active-server="activeServer" 
       @server-change="handleServerChange"
       @open-settings="openSettings" 
     />
     
     <!-- 频道列表 -->
     <ChannelList 
       v-if="showChannelList"
       :current-server-name="currentServerName" 
     />
     
     <!-- 消息区域 -->
     <MessageLayout />
   </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import ServerList from '@/components/chat2/ServerList.vue'
import ChannelList from '@/components/chat2/ChannelList.vue'
import MessageLayout from '@/components/chat2/MessageLayout.vue'
import { navTab } from '@/components/chat2/state.js'

const currentTheme = ref(localStorage.getItem('chat-theme') || 'dark')
const activeServer = ref('friends')


// 计算属性
const showChannelList = computed(() => {
  return activeServer.value !== 'home'
})

const currentServerName = computed(() => {
  switch (activeServer.value) {
    case 'friends':
      return '好友'
    case 'groups':
      return '群组'
    case 'moments':
      return '此刻'
    default:
      return 'LionChat'
  }
})

// 方法
function handleServerChange(serverType) {
  activeServer.value = serverType
  // 同步更新navTab状态
  if (serverType === 'friends') {
    navTab.value = 'friend'
  } else if (serverType === 'groups') {
    navTab.value = 'group'
  } else if (serverType === 'moments') {
    navTab.value = 'moment'
  }
}

function openSettings() {
  // 打开设置对话框
  console.log('打开设置')
}

onMounted(() => {
  // 监听主题变化
  const observer = new MutationObserver(() => {
    const theme = document.documentElement.getAttribute('data-theme') || 'dark'
    currentTheme.value = theme
  })
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
  
  // 初始化默认服务器
  handleServerChange('friends')
})
</script>

<style scoped>
.chat-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-color);
}

/* Discord风格三栏布局 */
.chat-layout > * {
  flex-shrink: 0;
}

/* 服务器列表固定宽度 */
.chat-layout > :first-child {
  width: 72px;
}

/* 频道列表固定宽度 */
.chat-layout > :nth-child(2) {
  width: 240px;
}

/* 消息区域占据剩余空间 */
.chat-layout > :last-child {
  flex: 1;
  min-width: 0;
}
</style>