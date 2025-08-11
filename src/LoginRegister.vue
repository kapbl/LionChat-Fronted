<template>
    <div class="login-bg">
      <div class="login-box">
        <div class="login-tabs">
          <div :class="['login-tab', {active: tab==='login'}]" @click="tab='login'">登录</div>
          <div :class="['login-tab', {active: tab==='register'}]" @click="tab='register'">注册</div>
        </div>
        <form @submit.prevent="tab==='login' ? doLogin() : doRegister()">
          <div class="login-form-item">
            <input v-model="username" placeholder="用户名" required />
          </div>
          <div v-if="tab==='register'" class="login-form-item">
            <input v-model="nickname" placeholder="昵称" required />
          </div>
          <div class="login-form-item">
            <input v-model="password" type="password" placeholder="密码" required />
          </div>
          <div class="login-form-item">
            <button type="submit" :disabled="loading">{{ tab==='login' ? '登录' : '注册' }}</button>
          </div>
          <div v-if="errorMsg" class="login-error">{{ errorMsg }}</div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  
  const tab = ref('login')
  const username = ref('')
  const password = ref('')
  const nickname = ref('')
  const loading = ref(false)
  const errorMsg = ref('')
  const router = useRouter()
  
  async function doLogin() {
    errorMsg.value = ''
    loading.value = true
    try {
      const resp = await fetch('v1/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.value, password: password.value })
      })
      // 返回的数据
      const data = await resp.json()
      if (data.code === 200 && data.data && data.data.token) {
        const sessionKey = getSessionKey(); // 获取session key
        localStorage.setItem(`token_${sessionKey}`, data.data.token)
        localStorage.setItem(`userinfo_${sessionKey}`, JSON.stringify(data.data.userinfo))
        router.push({ path: '/chat', query: { session: sessionKey } }) 
      } else {
        errorMsg.value = data.msg || '登录失败'
      }
    } catch (e) {
      errorMsg.value = '网络错误'
    } finally {
      loading.value = false
    }
  }
  
  async function doRegister() {
    errorMsg.value = ''
    loading.value = true
    try {
      const resp = await fetch('http://localhost/v1/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.value, password: password.value, nickname: nickname.value })
      })
      const data = await resp.json()
      if (data.code === 200) {
        tab.value = 'login'
        errorMsg.value = '注册成功，请登录'
      } else {
        errorMsg.value = data.data || '注册失败'
      }
    } catch (e) {
      errorMsg.value = '网络错误'
    } finally {
      loading.value = false
    }
  }
  
  function getSessionKey() {
    // 从URL参数获取或生成随机session key
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('session') || Math.random().toString(36).substr(2, 9)
  }
  </script>
  
  <style scoped>
  .login-bg {
    min-height: 100vh;
    background: linear-gradient(120deg, #ffffff 0%, #ffffff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .login-box {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    padding: 36px 32px 28px 32px;
    min-width: 320px;
    max-width: 90vw;
  }
  .login-tabs {
    display: flex;
    margin-bottom: 24px;
  }
  .login-tab {
    flex: 1;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    color: #888;
    padding: 8px 0;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: color 0.2s, border 0.2s;
  }
  .login-tab.active {
    color: #42b983;
    border-bottom: 2px solid #42b983;
  }
  .login-form-item {
    margin-bottom: 18px;
  }
  .login-form-item input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 16px;
    outline: none;
    transition: border 0.2s;
  }
  .login-form-item input:focus {
    border: 1.5px solid #42b983;
  }
  .login-form-item button {
    width: 100%;
    padding: 10px 0;
    background: #42b983;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
  }
  .login-form-item button:disabled {
    background: #b2e2c7;
    cursor: not-allowed;
  }
  .login-error {
    color: #f00;
    text-align: center;
    margin-top: 8px;
    font-size: 15px;
  }
  </style> 