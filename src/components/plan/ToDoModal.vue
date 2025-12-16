<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h3 class="modal-title">{{ isEditMode ? 'ToDo 수정' : 'ToDo 생성' }}</h3>

      <div class="form-group">
        <label>제목</label>
        <input v-model="formData.title" type="text" class="form-input" placeholder="일정을 입력하세요"
          :disabled="readOnlyExceptDesc" :class="{ 'disabled-input': readOnlyExceptDesc }">
      </div>

      <div class="form-group">
        <label>시작 시간</label>
        <input v-model="formData.startAt" type="datetime-local" class="form-input" :disabled="readOnlyExceptDesc"
          :class="{ 'disabled-input': readOnlyExceptDesc }">
      </div>

      <div class="form-group">
        <label>종료 시간</label>
        <input v-model="formData.endAt" type="datetime-local" class="form-input" :disabled="readOnlyExceptDesc"
          :class="{ 'disabled-input': readOnlyExceptDesc }">
      </div>

      <div class="form-group">
        <label>설명</label>
        <textarea v-model="formData.description" class="form-input textarea" placeholder="상세 내용을 입력하세요"></textarea>
      </div>

      <div class="modal-actions">
        <button class="modal-btn cancel" @click="closeModal">취소</button>
        <button class="modal-btn save" @click="handleSave">저장</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true
  },
  initialData: {
    type: Object,
    default: () => ({})
  },
  mode: {
    type: String, // 'create' or 'edit'
    default: 'create'
  },
  readOnlyExceptDesc: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'save']);

const formData = ref({
  title: '',
  startAt: '',
  endAt: '',
  description: ''
});

const isEditMode = computed(() => props.mode === 'edit');

watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    if (props.mode === 'edit' && props.initialData) {
      // Deep copy and format dates
      const data = JSON.parse(JSON.stringify(props.initialData));

      const toLocalISOString = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offset).toISOString().slice(0, 16);
      };

      if (data.startAt) data.startAt = toLocalISOString(data.startAt);
      if (data.endAt) data.endAt = toLocalISOString(data.endAt);

      formData.value = data;
    } else {
      // Reset for create
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      const localNow = new Date(now.getTime() - offset);
      const localNextHour = new Date(now.getTime() - offset + 60 * 60 * 1000);

      formData.value = {
        title: '',
        startAt: localNow.toISOString().slice(0, 16),
        endAt: localNextHour.toISOString().slice(0, 16),
        description: ''
      };
    }
  }
});

const closeModal = () => {
  emit('close');
};

const handleSave = () => {
  // Validate basic inputs
  if (!formData.value.title) {
    alert('제목을 입력해주세요.');
    return;
  }

  emit('save', { ...formData.value });
};
</script>

<style scoped>
/* Modal Styles - Reused */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 340px;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  animation: modal-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modal-pop {
  from {
    transform: scale(0.9);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 20px 0;
  text-align: center;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #666;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 12px;
  font-size: 15px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #0095f6;
  outline: none;
}

.textarea {
  min-height: 80px;
  resize: none;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.modal-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
}

.modal-btn.cancel {
  background: #f5f5f5;
  color: #666;
}

.modal-btn.save {
  background: #0095f6;
  color: white;
}

.disabled-input {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}
</style>
