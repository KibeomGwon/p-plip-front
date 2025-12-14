<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="handleClose">
      <div class="modal-content">
        <header class="modal-header">
          <h3>리뷰 수정</h3>
          <button class="close-btn" @click="handleClose">×</button>
        </header>

        <div class="modal-body">
          <!-- Image Upload Section -->
          <div class="image-upload-section">
            <div class="image-preview-list" @wheel.prevent="onWheel">
              <div 
                v-for="(img, index) in croppedImages" 
                :key="index" 
                class="preview-item"
              >
                <img :src="img.url || getImageUrl(img.name)" alt="Preview" class="preview-img" />
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

          <!-- Content Input -->
          <div class="input-group">
            <textarea 
              v-model="content" 
              placeholder="내용을 입력하세요" 
              class="content-input"
            ></textarea>
          </div>
        </div>

        <footer class="modal-footer">
          <button class="cancel-btn" @click="handleClose">취소</button>
          <button class="save-btn" @click="handleSave" :disabled="!isValid">수정</button>
        </footer>
      </div>
    </div>

    <!-- Cropper Modal (Nested) -->
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
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits, onMounted, onUnmounted } from 'vue';
import ImageCropper from '@/components/common/ImageCropper.vue';
import { fileApi } from '@/api/file';
import { useImage } from '@/composables/useImage';

const props = defineProps({
  review: {
    type: Object,
    required: true
  },
  show: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'submit']);

const { getImageUrl } = useImage();

const content = ref('');
const initialContent = ref('');
const croppedImages = ref([]);
const removedImgs = ref([]);
const showCropper = ref(false);
const selectedFile = ref(null);
const addedImgs = ref([]);
const isSaved = ref(false);

const isModified = computed(() => {
  return content.value !== initialContent.value || 
         addedImgs.value.length > 0 || 
         removedImgs.value.length > 0;
});

const cleanupFiles = async () => {
  if (addedImgs.value.length > 0) {
    try {
      await Promise.all(addedImgs.value.map(img => fileApi.deleteFile(img.id, "REVIEW")));
    } catch (err) {
      console.error("Cleanup failed", err);
    }
  }
};

const handleClose = async () => {
  if (isModified.value) {
    if (confirm("수정된 내용이 있습니다. 정말 나가시겠습니까?")) {
      await cleanupFiles();
      emit('close');
    }
  } else {
    emit('close');
  }
};

const preventClose = (e) => {
  if (isModified.value) {
    e.preventDefault();
    e.returnValue = '';
  }
};

onMounted(() => {
  window.addEventListener('beforeunload', preventClose);
});

onUnmounted(() => {
  window.removeEventListener('beforeunload', preventClose);
  if (!isSaved.value) {
    cleanupFiles();
  }
});

// Initialize data when modal opens or review changes
watch(() => props.show, (newVal) => {
  if (newVal && props.review) {
    content.value = props.review.text;
    initialContent.value = props.review.text;
    croppedImages.value = [];
    removedImgs.value = [];
    addedImgs.value = [];
    isSaved.value = false;
    
    if (props.review.photos) {
      props.review.photos.forEach(img => {
        croppedImages.value.push({
          id: img.id,
          url: '', 
          name: img.name,
          status: 'EXISTING'
        });
      });
    }
  }
}, { immediate: true });

const isValid = computed(() => {
  return content.value.trim().length > 0;
});

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
    const fileBaseUrl = import.meta.env.VITE_FILE_BASE_URL || '';
    const fullUrl = `${fileBaseUrl}/${res.name}`;
    const newImg = {
      id: res.id,
      url: fullUrl,
      name: res.name,
      status: 'NEW'
    };
    croppedImages.value.push(newImg);
    addedImgs.value.push(newImg);
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

const removeImage = (index) => {
  const img = croppedImages.value[index];
  
  if (img.status === 'EXISTING') {
    removedImgs.value.push({ id: img.id, status: 'REMOVE' });
  } else if (img.status === 'NEW') {
     // If removing a new image from the list, we should consider it 'removed' from the session context?
     // Actually, if we remove it from the list, it's basically orphaned if we don't clean it up.
     // But cleanupFiles handles addedImgs.
     // Ideally we should delete it nicely now or let cleanupFiles handle it?
     // For simplicity, we keep it in addedImgs (so it gets deleted on Cancel), 
     // BUT if we Submit, we only send 'files'.
     // Wait, if I upload NEW, then remove it from list. It is still in addedImgs.
     // If I then Save, addedImgs are NOT deleted. They become orphans on server.
     // Fix: If removing NEW image, delete immediately?
     // Or remove from addedImgs?
     // Let's delete immediately for NEW images to keep it clean.
     if (img.id) fileApi.deleteFile(img.id, "REVIEW").catch(e => console.error(e));
     
     // Remove from addedImgs list too to prevent double delete on close
     const addedIndex = addedImgs.value.findIndex(a => a.id === img.id);
     if (addedIndex > -1) addedImgs.value.splice(addedIndex, 1);
  }

  croppedImages.value.splice(index, 1);
};

const onWheel = (e) => {
  if (e.deltaY) {
    e.currentTarget.scrollLeft += e.deltaY;
  }
};

const handleSave = () => {
    isSaved.value = true;
    // Logic from NoticeBoardModifyView.vue
    // imageIds: croppedImages.value.concat(removedImgs.value).map(img => img.id)
    const allImages = [...croppedImages.value, ...removedImgs.value];

    emit('submit', {
        id: props.review.id,
        content: content.value,
        files: allImages, 
    });
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 500px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.modal-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 16px;
  overflow-y: auto;
}

.modal-footer {
  padding: 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.cancel-btn, .save-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.cancel-btn {
  background: #f0f0f0;
  color: #333;
}

.save-btn {
  background: #0095f6;
  color: white;
}

.save-btn:disabled {
  background: #b2dffc;
  cursor: not-allowed;
}

/* Image List Styles (Reused) */
.image-preview-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 16px;
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

.content-input {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  font-size: 15px;
  outline: none;
  min-height: 120px;
  resize: vertical;
}

/* Cropper Modal */
.cropper-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cropper-wrapper {
  max-width: 90%;
  max-height: 90%;
}
</style>
