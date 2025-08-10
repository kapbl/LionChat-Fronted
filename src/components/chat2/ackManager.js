import { ref, nextTick } from 'vue'
import { getWebSocket } from './websocket'

// ACK管理器类
class ACKManager {
    constructor() {
        this.pendingAcks = new Set() // 待发送ACK的消息ID集合
        this.ackTimer = null // ACK发送定时器
        this.ackDelay = 1000 // ACK发送延迟（毫秒）
        this.messageObserver = null // Intersection Observer实例
        this.visibilityObserver = null // 页面可见性监听
        this.myUuid = ''
        this.MessageType = null
        this.messageElements = new Map() // 消息ID到DOM元素的映射
        this.readMessages = new Set() // 已读消息ID集合
    }

    // 初始化ACK管理器
    init(myUuid, MessageType) {
        this.myUuid = myUuid
        this.MessageType = MessageType
        this.setupIntersectionObserver()
        this.setupVisibilityObserver()
    }

    // 设置Intersection Observer监听消息进入可视区域
    setupIntersectionObserver() {
        const options = {
            root: null, // 使用视口作为根
            rootMargin: '0px',
            threshold: 0.5 // 当消息50%可见时触发
        }

        this.messageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const messageId = entry.target.dataset.messageId
                    const fromUuid = entry.target.dataset.fromUuid
                    
                    // 只对非自己发送的消息进行ACK确认
                    if (messageId && fromUuid && fromUuid !== this.myUuid) {
                        this.markMessageAsRead(messageId)
                    }
                }
            })
        }, options)
    }

    // 设置页面可见性监听
    setupVisibilityObserver() {
        this.visibilityObserver = () => {
            if (!document.hidden) {
                // 页面变为可见时，立即发送所有待确认的ACK
                this.flushPendingAcks()
            }
        }
        document.addEventListener('visibilitychange', this.visibilityObserver)
    }

    // 注册消息元素用于监听
    registerMessageElement(messageId, element, fromUuid) {
        if (!messageId || !element || fromUuid === this.myUuid) return
        
        element.dataset.messageId = messageId
        element.dataset.fromUuid = fromUuid
        this.messageElements.set(messageId, element)
        this.messageObserver.observe(element)
    }

    // 取消注册消息元素
    unregisterMessageElement(messageId) {
        const element = this.messageElements.get(messageId)
        if (element) {
            this.messageObserver.unobserve(element)
            this.messageElements.delete(messageId)
        }
    }

    // 标记消息为已读
    markMessageAsRead(messageId) {
        if (this.readMessages.has(messageId)) {
            return // 已经标记为已读
        }
        
        this.readMessages.add(messageId)
        this.pendingAcks.add(messageId)
        
        // 延迟发送ACK，允许批量处理
        this.scheduleAckSend()
    }

    // 调度ACK发送
    scheduleAckSend() {
        if (this.ackTimer) {
            clearTimeout(this.ackTimer)
        }
        
        this.ackTimer = setTimeout(() => {
            this.flushPendingAcks()
        }, this.ackDelay)
    }

    // 立即发送所有待确认的ACK
    flushPendingAcks() {
        if (this.pendingAcks.size === 0) return
        
        const ws = getWebSocket()
        if (!ws || ws.readyState !== WebSocket.OPEN || !this.MessageType) {
            return
        }

        // 将Set转换为数组
        const ackMessageIds = Array.from(this.pendingAcks)
        
        // 构建ACK消息
        const ackMessage = {
            avatar: '',
            fromUsername: '',
            from: this.myUuid,
            to: '', // ACK消息的to字段可以为空，服务器会根据ackMessageIds处理
            content: 'ack',
            contentType: 10, // ACK消息类型
            type: 'ack',
            messageType: 1,
            url: '',
            fileSuffix: '',
            file: new Uint8Array(),
            messageId: '',
            isFragmented: false,
            fragmentIndex: 0,
            totalFragments: 0,
            timestamp: Date.now(),
            checksum: '',
            ackMessageIds: ackMessageIds,
            isRead: true,
            readTimestamp: Date.now()
        }

        try {
            const messageBuffer = this.MessageType.encode(this.MessageType.create(ackMessage)).finish()
            ws.send(messageBuffer)
            
            console.log(`发送ACK确认，包含${ackMessageIds.length}条消息:`, ackMessageIds)
            
            // 清空待发送ACK列表
            this.pendingAcks.clear()
            
            if (this.ackTimer) {
                clearTimeout(this.ackTimer)
                this.ackTimer = null
            }
        } catch (error) {
            console.error('发送ACK消息失败:', error)
        }
    }

    // 手动标记聊天窗口的所有消息为已读
    markChatAsRead(chatId, messages) {
        if (!messages || messages.length === 0) return
        
        messages.forEach(message => {
            // 只对非自己发送的消息进行ACK确认
            if (message.from !== this.myUuid && message.messageId) {
                this.markMessageAsRead(message.messageId)
            }
        })
        
        // 立即发送ACK
        this.flushPendingAcks()
    }

    // 检查消息是否已读
    isMessageRead(messageId) {
        return this.readMessages.has(messageId)
    }

    // 处理接收到的ACK确认消息
    handleAckMessage(ackMessage) {
        if (ackMessage.ackMessageIds && ackMessage.ackMessageIds.length > 0) {
            console.log('收到ACK确认:', ackMessage.ackMessageIds)
            // 这里可以更新UI显示消息已读状态
            // 触发自定义事件通知其他组件
            const event = new CustomEvent('messagesAcked', {
                detail: {
                    messageIds: ackMessage.ackMessageIds,
                    readTimestamp: ackMessage.readTimestamp,
                    from: ackMessage.from
                }
            })
            window.dispatchEvent(event)
        }
    }

    // 销毁ACK管理器
    destroy() {
        if (this.messageObserver) {
            this.messageObserver.disconnect()
            this.messageObserver = null
        }
        
        if (this.visibilityObserver) {
            document.removeEventListener('visibilitychange', this.visibilityObserver)
            this.visibilityObserver = null
        }
        
        if (this.ackTimer) {
            clearTimeout(this.ackTimer)
            this.ackTimer = null
        }
        
        this.pendingAcks.clear()
        this.messageElements.clear()
        this.readMessages.clear()
    }
}

// 创建全局ACK管理器实例
export const ackManager = new ACKManager()

// 导出ACK管理器类供其他地方使用
export default ACKManager