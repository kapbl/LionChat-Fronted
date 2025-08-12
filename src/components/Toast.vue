<template>
  <div v-if="visible" class="toast" :class="type">
    <div class="toast-content">
      <span class="toast-icon">{{ getIcon() }}</span>
      <span class="toast-message">{{ message }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

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

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .toast.info {
    background-color: #1e3a8a;
    color: #93c5fd;
  }
  
  .toast.success {
    background-color: #14532d;
    color: #86efac;
  }
  
  .toast.warning {
    background-color: #92400e;
    color: #fbbf24;
  }
  
  .toast.error {
    background-color: #7f1d1d;
    color: #fca5a5;
  }
}
</style>