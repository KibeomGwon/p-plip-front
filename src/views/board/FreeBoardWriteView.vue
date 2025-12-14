<template>
  <div class="write-container">
    <!-- Header -->
    <div class="write-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 19L8 12L15 5" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h2 class="header-title">글 쓰기</h2>
      <button class="submit-btn" @click="submitPost" :disabled="!isValid">완료</button>
    </div>

    <div class="content-scroll">
      <!-- Image Upload Section -->
      <div class="image-upload-section">
        <div class="image-preview-list">
          <div 
            v-for="(img, index) in croppedImages" 
            :key="index" 
            class="preview-item"
            :class="{ 'dragging': draggedIndex === index }"
            draggable="true"
            @dragstart="onDragStart(index)"
            @dragover.prevent
            @dragenter.prevent="onDragEnter(index)"
            @drop="onDrop(index)"
          >
            <img :src="img.url" alt="Preview" class="preview-img" />
            <button class="remove-btn" @click="removeImage(index)">×</button>
          </div>
          
          <label class="upload-btn" v-if="croppedImages.length < 5">
            <input type="file" accept="image/*" @change="onFileSelect" hidden />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>사진 추가</span>
          </label>
        </div>
      </div>

      <!-- Title Input -->
      <div class="input-group">
        <input 
          v-model="title" 
          type="text" 
          placeholder="제목을 입력하세요" 
          class="title-input"
        />
      </div>

      <!-- Content Input -->
      <div class="input-group">
        <textarea 
          v-model="content" 
          placeholder="내용을 입력하세요" 
          class="content-input"
        ></textarea>
      </div>
    </div>

    <!-- Cropper Modal -->
    <div v-if="showCropper" class="cropper-modal">
      <div class="cropper-wrapper">
        <ImageCropper 
          :imageFile="selectedFile" 
          @crop="onCrop" 
          @cancel="cancelCrop" 
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router';
import ImageCropper from '@/components/common/ImageCropper.vue';
import { boardApi } from '@/api/board';
import { fileApi } from '@/api/file';

import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const router = useRouter();
const route = useRoute();

const title = ref('');
const content = ref('');
const croppedImages = ref([]); // Array of { blob, url }
const draggedIndex = ref(null);
const isEditMode = ref(false);
const editId = ref(null);
const isSaved = ref(false);

const onDragStart = (index) => {
  draggedIndex.value = index;
};

const onDragEnter = (index) => {
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    // Swap logic for smoother feel (optional, but good for reordering)
    const item = croppedImages.value.splice(draggedIndex.value, 1)[0];
    croppedImages.value.splice(index, 0, item);
    draggedIndex.value = index;
  }
};

const onDrop = (index) => {
  draggedIndex.value = null;
};

const showCropper = ref(false);
const selectedFile = ref(null);

const isValid = computed(() => {
  return title.value.trim() && content.value.trim();
});

const onFileSelect = (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile.value = file;
    showCropper.value = true;
  }
  // Reset input
  e.target.value = '';
};

const onCrop = async (blob) => {
  try {
    const formData = new FormData();
    console.log(blob);
    const fileName = selectedFile.value?.name || 'image.png';
    formData.append('file', blob, fileName);

    const res = await fileApi.uploadFile(formData, IMAGE_TYPE.FREE_BOARD).then(res => {
      console.log(res);
      const fileData = res;
      const fileBaseUrl = import.meta.env.VITE_FILE_BASE_URL || '';
      // Ensure slash between base and path if needed. Assuming base doesn't end with slash or path doesn't start.
      // safely join:
      const fullUrl = `${fileBaseUrl}/${fileData.name}`;
      
      croppedImages.value.push({
        id: fileData.id,
        url: fullUrl,
        name: fileData.name,
      });
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
  }

  showCropper.value = false;
  selectedFile.value = null;
};

const cancelCrop = () => {
  showCropper.value = false;
  selectedFile.value = null;
};

const removeImage = async (index) => {
  const image = croppedImages.value[index];
  if (image.id) {
    try {
      await fileApi.deleteFile(image.id, "FREE_BOARD");
    } catch (err) {
      console.error(err);
      // alert('이미지 삭제 실패'); // Optional: show alert or just remove locally
    }
  }
  croppedImages.value.splice(index, 1);
};

const submitPost = async () => {
  const postData = {
    title: title.value,
    content: content.value,
    ids: croppedImages.value.map(img => img.id),
  };

  try {
    let res;
    if (isEditMode.value) {
        // user didn't specify edit logic update, but assuming similar structure or keep store for edit?
        // User request was specific about "postFreeBoard". 
        // For modify view (separate file now), logic might be different. 
        // This is FreeBoardWriteView.vue. 
        // But wait, the previous context had isEditMode. 
        // I should probably focus on the CREATE part since the user mentioned "글쓰기가 완료되면".
        // But I should handle if this view is still used for edit?
        // Actually, user created `FreeBoardModifyView` separately. 
        // So `FreeBoardWriteView` might only be for create now? 
        // But `isEditMode` logic is still in the file I read.
        // I will implement standard create logic here.
        
        res = await boardApi.postFreeBoard(postData);
    } else {
        res = await boardApi.postFreeBoard(postData);
    }

      const newPostId = res.id;
      // Navigate to detail, replace to avoid going back to write form
      isSaved.value = true;
      router.replace({ name: 'freeboard-detail', params: { id: newPostId } });
  } catch (err) {
    console.error(err);
    alert('게시글 작성에 실패했습니다.');
  }
};

onBeforeRouteLeave((to, from, next) => {
  if (!isSaved.value) {
    // Only warn if there is some content
    if ((title.value || content.value || croppedImages.value.length > 0)) {
        const answer = window.confirm('정보가 삭제됩니다. 정말 나가시겠습니까?');
        if (croppedImages.value) {
            croppedImages.value.forEach(img => {
                removeImage(img.id);
            });
        }
        
        if (answer) {
            next();
        } else {
            next(false);
        }
    } else {
        next();
    }
  } else {
    next();
  }
});

const preventClose = (e) => {
  e.preventDefault();
  if (!isSaved.value && croppedImages.value) {
    croppedImages.value.forEach(img => {
      removeImage(img.id);
    });
  }
  // Cleanup logic if needed
};

onUnmounted(() => {
  window.removeEventListener('beforeunload', preventClose);
});
</script>

<style scoped>
.write-container {
  background: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  touch-action: none; /* Prevent whole page drag */
}

.write-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.back-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
}

.header-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

.submit-btn {
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: #0095f6;
  cursor: pointer;
}

.submit-btn:disabled {
  color: #999;
  cursor: default;
}

.content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  touch-action: pan-y; /* Allow vertical scrolling */
  overscroll-behavior: contain;
}

.image-upload-section {
  margin-bottom: 24px;
}

.image-preview-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  padding-top: 8px;
  touch-action: pan-x pan-y; /* Allow horizontal scroll and vertical page scroll */
}

.preview-item {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.remove-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  background: rgba(0,0,0,0.5);
  color: white;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
}

.upload-btn {
  width: 80px;
  height: 80px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.upload-btn span {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.input-group {
  margin-bottom: 16px;
}

.title-input {
  width: 100%;
  border: none;
  border-bottom: 1px solid #eee;
  padding: 12px 0;
  font-size: 18px;
  font-weight: 600;
  outline: none;
}

.content-input {
  width: 100%;
  border: none;
  padding: 12px 0;
  font-size: 16px;
  outline: none;
  min-height: 200px;
  resize: none;
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
