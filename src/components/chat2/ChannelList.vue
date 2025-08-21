<template>
  <div class="channel-list">
    <div class="channel-header">
      <h3 class="server-name">{{ currentServerName }}</h3>
    </div>
    
    <div class="channel-categories">
      <!-- 好友分类 -->
      <div class="category" v-if="navTab === 'friend'">
        <div class="category-header" @click="toggleCategory('friends')">
          <svg class="category-arrow" :class="{ expanded: expandedCategories.friends }" width="12" height="12" viewBox="0 0 24 24">
            <path fill="currentColor" d="M8.5 17.5L15 12L8.5 6.5L7 8L11.5 12L7 16L8.5 17.5Z"/>
          </svg>
          <span class="category-name">好友</span>
        </div>
        
        <div class="channel-list-items" v-show="expandedCategories.friends">
          <div class="add-friend-section">
            <div class="channel-item add-friend" @click="showAddFriend = true">
              <svg class="channel-icon" width="16" height="16" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              <span class="channel-name">添加好友</span>
            </div>
          </div>
          
          <div v-if="showAddFriend" class="add-friend-dialog">
            <input v-model="newFriendName" placeholder="输入用户名搜索" class="add-friend-input" @keyup.enter="searchFriend" />
            <div class="add-friend-actions">
              <button class="search-btn" @click="searchFriend" :disabled="searching">搜索</button>
              <button class="cancel-btn" @click="cancelAddFriend">取消</button>
            </div>
          </div>
          
          <div v-if="showAddFriend && (searchResults.length > 0 || searchError)" class="search-results">
            <div v-if="searchError" class="search-error">{{ searchError }}</div>
            <div v-for="f in searchResults" :key="f.uuid" class="search-result-item" @click="addSearchedFriend(f)">
              <div class="user-avatar">
                <span v-if="f.avatar && f.avatar.startsWith('<svg')" v-html="f.avatar"></span>
                <span v-else>{{ f.avatar || '😀' }}</span>
              </div>
              <div class="user-info">
                <span class="user-name">{{ f.nickname || f.username }}</span>
                <span class="user-email">{{ f.email }}</span>
              </div>
              <span class="add-button">+</span>
            </div>
          </div>
          
          <div v-for="friend in friends" :key="friend.uuid" 
               class="channel-item friend-item" 
               :class="{ active: friend.uuid === TOUUID }"
               @click="selectFriend(friend)">
            <div class="friend-status"></div>
            <div class="friend-avatar">
              <span v-if="friend.avatarType === 'emoji'">{{ friend.avatar || '😀' }}</span>
              <span v-else-if="friend.avatarType === 'svg'" v-html="friend.avatar"></span>
            </div>
            <div class="friend-info">
              <span class="friend-name">{{ friend.name }}</span>
              <span class="friend-status-text">在线</span>
            </div>
            <div v-if="friend.unread > 0" class="unread-badge">{{ friend.unread }}</div>
          </div>
          
          <div v-if="friends.length === 0 && !showAddFriend" class="empty-state">
            <div class="empty-icon">👥</div>
            <div class="empty-text">还没有好友</div>
            <button class="empty-action" @click="showAddFriend = true">添加好友</button>
          </div>
        </div>
      </div>
      
      <!-- 群组分类 -->
      <div class="category" v-if="navTab === 'group'">
        <div class="category-header" @click="toggleCategory('groups')">
          <svg class="category-arrow" :class="{ expanded: expandedCategories.groups }" width="12" height="12" viewBox="0 0 24 24">
            <path fill="currentColor" d="M8.5 17.5L15 12L8.5 6.5L7 8L11.5 12L7 16L8.5 17.5Z"/>
          </svg>
          <span class="category-name">群组</span>
        </div>
        
        <div class="channel-list-items" v-show="expandedCategories.groups">
          <div class="add-group-section">
            <div class="channel-item add-group" @click="showCreateGroup = true">
              <svg class="channel-icon" width="16" height="16" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              <span class="channel-name">创建群组</span>
            </div>
            <div class="channel-item join-group" @click="showAddGroup = true">
              <svg class="channel-icon" width="16" height="16" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
              </svg>
              <span class="channel-name">加入群组</span>
            </div>
          </div>
          
          <div v-if="showCreateGroup" class="create-group-dialog">
            <div class="form-group">
              <input v-model="createGroupName" placeholder="群组名称" class="group-input" />
            </div>
            <div class="form-group">
              <select v-model="createGroupType" class="group-select">
                <option value="">选择类型</option>
                <option value="游戏">游戏</option>
                <option value="学习">学习</option>
                <option value="工作">工作</option>
                <option value="娱乐">娱乐</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div class="form-group">
              <textarea v-model="createGroupDescription" placeholder="群组描述" class="group-textarea" maxlength="200"></textarea>
            </div>
            <div class="form-actions">
              <button class="create-btn" @click="createGroup" :disabled="creatingGroup || !createGroupName.trim()">创建</button>
              <button class="cancel-btn" @click="cancelCreateGroup">取消</button>
            </div>
          </div>
          
          <div v-if="showAddGroup" class="add-group-dialog">
            <input v-model="newGroupName" placeholder="输入群组名称" class="group-input" @keyup.enter="joinGroup" />
            <div class="form-actions">
              <button class="join-btn" @click="joinGroup" :disabled="joiningGroup">加入</button>
              <button class="cancel-btn" @click="cancelAddGroup">取消</button>
            </div>
          </div>
          
          <div v-for="group in groups" :key="group.uuid" 
               class="channel-item group-item" 
               :class="{ active: group.uuid === TOUUID }"
               @click="selectGroup(group)">
            <div class="group-icon">#</div>
            <div class="group-info">
              <span class="group-name">{{ group.name }}</span>
            </div>
            <div v-if="group.unread > 0" class="unread-badge">{{ group.unread }}</div>
          </div>
          
          <div v-if="groups.length === 0 && !showCreateGroup && !showAddGroup" class="empty-state">
            <div class="empty-icon">💬</div>
            <div class="empty-text">还没有群组</div>
            <div class="empty-actions">
              <button class="empty-action" @click="showCreateGroup = true">创建群组</button>
              <button class="empty-action" @click="showAddGroup = true">加入群组</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 此刻分类 -->
      <div class="category" v-if="navTab === 'moment'">
        <div class="category-header" @click="toggleCategory('moments')">
          <svg class="category-arrow" :class="{ expanded: expandedCategories.moments }" width="12" height="12" viewBox="0 0 24 24">
            <path fill="currentColor" d="M8.5 17.5L15 12L8.5 6.5L7 8L11.5 12L7 16L8.5 17.5Z"/>
          </svg>
          <span class="category-name">此刻</span>
          <div v-if="hasUnreadMoments" class="notification-dot"></div>
        </div>
        
        <div class="channel-list-items" v-show="expandedCategories.moments">
          <div class="channel-item add-moment" @click="showAddMoment = true">
            <svg class="channel-icon" width="16" height="16" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            <span class="channel-name">发布动态</span>
          </div>
          
          <div v-if="showAddMoment" class="add-moment-dialog">
            <textarea v-model="newMomentContent" placeholder="分享你此刻在做什么..." class="moment-textarea" maxlength="200"></textarea>
            <div class="form-actions">
              <span class="char-count">{{ newMomentContent.length }}/200</span>
              <button class="publish-btn" @click="publishMoment" :disabled="!newMomentContent.trim() || publishingMoment">发布</button>
              <button class="cancel-btn" @click="cancelAddMoment">取消</button>
            </div>
          </div>
          
          <div class="moment-list">
            <div v-for="moment in moments" :key="moment.id" class="moment-item">
              <div class="moment-header">
                <div class="moment-avatar">
                  <svg viewBox="0 0 36 36" fill="none" width="24" height="24">
                    <rect width="36" height="36" fill="#49007e" rx="18"/>
                  </svg>
                </div>
                <div class="moment-info">
                  <span class="moment-author">{{ moment.author }}</span>
                  <span class="moment-time">{{ formatTime(moment.timestamp) }}</span>
                </div>
              </div>
              <div class="moment-content">{{ moment.content }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { TOUUID, friends, groups, navTab, hasUnreadMoments, currentChatTargetName, currentChatID, currentChatType, API_BASE_URL } from './state.js'

// 获取token
const route = useRoute()
const sessionKey = route.query.session || 'default'
const token = localStorage.getItem(`${sessionKey}`)

// 从父组件接收的props和事件
const props = defineProps({
  currentServerName: {
    type: String,
    default: 'LionChat'
  }
})

// 展开的分类
const expandedCategories = ref({
  friends: true,
  groups: true,
  moments: true
})

// 添加好友相关
const showAddFriend = ref(false)
const newFriendName = ref('')
const searching = ref(false)
const searchResults = ref([])
const searchError = ref('')

// 创建群组相关
const showCreateGroup = ref(false)
const createGroupName = ref('')
const createGroupType = ref('')
const createGroupDescription = ref('')
const creatingGroup = ref(false)

// 加入群组相关
const showAddGroup = ref(false)
const newGroupName = ref('')
const joiningGroup = ref(false)

// 此刻相关
const showAddMoment = ref(false)
const newMomentContent = ref('')
const publishingMoment = ref(false)
const moments = ref([])

// 方法
function toggleCategory(category) {
  expandedCategories.value[category] = !expandedCategories.value[category]
}

function searchFriend() {
  // 搜索好友逻辑
  console.log('搜索好友:', newFriendName.value)
}

function cancelAddFriend() {
  showAddFriend.value = false
  newFriendName.value = ''
  searchResults.value = []
  searchError.value = ''
}

function addSearchedFriend(friend) {
  // 添加好友逻辑
  console.log('添加好友:', friend)
}

function selectFriend(friend) {
  // 选择好友逻辑
  TOUUID.value = friend.uuid
  currentChatTargetName.value = friend.name
  currentChatID.value = friend.uuid
  currentChatType.value = 1 // 1表示好友聊天
  console.log('选择好友:', friend)
}

function createGroup() {
  // 创建群组逻辑
  console.log('创建群组:', createGroupName.value)
}

function cancelCreateGroup() {
  showCreateGroup.value = false
  createGroupName.value = ''
  createGroupType.value = ''
  createGroupDescription.value = ''
}

function joinGroup() {
  // 加入群组逻辑
  console.log('加入群组:', newGroupName.value)
}

function cancelAddGroup() {
  showAddGroup.value = false
  newGroupName.value = ''
}

function selectGroup(group) {
  // 选择群组逻辑
  TOUUID.value = group.uuid
  currentChatTargetName.value = group.name
  currentChatID.value = group.uuid
  currentChatType.value = 2 // 2表示群组聊天
  console.log('选择群组:', group)
}

// 获取好友列表
async function getFriendList() {
  try {
    const resp = await fetch(`${API_BASE_URL}/v1/api/friend/friendList`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await resp.json();
    if (data.code == 4444) {
      console.log(data.msg)
      return
    }
    // 从localStorage获取未读消息计数
    const savedUnreadCounts = JSON.parse(localStorage.getItem(`unreadCounts_${sessionKey}`) || '{}')
    friends.value = data.data.map(item => ({
      name: item.nickname,
      email: item.email,
      uuid: item.uuid,
      unread: savedUnreadCounts[item.uuid] || 0
    }))
  } catch (e) {
    console.error('获取好友列表失败:', e.message)
  }
}

// 获取群组列表
async function getGroupList() {
  try {
    const resp = await fetch(`${API_BASE_URL}/v1/api/group/group-list`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await resp.json();
    if (data.code == 1122) {
      console.log(data.msg)
      return
    } else if (data.code == 0) {
      console.log(data.msg)
      // 从localStorage获取未读消息计数
      const savedUnreadCounts = JSON.parse(localStorage.getItem(`unreadCounts_${sessionKey}`) || '{}')
      // 处理返回的数据结构
      if (data.data && Array.isArray(data.data)) {
        groups.value = data.data.map(item => ({
          uuid: item.group_uuid,
          name: item.group_name,
          unread: savedUnreadCounts[item.group_uuid] || 0
        }))
      } else {
        console.warn('Unexpected group list data structure:', data)
        groups.value = []
      }
    }
  } catch (e) {
    console.error('获取群组列表失败:', e.message)
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  await getFriendList()
  await getGroupList()
})

function publishMoment() {
  // 发布动态逻辑
  console.log('发布动态:', newMomentContent.value)
}

function cancelAddMoment() {
  showAddMoment.value = false
  newMomentContent.value = ''
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleString()
}
</script>

<style scoped>
.channel-list {
  width: 240px;
  background: var(--channel-bg);
  display: flex;
  flex-direction: column;
  height: 100vh;
  border-right: 1px solid var(--border-color);
}

.channel-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.server-name {
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.channel-categories {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.category {
  margin-bottom: 16px;
}

.category-header {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
}

.category-header:hover {
  color: var(--text-primary);
}

.category-arrow {
  margin-right: 4px;
  transition: transform 0.2s;
}

.category-arrow.expanded {
  transform: rotate(90deg);
}

.category-name {
  flex: 1;
}

.notification-dot {
  width: 8px;
  height: 8px;
  background: var(--error-color);
  border-radius: 50%;
  margin-left: 4px;
}

.channel-list-items {
  padding: 0 8px;
}

.channel-item {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  margin: 1px 0;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.15s;
  position: relative;
}

.channel-item:hover {
  background: var(--nav-hover-bg);
  color: var(--text-primary);
}

.channel-item.active {
  background: var(--nav-hover-bg);
  color: var(--text-primary);
}

.channel-item.active::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--accent-color);
  border-radius: 0 2px 2px 0;
}

.channel-icon {
  margin-right: 8px;
  color: var(--text-muted);
}

.channel-name {
  font-size: 14px;
  font-weight: 500;
}

.friend-item {
  padding: 8px;
}

.friend-status {
  width: 8px;
  height: 8px;
  background: var(--success-color);
  border-radius: 50%;
  margin-right: 8px;
  border: 2px solid var(--channel-bg);
}

.friend-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  font-size: 18px;
  background: var(--bg-tertiary);
}

.friend-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.friend-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.friend-status-text {
  font-size: 12px;
  color: var(--text-muted);
}

.group-item {
  padding: 6px 8px;
}

.group-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  font-size: 16px;
  color: var(--text-muted);
}

.group-info {
  flex: 1;
}

.group-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.unread-badge {
  background: var(--error-color);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

/* 对话框样式 */
.add-friend-dialog,
.create-group-dialog,
.add-group-dialog,
.add-moment-dialog {
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 12px;
  margin: 8px 0;
}

.form-group {
  margin-bottom: 8px;
}

.add-friend-input,
.group-input,
.group-select,
.group-textarea,
.moment-textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 14px;
  box-sizing: border-box;
}

.group-textarea,
.moment-textarea {
  min-height: 60px;
  resize: vertical;
  font-family: inherit;
}

.form-actions,
.add-friend-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.search-btn,
.create-btn,
.join-btn,
.publish-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.search-btn:hover,
.create-btn:hover,
.join-btn:hover,
.publish-btn:hover {
  background: var(--accent-hover);
}

.cancel-btn {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.cancel-btn:hover {
  background: var(--nav-hover-bg);
}

.char-count {
  font-size: 11px;
  color: var(--text-muted);
  margin-left: auto;
}

/* 搜索结果 */
.search-results {
  margin-top: 8px;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.search-result-item:hover {
  background: var(--nav-hover-bg);
}

.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  font-size: 14px;
  background: var(--bg-tertiary);
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.user-email {
  font-size: 11px;
  color: var(--text-muted);
}

.add-button {
  color: var(--accent-color);
  font-size: 16px;
  font-weight: bold;
}

.search-error {
  color: var(--error-color);
  font-size: 12px;
  padding: 8px;
  text-align: center;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 20px;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.empty-text {
  font-size: 14px;
  margin-bottom: 12px;
}

.empty-action {
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 12px;
  cursor: pointer;
  margin: 0 4px;
}

.empty-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* 此刻相关 */
.moment-item {
  padding: 8px;
  border-bottom: 1px solid var(--border-color);
}

.moment-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.moment-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 8px;
}

.moment-info {
  display: flex;
  flex-direction: column;
}

.moment-author {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.moment-time {
  font-size: 10px;
  color: var(--text-muted);
}

.moment-content {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}
</style>