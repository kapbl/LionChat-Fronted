import { ref } from 'vue'
import { loadAllMessages } from './messageStorage.js'

// API 基础 URL
export const API_BASE_URL = 'https://chlion.lionchat.online'
export const API_BASE_URL_WS = 'wss://chlion.lionchat.online'


// 用户信息全局变量
export const myName = ref('')
export const MYUUID = ref('')

export const TOUUID = ref('')
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

// 初始化聊天消息，从本地存储加载历史消息
export async function initializeChatMessages(sessionKey = 'default') {
    try {
        const storedMessages = await loadAllMessages(sessionKey)
        if (storedMessages && Object.keys(storedMessages).length > 0) {
            // 合并存储的消息到当前chatMessages
            Object.keys(storedMessages).forEach(chatId => {
                if (storedMessages[chatId] && storedMessages[chatId].length > 0) {
                    chatMessages.value[chatId] = storedMessages[chatId]
                }
            })
            console.log('已加载历史消息:', Object.keys(storedMessages).length, '个聊天')
        }
    } catch (error) {
        console.error('加载历史消息失败:', error)
    }
}
