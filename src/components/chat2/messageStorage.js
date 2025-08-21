/**
 * 消息本地存储管理模块
 * 负责处理聊天消息的本地持久化存储
 */

import { storageConfig, getConfigValue } from './storageConfig.js'

// 存储配置
const STORAGE_CONFIG = {
    STORAGE_KEY_PREFIX: 'lionChat_messages_',
    METADATA_KEY: 'lionChat_storage_metadata',
    STORAGE_VERSION: '1.0',
}

/**
 * 消息存储管理器
 */
class MessageStorageManager {
    constructor(sessionKey = 'default') {
        this.sessionKey = sessionKey
        this.storageKey = `${STORAGE_CONFIG.PREFIX}${sessionKey}`
        this.metaKey = `${this.storageKey}_meta`
        
        // 初始化存储元数据
        this.initStorageMeta()
    }

    /**
     * 初始化存储元数据
     */
    initStorageMeta() {
        const meta = this.getStorageMeta()
        if (!meta) {
            this.setStorageMeta({
                version: STORAGE_CONFIG.STORAGE_VERSION,
                createdAt: Date.now(),
                lastCleanup: Date.now(),
                totalMessages: 0
            })
        }
    }

    /**
     * 获取存储元数据
     */
    getStorageMeta() {
        try {
            const meta = localStorage.getItem(this.metaKey)
            return meta ? JSON.parse(meta) : null
        } catch (error) {
            console.error('获取存储元数据失败:', error)
            return null
        }
    }

    /**
     * 设置存储元数据
     */
    setStorageMeta(meta) {
        try {
            localStorage.setItem(this.metaKey, JSON.stringify(meta))
        } catch (error) {
            console.error('设置存储元数据失败:', error)
        }
    }

    /**
     * 保存单个聊天的消息
     * @param {string} chatId - 聊天ID
     * @param {Array} messages - 消息数组
     */
    saveChatMessages(chatId, messages) {
        if (!chatId || !Array.isArray(messages)) {
            console.warn('保存消息参数无效:', { chatId, messages })
            return false
        }

        try {
            // 过滤和清理消息
            const cleanMessages = this.cleanMessages(messages)
            
            // 限制消息数量
            const limitedMessages = this.limitMessages(cleanMessages)
            
            // 检查是否需要压缩
            const compressionThreshold = getConfigValue('compressionThreshold', 100)
            const enableCompression = getConfigValue('enableCompression', true)
            const shouldCompress = enableCompression && limitedMessages.length > compressionThreshold
            
            // 保存到localStorage
            const chatStorageKey = `${this.storageKey}_${chatId}`
            const messageData = {
                chatId,
                messages: shouldCompress ? this.compressData(limitedMessages) : limitedMessages,
                compressed: shouldCompress,
                lastUpdated: Date.now(),
                messageCount: limitedMessages.length,
                version: STORAGE_CONFIG.STORAGE_VERSION
            }
            
            localStorage.setItem(chatStorageKey, JSON.stringify(messageData))
            
            // 更新元数据
            this.updateStorageMeta(chatId, limitedMessages.length)
            
            console.log(`成功保存聊天 ${chatId} 的 ${limitedMessages.length} 条消息`)
            return true
        } catch (error) {
            console.error('保存聊天消息失败:', error)
            
            // 如果是存储空间不足，尝试清理旧数据
            if (error.name === 'QuotaExceededError') {
                this.cleanupOldData()
                // 重试一次
                try {
                    const chatStorageKey = `${this.storageKey}_${chatId}`
                    localStorage.setItem(chatStorageKey, JSON.stringify({
                        chatId,
                        messages: this.limitMessages(this.cleanMessages(messages)),
                        lastUpdated: Date.now(),
                        messageCount: messages.length
                    }))
                    return true
                } catch (retryError) {
                    console.error('重试保存消息失败:', retryError)
                }
            }
            return false
        }
    }

    /**
     * 加载单个聊天的消息
     * @param {string} chatId - 聊天ID
     * @returns {Array} 消息数组
     */
    loadChatMessages(chatId) {
        if (!chatId) {
            console.warn('加载消息的聊天ID无效:', chatId)
            return []
        }

        try {
            const chatStorageKey = `${this.storageKey}_${chatId}`
            const storedData = localStorage.getItem(chatStorageKey)
            
            if (!storedData) {
                return []
            }

            const messageData = JSON.parse(storedData)
            
            // 验证数据结构
            if (!messageData.messages || !Array.isArray(messageData.messages)) {
                console.warn('存储的消息数据格式无效:', messageData)
                return []
            }

            // 检查消息是否过期
            const now = Date.now()
            const expiryDays = getConfigValue('messageExpiryDays', 30)
            const expireTime = expiryDays * 24 * 60 * 60 * 1000
            const validMessages = messageData.messages.filter(msg => {
                const messageAge = now - (msg.timestamp || 0)
                return messageAge < expireTime
            })

            // 如果有消息被过滤掉，更新存储
            if (validMessages.length !== messageData.messages.length) {
                this.saveChatMessages(chatId, validMessages)
            }

            console.log(`成功加载聊天 ${chatId} 的 ${validMessages.length} 条消息`)
            return validMessages
        } catch (error) {
            console.error('加载聊天消息失败:', error)
            return []
        }
    }

    /**
     * 加载所有聊天的消息
     * @returns {Object} 所有聊天消息的对象
     */
    loadAllMessages() {
        const allMessages = {}
        
        try {
            // 遍历localStorage查找所有相关的消息存储
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key && key.startsWith(`${this.storageKey}_`) && !key.endsWith('_meta')) {
                    // 提取chatId
                    const chatId = key.replace(`${this.storageKey}_`, '')
                    if (chatId) {
                        const messages = this.loadChatMessages(chatId)
                        if (messages.length > 0) {
                            allMessages[chatId] = messages
                        }
                    }
                }
            }
            
            console.log(`成功加载 ${Object.keys(allMessages).length} 个聊天的消息`)
        } catch (error) {
            console.error('加载所有消息失败:', error)
        }
        
        return allMessages
    }

    /**
     * 删除单个聊天的消息
     * @param {string} chatId - 聊天ID
     */
    deleteChatMessages(chatId) {
        if (!chatId) return false
        
        try {
            const chatStorageKey = `${this.storageKey}_${chatId}`
            localStorage.removeItem(chatStorageKey)
            console.log(`成功删除聊天 ${chatId} 的消息`)
            return true
        } catch (error) {
            console.error('删除聊天消息失败:', error)
            return false
        }
    }

    /**
     * 清空所有消息
     */
    clearAllMessages() {
        try {
            const keysToRemove = []
            
            // 收集所有相关的存储键
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key && key.startsWith(this.storageKey)) {
                    keysToRemove.push(key)
                }
            }
            
            // 删除所有相关存储
            keysToRemove.forEach(key => {
                localStorage.removeItem(key)
            })
            
            // 重新初始化元数据
            this.initStorageMeta()
            
            console.log(`成功清空所有消息，删除了 ${keysToRemove.length} 个存储项`)
            return true
        } catch (error) {
            console.error('清空所有消息失败:', error)
            return false
        }
    }

    /**
     * 清理消息数据
     * @param {Array} messages - 原始消息数组
     * @returns {Array} 清理后的消息数组
     */
    cleanMessages(messages) {
        return messages.filter(msg => {
            // 过滤掉无效消息
            if (!msg || typeof msg !== 'object') return false
            
            // 必须有基本字段
            if (!msg.messageId && !msg.timestamp) return false
            
            return true
        }).map(msg => {
            // 清理消息对象，移除不必要的字段
            const cleanMsg = { ...msg }
            
            // 移除可能很大的二进制数据（如果已经有URL）
            if (cleanMsg.url && cleanMsg.file) {
                delete cleanMsg.file
            }
            
            // 确保时间戳存在
            if (!cleanMsg.timestamp) {
                cleanMsg.timestamp = Date.now()
            }
            
            return cleanMsg
        })
    }

    /**
     * 限制消息数量
     * @param {Array} messages - 消息数组
     * @returns {Array} 限制后的消息数组
     */
    limitMessages(messages) {
        const maxMessages = getConfigValue('maxMessagesPerChat', 1000)
        if (messages.length <= maxMessages) {
            return messages
        }
        
        // 保留最新的消息
        return messages
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
            .slice(0, maxMessages)
    }

    /**
     * 更新存储元数据
     * @param {string} chatId - 聊天ID
     * @param {number} messageCount - 消息数量
     */
    updateStorageMeta(chatId, messageCount) {
        const meta = this.getStorageMeta() || {}
        meta.lastUpdated = Date.now()
        meta.totalMessages = (meta.totalMessages || 0) + messageCount
        this.setStorageMeta(meta)
    }

    /**
     * 清理旧数据
     */
    cleanupOldData() {
        try {
            const now = Date.now()
            const expiryDays = getConfigValue('messageExpiryDays', 30)
            const expireTime = expiryDays * 24 * 60 * 60 * 1000
            const keysToRemove = []
            
            // 查找过期的消息存储
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key && key.startsWith(`${this.storageKey}_`) && !key.endsWith('_meta')) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key))
                        if (data.lastUpdated && (now - data.lastUpdated) > expireTime) {
                            keysToRemove.push(key)
                        }
                    } catch (error) {
                        // 如果解析失败，也标记为删除
                        keysToRemove.push(key)
                    }
                }
            }
            
            // 删除过期数据
            keysToRemove.forEach(key => {
                localStorage.removeItem(key)
            })
            
            // 更新清理时间
            const meta = this.getStorageMeta() || {}
            meta.lastCleanup = now
            this.setStorageMeta(meta)
            
            console.log(`清理完成，删除了 ${keysToRemove.length} 个过期存储项`)
        } catch (error) {
            console.error('清理旧数据失败:', error)
        }
    }

    /**
     * 获取存储统计信息
     * @returns {Object} 存储统计信息
     */
    getStorageStats() {
        try {
            let totalSize = 0
            let chatCount = 0
            let totalMessages = 0
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key && key.startsWith(`${this.storageKey}_`) && !key.endsWith('_meta')) {
                    const value = localStorage.getItem(key)
                    if (value) {
                        totalSize += value.length
                        chatCount++
                        
                        try {
                            const data = JSON.parse(value)
                            totalMessages += data.messageCount || 0
                        } catch (error) {
                            // 忽略解析错误
                        }
                    }
                }
            }
            
            return {
                totalSize,
                chatCount,
                totalMessages,
                formattedSize: this.formatBytes(totalSize)
            }
        } catch (error) {
            console.error('获取存储统计失败:', error)
            return {
                totalSize: 0,
                chatCount: 0,
                totalMessages: 0,
                formattedSize: '0 B'
            }
        }
    }

    /**
     * 格式化字节大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的大小
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B'
        
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
}

// 创建默认实例
let defaultInstance = null

/**
 * 获取消息存储管理器实例
 * @param {string} sessionKey - 会话键
 * @returns {MessageStorageManager} 存储管理器实例
 */
export function getMessageStorage(sessionKey = 'default') {
    if (!defaultInstance || defaultInstance.sessionKey !== sessionKey) {
        defaultInstance = new MessageStorageManager(sessionKey)
    }
    return defaultInstance
}

/**
 * 导出存储配置
 */
export { STORAGE_CONFIG }

/**
 * 导出管理器类
 */
export { MessageStorageManager }

/**
 * 便捷方法：保存消息
 * @param {string} sessionKey - 会话键
 * @param {string} chatId - 聊天ID
 * @param {Array} messages - 消息数组
 */
export function saveMessages(sessionKey, chatId, messages) {
    const storage = getMessageStorage(sessionKey)
    return storage.saveChatMessages(chatId, messages)
}

/**
 * 便捷方法：加载消息
 * @param {string} sessionKey - 会话键
 * @param {string} chatId - 聊天ID
 * @returns {Array} 消息数组
 */
export function loadMessages(sessionKey, chatId) {
    const storage = getMessageStorage(sessionKey)
    return storage.loadChatMessages(chatId)
}

/**
 * 便捷方法：加载所有消息
 * @param {string} sessionKey - 会话键
 * @returns {Object} 所有消息对象
 */
export function loadAllMessages(sessionKey) {
    const storage = getMessageStorage(sessionKey)
    return storage.loadAllMessages()
}

/**
 * 便捷方法：清理存储
 * @param {string} sessionKey - 会话键
 */
export function cleanupStorage(sessionKey) {
    const storage = getMessageStorage(sessionKey)
    return storage.cleanupOldData()
}