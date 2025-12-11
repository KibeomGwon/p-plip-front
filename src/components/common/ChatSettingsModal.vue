<template>
  <div class="settings-modal-overlay" :class="{ open: isOpen }" @click.self="close">
    <div class="settings-modal" :class="{ open: isOpen }">
      <div class="settings-header">
        <h3>설정</h3>
        <button class="close-btn" @click="close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <div class="settings-body">
        <!-- Search Radius -->
        <div class="setting-item">
          <label class="setting-label">검색 반경 (m)</label>
          <div class="range-wrapper">
            <input 
              type="range" 
              v-model.number="localSettings.m" 
              min="100" 
              max="5000" 
              step="100"
            >
            <span class="range-value">{{ localSettings.m }}m</span>
          </div>
        </div>

        <!-- Content Types -->
        <div class="setting-item">
          <label class="setting-label">검색 유형</label>
          <div class="checkbox-group">
            <label class="checkbox-item" v-for="type in availableTypes" :key="type.value">
              <input 
                type="checkbox" 
                :value="type.value" 
                v-model="localSettings.contentTypes"
              >
              <span class="checkbox-text">{{ type.label }}</span>
            </label>
          </div>
        </div>
      </div>

      <div class="settings-footer">
        <button class="save-btn" @click="save">저장</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  currentSettings: {
    type: Object,
    default: () => ({
      m: 1000,
      contentTypes: ['ATTRACTION']
    })
  }
});

const emits = defineEmits(['close', 'save']);

const localSettings = ref({ ...props.currentSettings });
const availableTypes = [
  { label: '관광지', value: 'ATTRACTION' },
  { label: '문화시설', value: 'CULTURAL_FACILITY' },
  { label: '행사/공연축제', value: 'FESTIVAL' },
  { label: '여행코스', value: 'TRAVEL_COURSE' },
  { label: '레포츠', value: 'LEPORTS' },
  { label: '숙박', value: 'LODGING' },
  { label: '쇼핑', value: 'SHOPPING' },
  { label: '음식점', value: 'RESTAURANT' }
];

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    localSettings.value = JSON.parse(JSON.stringify(props.currentSettings));
  }
});

const close = () => {
  emits('close');
};

const save = () => {
  emits('save', localSettings.value);
  close();
};
</script>

<style scoped>
.settings-modal-overlay {
  position: absolute;
  top: 0; 
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 200; /* Higher than ChatModal overlay if needed, or managed by parent */
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}

.settings-modal-overlay.open {
  opacity: 1;
  pointer-events: auto;
}

.settings-modal {
  width: 90%;
  max-width: 320px;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  transform: scale(0.9);
  transition: transform 0.2s;
}

.settings-modal.open {
  transform: scale(1);
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.settings-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.setting-item {
  margin-bottom: 24px;
}

.setting-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
}

.range-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.range-wrapper input {
  flex: 1;
}

.range-value {
  font-size: 14px;
  font-weight: 600;
  color: #007bff;
  min-width: 50px;
  text-align: right;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.checkbox-text {
  font-size: 14px;
  color: #333;
}

.settings-footer {
  display: flex;
  justify-content: flex-end;
}

.save-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.save-btn:hover {
  background: #0056b3;
}
</style>
