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
            <div class="nav-item"><span class="nav-icon"></span>此刻</div>
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
                <input v-model="createGroupName" placeholder="输入新群组名称" class="create-group-input"
                    @keyup.enter="createGroup" />
                <button class="create-group-confirm" @click="createGroup" :disabled="creatingGroup">创建</button>
                <button class="create-group-cancel" @click="cancelCreateGroup">取消</button>
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
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { toUuid,currentChatTargetName,currentChatID} from './state.js'

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
const creatingGroup = ref(false)
const joiningGroup = ref(false)
// // 好友列表，头像类型随机
const friends = ref([])
// // 群聊列表，头像类型随机
const groups = ref([])
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
// 设置相关
const showSettings = ref(false)
const settingsTab = ref('profile') // 'profile' 或 'password'
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
// const currentChatID = ref(0)
onMounted(async () => {
    getFriendList()
    getGroupList()
})

function handleNavClick(tab) {
    navTab.value = tab
    if (tab === 'friend') {
        getFriendList()
    } else if (tab === 'group') {
        getGroupList()
    }
}
async function searchFriend() {
    const name = newFriendName.value.trim()
    if (!name) return
    searching.value = true
    searchError.value = ''
    searchResults.value = []
    try {
        const resp = await fetch(`http://localhost/v1/api/friend/search?username=${encodeURIComponent(name)}`, {
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
            const resp = await fetch('http://localhost/v1/api/friend/addFriend', {
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
    if (!name) {
        alert('请输入群组名称')
        return
    }

    creatingGroup.value = true
    try {
        const resp = await fetch('http://localhost/v1/api/group/createGroup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                group_name: name,
                // description: ''
            })
        })

        if (!resp.ok) throw new Error('网络错误')
        const data = await resp.json()
        if (data.code !== 0) throw new Error(data.msg || '创建失败')

        groups.value.push({
            uuid: data.data.group_id,
            name: data.data.group_name,
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
        const resp = await fetch('http://localhost/v1/api/group/joinGroup', {
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

        groups.value.push({
            uuid: data.data.group_id,
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
}
// 取消加入群组
function cancelAddGroup() {
    showAddGroup.value = false
    newGroupName.value = ''
}
// 选择一个朋友
function selectFriend(friend) {
    toUuid.value = friend.uuid
    messageType.value = 1
    currentChatID.value = friend.uuid
    friend.unread = 0
    currentChatTargetName.value = friend.name
    console.log(friend)
    // 保存未读消息计数到localStorage
    // saveUnreadCounts()
}
// 选择一个群组
function selectGroup(group) {
    toUuid.value = group.uuid
    messageType.value = 2
    currentChatID.value = group.uuid
    group.unread = 0
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
        const resp = await fetch('http://localhost/v1/api/friend/handleRequest', {  // Changed endpoint
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
        const resp = await fetch('http://localhost/v1/api/friend/handleResponse', {  // Changed endpoint
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
    } catch (e) {
        alert('操作失败: ' + e.message);
    } finally {
        showFriendReplyRequest.value = false;
    }
}
// 获取好友列表
async function getFriendList() {
    try {
        const resp = await fetch('http://localhost/v1/api/friend/getFriendList', {
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
        const resp = await fetch('http://localhost/v1/api/group/getGroupList', {
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
        const resp = await fetch('http://localhost/v1/api/profile/updateProfile', {
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
        const resp = await fetch('http://localhost/v1/api/user/updatePassword', {
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
}

.nav-item:hover {
    background: #e6f7ff;
}

.nav-icon {
    font-size: 20px;
    margin-right: 6px;
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

.create-group-dialog {
    display: flex;
    align-items: center;
    padding: 8px 8px 8px 16px;
    background: #f7f7f7;
    border-radius: 6px;
    margin: 8px 8px 0 8px;
}

.create-group-input {
    flex: 1;
    padding: 6px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    margin-right: 8px;
}

.create-group-confirm {
    background: #42b983;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 4px 10px;
    font-size: 14px;
    cursor: pointer;
    margin-right: 4px;
}

.create-group-confirm:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.create-group-cancel {
    background: #eee;
    color: #333;
    border: none;
    border-radius: 4px;
    padding: 4px 10px;
    font-size: 14px;
    cursor: pointer;
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
</style>