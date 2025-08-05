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