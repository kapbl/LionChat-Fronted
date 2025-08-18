<template>
  <div v-if="visible" class="toast" :class="[type, `${currentTheme}-theme`]">
    <div class="toast-content">
      <span class="toast-icon">{{ getIcon() }}</span>
      <span class="toast-message">{{ message }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const currentTheme = ref(localStorage.getItem('chat-theme') || 'light')

onMounted(() => {
  // 监听主题变化
  const observer = new MutationObserver(() => {
    const theme = document.documentElement.getAttribute('data-theme') || 'light'
    currentTheme.value = theme
  })
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
})

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info', // info, success, warning, error
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000
  },
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const visible = ref(false)
let timer = null

watch(() => props.show, (newVal) => {
  if (newVal) {
    showToast()
  } else {
    hideToast()
  }
})

function showToast() {
  visible.value = true
  if (timer) {
    clearTimeout(timer)
  }
  timer = setTimeout(() => {
    hideToast()
  }, props.duration)
}

function hideToast() {
  visible.value = false
  emit('close')
}

function getIcon() {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  }
  return icons[props.type] || icons.info
}
</script>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  min-width: 300px;
  max-width: 500px;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  animation: slideIn 0.3s ease-out;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toast-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.toast-message {
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
}

/* 不同类型的样式 */
.toast.info {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
  color: #1565c0;
}

.toast.success {
  background-color: #e8f5e8;
  border-left: 4px solid #4caf50;
  color: #2e7d32;
}

.toast.warning {
  background-color: #fff3e0;
  border-left: 4px solid #ff9800;
  color: #ef6c00;
}

.toast.error {
  background-color: #ffebee;
  border-left: 4px solid #f44336;
  color: #c62828;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 深色主题支持 */
.toast.dark-theme.info {
  background-color: #1e3a8a;
  color: #93c5fd;
  border-left-color: #3b82f6;
}

.toast.dark-theme.success {
  background-color: #14532d;
  color: #86efac;
  border-left-color: #22c55e;
}

.toast.dark-theme.warning {
  background-color: #92400e;
  color: #fbbf24;
  border-left-color: #f59e0b;
}

.toast.dark-theme.error {
  background-color: #7f1d1d;
  color: #fca5a5;
  border-left-color: #ef4444;
}

/* 护眼主题支持 */
.toast.eye-care-theme.info {
  background-color: #f0ead6;
  color: #5d4e37;
  border-left-color: #8fbc8f;
}

.toast.eye-care-theme.success {
  background-color: #e6f3e6;
  color: #3c2e26;
  border-left-color: #8fbc8f;
}

.toast.eye-care-theme.warning {
  background-color: #f7f3e9;
  color: #8b7355;
  border-left-color: #d4c4a8;
}

.toast.eye-care-theme.error {
  background-color: #f0ead6;
  color: #8b7355;
  border-left-color: #d4c4a8;
}
</style>