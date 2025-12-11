<template>
  <div class="chat-wrapper">
    <!-- FAB: Only visible when chat is "closed" (meaning input bar is hidden? No, user said "chat room is gone but input IS there". 
         Actually, usually FAB opens the input bar. 
         But the user said "Like this picture... chat input window is there".
         If I look at the picture (which I can't see but user described), usually maps have a floating bar always or a FAB that opens it.
         User said: "chat-fab 버튼을 눌렀을때 chat Modal화면이 채팅창 느낌이 아니라이런 형식으로... 세팅 버튼을 클릭하면 모달로 띄워지는 형식"
         So:
         1. FAB click -> Opens the "Input Bar" (and hides FAB).
         2. Input Bar has [Settings Btn] [Input] [Send].
         3. Settings Btn click -> Opens Settings Popover above.
    -->

    <!-- Input Bar Container (Replaces the large modal) -->
    <transition name="slide-up">
      <div v-if="isOpen" class="input-bar-container">
        
        <!-- Settings Popover -->
        <transition name="fade-slide">
          <div v-if="isSettingsOpen" class="settings-popover">
            <div class="settings-header">
                <span class="settings-title">검색 설정</span>
                <button class="close-settings" @click="isSettingsOpen = false">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            
            <!-- Settings Content (Range) -->
            <div class="setting-row">
                <div class="setting-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>
                    <span>반경 (m)</span>
                </div>
                <div class="setting-value">{{ settings.m }}m</div>
            </div>
            <div class="setting-control">
                <input 
                    type="range" 
                    v-model.number="settings.m" 
                    min="500" 
                    max="5000" 
                    step="500"
                    class="slider"
                >
                <div class="slider-labels">
                    <span>500m</span>
                    <span>5km</span>
                </div>
            </div>

             <!-- Settings Content (Count K) -->
            <div class="setting-row" style="margin-top: 20px;">
                 <div class="setting-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    <span>추천 개수 (k)</span>
                </div>
                <div class="setting-value">{{ settings.k }}개</div>
            </div>
            <div class="setting-control">
                <input 
                    type="range" 
                    v-model.number="settings.k" 
                    min="1" 
                    max="10" 
                    step="1"
                    class="slider"
                >
                <div class="slider-labels">
                    <span>1개</span>
                    <span>10개</span>
                </div>
            </div>

          </div>
        </transition>

        <!-- Main Bar -->
        <div class="input-bar">
          <!-- Settings Button -->
          <button 
            class="action-btn settings-btn" 
            :class="{ active: isSettingsOpen }"
            @click="isSettingsOpen = !isSettingsOpen"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line>
                <line x1="17" y1="16" x2="23" y2="16"></line>
            </svg>
          </button>

          <!-- Input Field -->
          <input 
            v-model="inputText"
            type="text" 
            class="main-input"
            placeholder="예: 강남역 근처 분위기 좋은 카페"
            @keyup.enter="handleSend"
          />

          <!-- Send Button (Up Arrow) -->
          <button 
            class="action-btn send-btn"
            :disabled="!inputText.trim()"
            @click.stop="handleSend"
          >
            <!-- Gemini Sparkle Icon -->
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="#3b82f6"/>
                <path d="M16 16L17.2 19.6L21 21L17.2 22.4L16 26L14.8 22.4L11 21L14.8 19.6L16 16Z" fill="#3b82f6" transform="scale(0.5) translate(20,20)"/> 
                <!-- Simplified single sparkle for clarity and theme match -->
            </svg>
          </button>
        </div>

        <!-- Close/Collapse Button (Background click to close is standard, but user might want a way to close the bar) -->
        <!-- User didn't specify closing logic. Usually tapping outside closes. -->
      </div>
    </transition>

    <!-- Overlay for closing when clicking outside -->
    <div v-if="isOpen" class="overlay-backdrop" @click="closeBar"></div>

    <!-- FAB Trigger (Visible when CLOSED and NOT Loading) -->
    <button 
        v-if="!isOpen" 
        class="chat-fab" 
        @click="openBar" 
        :class="{ 'loading-mode': isLoading }"
        :disabled="isLoading"
    >
      <div v-if="isLoading" class="loading-spinner"></div>
      <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5C13.5 9 15 10.5 19 12C15 13.5 13.5 15 12 19C10.5 15 9 13.5 5 12C9 10.5 10.5 9 12 5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M19 2C19.5 3.5 20.5 4.5 22 5C20.5 5.5 19.5 6.5 19 8C18.5 6.5 17.5 5.5 16 5C17.5 4.5 18.5 3.5 19 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M5 16C5.5 17.5 6.5 18.5 8 19C6.5 19.5 5.5 20.5 5 22C4.5 20.5 3.5 19.5 2 19C3.5 18.5 4.5 17.5 5 16Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { aiApi } from '@/api/ai';

const props = defineProps({
  lat: { type: Number, default: 0 },
  lng: { type: Number, default: 0 }
});

const emits = defineEmits(['ai-response']);

const isOpen = ref(false);
const isSettingsOpen = ref(false);
const isLoading = ref(false);
const inputText = ref('');

const settings = ref({
  m: 1000,
  k: 5
});

const openBar = () => {
    if (isLoading.value) return; 
    isOpen.value = true;
};

const closeBar = () => {
    isOpen.value = false;
    isSettingsOpen.value = false;
};

const handleSend = async () => {
  if (!inputText.value.trim()) return;
  
  // Close interface and start loading
  isOpen.value = false;
  isSettingsOpen.value = false;
  isLoading.value = true;

  try {
    const payload = {
        query: inputText.value,
        lat: props.lat, 
        lng: props.lng, 
        m: settings.value.m,
        k: settings.value.k
    };

    const res = await aiApi.postAiRequest(payload);
    
    if (res.data && res.data.success) {
        emits('ai-response', res.data.data);
    } else {
        console.error("AI Request Failed", res);
    }

  } catch (error) {
    console.error("AI API Error:", error);
  } finally {
    isLoading.value = false;
    inputText.value = ''; 
  }
};
</script>

<style scoped>
/* Overlay Backdrop to close when clicking outside */
.overlay-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 95; /* Below input bar (100) */
    background: transparent; /* Transparent or slight dim? User wants "input bar" style, usually map is visible. */
}

/* Input Bar Container */
/* Input Bar Container */
.input-bar-container {
    position: absolute; /* Or fixed? MainView is relative, so absolute works if inside MainView */
    bottom: calc(80px + env(safe-area-inset-bottom)); /* Positioned similar to where FAB was */
    left: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 8px; /* Adds the requested gap (approx 3~8px visual) naturally */
}

/* Main Input Bar */
.input-bar {
    width: 100%;
    height: 60px;
    box-sizing: border-box; /* Fix width overflow due to padding */
    background: white;
    border-radius: 30px;
    display: flex;
    align-items: center;
    padding: 6px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    gap: 8px;
    flex-shrink: 0; /* Prevent shrinking */
}

/* Button & Input Styles */
.action-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: transform 0.2s, background 0.2s;
}

.action-btn:active {
    transform: scale(0.95);
}

.settings-btn {
    background: #3b82f6; /* Blue Theme */
}

.settings-btn.active {
    filter: brightness(0.9);
}

.send-btn {
    background: #F0F8FF; /* Light AliceBlue */
}

.main-input {
    flex: 1;
    height: 100%;
    border: none;
    outline: none;
    font-size: 16px;
    color: #333;
    padding: 0 8px;
    background: transparent;
}

/* Settings Popover */
.settings-popover {
    /* Removed absolute positioning */
    position: relative; 
    width: 100%;
    box-sizing: border-box;
    background: white;
    padding: 20px;
    border-radius: 20px;
    box-shadow: 0 -4px 25px rgba(0,0,0,0.1); /* Slight shadow adjustment */
    z-index: 110;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 0px; /* Gap is handled by container */
}

.settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}

.settings-title {
    font-size: 14px;
    font-weight: 700;
    color: #666;
}

.close-settings {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
}

.setting-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.setting-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #333;
}

.setting-value {
    font-size: 14px;
    font-weight: 700;
    color: #3b82f6;
    background: #EFF6FF;
    padding: 4px 8px;
    border-radius: 12px;
}

.setting-control {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.slider {
    width: 100%;
    height: 4px;
    background: #e0e0e0;
    border-radius: 2px;
    appearance: none;
    outline: none;
}

.slider::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    background: #3b82f6;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: #999;
}

/* FAB */
.chat-fab {
  position: absolute;
  bottom: calc(80px + env(safe-area-inset-bottom));
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #3b82f6;
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 90;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
}

.chat-fab:active {
  transform: scale(0.95);
}

.chat-fab.loading-mode {
    background: white;
    cursor: wait;
}

.loading-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid rgba(59, 130, 246, 0.3);
    border-radius: 50%;
    border-top-color: #3b82f6;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
</style>
