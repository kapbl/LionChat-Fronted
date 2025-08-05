<template>
   <div class="chat-layout">
     <!-- 侧边栏布局 -->
     <LeftLayout /> 
     <!-- 聊天布局 -->
     <MessageLayout />
   </div>
</template>

<script setup>
import LeftLayout from '@/components/chat2/LeftLayout.vue'
import MessageLayout from '@/components/chat2/MessageLayout.vue'
</script>

<style>
.chat-layout {
  display: flex;
  height: 100vh;
  background: #f5f5f5;
  overflow: hidden;
}
</style>