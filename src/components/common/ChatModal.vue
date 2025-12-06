<template>
  <div class="chat-wrapper">
    <div class="chat-modal-overlay" :class="{ open: isOpen }" @click.self="isOpen = false">
    <div class="chat-modal-container" :class="{ open: isOpen }">
      <!-- Header -->
      <div class="chat-header">
        <div class="header-content">
          <span class="ai-title">AI Assistant</span>
          <button class="close-btn" @click="isOpen = false">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="chat-body">
        <div v-for="(msg, index) in messages" :key="index" class="message-wrapper" :class="msg.sender">
          <!-- AI Icon -->
          <div v-if="msg.sender === 'ai'" class="avatar ai-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#007bff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#007bff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#007bff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <div class="message-bubble">
            {{ msg.text }}
          </div>

          <!-- User Icon -->
          <div v-if="msg.sender === 'user'" class="avatar user-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="chat-footer">
        <div class="suggestion-chips">
          <button class="chip" @click="sendMessage('여행지 알려줘')">여행지 알려줘</button>
          <button class="chip" @click="sendMessage('맛집 추천해줘')">맛집 추천해줘</button>
        </div>
        <div class="input-area">
          <input 
            type="text" 
            v-model="inputText" 
            placeholder="메시지를 입력하세요..." 
            @keyup.enter="handleSend"
          >
          <button class="send-btn" @click="handleSend">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
    </div>

    <!-- Chat Trigger Button -->
    <button class="chat-fab" @click="isOpen = true" :class="{ hidden: isOpen }">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const isOpen = ref(false);

const inputText = ref('');

// TODO: 채팅기록이 있다면 불러오기
const messages = ref([
  { sender: 'ai', text: '어떤 여행을 도와드릴까요?' }
]);

const handleSend = () => {
  if (!inputText.value.trim()) return;
  sendMessage(inputText.value);
  inputText.value = '';
};

const sendMessage = (text) => {
  messages.value.push({ sender: 'user', text });
  
  // TODO: API 연결.
  setTimeout(() => {
    messages.value.push({ sender: 'ai', text: '잠시만 기다려주세요. 추천 장소를 찾고 있습니다...' });
  }, 1000);
};

// Reset chat when opened? Optional.
</script>

<style scoped>
.chat-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 100;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.chat-modal-overlay.open {
  opacity: 1;
  pointer-events: auto;
}

.chat-modal-container {
  width: 100%;
  max-width: 600px; /* Limit width on desktop */
  height: 60vh;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  margin-bottom: env(safe-area-inset-bottom); /* Respect safe area if needed, or handle in padding */
}

.chat-modal-container.open {
  transform: translateY(0);
}

.chat-header {
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ai-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 80%;
}

.message-wrapper.ai {
  align-self: flex-start;
}

.message-wrapper.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-avatar {
  background: #eef5ff;
}

.user-avatar {
  background: #333;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
}

.ai .message-bubble {
  background: #eef5ff;
  color: #333;
  border-bottom-left-radius: 4px;
}

.user .message-bubble {
  background: #87CEEB; /* Sky blue from image */
  color: white;
  border-bottom-right-radius: 4px;
}

.chat-footer {
  padding: 16px 20px 30px; /* Extra bottom padding */
  background: rgba(255, 255, 255, 0.5);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.suggestion-chips {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.chip {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 12px;
  color: #555;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.chip:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

.input-area {
  display: flex;
  gap: 8px;
}

.input-area input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.input-area input:focus {
  border-color: #87CEEB;
}

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #333;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.send-btn:active {
  transform: scale(0.95);
}

.chat-fab {
  position: absolute;
  bottom: calc(80px + env(safe-area-inset-bottom));
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #87CEEB;
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 90; /* Below modal overlay (100) but above content */
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
}

.chat-fab:active {
  transform: scale(0.95);
}

.chat-fab.hidden {
  opacity: 0;
  pointer-events: none;
}
</style>
