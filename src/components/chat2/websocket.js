
import { ref } from 'vue';

let ws = null;
export const wsConnected = ref(false);

export function initWebSocket(sessionKey = 'default', onMessageCallback, myUuid, MessageType) {
    const token = localStorage.getItem(`token_${sessionKey}`);
    if (!token) {
        console.error('No token found for session:', sessionKey);
        wsConnected.value = false;
        return;
    }
    const WS_URL = `ws://62.234.192.227/v1/api/webSocket/connect?token=${token}`;

    ws = new WebSocket(WS_URL);
    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
        wsConnected.value = true;
        // 发送心跳消息
        setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                // 消息体
                const msgObj = {
                    to: myUuid,
                    type: 'ping',
                    messageType: 1, // 单聊或群聊
                }
                const errMsg = MessageType.verify(msgObj)
                if (errMsg) {
                    console.error('Message verification failed:', errMsg)
                    return
                }
                const messageBuffer = MessageType.encode(MessageType.create(msgObj)).finish()
                ws.send(messageBuffer)
            }
        }, 30000);
    };

    ws.onclose = () => {
        wsConnected.value = false;
    };

    if (onMessageCallback) {
        ws.onmessage = onMessageCallback;
    }
}

export function getWebSocket() {
    return ws;
}

export function closeWebSocket() {
    if (ws) {
        ws.close();
    }
}