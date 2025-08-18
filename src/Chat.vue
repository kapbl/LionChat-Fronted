<template>
   <div class="chat-layout" :class="`${currentTheme}-theme`">
     <!-- 侧边栏布局 -->
     <LeftLayout /> 
     <!-- 聊天布局 -->
     <MessageLayout />
   </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LeftLayout from '@/components/chat2/LeftLayout.vue'
import MessageLayout from '@/components/chat2/MessageLayout.vue'

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
</script>

<style>
.chat-layout {
  display: flex;
  height: 100vh;
  background: var(--bg-primary, #f5f5f5);
  overflow: hidden;
}
</style>