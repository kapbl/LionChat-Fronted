<template>
  <div class="storage-settings">
    <div class="settings-header">
      <h3>消息存储设置</h3>
      <div class="header-actions">
        <button @click="resetToDefaults" class="reset-btn">恢复默认</button>
        <button @click="saveSettings" class="save-btn" :disabled="!hasChanges">保存设置</button>
      </div>
    </div>

    <div class="settings-content" v-if="configLoaded">
      <!-- 基础存储设置 -->
      <div class="settings-section">
        <h4>基础设置</h4>
        
        <div class="setting-item">
          <label>每个聊天最大消息数量</label>
          <input 
            type="number" 
            v-model.number="localConfig.maxMessagesPerChat"
            min="100"
            max="10000"
            step="100"
          />
          <span class="setting-desc">{{ descriptions.maxMessagesPerChat }}</span>
        </div>

        <div class="setting-item">
          <label>总最大消息数量</label>
          <input 
            type="number" 
            v-model.number="localConfig.maxTotalMessages"
            min="1000"
            max="100000"
            step="1000"
          />
          <span class="setting-desc">{{ descriptions.maxTotalMessages }}</span>
        </div>

        <div class="setting-item">
          <label>消息保存天数</label>
          <input 
            type="number" 
            v-model.number="localConfig.messageExpiryDays"
            min="1"
            max="365"
          />
          <span class="setting-desc">{{ descriptions.messageExpiryDays }}</span>
        </div>

        <div class="setting-item">
          <label>
            <input 
              type="checkbox" 
              v-model="localConfig.autoCleanup"
            />
            自动清理过期消息
          </label>
          <span class="setting-desc">{{ descriptions.autoCleanup }}</span>
        </div>
      </div>

      <!-- 性能优化设置 -->
      <div class="settings-section">
        <h4>性能优化</h4>
        
        <div class="setting-item">
          <label>
            <input 
              type="checkbox" 
              v-model="localConfig.enableCompression"
            />
            启用消息压缩
          </label>
          <span class="setting-desc">{{ descriptions.enableCompression }}</span>
        </div>

        <div class="setting-item" v-if="localConfig.enableCompression">
          <label>压缩阈值（消息数量）</label>
          <input 
            type="number" 
            v-model.number="localConfig.compressionThreshold"
            min="50"
            max="1000"
            step="50"
          />
          <span class="setting-desc">{{ descriptions.compressionThreshold }}</span>
        </div>

        <div class="setting-item">
          <label>批量保存大小</label>
          <input 
            type="number" 
            v-model.number="localConfig.batchSaveSize"
            min="10"
            max="200"
            step="10"
          />
          <span class="setting-desc">{{ descriptions.batchSaveSize }}</span>
        </div>

        <div class="setting-item">
          <label>保存延迟（毫秒）</label>
          <input 
            type="number" 
            v-model.number="localConfig.saveDelay"
            min="100"
            max="5000"
            step="100"
          />
          <span class="setting-desc">{{ descriptions.saveDelay }}</span>
        </div>
      </div>

      <!-- 清理策略设置 -->
      <div class="settings-section">
        <h4>清理策略</h4>
        
        <div class="setting-item">
          <label>保留最近消息数量</label>
          <input 
            type="number" 
            v-model.number="localConfig.keepRecentMessages"
            min="50"
            max="500"
            step="50"
          />
          <span class="setting-desc">{{ descriptions.keepRecentMessages }}</span>
        </div>

        <div class="setting-item">
          <label>最大存储空间（MB）</label>
          <input 
            type="number" 
            v-model.number="maxStorageMB"
            min="10"
            max="500"
            step="10"
          />
          <span class="setting-desc">限制消息存储占用的最大空间</span>
        </div>
      </div>

      <!-- 调试选项 -->
      <div class="settings-section">
        <h4>调试选项</h4>
        
        <div class="setting-item">
          <label>
            <input 
              type="checkbox" 
              v-model="localConfig.enableDebugLog"
            />
            启用调试日志
          </label>
          <span class="setting-desc">{{ descriptions.enableDebugLog }}</span>
        </div>

        <div class="setting-item">
          <label>
            <input 
              type="checkbox" 
              v-model="localConfig.enableStorageStats"
            />
            启用存储统计
          </label>
          <span class="setting-desc">{{ descriptions.enableStorageStats }}</span>
        </div>
      </div>

      <!-- 存储统计信息 -->
      <div class="settings-section" v-if="localConfig.enableStorageStats">
        <h4>存储统计</h4>
        <div class="storage-stats">
          <div class="stat-item">
            <span class="stat-label">已存储聊天数量：</span>
            <span class="stat-value">{{ storageStats.totalChats }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总消息数量：</span>
            <span class="stat-value">{{ storageStats.totalMessages }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">存储空间占用：</span>
            <span class="stat-value">{{ formatBytes(storageStats.storageSize) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">最后清理时间：</span>
            <span class="stat-value">{{ formatDate(storageStats.lastCleanup) }}</span>
          </div>
        </div>
        
        <div class="storage-actions">
          <button @click="cleanupStorage" class="cleanup-btn">立即清理</button>
          <button @click="exportMessages" class="export-btn">导出消息</button>
          <button @click="clearAllMessages" class="danger-btn">清空所有消息</button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else class="loading-state">
      <p>正在加载配置...</p>
    </div>

    <!-- 错误提示 -->
    <div v-if="configError" class="error-message">
      <p>配置加载失败: {{ configError }}</p>
      <button @click="reloadConfig">重新加载</button>
    </div>

    <!-- 验证错误 -->
    <div v-if="validationErrors.length > 0" class="validation-errors">
      <h4>配置错误：</h4>
      <ul>
        <li v-for="error in validationErrors" :key="error">{{ error }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { 
  storageConfig, 
  configLoaded, 
  configError,
  loadStorageConfig,
  saveStorageConfig,
  resetStorageConfig,
  updateStorageConfig,
  validateConfig,
  getConfigDescription
} from './storageConfig.js'
import { getMessageStorage, cleanupStorage } from './messageStorage.js'

export default {
  name: 'StorageSettings',
  setup() {
    // 本地配置副本
    const localConfig = ref({ ...storageConfig })
    const descriptions = ref(getConfigDescription())
    const validationErrors = ref([])
    const storageStats = ref({
      totalChats: 0,
      totalMessages: 0,
      storageSize: 0,
      lastCleanup: null
    })

    // 计算属性
    const hasChanges = computed(() => {
      return JSON.stringify(localConfig.value) !== JSON.stringify(storageConfig)
    })

    const maxStorageMB = computed({
      get: () => Math.round(localConfig.value.maxStorageSize / (1024 * 1024)),
      set: (value) => {
        localConfig.value.maxStorageSize = value * 1024 * 1024
      }
    })

    // 监听配置变化
    watch(storageConfig, (newConfig) => {
      localConfig.value = { ...newConfig }
    }, { deep: true })

    // 验证配置
    watch(localConfig, (newConfig) => {
      validationErrors.value = validateConfig(newConfig)
    }, { deep: true })

    // 方法
    const saveSettings = async () => {
      try {
        const errors = validateConfig(localConfig.value)
        if (errors.length > 0) {
          validationErrors.value = errors
          return
        }

        await updateStorageConfig(localConfig.value)
        validationErrors.value = []
        alert('设置已保存')
      } catch (error) {
        console.error('保存设置失败:', error)
        alert('保存设置失败: ' + error.message)
      }
    }

    const resetToDefaults = async () => {
      if (confirm('确定要恢复默认设置吗？这将清除所有自定义配置。')) {
        try {
          await resetStorageConfig()
          localConfig.value = { ...storageConfig }
          validationErrors.value = []
          alert('已恢复默认设置')
        } catch (error) {
          console.error('恢复默认设置失败:', error)
          alert('恢复默认设置失败: ' + error.message)
        }
      }
    }

    const reloadConfig = async () => {
      try {
        await loadStorageConfig()
        localConfig.value = { ...storageConfig }
      } catch (error) {
        console.error('重新加载配置失败:', error)
      }
    }

    const updateStorageStats = async () => {
      try {
        const messageStorage = getMessageStorage()
        const stats = await messageStorage.getStorageStats()
        storageStats.value = stats
      } catch (error) {
        console.error('获取存储统计失败:', error)
      }
    }

    const cleanupStorageAction = async () => {
      try {
        await cleanupStorage()
        await updateStorageStats()
        alert('存储清理完成')
      } catch (error) {
        console.error('存储清理失败:', error)
        alert('存储清理失败: ' + error.message)
      }
    }

    const exportMessages = async () => {
      try {
        const messageStorage = getMessageStorage()
        const allMessages = await messageStorage.loadAllMessages()
        const dataStr = JSON.stringify(allMessages, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        
        const link = document.createElement('a')
        link.href = URL.createObjectURL(dataBlob)
        link.download = `lionChat_messages_${new Date().toISOString().split('T')[0]}.json`
        link.click()
        
        URL.revokeObjectURL(link.href)
      } catch (error) {
        console.error('导出消息失败:', error)
        alert('导出消息失败: ' + error.message)
      }
    }

    const clearAllMessages = async () => {
      if (confirm('确定要清空所有消息吗？此操作不可恢复！')) {
        if (confirm('请再次确认：这将永久删除所有聊天记录！')) {
          try {
            const messageStorage = getMessageStorage()
            await messageStorage.clearAllMessages()
            await updateStorageStats()
            alert('所有消息已清空')
          } catch (error) {
            console.error('清空消息失败:', error)
            alert('清空消息失败: ' + error.message)
          }
        }
      }
    }

    const formatBytes = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatDate = (timestamp) => {
      if (!timestamp) return '从未'
      return new Date(timestamp).toLocaleString()
    }

    // 生命周期
    onMounted(() => {
      updateStorageStats()
    })

    return {
      localConfig,
      descriptions,
      configLoaded,
      configError,
      validationErrors,
      storageStats,
      hasChanges,
      maxStorageMB,
      saveSettings,
      resetToDefaults,
      reloadConfig,
      cleanupStorage: cleanupStorageAction,
      exportMessages,
      clearAllMessages,
      formatBytes,
      formatDate
    }
  }
}
</script>

<style scoped>
.storage-settings {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: var(--bg-primary, #fff);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color, #eee);
}

.settings-header h3 {
  margin: 0;
  color: var(--text-primary, #333);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.settings-section {
  margin-bottom: 32px;
}

.settings-section h4 {
  margin: 0 0 16px 0;
  color: var(--text-primary, #333);
  font-size: 16px;
  font-weight: 600;
}

.setting-item {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-item label {
  font-weight: 500;
  color: var(--text-primary, #333);
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-item input[type="number"] {
  padding: 8px 12px;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 4px;
  font-size: 14px;
  max-width: 200px;
}

.setting-item input[type="checkbox"] {
  margin: 0;
}

.setting-desc {
  font-size: 12px;
  color: var(--text-secondary, #666);
  margin-top: 4px;
}

.storage-stats {
  background: var(--bg-secondary, #f5f5f5);
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.stat-label {
  color: var(--text-secondary, #666);
}

.stat-value {
  font-weight: 500;
  color: var(--text-primary, #333);
}

.storage-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* 按钮样式 */
button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn {
  background: var(--accent-color, #42b983);
  color: white;
}

.save-btn:disabled {
  background: var(--border-color, #ddd);
  cursor: not-allowed;
}

.reset-btn {
  background: var(--bg-secondary, #f5f5f5);
  color: var(--text-primary, #333);
  border: 1px solid var(--border-color, #ddd);
}

.cleanup-btn {
  background: var(--warning-color, #f39c12);
  color: white;
}

.export-btn {
  background: var(--info-color, #3498db);
  color: white;
}

.danger-btn {
  background: var(--danger-color, #e74c3c);
  color: white;
}

button:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary, #666);
}

.error-message {
  background: var(--danger-bg, #fee);
  color: var(--danger-color, #e74c3c);
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.validation-errors {
  background: var(--warning-bg, #fef9e7);
  color: var(--warning-color, #f39c12);
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.validation-errors ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.validation-errors li {
  margin-bottom: 4px;
}
</style>