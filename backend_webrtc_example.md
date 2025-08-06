# 后端WebRTC信令处理示例

## 概述

为了支持WebRTC语音通话功能，后端需要处理新的消息类型（contentType = 6）并转发信令消息。

## 消息格式更新

### Protobuf定义更新
```protobuf
syntax = "proto3";

message ChatMessage {
  string avatar = 1;
  string fromUsername = 2;
  string from = 3;
  string to = 4;
  string content = 5;
  int32 contentType = 6; // 1=文字, 2=文件, 3=图片, 4=语音, 5=视频, 6=WebRTC信令
  string type = 7;
  int32 messageType = 8; // 1=单聊, 2=群聊
  string url = 9;
  string fileSuffix = 10;
  bytes file = 11;
  int64 timestamp = 12;
  int32 duration = 13; // 语音消息时长（秒）
}
```

## 后端处理逻辑

### Go语言示例

```go
package main

import (
    "encoding/json"
    "log"
    "github.com/gorilla/websocket"
)

// WebRTC信令消息类型
type WebRTCSignal struct {
    Type      string      `json:"type"`
    From      string      `json:"from,omitempty"`
    FromName  string      `json:"fromName,omitempty"`
    To        string      `json:"to,omitempty"`
    Offer     interface{} `json:"offer,omitempty"`
    Answer    interface{} `json:"answer,omitempty"`
    Candidate interface{} `json:"candidate,omitempty"`
}

// 处理WebRTC信令消息
func handleWebRTCMessage(conn *websocket.Conn, message *ChatMessage) {
    // 解析信令内容
    var signal WebRTCSignal
    if err := json.Unmarshal([]byte(message.Content), &signal); err != nil {
        log.Printf("解析WebRTC信令失败: %v", err)
        return
    }

    log.Printf("收到WebRTC信令: %s, 从 %s 到 %s", signal.Type, message.From, message.To)

    // 根据信令类型处理
    switch signal.Type {
    case "call-invite":
        handleCallInvite(message, &signal)
    case "call-accept":
        handleCallAccept(message, &signal)
    case "call-reject":
        handleCallReject(message, &signal)
    case "call-hangup":
        handleCallHangup(message, &signal)
    case "offer":
        handleOffer(message, &signal)
    case "answer":
        handleAnswer(message, &signal)
    case "ice-candidate":
        handleIceCandidate(message, &signal)
    default:
        log.Printf("未知的WebRTC信令类型: %s", signal.Type)
    }

    // 转发消息给目标用户
    forwardMessageToUser(message)
}

// 处理通话邀请
func handleCallInvite(message *ChatMessage, signal *WebRTCSignal) {
    log.Printf("用户 %s 邀请 %s 进行语音通话", message.From, message.To)
    
    // 可以在这里添加业务逻辑，比如：
    // - 检查用户是否在线
    // - 检查用户是否正在通话中
    // - 记录通话邀请日志
    
    // 检查目标用户是否在线
    if !isUserOnline(message.To) {
        // 发送用户离线消息
        sendCallFailedMessage(message.From, "用户离线")
        return
    }
}

// 处理通话接受
func handleCallAccept(message *ChatMessage, signal *WebRTCSignal) {
    log.Printf("用户 %s 接受了来自 %s 的通话", message.From, message.To)
    
    // 可以在这里记录通话开始时间
    recordCallStart(message.From, message.To)
}

// 处理通话拒绝
func handleCallReject(message *ChatMessage, signal *WebRTCSignal) {
    log.Printf("用户 %s 拒绝了来自 %s 的通话", message.From, message.To)
    
    // 记录通话拒绝日志
    recordCallReject(message.From, message.To)
}

// 处理通话挂断
func handleCallHangup(message *ChatMessage, signal *WebRTCSignal) {
    log.Printf("用户 %s 挂断了与 %s 的通话", message.From, message.To)
    
    // 记录通话结束时间
    recordCallEnd(message.From, message.To)
}

// 处理WebRTC Offer
func handleOffer(message *ChatMessage, signal *WebRTCSignal) {
    log.Printf("转发Offer: %s -> %s", message.From, message.To)
}

// 处理WebRTC Answer
func handleAnswer(message *ChatMessage, signal *WebRTCSignal) {
    log.Printf("转发Answer: %s -> %s", message.From, message.To)
}

// 处理ICE候选
func handleIceCandidate(message *ChatMessage, signal *WebRTCSignal) {
    log.Printf("转发ICE候选: %s -> %s", message.From, message.To)
}

// 转发消息给目标用户
func forwardMessageToUser(message *ChatMessage) {
    // 查找目标用户的WebSocket连接
    targetConn := getUserConnection(message.To)
    if targetConn == nil {
        log.Printf("用户 %s 不在线，无法转发消息", message.To)
        return
    }

    // 序列化消息
    messageBytes, err := proto.Marshal(message)
    if err != nil {
        log.Printf("序列化消息失败: %v", err)
        return
    }

    // 发送消息
    if err := targetConn.WriteMessage(websocket.BinaryMessage, messageBytes); err != nil {
        log.Printf("发送消息失败: %v", err)
        // 可能需要清理连接
        removeUserConnection(message.To)
    }
}

// 检查用户是否在线
func isUserOnline(userID string) bool {
    // 实现用户在线状态检查逻辑
    return getUserConnection(userID) != nil
}

// 发送通话失败消息
func sendCallFailedMessage(userID, reason string) {
    // 实现发送通话失败通知的逻辑
    log.Printf("向用户 %s 发送通话失败通知: %s", userID, reason)
}

// 记录通话开始
func recordCallStart(caller, callee string) {
    // 实现通话记录逻辑
    log.Printf("记录通话开始: %s -> %s", caller, callee)
}

// 记录通话拒绝
func recordCallReject(caller, callee string) {
    // 实现通话拒绝记录逻辑
    log.printf("记录通话拒绝: %s -> %s", caller, callee)
}

// 记录通话结束
func recordCallEnd(caller, callee string) {
    // 实现通话结束记录逻辑
    log.Printf("记录通话结束: %s -> %s", caller, callee)
}

// 获取用户连接
func getUserConnection(userID string) *websocket.Conn {
    // 实现获取用户WebSocket连接的逻辑
    // 这通常涉及一个用户ID到连接的映射
    return nil // 占位符
}

// 移除用户连接
func removeUserConnection(userID string) {
    // 实现移除用户连接的逻辑
    log.Printf("移除用户 %s 的连接", userID)
}
```

### Node.js示例

```javascript
const WebSocket = require('ws');
const protobuf = require('protobufjs');

// 处理WebRTC信令消息
function handleWebRTCMessage(ws, message) {
    try {
        const signal = JSON.parse(message.content);
        console.log(`收到WebRTC信令: ${signal.type}, 从 ${message.from} 到 ${message.to}`);

        switch (signal.type) {
            case 'call-invite':
                handleCallInvite(message, signal);
                break;
            case 'call-accept':
                handleCallAccept(message, signal);
                break;
            case 'call-reject':
                handleCallReject(message, signal);
                break;
            case 'call-hangup':
                handleCallHangup(message, signal);
                break;
            case 'offer':
            case 'answer':
            case 'ice-candidate':
                // 直接转发WebRTC信令
                forwardMessageToUser(message);
                break;
            default:
                console.log(`未知的WebRTC信令类型: ${signal.type}`);
        }
    } catch (error) {
        console.error('解析WebRTC信令失败:', error);
    }
}

// 处理通话邀请
function handleCallInvite(message, signal) {
    console.log(`用户 ${message.from} 邀请 ${message.to} 进行语音通话`);
    
    // 检查目标用户是否在线
    if (!isUserOnline(message.to)) {
        sendCallFailedMessage(message.from, '用户离线');
        return;
    }
    
    // 转发邀请消息
    forwardMessageToUser(message);
}

// 转发消息给目标用户
function forwardMessageToUser(message) {
    const targetWs = getUserConnection(message.to);
    if (!targetWs) {
        console.log(`用户 ${message.to} 不在线，无法转发消息`);
        return;
    }

    // 序列化并发送消息
    const messageBuffer = MessageType.encode(MessageType.create(message)).finish();
    targetWs.send(messageBuffer);
}

// 用户连接管理
const userConnections = new Map();

function addUserConnection(userId, ws) {
    userConnections.set(userId, ws);
}

function removeUserConnection(userId) {
    userConnections.delete(userId);
}

function getUserConnection(userId) {
    return userConnections.get(userId);
}

function isUserOnline(userId) {
    return userConnections.has(userId);
}
```

## 数据库设计

### 通话记录表
```sql
CREATE TABLE call_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    caller_id VARCHAR(64) NOT NULL,
    callee_id VARCHAR(64) NOT NULL,
    call_type TINYINT DEFAULT 1, -- 1=语音, 2=视频
    status TINYINT DEFAULT 0, -- 0=邀请, 1=接受, 2=拒绝, 3=挂断
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    duration INT DEFAULT 0, -- 通话时长（秒）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_caller_id ON call_records(caller_id);
CREATE INDEX idx_callee_id ON call_records(callee_id);
CREATE INDEX idx_created_at ON call_records(created_at);
```

## 配置建议

### 1. WebSocket配置
```yaml
websocket:
  max_connections: 10000
  read_timeout: 60s
  write_timeout: 10s
  ping_interval: 30s
  pong_timeout: 10s
```

### 2. 消息队列
对于高并发场景，建议使用消息队列来处理WebRTC信令：
```yaml
redis:
  host: localhost
  port: 6379
  channels:
    webrtc_signals: "webrtc:signals"
```

### 3. 负载均衡
如果使用多个服务器实例，需要确保WebSocket连接的粘性：
```nginx
upstream websocket {
    ip_hash;
    server 127.0.0.1:8080;
    server 127.0.0.1:8081;
}
```

## 监控和日志

### 关键指标
1. **通话成功率**: 成功建立连接的通话比例
2. **连接时间**: 从邀请到建立连接的时间
3. **通话时长**: 平均通话时长统计
4. **错误率**: WebRTC连接失败的比例

### 日志格式
```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "level": "INFO",
  "event": "webrtc_call_invite",
  "caller": "user123",
  "callee": "user456",
  "call_id": "call_789",
  "metadata": {
    "user_agent": "Chrome/120.0.0.0",
    "ip": "192.168.1.100"
  }
}
```

## 安全考虑

1. **身份验证**: 确保只有已认证用户可以发起通话
2. **权限控制**: 检查用户是否有权限与目标用户通话
3. **频率限制**: 防止恶意用户频繁发起通话请求
4. **消息验证**: 验证WebRTC信令消息的格式和内容

---

这个示例展示了如何在后端处理WebRTC信令消息。根据具体的技术栈和业务需求，可能需要进行相应的调整和优化。