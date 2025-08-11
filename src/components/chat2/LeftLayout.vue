<template>
    <div class="left-list">
        <div class="my-info">
            <div class="my-avatar">
                <svg viewBox="0 0 36 36" fill="none" role="img" xmlns="" width="50" height="50">
                    <mask id="«R47rrlb»" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
                        <rect width="36" height="36" rx="72" fill="#FFFFFF"></rect>
                    </mask>
                    <g mask="url(#«R47rrlb»)">
                        <rect width="36" height="36" fill="#49007e"></rect>
                        <rect x="0" y="0" width="36" height="36" transform="translate(7 1) rotate(53 18 18) scale(1.2)"
                            fill="#ff7d10" rx="6"></rect>
                        <g transform="translate(3.5 -4) rotate(3 18 18)">
                            <path d="M15 21c2 1 4 1 6 0" stroke="#000000" fill="none" stroke-linecap="round"></path>
                            <rect x="11" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#000000"></rect>
                            <rect x="23" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#000000"></rect>
                        </g>
                    </g>
                </svg>
            </div>
            <div class="my-name">{{ myName }}</div>
            <div class="my-uuid">{{ myUuid }}</div>
        </div>
        <div class="nav-list">
            <div class="nav-item" :class="{ active: navTab === 'friend' }" @click="handleNavClick('friend')">
                <span class="nav-icon"></span> 好友
            </div>
            <div class="nav-item" :class="{ active: navTab === 'group' }" @click="handleNavClick('group')">
                <span class="nav-icon"></span> 群组
            </div>
            <div class="nav-item" :class="{ active: navTab === 'moment' }" @click="handleNavClick('moment')">
                <span class="nav-icon"></span>此刻
                <div v-if="hasUnreadMoments" class="moment-notification-dot"></div>
            </div>
            <div class="nav-item" @click="showSettings = true"><span class="nav-icon"></span>设置</div>
        </div>
    </div>
    <div class="activated-list">
        <div v-if="navTab === 'friend'">
            <div class="friend-list-title-row">
                <div class="friend-list-title">好友</div>
                <button class="add-friend-btn" @click="showAddFriend = true">添加好友</button>
            </div>
            <div v-if="showAddFriend" class="add-friend-dialog">
                <input v-model="newFriendName" placeholder="Username" class="add-friend-input"
                    @keyup.enter="searchFriend" />
                <button class="add-friend-confirm" @click="searchFriend" :disabled="searching">Search</button>
                <button class="add-friend-cancel" @click="cancelAddFriend">Cancel</button>
            </div>
            <div v-if="showAddFriend && (searchResults.length > 0 || searchError)" class="search-result-list">
                <div v-if="searchError" class="search-error">{{ searchError }}</div>
                <div v-for="f in searchResults" :key="f.uuid" class="search-result-item" @click="addSearchedFriend(f)">
                    <span class="search-avatar"
                        v-if="f.avatar && (f.avatar.endsWith('.png') || f.avatar.endsWith('.jpg') || f.avatar.endsWith('.jpeg') || f.avatar.endsWith('.gif'))">
                        <img :src="'/avatars/' + f.avatar" alt="avatar"
                            style="width:32px;height:32px;border-radius:50%;object-fit:cover;" />
                    </span>
                    <span class="search-avatar" v-else-if="f.avatar && f.avatar.startsWith('<svg')"
                        v-html="f.avatar"></span>
                    <span class="search-avatar" v-else>{{ f.avatar || '😀' }}</span>
                    <span class="search-nickname">{{ f.nickname || f.username }}</span>
                    <span class="search-uuid">({{ f.uuid }})</span>
                    <span class="search-add">点击添加</span>
                </div>
            </div>

            <div v-for="friend in friends" :key="friend.uuid" class="friend-item"
                :class="{ active: friend.uuid === toUuid }" @click="selectFriend(friend)">
                <div class="friend-avatar">
                    <span v-if="friend.avatarType === 'emoji'" class="avatar-emoji">{{ friend.avatar }}</span>
                    <span v-else-if="friend.avatarType === 'svg'" v-html="friend.avatar"></span>
                </div>
                <div class="friend-info">
                    <div class="friend-name">{{ friend.name }}</div>
                    <div class="friend-uuid">{{ friend.uuid }}</div>
                </div>
                <div v-if="friend.unread > 0" class="unread-bubble">{{ friend.unread }}</div>
            </div>
        </div>
        <div v-else-if="navTab === 'group'">
            <div class="group-list-title-row">
                <div class="group-list-title">群聊</div>
                <div class="group-actions">
                    <button class="create-group-btn" @click="showCreateGroup = true">＋创建群组</button>
                    <button class="add-group-btn" @click="showAddGroup = true">＋加入群聊</button>
                </div>
            </div>
            <div v-if="showCreateGroup" class="create-group-dialog">
                <div class="create-group-form">
                    <div class="form-group">
                        <label>群组名称：</label>
                        <input v-model="createGroupName" placeholder="输入新群组名称" class="create-group-input" />
                    </div>
                    <div class="form-group">
                        <label>群组类型：</label>
                        <select v-model="createGroupType" class="create-group-select">
                            <option value="">请选择群组类型</option>
                            <option value="游戏">游戏</option>
                            <option value="体育">体育</option>
                            <option value="新闻">新闻</option>
                            <option value="学习">学习</option>
                            <option value="工作">工作</option>
                            <option value="娱乐">娱乐</option>
                            <option value="生活">生活</option>
                            <option value="技术">技术</option>
                            <option value="其他">其他</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>群组描述：</label>
                        <textarea 
                            v-model="createGroupDescription" 
                            placeholder="请输入群组描述（最多200字）" 
                            class="create-group-textarea"
                            maxlength="200"
                        ></textarea>
                        <div class="char-count">{{ createGroupDescription.length }}/200</div>
                    </div>
                    <div class="form-actions">
                        <button class="create-group-confirm" @click="createGroup" :disabled="creatingGroup || !createGroupName.trim() || !createGroupType">创建</button>
                        <button class="create-group-cancel" @click="cancelCreateGroup">取消</button>
                    </div>
                </div>
            </div>
            <div v-if="showAddGroup" class="add-group-dialog">
                <input v-model="newGroupName" placeholder="输入要加入的群聊名称" class="add-group-input"
                    @keyup.enter="joinGroup" />
                <button class="add-group-confirm" @click="joinGroup" :disabled="joiningGroup">加入</button>
                <button class="add-group-cancel" @click="cancelAddGroup">取消</button>
            </div>
            <div v-for="group in groups" :key="group.uuid" class="group-item" :class="{ active: group.uuid === toUuid }"
                @click="selectGroup(group)">
                <div class="group-avatar">
                    <span v-if="group.avatarType === 'emoji'" class="avatar-emoji">{{ group.avatar }}</span>
                    <span v-else-if="group.avatarType === 'svg'" v-html="group.avatar"></span>
                </div>
                <div class="group-info">
                    <div class="group-name">{{ group.name }}</div>
                    <div class="group-uuid">{{ group.uuid }}</div>
                </div>
                <div v-if="group.unread > 0" class="group_unread-bubble">{{ group.unread }}</div>
            </div>
        </div>
        <div v-else-if="navTab === 'moment'">
            <div class="moment-list-title-row">
                <div class="moment-list-title">此刻</div>
                <button class="add-moment-btn" @click="showAddMoment = true">发布动态</button>
            </div>
            <div v-if="showAddMoment" class="add-moment-dialog">
                <textarea v-model="newMomentContent" placeholder="分享你此刻在做什么..." class="add-moment-textarea"
                    @keyup.ctrl.enter="publishMoment" maxlength="200"></textarea>
                <div class="moment-actions">
                    <span class="char-count">{{ newMomentContent.length }}/200</span>
                    <button class="publish-moment-btn" @click="publishMoment" :disabled="!newMomentContent.trim() || publishingMoment">发布</button>
                    <button class="cancel-moment-btn" @click="cancelAddMoment">取消</button>
                </div>
            </div>
            <div class="moment-list">
                <div v-for="moment in moments" :key="moment.id" class="moment-item">
                    <div class="moment-header">
                        <div class="moment-avatar">
                            <svg viewBox="0 0 36 36" fill="none" role="img" xmlns="" width="32" height="32">
                                <mask id="moment-avatar" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
                                    <rect width="36" height="36" rx="72" fill="#FFFFFF"></rect>
                                </mask>
                                <g mask="url(#moment-avatar)">
                                    <rect width="36" height="36" fill="#49007e"></rect>
                                    <rect x="0" y="0" width="36" height="36" transform="translate(7 1) rotate(53 18 18) scale(1.2)"
                                        fill="#ff7d10" rx="6"></rect>
                                </g>
                            </svg>
                        </div>
                        <div class="moment-info">
                            <div class="moment-author">{{ moment.author }}</div>
                            <div class="moment-time">{{ formatTime(moment.timestamp) }}</div>
                        </div>
                    </div>
                    <div class="moment-content">{{ moment.content }}</div>
                    <div class="moment-actions">
                        <button class="moment-action-btn" @click="likeMoment(moment)">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            <span>{{ moment.likes || 0 }}</span>
                        </button>
                        <button class="moment-action-btn" @click="toggleComments(moment)">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <span>{{ moment.comments?.length || 0 }}</span>
                        </button>
                    </div>
                    <!-- 评论区域 -->
                    <div v-if="moment.showComments" class="moment-comments">
                        <div class="comment-input-area">
                            <textarea 
                                v-model="moment.newComment" 
                                placeholder="写下你的评论..." 
                                class="comment-input"
                                @keyup.ctrl.enter="submitComment(moment)"
                                maxlength="500"
                            ></textarea>
                            <div class="comment-actions">
                                <span class="comment-char-count">{{ (moment.newComment || '').length }}/500</span>
                                <button 
                                    class="submit-comment-btn" 
                                    @click="submitComment(moment)" 
                                    :disabled="!moment.newComment?.trim() || submittingComment"
                                >
                                    发布评论
                                </button>
                            </div>
                        </div>
                        <div class="comments-list">
                            <div v-for="comment in moment.comments" :key="comment.id" class="comment-item">
                                <div class="comment-header">
                                    <div class="comment-avatar">
                                        <svg viewBox="0 0 36 36" fill="none" role="img" xmlns="" width="24" height="24">
                                            <mask id="comment-avatar" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
                                                <rect width="36" height="36" rx="72" fill="#FFFFFF"></rect>
                                            </mask>
                                            <g mask="url(#comment-avatar)">
                                                <rect width="36" height="36" fill="#49007e"></rect>
                                                <rect x="0" y="0" width="36" height="36" transform="translate(7 1) rotate(53 18 18) scale(1.2)"
                                                    fill="#ff7d10" rx="6"></rect>
                                            </g>
                                        </svg>
                                    </div>
                                    <div class="comment-info">
                                        <div class="comment-author">{{ comment.author }}</div>
                                        <div class="comment-time">{{ formatTime(comment.timestamp) }}</div>
                                    </div>
                                </div>
                                <div class="comment-content">{{ comment.content }}</div>
                            </div>
                            <div v-if="!moment.comments || moment.comments.length === 0" class="empty-comments">
                                <div class="empty-comment-text">还没有评论，快来抢沙发吧！</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="moments.length === 0" class="empty-moments">
                    <div class="empty-icon">📝</div>
                    <div class="empty-text">还没有动态，快来发布第一条吧！</div>
                </div>
            </div>
        </div>
        <div v-if="showFriendRequest" class="friend-request-overlay">
            <div class="friend-request-dialog">
                <h3>好友请求</h3>
                <p>来自：{{ friendRequestInfo.fromUsername }}</p>
                <p>留言：{{ friendRequestInfo.content }}</p>
                <div class="request-buttons">
                    <button @click="handleFriendRequest(true)" class="accept-btn">接受</button>
                    <button @click="handleFriendRequest(false)" class="reject-btn">拒绝</button>
                </div>
            </div>
        </div>
        <div v-if="showFriendReplyRequest" class="friend-response-overlay">
            <div class="friend-response-dialog">
                <h3>好友请求回复</h3>
                <p>来自：{{ friendResponseInfo.fromUsername }}</p>
                <p>留言：{{ friendResponseInfo.content }}</p>
                <div class="response-buttons">
                    <button @click="handleFriendResponse()" class="ok-btn">知道了</button>
                </div>
            </div>
        </div>
        <div v-if="showSettings" class="settings-overlay">
            <div class="settings-dialog">
                <div class="settings-header">
                    <h3>设置</h3>
                    <button class="close-btn" @click="showSettings = false">×</button>
                </div>
                <div class="settings-content">
                    <div class="settings-tabs">
                        <button class="tab-btn" :class="{ active: settingsTab === 'profile' }"
                            @click="settingsTab = 'profile'">
                            个人信息
                        </button>
                        <button class="tab-btn" :class="{ active: settingsTab === 'password' }"
                            @click="settingsTab = 'password'">
                            修改密码
                        </button>
                        <button class="tab-btn" :class="{ active: settingsTab === 'theme' }"
                            @click="settingsTab = 'theme'">
                            主题设置
                        </button>
                    </div>

                    <!-- 个人信息设置 -->
                    <div v-if="settingsTab === 'profile'" class="settings-panel">
                        <div class="form-group">
                            <label>昵称：</label>
                            <input v-model="profileForm.nickname" type="text" class="form-input" placeholder="请输入昵称" />
                        </div>
                        <div class="form-group">
                            <label>用户名：</label>
                            <input v-model="profileForm.username" type="text" class="form-input" placeholder="请输入用户名" />
                        </div>
                        <div class="form-group">
                            <label>邮箱：</label>
                            <input v-model="profileForm.email" type="email" class="form-input" placeholder="请输入邮箱" />
                        </div>
                        <div class="form-actions">
                            <button @click="updateProfile" class="save-btn" :disabled="updatingProfile">保存</button>
                            <button @click="resetProfileForm" class="cancel-btn">重置</button>
                        </div>
                    </div>

                    <!-- 修改密码 -->
                    <div v-if="settingsTab === 'password'" class="settings-panel">
                        <div class="form-group">
                            <label>当前密码：</label>
                            <input v-model="passwordForm.currentPassword" type="password" class="form-input"
                                placeholder="请输入当前密码" />
                        </div>
                        <div class="form-group">
                            <label>新密码：</label>
                            <input v-model="passwordForm.newPassword" type="password" class="form-input"
                                placeholder="请输入新密码" />
                        </div>
                        <div class="form-group">
                            <label>确认新密码：</label>
                            <input v-model="passwordForm.confirmPassword" type="password" class="form-input"
                                placeholder="请再次输入新密码" />
                        </div>
                        <div class="form-actions">
                            <button @click="updatePassword" class="save-btn" :disabled="updatingPassword">修改密码</button>
                            <button @click="resetPasswordForm" class="cancel-btn">重置</button>
                        </div>
                    </div>

                    <!-- 主题设置 -->
                    <div v-if="settingsTab === 'theme'" class="settings-panel">
                        <div class="theme-section">
                            <h4>外观模式</h4>
                            <div class="theme-options">
                                <div class="theme-option" :class="{ active: currentTheme === 'light' }" @click="setTheme('light')">
                                    <div class="theme-preview light-preview">
                                        <div class="preview-header"></div>
                                        <div class="preview-content"></div>
                                    </div>
                                    <span>浅色模式</span>
                                </div>
                                <div class="theme-option" :class="{ active: currentTheme === 'dark' }" @click="setTheme('dark')">
                                    <div class="theme-preview dark-preview">
                                        <div class="preview-header"></div>
                                        <div class="preview-content"></div>
                                    </div>
                                    <span>深色模式</span>
                                </div>
                                <div class="theme-option" :class="{ active: currentTheme === 'eye-care' }" @click="setTheme('eye-care')">
                                    <div class="theme-preview eye-care-preview">
                                        <div class="preview-header"></div>
                                        <div class="preview-content"></div>
                                    </div>
                                    <span>护眼模式</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="theme-section">
                            <h4>个性化设置</h4>
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" v-model="autoTheme" @change="toggleAutoTheme">
                                    跟随系统主题
                                </label>
                            </div>
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" v-model="eyeCareMode" @change="toggleEyeCareMode">
                                    护眼模式增强
                                </label>
                                <small>降低蓝光，减少眼部疲劳</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted} from 'vue'
import { useRoute } from 'vue-router'
import { toUuid, currentChatTargetName, currentChatID, showFriendRequest, friendRequestInfo, showFriendReplyRequest, friendResponseInfo, friends, groups, hasUnreadMoments, currentChatType } from './state.js'


const route = useRoute()
const sessionKey = route.query.session || 'default'
const userinfo = JSON.parse(localStorage.getItem(`userinfo_${sessionKey}`) || '{}')
const myName = userinfo.nickname || '我'
const myUuid = userinfo.uuid
const token = localStorage.getItem(`token_${sessionKey}`)
const navTab = ref('friend') // 当前左侧tab，默认展示好友
const showAddFriend = ref(false)
const newFriendName = ref('')
const searchResults = ref([])
const searching = ref(false)
const searchError = ref('')
const showAddGroup = ref(false)
const newGroupName = ref('')
const showCreateGroup = ref(false)
const createGroupName = ref('')
const createGroupType = ref('')
const createGroupDescription = ref('')
const creatingGroup = ref(false)
const joiningGroup = ref(false)
// 好友列表和群聊列表现在从 state.js 导入
// 当前消息类型，1=单聊，2=群聊
const messageType = ref(1)
// 好友请求相关变量已移动到 state.js 中
// 设置相关
const showSettings = ref(false)
const settingsTab = ref('profile') // 'profile'、'password' 或 'theme'

// 主题相关
const currentTheme = ref(localStorage.getItem('chat-theme') || 'light')
const autoTheme = ref(localStorage.getItem('chat-auto-theme') === 'true')
const eyeCareMode = ref(localStorage.getItem('chat-eye-care') === 'true')
const updatingProfile = ref(false)
const updatingPassword = ref(false)
// 个人信息表单
const profileForm = ref({
    nickname: userinfo.nickname || '',
    username: userinfo.username || '',
    email: userinfo.email || ''
})
// 密码修改表单
const passwordForm = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
})
// 此刻功能相关
const showAddMoment = ref(false)
const newMomentContent = ref('')
const publishingMoment = ref(false)
const moments = ref([])
const submittingComment = ref(false)
// const currentChatID = ref(0)
onMounted(async () => {
    getFriendList()
    getGroupList()
    
    // 初始化主题设置
    applyTheme(currentTheme.value)
    applyEyeCareMode()
    setupThemeListener()
})

function handleNavClick(tab) {
    navTab.value = tab
    if (tab === 'friend') {
        getFriendList()
    } else if (tab === 'group') {
        getGroupList()
    } else if (tab === 'moment') {
        getMomentList()
        // 清除未读时刻状态
        hasUnreadMoments.value = false
    }
}
async function searchFriend() {
    const name = newFriendName.value.trim()
    if (!name) return
    searching.value = true
    searchError.value = ''
    searchResults.value = []
    try {
        const resp = await fetch(`v1/api/friend/search?username=${encodeURIComponent(name)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        if (!resp.ok) throw new Error('网络错误')
        const data = await resp.json()
        if (data && data.data && data.data.uuid) {
            searchResults.value = [data.data]
        } else {
            searchError.value = '未找到相关用户'
        }
    } catch (e) {
        searchError.value = '搜索失败：' + e.message
    } finally {
        searching.value = false
    }
}
// 添加发送好友请求的逻辑
function addSearchedFriend(f) {
    const sendAddRequest = async () => {
        try {
            const resp = await fetch('v1/api/friend/addFriend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    target_user_name: f.username,  // 目标用户名
                    content: '你好，我是',
                })
            });
            const data = await resp.json();
            if (data.code !== 200) {
                throw new Error(data.msg || '添加好友失败');
            } else if (data.code === 201) {
                throw new Error(data.msg || '好友已存在');
            }
            alert('好友请求已发送');
        } catch (e) {
            searchError.value = '添加失败: ' + e.message;
        }
    };
    // 先发送好友请求，再添加本地列表
    sendAddRequest().then(() => {
        friends.value.push({
            uuid: f.uuid,
            name: f.nickname || f.username,
        });
        showAddFriend.value = false;
        newFriendName.value = '';
        searchResults.value = [];
        searchError.value = '';
    });
}
function cancelAddFriend() {
    showAddFriend.value = false
    newFriendName.value = ''
    searchResults.value = []
    searchError.value = ''
}
// 创建群组
async function createGroup() {
    const name = createGroupName.value.trim()
    const type = createGroupType.value.trim()
    const description = createGroupDescription.value.trim()
    
    if (!name) {
        alert('请输入群组名称')
        return
    }
    
    if (!type) {
        alert('请选择群组类型')
        return
    }

    creatingGroup.value = true
    try {
        const resp = await fetch('v1/api/group/createGroup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                group_name: name,
                group_type: type,
                description: description
            })
        })

        if (!resp.ok) throw new Error('网络错误')
        const data = await resp.json()
        if (data.code !== 0) throw new Error(data.msg || '创建失败')
        console.log(data)

        //uuid: item.group_uuid,
        //name: item.group_name,
        groups.value.push({
            uuid: data.data.group_id,
            name: data.data.group_name,
            type: type,
            description: description,
            unread: 0
        })

        alert('群组创建成功')
        cancelCreateGroup()
    } catch (e) {
        alert('创建群组失败: ' + e.message)
    } finally {
        creatingGroup.value = false
    }
}
// 加入群组
async function joinGroup() {
    const name = newGroupName.value.trim()
    if (!name) {
        alert('请输入群聊名称')
        return
    }

    joiningGroup.value = true
    try {
        const resp = await fetch('v1/api/group/joinGroup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                group_name: name,
            })
        })

        if (!resp.ok) throw new Error('网络错误')
        const data = await resp.json()
        if (data.code !== 0) throw new Error(data.msg || '加入失败')
        console.log(data)
        groups.value.push({
            uuid: data.data.group_uuid,
            name: data.data.group_name,
            unread: 0
        })

        alert('成功加入群聊')
        cancelAddGroup()
    } catch (e) {
        alert('加入群聊失败: ' + e.message)
    } finally {
        joiningGroup.value = false
    }
}
// 取消创建群组
function cancelCreateGroup() {
    showCreateGroup.value = false
    createGroupName.value = ''
    createGroupType.value = ''
    createGroupDescription.value = ''
}
// 取消加入群组
function cancelAddGroup() {
    showAddGroup.value = false
    newGroupName.value = ''
}
// 选择一个朋友
function selectFriend(friend) {
    toUuid.value = friend.uuid
    currentChatType.value = 1
    currentChatID.value = friend.uuid
    friend.unread = 0
    currentChatTargetName.value = friend.name
    // 保存未读消息计数到localStorage
    saveUnreadCounts()
}
// 选择一个群组
function selectGroup(group) {
    console.log(group)
    toUuid.value = group.uuid
    currentChatType.value = 2
    currentChatID.value = group.uuid
    group.unread = 0
    currentChatTargetName.value = group.name
    // 保存未读消息计数到localStorage
    saveUnreadCounts()
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
// 添加处理好友请求的方法
async function handleFriendRequest(isAccept) {
    try {
        const resp = await fetch('v1/api/friend/handleRequest', {  // Changed endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                status: isAccept ? 1 : 0,
                target_uuid: friendRequestInfo.value.from
            })
        });
    } catch (e) {
        alert('操作失败: ' + e.message);
    } finally {
        showFriendRequest.value = false;
    }
}
// 添加处理好友回复请求的方法
async function handleFriendResponse() {
    try {
        const resp = await fetch('v1/api/friend/handleResponse', {  // Changed endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                status: 1,
                target_uuid: friendResponseInfo.value.from
            })
        });
        // 刷新好友列表
        getFriendList()
    } catch (e) {
        alert('操作失败: ' + e.message);
    } finally {
        showFriendReplyRequest.value = false;
    }
}
// 获取好友列表
async function getFriendList() {
    try {
        const resp = await fetch('v1/api/friend/getFriendList', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await resp.json();
        // 从localStorage获取未读消息计数
        const savedUnreadCounts = JSON.parse(localStorage.getItem(`unreadCounts_${sessionKey}`) || '{}')
        friends.value = data.data.map(item => ({
            name: item.friend_nickname,
            uuid: item.friend_uuid,
            unread: savedUnreadCounts[item.friend_uuid] || 0
        }))
    } catch (e) {
        // alert(e.message);
    }
}
// 获取群组列表
async function getGroupList() {
    try {
        const resp = await fetch('v1/api/group/getGroupList', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await resp.json();
        // 从localStorage获取未读消息计数
        const savedUnreadCounts = JSON.parse(localStorage.getItem(`unreadCounts_${sessionKey}`) || '{}')
        groups.value = data.data.map(item => ({
            uuid: item.group_uuid,
            name: item.group_name,
            unread: savedUnreadCounts[item.group_uuid] || 0
        }))
    } catch (e) {
        // alert(e.message);
    }
}
// 设置相关方法
// 更新个人信息
async function updateProfile() {
    if (!profileForm.value.nickname.trim()) {
        alert('昵称不能为空')
        return
    }

    updatingProfile.value = true
    try {
        const resp = await fetch('v1/api/profile/updateProfile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                username: profileForm.value.username,
                nickname: profileForm.value.nickname,
                email: profileForm.value.email,
                avatar: profileForm.value.avatar || ''
            })
        })

        const data = await resp.json()
        if (data.code == 0) {
            alert('更新成功')
        }
        else {
            alert('更新失败')
        }
    } catch (e) {
        alert('更新失败: ' + e.message)
    } finally {
        updatingProfile.value = false
    }
}
// 修改密码
async function updatePassword() {
    if (!passwordForm.value.currentPassword) {
        alert('请输入当前密码')
        return
    }

    if (!passwordForm.value.newPassword) {
        alert('请输入新密码')
        return
    }

    if (passwordForm.value.newPassword.length < 6) {
        alert('新密码长度不能少于6位')
        return
    }

    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        alert('两次输入的新密码不一致')
        return
    }

    updatingPassword.value = true
    try {
        const resp = await fetch('v1/api/user/updatePassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                currentPassword: passwordForm.value.currentPassword,
                newPassword: passwordForm.value.newPassword
            })
        })

        const data = await resp.json()
        if (data.code === 200) {
            alert('密码修改成功')
            resetPasswordForm()
        } else {
            throw new Error(data.msg || '修改失败')
        }
    } catch (e) {
        alert('修改失败: ' + e.message)
    } finally {
        updatingPassword.value = false
    }
}
// 重置个人信息表单
function resetProfileForm() {
    profileForm.value = {
        nickname: userinfo.nickname || '',
        username: userinfo.username || '',
        email: userinfo.email || ''
    }
}
// 重置密码表单
function resetPasswordForm() {
    passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    }
}

// 主题相关方法
function setTheme(theme) {
    currentTheme.value = theme
    localStorage.setItem('chat-theme', theme)
    applyTheme(theme)
}

function toggleAutoTheme() {
    localStorage.setItem('chat-auto-theme', autoTheme.value.toString())
    if (autoTheme.value) {
        // 检测系统主题
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        setTheme(systemTheme)
    }
}

function toggleEyeCareMode() {
    localStorage.setItem('chat-eye-care', eyeCareMode.value.toString())
    applyEyeCareMode()
}

function applyTheme(theme) {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    
    // 移除之前的主题类
    root.classList.remove('light-theme', 'dark-theme', 'eye-care-theme')
    
    // 添加新的主题类
    root.classList.add(`${theme}-theme`)
}

function applyEyeCareMode() {
    const root = document.documentElement
    if (eyeCareMode.value) {
        root.classList.add('eye-care-enhanced')
    } else {
        root.classList.remove('eye-care-enhanced')
    }
}

// 监听系统主题变化
function setupThemeListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
        if (autoTheme.value) {
            const systemTheme = e.matches ? 'dark' : 'light'
            setTheme(systemTheme)
        }
    })
}

// 此刻功能相关方法
// 发布动态
async function publishMoment() {
    const content = newMomentContent.value.trim()
    if (!content) {
        alert('请输入动态内容')
        return
    }

    publishingMoment.value = true
    try {
        // 这里可以添加实际的API调用
        const resp = await fetch('v1/api/moment/createMoment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                content: content
            })
        })
        //const data = await resp.json()
        // if (data.code === 200) {
        //     alert('动态发布成功')
        // } else {
        //     throw new Error(data.msg || '发布失败')
        // }

        // 暂时使用本地存储模拟
        const newMoment = {
            id: Date.now(),
            author: myName,
            content: content,
            timestamp: new Date().toISOString()
        }
        
        moments.value.unshift(newMoment)
        
        // 保存到localStorage
        const savedMoments = JSON.parse(localStorage.getItem(`moments_${sessionKey}`) || '[]')
        savedMoments.unshift(newMoment)
        localStorage.setItem(`moments_${sessionKey}`, JSON.stringify(savedMoments))
        
        alert('动态发布成功')
        cancelAddMoment()
    } catch (e) {
        alert('发布失败: ' + e.message)
    } finally {
        publishingMoment.value = false
    }
}

// 取消发布动态
function cancelAddMoment() {
    showAddMoment.value = false
    newMomentContent.value = ''
}

// 获取动态列表
async function getMomentList() {
    try {
        // 这里可以添加实际的API调用
        const resp = await fetch('v1/api/moment/list', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        const data = await resp.json()
        if (data.code === 0) {
            moments.value = data.data.map(item => ({
                moment_id: item.moment_id,
                user_id: item.user_id,
                author: item.username,
                content: item.content,
                likes: item.like_count,
                comments: item.comment_list,
                timestamp: item.create_time,
            }))
        }
    } catch (e) {
        console.error('获取动态列表失败:', e)
    }
}

// 格式化时间
function formatTime(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) { // 1分钟内
        return '刚刚'
    } else if (diff < 3600000) { // 1小时内
        return Math.floor(diff / 60000) + '分钟前'
    } else if (diff < 86400000) { // 24小时内
        return Math.floor(diff / 3600000) + '小时前'
    } else if (diff < 604800000) { // 7天内
        return Math.floor(diff / 86400000) + '天前'
    } else {
        return date.toLocaleDateString()
    }
}

// todo 点赞动态
async function likeMoment(moment) {
    console.log('点赞动态2:', moment['moment_id'])
    console.log('moment_id类型:', typeof moment['moment_id'])
    const momentId = parseInt(moment['moment_id'])
    console.log('parseInt后的值:', momentId)
    console.log('parseInt后的类型:', typeof momentId)

    try {
        // 这里可以添加实际的API调用
        const requestBody = {
            moment_id: momentId
        }
        console.log('发送到后端的数据:', JSON.stringify(requestBody))
        
        const resp = await fetch('/v1/api/comment/like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        })
        const data = await resp.json()
        if (data.code === 0) {
            alert('点赞成功')
             if (!moment.likes) {
                moment.likes = 0
            }
            moment.likes++
            console.log('点赞动态:', moment)
        } else {
            throw new Error(data.msg || '你已经点赞过了')

        }
    } catch (e) {
        alert('点赞失败: ' + e.message)
    }
   
}

// 切换评论显示状态
function toggleComments(moment) {
    moment.showComments = !moment.showComments
    
    // 如果是第一次打开评论区，初始化评论数据
    if (moment.showComments && !moment.comments) {
        moment.comments = []
        moment.newComment = ''
        // 获取该动态的评论列表
        getCommentList(moment)
    }
}

// 提交评论
async function submitComment(moment) {
    const content = moment.newComment?.trim()
    if (!content) {
        alert('请输入评论内容')
        return
    }

    submittingComment.value = true
    try {
        const momentId = parseInt(moment['moment_id'] || moment.id)
        
        // 调用后端API提交评论
        const resp = await fetch('/v1/api/comment/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                moment_id: momentId,
                content: content
            })
        })
        
        const data = await resp.json()
        if (data.code === 0) {
            // 创建新评论对象
            const newComment = {
                id: Date.now(),
                author: myName,
                content: content,
                timestamp: new Date().toISOString()
            }
            
            // 添加到评论列表
            if (!moment.comments) {
                moment.comments = []
            }
            moment.comments.unshift(newComment)
            
            // 清空输入框
            moment.newComment = ''
            
            alert('评论发布成功')
        } else {
            throw new Error(data.msg || '评论发布失败')
        }
    } catch (e) {
        alert('评论发布失败: ' + e.message)
    } finally {
        submittingComment.value = false
    }
}

// 获取评论列表
async function getCommentList(moment) {
    try {
        const momentId = parseInt(moment['moment_id'] || moment.id)
        
        const resp = await fetch(`/v1/api/comment/list?moment_id=${momentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        
        const data = await resp.json()
        if (data.code === 0) {
            moment.comments = data.data.map(item => ({
                id: item.comment_id,
                author: item.username,
                content: item.content,
                timestamp: item.create_time
            }))
        }
    } catch (e) {
        console.error('获取评论列表失败:', e)
        // 如果获取失败，初始化为空数组
        moment.comments = []
    }
}
</script>

<style scoped>
.chat-layout {
    display: flex;
    height: 100vh;
    background: #f5f5f5;
    overflow: hidden;
}

.left-list {
    width: 120px;
    background: #fff;
    border-right: 1px solid #eee;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 0 8px 0;
}

.my-info {
    width: 100%;
    padding: 16px 0 8px 0;
    border-bottom: 1px solid #eee;
    background: #f7f7f7;
    margin-bottom: 8px;
    text-align: center;
}

.my-avatar {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 8px;
}

.avatar-emoji {
    font-size: 48px;
    display: inline-block;
}

.my-name {
    font-size: 15px;
    font-weight: bold;
    margin-bottom: 2px;
}

.my-uuid {
    font-size: 12px;
    color: #888;
    word-break: break-all;
}

.nav-list {
    width: 100%;
    margin-top: 16px;
}

.nav-item {
    display: flex;
    align-items: center;
    font-size: 16px;
    padding: 12px 0 12px 0;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;
    border-radius: 6px;
    margin: 0 8px 8px 8px;
    position: relative;
}

.nav-item:hover {
    background: #e6f7ff;
}

.nav-icon {
    font-size: 20px;
    margin-right: 6px;
}

.moment-notification-dot {
    position: absolute;
    top: 8px;
    right: 20px;
    width: 8px;
    height: 8px;
    background: #ff4444;
    border-radius: 50%;
    border: 2px solid #fff;
}

.activated-list {
    width: 380px;
    background: #fff;
    border-right: 1px solid #eee;
    display: flex;
    flex-direction: column;
    padding: 0 0 8px 0;
}

.friend-list-title {
    font-weight: bold;
    font-size: 16px;
    padding: 16px 0 8px 16px;
    /* border-bottom: 1px solid #eee; */
    margin-bottom: 8px;
}

.friend-list-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px 0 0;
}

.group-list-title {
    font-weight: bold;
    font-size: 16px;
    padding: 16px 0 8px 16px;
    /* border-bottom: 1px solid #eee; */
    margin-bottom: 8px;
}

.group-list-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px 0 0;
}

.group-actions {
    display: flex;
    gap: 8px;
}

.create-group-btn {
    background: #42b983;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.2s;
}

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

.add-friend-btn:hover {
    background: #369870;
}

.add-group-btn {
    background: #42b983;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.2s;
}

.add-group-btn:hover {
    background: #369870;
}

.add-friend-dialog {
    display: flex;
    align-items: center;
    padding: 8px 8px 8px 16px;
    background: #f7f7f7;
    border-radius: 6px;
    margin: 8px 8px 0 8px;
}

.add-friend-input {
    flex: 1;
    padding: 6px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    margin-right: 8px;
}

.add-friend-confirm {
    background: #42b983;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 4px 10px;
    font-size: 14px;
    cursor: pointer;
    margin-right: 4px;
}

.add-friend-confirm:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.add-friend-cancel {
    background: #eee;
    color: #333;
    border: none;
    border-radius: 4px;
    padding: 4px 10px;
    font-size: 14px;
    cursor: pointer;
}

.create-group-dialog {
    background: #f7f7f7;
    border-radius: 8px;
    margin: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    max-height: 400px;
    overflow-y: auto;
}

.create-group-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.create-group-form .form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.create-group-form .form-group label {
    font-size: 13px;
    font-weight: 500;
    color: #333;
}

.create-group-input,
.create-group-select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    background: #fff;
    color: #333;
    box-sizing: border-box;
}

.create-group-textarea {
    width: 100%;
    min-height: 80px;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    background: #fff;
    color: #333;
    resize: vertical;
    font-family: inherit;
    box-sizing: border-box;
}

.create-group-form .char-count {
    font-size: 12px;
    color: #666;
    text-align: right;
    margin-top: 2px;
}

.create-group-form .form-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 10px;
}

.create-group-confirm {
    background: #42b983;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.create-group-confirm:hover:not(:disabled) {
    background: #369970;
}

.create-group-confirm:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.create-group-cancel {
    background: #eee;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.create-group-cancel:hover {
    background: #e0e0e0;
}

.add-group-dialog {
    display: flex;
    align-items: center;
    padding: 8px 8px 8px 16px;
    background: #f7f7f7;
    border-radius: 6px;
    margin: 8px 8px 0 8px;
}

.add-group-input {
    flex: 1;
    padding: 6px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    margin-right: 8px;
}

.add-group-confirm {
    background: #42b983;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 4px 10px;
    font-size: 14px;
    cursor: pointer;
    margin-right: 4px;
}

.add-group-confirm:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.add-group-cancel {
    background: #eee;
    color: #333;
    border: none;
    border-radius: 4px;
    padding: 4px 10px;
    font-size: 14px;
    cursor: pointer;
}

.friend-item {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    cursor: pointer;
    border-radius: 4px;
    margin: 4px 8px;
    transition: background 0.2s;
    background: #f8f8f8;
}

.group-item {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    cursor: pointer;
    border-radius: 4px;
    margin: 4px 8px;
    transition: background 0.2s;
    background: #f8f8f8;
}

.friend-item.active,
.friend-item:hover {
    background: #e6f7ff;
}

.group-item.active,
.group-item:hover {
    background: #e6f7ff;
}

.friend-avatar {
    width: 36px;
    height: 36px;
    margin-right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #f0f0f0;
    overflow: hidden;
    font-size: 24px;
}

.group-avatar {
    width: 36px;
    height: 36px;
    margin-right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #f0f0f0;
    overflow: hidden;
    font-size: 24px;
}

.friend-info {
    flex: 1;
    min-width: 0;
    position: relative;
}

.friend-name {
    font-weight: bold;
    font-size: 15px;
}

.friend-uuid {
    font-size: 12px;
    color: #888;
    word-break: break-all;
}

.unread-bubble {
    background: #ff4444;
    color: white;
    min-width: 20px;
    height: 20px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    padding: 0 4px;
    position: relative;
    right: 16px;
    animation: blink 1.5s infinite;
}

@keyframes blink {
    0%, 100% {
        transform: translateX(0);
    }
    25% {
        transform: translateX(-3px);
    }
    75% {
        transform: translateX(3px);
    }
}

.group-info {
    flex: 1;
    min-width: 0;
    position: relative;
}

.group-name {
    font-weight: bold;
    font-size: 15px;
}

.group-uuid {
    font-size: 12px;
    color: #888;
    word-break: break-all;
}

.group_unread-bubble {
    background: #ff4444;
    color: white;
    min-width: 20px;
    height: 20px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    padding: 0 4px;
    position: relative;
    right: 16px;
    animation: blink 1.5s infinite;
}

.friend-request-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.friend-request-dialog {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 300px;
    text-align: center;
}

.request-buttons {
    margin-top: 20px;
    display: flex;
    gap: 10px;
    justify-content: center;
}

.accept-btn {
    background: #42b983;
    color: white;
    padding: 8px 20px;
}

.reject-btn {
    background: #ff4444;
    color: white;
    padding: 8px 20px;
}

.friend-response-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.friend-response-dialog {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 300px;
    text-align: center;
}

.ok-btn {
    background: #42b983;
    color: white;
    padding: 8px 20px;
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

.nav-item.active {
    background: #e6f7ff;
    color: #42b983;
}

.search-result-list {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 6px;
    margin: 8px 8px 0 8px;
    padding: 6px 0;
    max-height: 180px;
    overflow-y: auto;
}

.search-result-item {
    display: flex;
    align-items: center;
    padding: 6px 12px;
    cursor: pointer;
    transition: background 0.15s;
    border-radius: 4px;
}

.search-result-item:hover {
    background: #e6f7ff;
}

.search-avatar {
    width: 32px;
    height: 32px;
    margin-right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
}

.search-nickname {
    font-weight: bold;
    margin-right: 8px;
}

.search-uuid {
    color: #888;
    font-size: 12px;
    margin-right: 8px;
}

.search-add {
    color: #42b983;
    font-size: 13px;
}

.search-error {
    color: #f00;
    padding: 6px 12px;
}

/* 设置弹窗样式 */
.settings-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.settings-dialog {
    background: white;
    border-radius: 12px;
    width: 500px;
    max-width: 90vw;
    max-height: 80vh;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #eee;
    background: #f8f9fa;
}

.settings-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
}

.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;
}

.close-btn:hover {
    background: #e9ecef;
    color: #333;
}

.settings-content {
    padding: 0;
}

.settings-tabs {
    display: flex;
    border-bottom: 1px solid #eee;
    background: #f8f9fa;
}

.tab-btn {
    flex: 1;
    padding: 16px 20px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #666;
    transition: all 0.2s;
    border-bottom: 3px solid transparent;
}

.tab-btn:hover {
    background: #e9ecef;
    color: #333;
}

.tab-btn.active {
    color: #42b983;
    background: white;
    border-bottom-color: #42b983;
}

.settings-panel {
    padding: 24px;
    max-height: 400px;
    overflow-y: auto;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
    font-size: 14px;
}

.form-input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s;
    box-sizing: border-box;
}

.form-input:focus {
    outline: none;
    border-color: #42b983;
    box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.form-input:hover {
    border-color: #bbb;
}

.form-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #eee;
}

.save-btn {
    background: #42b983;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    flex: 1;
}

.save-btn:hover:not(:disabled) {
    background: #369870;
    transform: translateY(-1px);
}

.save-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
}

.cancel-btn {
    background: #f8f9fa;
    color: #666;
    border: 1px solid #ddd;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    flex: 1;
}

.cancel-btn:hover {
    background: #e9ecef;
    border-color: #bbb;
    color: #333;
}

/* 此刻功能样式 */
.moment-list-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #eee;
    background: #f8f9fa;
}

.moment-list-title {
    font-weight: bold;
    font-size: 16px;
    color: #333;
}

.add-moment-btn {
    background: #42b983;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
}

.add-moment-btn:hover {
    background: #369870;
    transform: translateY(-1px);
}

.add-moment-dialog {
    padding: 16px;
    background: #fff;
    border-bottom: 1px solid #eee;
}

.add-moment-textarea {
    width: 100%;
    min-height: 80px;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.5;
    resize: vertical;
    box-sizing: border-box;
    font-family: inherit;
    transition: border-color 0.2s;
}

.add-moment-textarea:focus {
    outline: none;
    border-color: #42b983;
    box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.moment-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
}

.char-count {
    font-size: 12px;
    color: #888;
}

.publish-moment-btn {
    background: #42b983;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    margin-right: 8px;
}

.publish-moment-btn:hover:not(:disabled) {
    background: #369870;
}

.publish-moment-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.cancel-moment-btn {
    background: #f8f9fa;
    color: #666;
    border: 1px solid #ddd;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
}

.cancel-moment-btn:hover {
    background: #e9ecef;
    border-color: #bbb;
}

.moment-list {
    max-height: 500px;
    overflow-y: auto;
}

.moment-item {
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    transition: background 0.2s;
}

.moment-item:hover {
    background: #f8f9fa;
}

.moment-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
}

.moment-avatar {
    width: 32px;
    height: 32px;
    margin-right: 12px;
    border-radius: 50%;
    overflow: hidden;
}

.moment-info {
    flex: 1;
}

.moment-author {
    font-weight: bold;
    font-size: 14px;
    color: #333;
    margin-bottom: 2px;
}

.moment-time {
    font-size: 12px;
    color: #888;
}

.moment-content {
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    word-break: break-word;
    white-space: pre-wrap;
}

.moment-actions {
    display: flex;
    gap: 16px;
    margin-top: 12px;
    padding-top: 8px;
    border-top: 1px solid #f0f0f0;
}

.moment-action-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    color: #666;
    font-size: 13px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.moment-action-btn:hover {
    background: #f5f5f5;
    color: #333;
}

.moment-action-btn svg {
    stroke-width: 1.5;
}

.empty-moments {
    text-align: center;
    padding: 60px 20px;
    color: #888;
}

.empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.empty-text {
    font-size: 14px;
    color: #999;
}

/* 主题设置样式 */
.theme-section {
    margin-bottom: 24px;
}

.theme-section h4 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
}

.theme-options {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
}

.theme-option {
    flex: 1;
    text-align: center;
    cursor: pointer;
    padding: 12px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    transition: all 0.2s;
}

.theme-option:hover {
    border-color: #42b983;
}

.theme-option.active {
    border-color: #42b983;
    background: rgba(66, 185, 131, 0.1);
}

.theme-preview {
    width: 60px;
    height: 40px;
    margin: 0 auto 8px;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #ddd;
}

.preview-header {
    height: 12px;
    background: #f5f5f5;
}

.preview-content {
    height: 28px;
    background: #fff;
}

.light-preview .preview-header {
    background: #f8f9fa;
}

.light-preview .preview-content {
    background: #ffffff;
}

.dark-preview .preview-header {
    background: #2d3748;
}

.dark-preview .preview-content {
    background: #1a202c;
}

.eye-care-preview .preview-header {
    background: #f7f3e9;
}

.eye-care-preview .preview-content {
    background: #fefcf3;
}

.theme-option span {
    font-size: 14px;
    color: #666;
}

.form-group label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #333;
    margin-bottom: 8px;
}

.form-group small {
    display: block;
    font-size: 12px;
    color: #888;
    margin-top: 4px;
    margin-left: 24px;
}

.form-group input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #42b983;
}

/* 评论相关样式 */
.moment-comments {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
    background: #fafafa;
    border-radius: 8px;
    padding: 16px;
}

.comment-input-area {
    margin-bottom: 16px;
}

.comment-input {
    width: 100%;
    min-height: 60px;
    padding: 12px;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.5;
    resize: vertical;
    font-family: inherit;
    transition: all 0.2s ease;
    box-sizing: border-box;
}

.comment-input:focus {
    outline: none;
    border-color: #42b983;
    box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.comment-input::placeholder {
    color: #999;
}

.comment-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
}

.comment-char-count {
    font-size: 12px;
    color: #888;
}

.submit-comment-btn {
    background: #42b983;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.submit-comment-btn:hover:not(:disabled) {
    background: #369870;
    transform: translateY(-1px);
}

.submit-comment-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
}

.comments-list {
    max-height: 300px;
    overflow-y: auto;
}

.comment-item {
    background: white;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
    border: 1px solid #f0f0f0;
    transition: all 0.2s ease;
}

.comment-item:hover {
    border-color: #e1e5e9;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.comment-item:last-child {
    margin-bottom: 0;
}

.comment-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.comment-avatar {
    width: 24px;
    height: 24px;
    margin-right: 8px;
    border-radius: 50%;
    overflow: hidden;
}

.comment-info {
    flex: 1;
}

.comment-author {
    font-weight: 600;
    font-size: 13px;
    color: #333;
    margin-bottom: 2px;
}

.comment-time {
    font-size: 11px;
    color: #888;
}

.comment-content {
    font-size: 13px;
    line-height: 1.5;
    color: #333;
    word-break: break-word;
    white-space: pre-wrap;
}

.empty-comments {
    text-align: center;
    padding: 20px;
    color: #888;
}

.empty-comment-text {
    font-size: 13px;
    color: #999;
}

/* 评论区滚动条样式 */
.comments-list::-webkit-scrollbar {
    width: 4px;
}

.comments-list::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 2px;
}

.comments-list::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 2px;
}

.comments-list::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
</style>