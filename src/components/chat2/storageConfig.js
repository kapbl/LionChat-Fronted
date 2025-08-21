// 消息存储配置管理
import { ref, reactive } from 'vue'

// 默认存储配置
const DEFAULT_CONFIG = {
    // 存储相关配置
    maxMessagesPerChat: 1000,        // 每个聊天最大消息数量
    maxTotalMessages: 10000,         // 总最大消息数量
    messageExpiryDays: 30,           // 消息过期天数
    autoCleanup: true,               // 是否自动清理过期消息
    compressionThreshold: 100,       // 压缩阈值（消息数量）
    
    // 存储策略
    storageStrategy: 'localStorage', // 存储策略: localStorage, indexedDB
    enableCompression: true,         // 是否启用压缩
    enableEncryption: false,         // 是否启用加密（预留）
    
    // 性能相关
    batchSaveSize: 50,              // 批量保存大小
    saveDelay: 1000,                // 保存延迟（毫秒）
    maxStorageSize: 50 * 1024 * 1024, // 最大存储大小（50MB）
    
    // 清理策略
    cleanupInterval: 24 * 60 * 60 * 1000, // 清理间隔（24小时）
    keepRecentMessages: 100,         // 保留最近消息数量
    
    // 调试选项
    enableDebugLog: false,          // 是否启用调试日志
    enableStorageStats: true,       // 是否启用存储统计
}

// 当前存储配置（响应式）
export const storageConfig = reactive({ ...DEFAULT_CONFIG })

// 配置状态
export const configLoaded = ref(false)
export const configError = ref(null)

// 配置键名
const CONFIG_STORAGE_KEY = 'lionChat_storage_config'

/**
 * 加载存储配置
 */
export async function loadStorageConfig() {
    try {
        const savedConfig = localStorage.getItem(CONFIG_STORAGE_KEY)
        if (savedConfig) {
            const parsed = JSON.parse(savedConfig)
            // 合并配置，确保新增的配置项有默认值
            Object.assign(storageConfig, DEFAULT_CONFIG, parsed)
        }
        configLoaded.value = true
        configError.value = null
        
        if (storageConfig.enableDebugLog) {
            console.log('存储配置已加载:', storageConfig)
        }
    } catch (error) {
        console.error('加载存储配置失败:', error)
        configError.value = error.message
        // 使用默认配置
        Object.assign(storageConfig, DEFAULT_CONFIG)
        configLoaded.value = true
    }
}

/**
 * 保存存储配置
 */
export async function saveStorageConfig() {
    try {
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(storageConfig))
        configError.value = null
        
        if (storageConfig.enableDebugLog) {
            console.log('存储配置已保存:', storageConfig)
        }
    } catch (error) {
        console.error('保存存储配置失败:', error)
        configError.value = error.message
        throw error
    }
}

/**
 * 重置存储配置为默认值
 */
export function resetStorageConfig() {
    Object.assign(storageConfig, DEFAULT_CONFIG)
    return saveStorageConfig()
}

/**
 * 更新存储配置
 * @param {Object} updates 要更新的配置项
 */
export async function updateStorageConfig(updates) {
    Object.assign(storageConfig, updates)
    return saveStorageConfig()
}

/**
 * 获取配置值
 * @param {string} key 配置键名
 * @param {*} defaultValue 默认值
 */
export function getConfigValue(key, defaultValue = null) {
    return storageConfig[key] ?? defaultValue
}

/**
 * 验证配置值
 * @param {Object} config 要验证的配置
 */
export function validateConfig(config) {
    const errors = []
    
    // 验证数值类型配置
    const numberFields = [
        'maxMessagesPerChat', 'maxTotalMessages', 'messageExpiryDays',
        'compressionThreshold', 'batchSaveSize', 'saveDelay',
        'maxStorageSize', 'cleanupInterval', 'keepRecentMessages'
    ]
    
    numberFields.forEach(field => {
        if (config[field] !== undefined) {
            const value = Number(config[field])
            if (isNaN(value) || value < 0) {
                errors.push(`${field} 必须是非负数`)
            }
        }
    })
    
    // 验证存储策略
    if (config.storageStrategy && !['localStorage', 'indexedDB'].includes(config.storageStrategy)) {
        errors.push('storageStrategy 必须是 localStorage 或 indexedDB')
    }
    
    // 验证逻辑关系
    if (config.maxMessagesPerChat > config.maxTotalMessages) {
        errors.push('每个聊天的最大消息数不能超过总最大消息数')
    }
    
    if (config.keepRecentMessages > config.maxMessagesPerChat) {
        errors.push('保留最近消息数不能超过每个聊天的最大消息数')
    }
    
    return errors
}

/**
 * 获取存储配置的可读描述
 */
export function getConfigDescription() {
    return {
        maxMessagesPerChat: '每个聊天最多保存的消息数量',
        maxTotalMessages: '所有聊天总共最多保存的消息数量',
        messageExpiryDays: '消息保存天数，超过此时间的消息将被清理',
        autoCleanup: '是否自动清理过期和超量的消息',
        compressionThreshold: '当消息数量超过此值时启用压缩存储',
        storageStrategy: '存储方式：localStorage（简单快速）或 indexedDB（大容量）',
        enableCompression: '是否启用消息压缩以节省存储空间',
        batchSaveSize: '批量保存消息的数量，提高保存性能',
        saveDelay: '消息保存延迟时间（毫秒），避免频繁保存',
        maxStorageSize: '最大存储空间限制（字节）',
        cleanupInterval: '自动清理检查间隔时间（毫秒）',
        keepRecentMessages: '清理时保留的最近消息数量',
        enableDebugLog: '是否在控制台输出调试信息',
        enableStorageStats: '是否启用存储统计功能'
    }
}

// 自动加载配置
loadStorageConfig()

export default {
    storageConfig,
    configLoaded,
    configError,
    loadStorageConfig,
    saveStorageConfig,
    resetStorageConfig,
    updateStorageConfig,
    getConfigValue,
    validateConfig,
    getConfigDescription
}