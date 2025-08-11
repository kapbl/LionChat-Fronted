import { ref } from 'vue'

export const toUuid = ref('')
// 好友列表，头像类型随机
export const friends = ref([])
// 群聊列表，头像类型随机
export const groups = ref([])
// 选择当前的聊天对象的昵称
export const currentChatTargetName = ref('')
// 当前聊天对象的ID，这里使用uuid
export const currentChatID = ref('')
// 聊天消息数据，可被其他脚本访问
export const chatMessages = ref({}) // { [uuid]: [msg, ...] }
// 新时刻动态未读状态
export const hasUnreadMoments = ref(false)

// 加好友请求消息框
export const showFriendRequest = ref(false)
export const friendRequestInfo = ref({
    fromUsername: '',
    content: '',
    from: ''
})
// 加好友请求回复消息框
export const showFriendReplyRequest = ref(false)
export const friendResponseInfo = ref({
    fromUsername: '',
    content: '',
    from: ''
})
// 1 好友 2 群组
export const currentChatType = ref(1)
