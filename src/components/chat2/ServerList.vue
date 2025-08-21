<template>
  <div class="server-list">
    <!-- 主服务器图标 - 用户头像 -->
    <div class="server-item home-server" :class="{ active: activeServer === 'home' }" @click="selectServer('home')">
      <div class="server-icon user-avatar">
        <span class="avatar-content">{{ myAvatar }}</span>
      </div>
      <div class="server-tooltip">{{ myName || 'LionChat' }}</div>
    </div>
    
    <!-- 分隔线 -->
    <div class="server-separator"></div>
    
    <!-- 好友服务器 -->
    <div class="server-item" :class="{ active: activeServer === 'friends' }" @click="selectServer('friends')">
      <div class="server-icon friends-icon">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M13 14c-3.36 0-4.63 1.67-4.97 3.5-.14.73.3 1.5 1.05 1.5h7.84c.75 0 1.19-.77 1.05-1.5C17.63 15.67 16.36 14 13 14zm-4-4c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z"/>
          <path fill="currentColor" d="M2 17.5c0-.83.67-1.5 1.5-1.5S5 16.67 5 17.5 4.33 19 3.5 19 2 18.33 2 17.5zm2.5-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
        </svg>
      </div>
      <div class="server-tooltip">好友</div>
      <div v-if="friendNotifications > 0" class="notification-badge">{{ friendNotifications }}</div>
    </div>
    
    <!-- 群组服务器 -->
    <div class="server-item" :class="{ active: activeServer === 'groups' }" @click="selectServer('groups')">
      <div class="server-icon groups-icon">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01 1l-2.99 4v7h2v7h4zm-7.5-10.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2.5 16v-7H6V9.5l2.5-1.5L10 10v5h1.5v7H8z"/>
        </svg>
      </div>
      <div class="server-tooltip">群组</div>
      <div v-if="groupNotifications > 0" class="notification-badge">{{ groupNotifications }}</div>
    </div>
    
    <!-- 此刻服务器 -->
    <div class="server-item" :class="{ active: activeServer === 'moments' }" @click="selectServer('moments')">
      <div class="server-icon moments-icon">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
      <div class="server-tooltip">此刻</div>
      <div v-if="momentNotifications > 0" class="notification-badge">{{ momentNotifications }}</div>
    </div>
    
    <!-- 分隔线 -->
    <div class="server-separator"></div>
    
    <!-- 添加服务器 -->
    <div class="server-item add-server" @click="showAddServer">
      <div class="server-icon add-icon">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
      </div>
      <div class="server-tooltip">添加服务器</div>
    </div>
    
    <!-- 设置 -->
    <div class="server-item settings-server" @click="openSettings">
      <div class="server-icon settings-icon">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
        </svg>
      </div>
      <div class="server-tooltip">设置</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { friends, groups, hasUnreadMoments, myAvatar, myName } from './state.js'

// Props
const props = defineProps({
  activeServer: {
    type: String,
    default: 'friends'
  }
})

// Emits
const emit = defineEmits(['server-change', 'open-settings'])

// 计算通知数量
const friendNotifications = computed(() => {
  return friends.value.reduce((total, friend) => total + (friend.unread || 0), 0)
})

const groupNotifications = computed(() => {
  return groups.value.reduce((total, group) => total + (group.unread || 0), 0)
})

const momentNotifications = computed(() => {
  return hasUnreadMoments.value ? 1 : 0
})

// 方法
function selectServer(serverType) {
  emit('server-change', serverType)
}

function showAddServer() {
  // 显示添加服务器对话框
  console.log('显示添加服务器对话框')
}

function openSettings() {
  emit('open-settings')
}
</script>

<style scoped>
.server-list {
  width: 72px;
  background: var(--server-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  height: 100vh;
  overflow-y: auto;
  border-right: 1px solid var(--border-color);
}

.server-item {
  position: relative;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.server-item:hover .server-tooltip {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

.server-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.server-item:hover .server-icon {
  border-radius: 16px;
  background: var(--accent-color);
  color: white;
}

.server-item.active .server-icon {
  border-radius: 16px;
  background: var(--accent-color);
  color: white;
}

.server-item.active::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 40px;
  background: white;
  border-radius: 0 2px 2px 0;
}

.server-item:hover::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: white;
  border-radius: 0 2px 2px 0;
  transition: height 0.2s ease;
}

.home-server .server-icon {
  background: var(--accent-color);
  color: white;
  border-radius: 16px;
}

.friends-icon {
  background: #43b581;
}

.groups-icon {
  background: #7289da;
}

.moments-icon {
  background: #f04747;
}

.user-avatar {
  background: var(--accent-color);
  border-radius: 50% !important;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.user-avatar .avatar-content {
  font-size: 24px;
  line-height: 1;
}

.home-server:hover .user-avatar {
  border-radius: 16px !important;
}

.add-server .server-icon {
  background: var(--bg-secondary);
  border: 2px dashed var(--border-color);
  color: var(--success-color);
}

.add-server:hover .server-icon {
  background: var(--success-color);
  border: 2px solid var(--success-color);
  color: white;
}

.settings-server .server-icon {
  background: var(--bg-secondary);
  color: var(--text-muted);
}

.settings-server:hover .server-icon {
  background: var(--text-muted);
  color: white;
}

.server-tooltip {
  position: absolute;
  left: 60px;
  top: 50%;
  transform: translateY(-50%) translateX(-10px);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s ease;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.server-tooltip::before {
  content: '';
  position: absolute;
  left: -4px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 4px 4px 4px 0;
  border-color: transparent var(--bg-tertiary) transparent transparent;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: var(--error-color);
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
  border: 2px solid var(--server-bg);
}

.server-separator {
  width: 32px;
  height: 2px;
  background: var(--border-color);
  border-radius: 1px;
  margin: 8px 0;
}

/* 滚动条样式 */
.server-list::-webkit-scrollbar {
  width: 0;
}

.server-list {
  scrollbar-width: none;
}
</style>