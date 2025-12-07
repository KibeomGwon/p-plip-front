<template>
  <AppPage class="todo-list-page">
    <!-- UI Overlay (Sticky) -->
    <div class="ui-overlay">
      <button class="fab-btn" @click="openCreateModal">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M5 12H19" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <transition name="slide-up">
        <button v-if="isDirty" class="save-btn" @click="saveAllChanges">
          변경사항 저장하기
        </button>
      </transition>
    </div>

    <!-- Header -->
    <AppHeader :title="planTitle">
      <template #right>
        <div class="header-right"></div>
      </template>
    </AppHeader>

    <!-- Timeline Content -->
    <div class="timeline-content" ref="scrollContainer">
      <div class="timeline-line"></div>
      
      <draggable 
        v-model="todoList" 
        item-key="id"
        handle=".drag-handle"
        @end="onDragEnd"
        class="todo-draggable-list"
        :animation="200"
      >
        <template #item="{ element, index }">
          <div 
            class="todo-item" 
            :class="[getCardStatusClass(element), { 'is-active': isCurrentItem(element) }]"
            :id="'todo-' + element.id"
            @click="openEditModal(element)"
          >
            <!-- Timeline Point -->
            <div class="timeline-point-wrapper">
              <div class="timeline-point"></div>
            </div>

            <div class="todo-card-wrapper drag-handle">
               <!-- Card Content -->
              <div class="todo-card">
                <div class="todo-img" v-if="element.image">
                  <img :src="element.image" :alt="element.title">
                </div>
                <div class="todo-info">
                  <h3 class="todo-title">{{ element.title }}</h3>
                  <div class="todo-time">
                    {{ formatDate(element.startAt) }} {{ formatTime(element.startAt) }} - {{ formatTime(element.endAt) }}
                  </div>
                  <p class="todo-desc">{{ element.description }}</p>
                </div>
                
                <!-- Delete Button -->
                <button class="delete-btn" @click.stop="deleteTodo(element.id, index)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
              
              <!-- Action Button (e.g. Navigation) -->
              <button v-if="isCurrentItem(element)" class="action-btn">
                길찾기
              </button>
            </div>
            
          </div>
        </template>
      </draggable>
    </div>

    <!-- ToDo Modal -->
    <ToDoModal 
      :isVisible="isModalOpen"
      :initialData="selectedTodo"
      :mode="modalMode"
      @close="closeModal"
      @save="onSaveTodo"
    />
</AppPage>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import draggable from 'vuedraggable';
import ToDoModal from '@/components/my/ToDoModal.vue';
import AppHeader from '@/components/common/AppHeader.vue';
import AppPage from '@/components/common/AppPage.vue';

const route = useRoute();
const planTitle = ref('제주도 힐링 여행'); // Mock title
const scrollContainer = ref(null);
const isModalOpen = ref(false);
const modalMode = ref('create'); // 'create' | 'edit'
const selectedTodo = ref({});
let editingIndex = -1;
const originalTodoList = ref([]); // Store initial state from server

// Mock Data
const baseDate = '2025-12-07';

const todoList = ref([
  {
    id: 1,
    title: '용두암 해안도로 드라이브',
    startAt: `${baseDate}T14:00:00`,
    endAt: `${baseDate}T15:30:00`,
    description: '시원한 바닷바람 맞으며 해안 절경 감상하기',
    image: 'https://images.unsplash.com/photo-1544521782-b1e105e4cbde?w=200&h=200&fit=crop',
    durationMinutes: 90
  },
  {
    id: 2,
    title: '오설록 티 뮤지엄',
    startAt: `${baseDate}T16:00:00`,
    endAt: `${baseDate}T17:00:00`,
    description: '녹차밭에서 인생샷 찍고, 맛있는 녹차 아이스크림 먹기',
    image: 'https://images.unsplash.com/photo-1549421577-74266f875323?w=200&h=200&fit=crop',
    durationMinutes: 60
  },
  {
    id: 3,
    title: '흑돼지 저녁 식사',
    startAt: `${baseDate}T18:30:00`,
    endAt: `${baseDate}T20:00:00`,
    description: '현지인 추천 맛집에서 쫄깃한 흑돼지 즐기기',
    image: 'https://images.unsplash.com/photo-1606850246029-dd00bd5d0e29?w=200&h=200&fit=crop',
    durationMinutes: 90
  },
  {
    id: 4,
    title: '숙소 체크인',
    startAt: `${baseDate}T20:30:00`,
    endAt: `${baseDate}T21:00:00`,
    description: '',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=200&fit=crop',
    durationMinutes: 30
  }
]);

// Helper: Format Date
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}.${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')}`;
};

// Helper: Format Time
const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
};

// Logic: Determine Status
const now = new Date('2025-12-07T17:36:01'); // Fixed for demo based on prompt time

const isCurrentItem = (item) => {
  const start = new Date(item.startAt);
  const end = new Date(item.endAt);
  return now >= start && now < end;
};

const getCardStatusClass = (item) => {
  const start = new Date(item.startAt);
  const end = new Date(item.endAt);
  
  if (now >= start && now < end) {
    return 'status-current';
  } else if (now < start) {
    return 'status-future';
  } else {
    return 'status-past';
  }
};

// Logic: Time Recalculation after Drag
const onDragEnd = () => {
  if (todoList.value.length === 0) return;

  const originalStartTimes = todoList.value.map(t => new Date(t.startAt).getTime()).sort();
  const anchorTime = originalStartTimes[0];
  
  let currentTime = anchorTime;
  
  todoList.value.forEach((item, index) => {
    const start = new Date(currentTime);
    const end = new Date(start.getTime() + item.durationMinutes * 60000);
    
    item.startAt = start.toISOString(); 
    item.endAt = end.toISOString();
    
    currentTime = end.getTime() + 30 * 60000; 
  });
};

const deleteTodo = (id, index) => {
  if (confirm('정말 삭제하시겠습니까?')) {
    todoList.value.splice(index, 1);
  }
};

const openCreateModal = () => {
  modalMode.value = 'create';
  selectedTodo.value = {}; 
  isModalOpen.value = true;
};

const openEditModal = (todo) => {
  modalMode.value = 'edit';
  selectedTodo.value = todo;
  editingIndex = todoList.value.findIndex(t => t.id === todo.id);
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedTodo.value = {};
  editingIndex = -1;
};

const onSaveTodo = (formData) => {
  const start = new Date(formData.startAt);
  const end = new Date(formData.endAt);
  const diffMs = end - start;
  const durationMinutes = Math.floor(diffMs / 60000); 

  const newData = {
    ...formData,
    startAt: formData.startAt,
    endAt: formData.endAt,
    durationMinutes
  };

  if (modalMode.value === 'edit' && editingIndex > -1) {
    todoList.value[editingIndex] = {
      ...todoList.value[editingIndex],
      ...newData
    };
  } else {
    const newId = Math.max(...todoList.value.map(t => t.id), 0) + 1;
    todoList.value.push({
      id: newId,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=200&fit=crop', // Default image
      ...newData
    });
  }
  
  // Recalculate times after add? Maybe not mandatory immediately, but good for consistency.
  // Let's call onDragEnd() to normalize times if needed. 
  // But adding at the end might not need it if we trust the input times.
  // Let's leave it as explicit times for now until dragged.
  
  closeModal();
};

// Dirty Check
const isDirty = computed(() => {
  return JSON.stringify(todoList.value) !== JSON.stringify(originalTodoList.value);
});

const saveAllChanges = async () => {
  if (confirm('모든 변경사항을 저장하시겠습니까?')) {
    try {
      console.log('Sending to server:', todoList.value);
      originalTodoList.value = JSON.parse(JSON.stringify(todoList.value));
      alert('저장되었습니다.');
    } catch (e) {
      alert('저장에 실패했습니다.');
    }
  }
};

// Auto Scroll to Current
onMounted(async () => {
  originalTodoList.value = JSON.parse(JSON.stringify(todoList.value));
  await nextTick();
  scrollToCurrent();
});

const scrollToCurrent = () => {
  const current = todoList.value.find(item => isCurrentItem(item));
  const future = todoList.value.find(item => new Date(item.startAt) > now);
  const targetId = current ? `todo-${current.id}` : (future ? `todo-${future.id}` : null);
  
  if (targetId) {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
};
</script>

<style scoped>
/* Scoped overrides if needed */
.todo-list-page {
  /* Inherits min-height 100vh from AppPage */
}

/* Header styles removed, using AppHeader */

.icon-btn {
  /* Helper mostly replaced, but kept if used elsewhere? 
     AppHeader handles the back button. 
  */
}

.timeline-content {
  flex: 1;
  padding: 20px;
  position: relative;
  padding-left: 20px;
}

.timeline-line {
  position: absolute;
  left: 36px;
  top: 40px;
  bottom: 40px;
  width: 2px;
  background: linear-gradient(to bottom, 
    #e0e0e0 0%, 
    #0095f6 20%, 
    #0095f6 40%, 
    #e0e0e0 100%
  );
  z-index: 0;
}

.todo-draggable-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 80px;
}

.todo-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  z-index: 1;
}

.timeline-point-wrapper {
  width: 32px;
  display: flex;
  justify-content: center;
  margin-right: 12px;
  padding-top: 24px;
}

.timeline-point {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  border: 3px solid #ddd;
  transition: all 0.3s;
}

.todo-card-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.todo-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  display: flex;
  gap: 16px;
  cursor: grab;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.todo-card:active {
  cursor: grabbing;
}

.todo-img {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.todo-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.todo-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.todo-title {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  margin: 0 0 4px 0;
}

.todo-time {
  font-size: 13px;
  color: #888;
  margin-bottom: 6px;
  font-variant-numeric: tabular-nums;
}

.todo-desc {
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Status Styles */
.status-current .timeline-point {
  border-color: #0095f6;
  background: #0095f6;
  box-shadow: 0 0 0 4px rgba(0, 149, 246, 0.2);
}

.status-current .todo-card {
  border-color: #0095f6;
  box-shadow: 0 8px 20px rgba(0, 149, 246, 0.15);
}

.status-current .todo-title {
  color: #0095f6;
}

.status-future .timeline-point {
  border-color: #8ccbf9;
  background: white;
}

.status-future .todo-card {
  background: white;
  border-color: #b3e0ff;
  box-shadow: 0 4px 12px rgba(135, 206, 250, 0.25);
}

.status-past .todo-card {
  background: #f5f5f5;
  opacity: 0.8;
}

.status-past .todo-title {
  color: #999;
}

.status-past .timeline-point {
  border-color: #bbb;
  background: #ddd;
}

/* Action Button */
.action-btn {
  background: #0095f6;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-start;
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 149, 246, 0.3);
}

/* Delete Button */
.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  z-index: 10;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.delete-btn:hover {
  opacity: 1;
}

.delete-btn svg path {
  stroke: #aaa;
}

/* UI Overlay */
.ui-overlay {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: 100vh;
  pointer-events: none;
  z-index: 100;
  margin-bottom: -100vh;
}

.fab-btn {
  position: absolute;
  bottom: calc(88px + env(safe-area-inset-bottom));
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #0095f6;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 149, 246, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 200;
  transition: transform 0.2s;
  pointer-events: auto;
}

.fab-btn:active {
  transform: scale(0.95);
}

.save-btn {
  position: absolute;
  bottom: calc(24px + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  
  pointer-events: auto;
  background: #0095f6;
  color: white;
  border: none;
  font-size: 16px;
  font-weight: 700;
  padding: 14px 40px;
  border-radius: 30px;
  width: calc(100% - 48px);
  max-width: 320px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 149, 246, 0.3);
  transition: transform 0.2s;
}

.save-btn:active {
  transform: translateX(-50%) scale(0.98);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translate(-50%, 100%);
  opacity: 0;
}
</style>
