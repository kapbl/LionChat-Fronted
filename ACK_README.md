# 消息已读确认(ACK)机制实现说明

## 概述

本项目实现了完整的消息已读确认(ACK)机制，当接收方查看消息时，客户端会向服务器发送确认信号，服务器更新状态并同步给发送方，实现消息的已读/未读状态管理。

## 核心特性

### 1. ACK确认机制
- **原理**: 当接收方查看消息时，客户端向服务器发送确认信号（ACK），服务器更新状态并同步给发送方
- **触发时机**: 消息进入可视区域（如滚动至视口）或用户主动打开聊天窗口时
- **技术实现**: 前端通过监听滚动事件或窗口激活事件（visibilitychange）触发ACK
- **批量优化**: 用户阅读多条消息时，客户端合并发送一个ACK包（包含多条消息ID），减少网络请求

### 2. 可视区域监听
- 使用 `Intersection Observer API` 监听消息元素进入可视区域
- 当消息50%可见时自动触发已读确认
- 只对非自己发送的消息进行ACK确认

### 3. 页面可见性监听
- 监听 `visibilitychange` 事件
- 页面从隐藏状态变为可见时，立即发送所有待确认的ACK
- 切换聊天对象时，自动标记当前聊天的所有消息为已读

## 文件结构

### 1. 协议定义 (`public/message.proto`)
```protobuf
message Message {
    // ... 其他字段
    int32 contentType = 6;   // 新增: 10.消息已读确认(ACK)
    string type = 7;         // 新增: ACK确认为ack
    
    // 消息已读确认相关字段
    repeated string ackMessageIds = 18; // 批量确认的消息ID列表
    bool isRead = 19;        // 消息是否已读
    int64 readTimestamp = 20; // 消息已读时间戳
}
```

### 2. ACK管理器 (`src/components/chat2/ackManager.js`)
核心功能模块，负责:
- 管理待发送的ACK消息队列
- 监听消息元素的可视状态
- 批量发送ACK确认
- 处理页面可见性变化

### 3. 消息组件 (`src/components/chat2/MessageLayout.vue`)
集成ACK功能:
- 为每条消息生成唯一ID
- 注册消息元素到ACK管理器
- 显示消息已读状态
- 处理ACK确认消息

## 核心实现

### 1. 消息唯一ID生成
```javascript
function generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
```

### 2. 可视区域监听
```javascript
const messageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const messageId = entry.target.dataset.messageId
            const fromUuid = entry.target.dataset.fromUuid
            
            if (messageId && fromUuid && fromUuid !== this.myUuid) {
                this.markMessageAsRead(messageId)
            }
        }
    })
}, { threshold: 0.5 })
```

### 3. 批量ACK发送
```javascript
flushPendingAcks() {
    const ackMessageIds = Array.from(this.pendingAcks)
    
    const ackMessage = {
        contentType: 10, // ACK消息类型
        type: 'ack',
        ackMessageIds: ackMessageIds,
        isRead: true,
        readTimestamp: Date.now()
    }
    
    ws.send(MessageType.encode(MessageType.create(ackMessage)).finish())
}
```

### 4. 已读状态显示
```vue
<span v-if="msg.from === myUuid && msg.messageId" class="read-status">
    <span v-if="isMessageRead(msg.messageId)" class="read-indicator">✓✓</span>
    <span v-else class="unread-indicator">✓</span>
</span>
```

## 触发时机

### 1. 自动触发
- 消息滚动进入可视区域（50%可见）
- 页面从隐藏变为可见
- 切换到新的聊天对象

### 2. 延迟发送
- 默认延迟1秒发送ACK，允许批量处理
- 页面可见性变化时立即发送

### 3. 批量优化
- 多条消息的ACK会合并为一个请求
- 减少网络请求频率，提升性能

## 状态管理

### 1. 本地状态
- `readMessages`: 已读消息ID集合
- `pendingAcks`: 待发送ACK的消息ID集合
- `messageElements`: 消息ID到DOM元素的映射

### 2. 事件通信
- 使用自定义事件 `messagesAcked` 通知组件更新UI
- 支持跨组件的状态同步

## 使用方法

### 1. 初始化
```javascript
import { ackManager } from './ackManager.js'

// 在组件挂载时初始化
ackManager.init(myUuid, MessageType)
```

### 2. 注册消息元素
```javascript
// 在消息渲染时注册
function registerMessageElement(msg, el) {
    if (el && msg.messageId && msg.from !== myUuid) {
        ackManager.registerMessageElement(msg.messageId, el, msg.from)
    }
}
```

### 3. 处理ACK消息
```javascript
// 在WebSocket消息处理中添加
case 10: // ACK确认消息
    handleAckMessage(decoded)
    break
```

### 4. 清理资源
```javascript
// 在组件卸载时清理
ackManager.destroy()
```

## 性能优化

### 1. 批量处理
- 合并多条消息的ACK请求
- 减少网络请求频率

### 2. 延迟发送
- 1秒延迟允许收集更多待确认消息
- 避免频繁的网络请求

### 3. 智能触发
- 只对可见消息进行监听
- 页面隐藏时暂停ACK发送

### 4. 内存管理
- 及时清理过期的分片数据
- 合理管理DOM元素引用

## 注意事项

1. **消息ID唯一性**: 确保每条消息都有唯一的messageId
2. **网络异常处理**: ACK发送失败时的重试机制
3. **性能监控**: 监控ACK发送频率，避免过度请求
4. **兼容性**: 确保Intersection Observer API的浏览器兼容性
5. **服务端支持**: 需要服务端支持ACK消息类型的处理

## 扩展功能

### 1. 消息撤回
- 可基于ACK机制实现消息撤回功能
- 已读消息不允许撤回

### 2. 阅读回执
- 显示具体的阅读时间
- 支持群聊中的多人阅读状态

### 3. 离线消息
- 结合离线消息推送
- 支持消息的持久化存储

这个ACK确认机制提供了完整的消息已读/未读状态管理，通过智能的触发时机和批量优化，在保证用户体验的同时最大化了性能效率。