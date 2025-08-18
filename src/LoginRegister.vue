<template>
    <div class="login-bg">
      <div class="login-container">
        <div class="login-left">
          <div class="login-form-wrapper">
            <div class="login-header">
              <div class="header-top">
                <h1 class="login-title">{{ tab === 'login' ? texts.signIn : texts.signUp }}</h1>
                <button @click="toggleLanguage" class="language-toggle">
                  {{ language === 'zh' ? 'EN' : '中' }}
                </button>
              </div>
            </div>
            
            <form @submit.prevent="tab==='login' ? doLogin() : doRegister()" class="login-form">
              <div class="form-group">
                <label class="form-label">{{ texts.email }}</label>
                <input 
                  v-model="email" 
                  type="email" 
                  :placeholder="texts.emailPlaceholder" 
                  required 
                  class="form-input" 
                />
              </div>
              
              <div v-if="tab==='register'" class="form-group register-field">
                <label class="form-label">{{ texts.username }}</label>
                <input 
                  v-model="username" 
                  :placeholder="texts.usernamePlaceholder" 
                  required 
                  class="form-input" 
                />
              </div>
              
              <div v-if="tab==='register'" class="form-group register-field">
                <label class="form-label">{{ texts.nickname }}</label>
                <input 
                  v-model="nickname" 
                  :placeholder="texts.nicknamePlaceholder" 
                  required 
                  class="form-input" 
                />
              </div>
              
              <div class="form-group">
                <div class="password-header">
                  <label class="form-label">{{ texts.password }}</label>
                  <a href="#" class="forgot-link" v-if="tab === 'login'">{{ texts.forgotPassword }}</a>
                </div>
                <div class="password-wrapper">
                  <input 
                    v-model="password" 
                    :type="showPassword ? 'text' : 'password'" 
                    placeholder="••••••••••" 
                    required 
                    class="form-input password-input" 
                  />
                  <button 
                    type="button" 
                    @click="showPassword = !showPassword" 
                    class="password-toggle"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path v-if="!showPassword" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" fill="none"/>
                      <circle v-if="!showPassword" cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
                      <path v-else d="m1 1 22 22M6.71 6.71C4.68 8.04 3 10.5 3 12s1.68 3.96 3.71 5.29m0-10.58C8.04 5.32 10.5 4 12 4s3.96 1.32 5.29 3.71M17.29 17.29C15.96 18.68 13.5 20 12 20s-3.96-1.32-5.29-2.71" stroke="currentColor" stroke-width="2" fill="none"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <button type="submit" :disabled="loading" class="submit-btn">
                <span v-if="!loading">{{ tab === 'login' ? texts.signIn : texts.signUp }}</span>
                <div v-else class="loading-spinner"></div>
              </button>
              
              <div v-if="errorMsg" class="login-error">
                {{ errorMsg }}
              </div>
            </form>
            
            <div class="form-footer">
              <span class="footer-text">
                {{ tab === 'login' ? texts.noAccount : texts.hasAccount }}
              </span>
              <button 
                type="button" 
                @click="switchTab(tab === 'login' ? 'register' : 'login')" 
                class="switch-link"
              >
                {{ tab === 'login' ? texts.signUp : texts.signIn }}
              </button>
            </div>
          </div>
        </div>
        
        <div class="login-right">
          <div class="decoration-area">
            <div class="floating-orbs">
              <div class="orb orb-1"></div>
              <div class="orb orb-2"></div>
              <div class="orb orb-3"></div>
              <div class="orb orb-4"></div>
              <div class="orb orb-5"></div>
            </div>
            <div class="brand-logo">{{ texts.brandName }}</div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  
  const tab = ref('login')
  const email = ref('') // 邮箱 必填
  const username = ref('') // 用户名 必填
  const password = ref('')
  const nickname = ref('')// 不唯一
  const loading = ref(false)
  const errorMsg = ref('')
  const showPassword = ref(false)
  const language = ref('zh') // 默认中文
  const router = useRouter()
  
  // 多语言文本配置
  const translations = {
    zh: {
      signIn: '登录',
      signUp: '注册',
      email: '邮箱',
      emailPlaceholder: 'Charles@comet.co',
      username: '用户名',
      usernamePlaceholder: '请输入用户名',
      nickname: '昵称',
      nicknamePlaceholder: '请输入昵称',
      password: '密码',
      forgotPassword: '忘记密码？',
      noAccount: '还没有账户？',
      hasAccount: '已有账户？',
      brandName: 'Lion Chat',

      loginSuccess: '登录成功',
      loginFailed: '登录失败',
      registerSuccess: '注册成功，请登录',
      registerFailed: '注册失败',
      networkError: '网络错误'
    },
    en: {
      signIn: 'Sign in',
      signUp: 'Sign up',
      email: 'Email',
      emailPlaceholder: 'Charles@comet.co',
      username: 'Username',
      usernamePlaceholder: 'Enter username',
      nickname: 'Nickname',
      nicknamePlaceholder: 'Your nickname',
      password: 'Password',
      forgotPassword: 'Forgot password?',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      brandName: 'Lion Chat',
      loginSuccess: 'Login successful',
      loginFailed: 'Login failed',
      registerSuccess: 'Registration successful, please login',
      registerFailed: 'Registration failed',
      networkError: 'Network error'
    }
  }
  
  // 计算当前语言的文本
  const texts = computed(() => translations[language.value])
  
  // 切换语言
  function toggleLanguage() {
    language.value = language.value === 'zh' ? 'en' : 'zh'
  }
  
  async function doLogin() {
    errorMsg.value = ''
    loading.value = true
    try {
      const resp = await fetch('http://localhost:9922/v1/api/user/login', {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email.value, password: password.value })
      })
      // 返回的数据
      const data = await resp.json()
      console.log(data)
      if (data.code === 2002) {
        const sessionKey = getSessionKey(); // 获取session key
        localStorage.setItem(`token_${sessionKey}`, data.access_token)
        // localStorage.setItem(`userinfo_${sessionKey}`, JSON.stringify(data.data.userinfo))
        router.push({ path: '/chat', query: { session: sessionKey } }) 
      } else {
        errorMsg.value = data.code || texts.value.loginFailed
      }
    } catch (e) {
      errorMsg.value = texts.value.networkError 
    } finally {
      loading.value = false
    }
  }
  
  async function doRegister() {
    errorMsg.value = ''
    loading.value = true
    try {
      const resp = await fetch('http://localhost:9922/v1/api/user/register', {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value, username: username.value, password: password.value, nickname: nickname.value })
      })
      const data = await resp.json()
      console.log(data)

      if (data.code === 2000) {
        tab.value = 'login'
        errorMsg.value = texts.value.registerSuccess
      } else {
        errorMsg.value = data.data || texts.value.registerFailed
      }
    } catch (e) {
      errorMsg.value = texts.value.networkError
    } finally {
      loading.value = false
    }
  }
  
  function getSessionKey() {
    // 从URL参数获取或生成随机session key
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('session') || Math.random().toString(36).substr(2, 9)
  }

  function switchTab(newTab) {
    tab.value = newTab
    errorMsg.value = ''
    email.value = ''
    username.value = ''
    password.value = ''
    nickname.value = ''
  }
  </script>
  
  <style scoped>
  .login-bg {
    min-height: 100vh;
    background: #0a0a0a;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .login-container {
    display: flex;
    width: 100%;
    max-width: 1200px;
    height: 100vh;
    background: #0a0a0a;
  }

  .login-left {
     flex: 1;
     display: flex;
     align-items: center;
     justify-content: center;
     padding: 40px;
     background: #0a0a0a;
     position: relative;
     z-index: 1001;
   }

  .login-form-wrapper {
    width: 100%;
    max-width: 400px;
  }

  .login-header {
    margin-bottom: 40px;
  }

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .login-title {
    font-size: 32px;
    font-weight: 600;
    color: #ffffff;
    margin: 0;
    line-height: 1.2;
  }

  .language-toggle {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }

  .language-toggle:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  .language-toggle:active {
    transform: translateY(0);
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-label {
    font-size: 14px;
    font-weight: 500;
    color: #a1a1aa;
    margin: 0;
  }

  .password-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .forgot-link {
    font-size: 14px;
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
  }

  .forgot-link:hover {
    text-decoration: underline;
  }

  .form-input {
    width: 100%;
    padding: 12px 16px;
    background: #18181b;
    border: 1px solid #27272a;
    border-radius: 8px;
    color: #ffffff;
    font-size: 16px;
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }

  .form-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .form-input::placeholder {
    color: #71717a;
  }

  .password-wrapper {
    position: relative;
  }

  .password-input {
    padding-right: 48px;
  }

  .password-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #71717a;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease;
  }

  .password-toggle:hover {
    color: #a1a1aa;
  }

  .submit-btn {
    width: 100%;
    padding: 12px 16px;
    background: #3b82f6;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
  }

  .submit-btn:hover:not(:disabled) {
    background: #2563eb;
  }

  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .login-error {
    color: #ef4444;
    font-size: 14px;
    text-align: center;
    margin-top: 8px;
    padding: 12px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 8px;
  }

  .form-footer {
    margin-top: 32px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .footer-text {
    font-size: 14px;
    color: #a1a1aa;
  }

  .switch-link {
    background: none;
    border: none;
    color: #3b82f6;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    padding: 0;
  }

  .switch-link:hover {
    text-decoration: underline;
  }

  .login-right {
     flex: 1;
     position: relative;
     overflow: hidden;
     display: flex;
     align-items: center;
     justify-content: center;
   }

  .decoration-area {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .floating-orbs {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  .orb {
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    opacity: 0.6;
    animation: float 8s ease-in-out infinite;
    filter: blur(1px);
  }

  .orb-1 {
    width: 120px;
    height: 120px;
    top: 15%;
    right: 20%;
    animation-delay: 0s;
  }

  .orb-2 {
    width: 80px;
    height: 80px;
    top: 60%;
    left: 15%;
    animation-delay: 2s;
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
  }

  .orb-3 {
    width: 60px;
    height: 60px;
    bottom: 25%;
    right: 35%;
    animation-delay: 4s;
    background: linear-gradient(135deg, #06b6d4, #3b82f6);
  }

  .orb-4 {
    width: 40px;
    height: 40px;
    top: 35%;
    left: 25%;
    animation-delay: 1s;
    background: linear-gradient(135deg, #f59e0b, #ef4444);
  }

  .orb-5 {
    width: 100px;
    height: 100px;
    bottom: 15%;
    left: 40%;
    animation-delay: 3s;
    background: linear-gradient(135deg, #10b981, #06b6d4);
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px) translateX(0px) scale(1);
    }
    33% {
      transform: translateY(-30px) translateX(20px) scale(1.1);
    }
    66% {
      transform: translateY(20px) translateX(-15px) scale(0.9);
    }
  }

  .brand-logo {
    font-size: 48px;
    font-weight: 700;
    color: #ffffff;
    z-index: 10;
    position: relative;
    text-transform: lowercase;
    letter-spacing: -2px;
  }

  .register-field {
    animation: slideDown 0.3s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      max-height: 0;
      margin-bottom: 0;
    }
    to {
      opacity: 1;
      max-height: 100px;
      margin-bottom: 0;
    }
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .login-container {
      flex-direction: column;
    }
    
    .login-right {
      display: none;
    }
    
    .login-left {
      padding: 20px;
    }
    
    .login-title {
      font-size: 28px;
    }
  }

  @media (max-width: 480px) {
    .login-form-wrapper {
      max-width: 100%;
    }
    
    .form-input {
      padding: 12px 14px;
    }
  }
  </style>