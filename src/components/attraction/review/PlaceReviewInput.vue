<template>
  <div class="input-container">
    <!-- Image Previews -->
    <div v-if="files.length > 0" class="preview-area">
      <div v-for="(file, index) in files" :key="index" class="preview-item">
        <img :src="file.url" alt="Preview" />
        <button class="remove-btn" @click="removeFile(index)">
          <span class="material-icons">x</span>
        </button>
      </div>
    </div>

    <!-- Input Bar -->
    <footer class="input-bar">
      <button class="add-btn" @click="triggerFileInput">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <input 
        type="file" 
        ref="fileInput" 
        accept="image/*" 
        class="hidden-input"
        @change="onFileSelect"
      />
      
      <input 
        type="text" 
        class="text-input" 
        placeholder="리뷰를 남겨주세요..." 
        v-model="text"
        @keyup.enter="handleSubmit"
        @focus="handleInputFocus"
      />
      
      <button class="submit-btn" @click="handleSubmit" :disabled="!isValid">
        작성
      </button>
    </footer>

    <!-- Cropper Modal -->
    <Teleport to="body">
      <div v-if="showCropper" class="cropper-modal">
        <div class="cropper-wrapper">
          <ImageCropper 
            :imageFile="selectedFile" 
            @crop="onCrop" 
            @cancel="cancelCrop" 
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import ImageCropper from '@/components/common/ImageCropper.vue';
import { fileApi } from '@/axios/file';

const emit = defineEmits(['submit']);
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const text = ref('');
const fileInput = ref(null);
const files = ref([]);

const showCropper = ref(false);
const selectedFile = ref(null);

const isValid = computed(() => {
  return text.value.trim().length > 0 || files.value.length > 0;
});

const cleanupFiles = () => {
  if (files.value.length > 0) {
    files.value.forEach(file => {
      if (file.id) {
        // Best effort delete
        fileApi.deleteFile(file.id, "REVIEW").catch(err => console.error(err));
      }
    });
    // Clear to prevent double delete
    files.value = [];
  }
};

// Handle page refresh/close
window.addEventListener('beforeunload', cleanupFiles);

onUnmounted(() => {
  window.removeEventListener('beforeunload', cleanupFiles);
  cleanupFiles();
});


const checkAuth = () => {
  if (!authStore.isLoggedIn) {
    if (confirm('로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?')) {
      router.push({ 
        name: 'login', 
        query: { redirect: route.fullPath } 
      });
    }
    return false;
  }
  return true;
};

const triggerFileInput = () => {
  if (!checkAuth()) return;
  fileInput.value.click();
};

const handleInputFocus = (e) => {
  if (!checkAuth()) {
    e.target.blur();
  }
};


const onFileSelect = (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile.value = file;
    showCropper.value = true;
  }
  e.target.value = '';
};

const onCrop = async (blob) => {
  try {
    const formData = new FormData();
    const fileName = selectedFile.value?.name || 'image.png';
    formData.append('file', blob, fileName);

    const res = await fileApi.uploadFile(formData, "REVIEW");
    const fileBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL || '';
    const fullUrl = `${fileBaseUrl}${res.path}`;
    
    files.value.push({
      id: res.id,
      url: fullUrl,
      name: res.name,
      path: res.path
    });
  } catch (err) {
    console.error(err);
    alert('이미지 업로드 실패');
  }

  showCropper.value = false;
  selectedFile.value = null;
};

const cancelCrop = () => {
  showCropper.value = false;
  selectedFile.value = null;
};

const removeFile = async (index) => {
  const file = files.value[index];
  if (file.id) {
    try {
      await fileApi.deleteFile(file.id, "REVIEW");
    } catch (err) {
      console.error(err);
    }
  }
  files.value.splice(index, 1);
};


const handleSubmit = () => {
  if (!isValid.value) return;
  
  emit('submit', {
    text: text.value,
    images: files.value.map(f => f.id)
  });
  
  // Reset
  text.value = '';
  files.value = [];
};
</script>

<style scoped>
.input-container {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  background: white;
  z-index: 50;
  border-top: 1px solid #eee;
  padding-bottom: env(safe-area-inset-bottom);
}

.preview-area {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  background-color: #f8f9fa; /* Slight subtle background for differentiation */
  border-bottom: 1px solid #eee; /* Separator */
}
.preview-item {
  position: relative;
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eee;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.remove-btn .material-icons {
  font-size: 16px;
  color: white;
}

.input-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}

.hidden-input {
  display: none;
}

.add-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%; /* Make it circular */
  background: #f0f0f0; 
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
}

.add-btn:active {
  background: #e0e0e0;
  transform: scale(0.95);
}

.text-input {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 10px 16px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  background: #f9f9f9;
}

.text-input:focus {
  border-color: #0095f6;
  background: white;
}

.submit-btn {
  background: #0095f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 18px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
  flex-shrink: 0;
  white-space: nowrap;
}

.submit-btn:disabled {
  background: #b2dffc;
  cursor: not-allowed;
}

.cropper-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cropper-wrapper {
  max-width: 90%;
  max-height: 90%;
}
</style>
