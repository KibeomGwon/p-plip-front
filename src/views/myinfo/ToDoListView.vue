<template>
  <AppPage class="todo-list-page">
    <!-- UI Overlay (Sticky) -->
    <div class="ui-overlay">
      <button class="fab-btn" @click="openCreateModal">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M5 12H19" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
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
        <div class="header-right">
          <button class="delete-plan-btn" @click="handleDeletePlan">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20"
                stroke="#FF3B30" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </template>
    </AppHeader>

    <!-- Date Tabs -->
    <div class="date-tabs-container">
      <div class="date-tabs">
        <button v-for="(date, index) in uniqueDates" :key="date" class="tab-btn"
          :class="{ active: selectedDate === date }" @click="selectedDate = date">
          <div class="day-label">Day {{ index + 1 }}</div>
          <div class="date-label">{{ formatDateShort(date) }}</div>
        </button>
      </div>
    </div>

    <!-- Timeline Content -->
    <div class="timeline-content" ref="scrollContainer">
      <div v-if="filteredTodoList.length > 0" class="timeline-line"></div>

      <draggable v-model="filteredTodoList" item-key="id" handle=".drag-handle" @end="onDragEnd"
        class="todo-draggable-list" :animation="200">
        <template #item="{ element, index }">
          <div class="todo-item" :class="[getCardStatusClass(element), { 'is-active': isCurrentItem(element) }]"
            :id="'todo-' + element.id" @click="openEditModal(element)">
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
                  <p class="todo-desc" v-if="element.description">{{ element.description }}</p>
                  <div class="todo-time">
                    {{ formatDate(element.startAt) }} {{ formatTime(element.startAt) }} - {{ formatTime(element.endAt)
                    }}
                  </div>
                </div>

                <!-- Delete Button -->
                <button class="delete-btn" @click.stop="deleteTodo(element.id, index)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="#ccc" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </button>
              </div>

              <!-- Action Button (e.g. Navigation) -->
              <button v-if="isCurrentItem(element)" class="action-btn" @click.stop>
                현재 진행중
              </button>
            </div>

          </div>
        </template>
      </draggable>
    </div>

    <!-- ToDo Modal -->
    <ToDoModal :isVisible="isModalOpen" :initialData="selectedTodo" :mode="modalMode"
      :readOnlyExceptDesc="isReadOnlyExceptDesc" @close="closeModal" @save="onSaveTodo" />

    <!-- Plan Map Modal -->
    <PlanMapModal :isVisible="isMapModalOpen" :todoList="todoList" @close="closeMapModal" />

    <!-- Map View Button (Fixed Bottom) -->
    <div class="map-btn-container" :class="{ 'with-save-btn': isDirty }">
       <button class="map-view-btn" @click="openMapModal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="map-icon">
            <path d="M1 6V22L8 18L16 22L23 18V2L16 6L8 2L1 6Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 2V18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 6V22" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          지도로 보기
       </button>
    </div>

  </AppPage>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import draggable from 'vuedraggable';
import ToDoModal from '@/components/plan/ToDoModal.vue';
import PlanMapModal from '@/components/plan/PlanMapModal.vue';
import AppHeader from '@/components/common/AppHeader.vue';
import AppPage from '@/components/common/AppPage.vue';
import { usePlanStore } from '@/stores/plan';

const router = useRouter();
const route = useRoute();
const planStore = usePlanStore();

const handleDeletePlan = async () => {
  if (confirm('정말로 이 여행 계획을 삭제하시겠습니까? 삭제된 계획은 복구할 수 없습니다.')) {
    const success = await planStore.deletePlan(route.params.id);
    if (success) {
      router.push({ name: 'plan' });
    }
  }
};
const planTitle = ref('여행 계획 상세'); // Future: Fetch plan title from store/api if available
const scrollContainer = ref(null);
const isModalOpen = ref(false);
const isMapModalOpen = ref(false);
const modalMode = ref('create'); // 'create' | 'edit'
const selectedTodo = ref({});
const isReadOnlyExceptDesc = ref(false);

const openMapModal = () => {
  isMapModalOpen.value = true;
};

const closeMapModal = () => {
  isMapModalOpen.value = false;
};

let editingIndex = -1;
const originalTodoList = ref([]); // Store initial state from server
const todoList = ref([]); // Local working copy
const selectedDate = ref(null); // Currently selected date string (YYYY-MM-DD)

// Date Tab Logic
const uniqueDates = computed(() => {
  const dates = new Set(todoList.value.map(item => item.startAt.split('T')[0]));
  return Array.from(dates).sort();
});

// Initialize selectedDate when data loads
const initSelectedDate = () => {
  if (!selectedDate.value && uniqueDates.value.length > 0) {
    selectedDate.value = uniqueDates.value[0];
  }
};

const filteredTodoList = computed({
  get: () => {
    if (!selectedDate.value) return [];
    return todoList.value.filter(item => item.startAt.startsWith(selectedDate.value));
  },
  set: (newVal) => {
    // When drag reorders the filtered list, we need to reflect that in the main list.
    // Strategy: Remove all items of selectedDate from main list, then insert newVal items at the correct position (or just append if simple).
    // Better Strategy: Map the rewver order back to the main list.

    // 1. Get items NOT in current date
    const otherItems = todoList.value.filter(item => !item.startAt.startsWith(selectedDate.value));

    // 2. Combine others + new sorted filtered items
    // Note: This puts current date items at the end or we need to respect original relative order logic?
    // Since we sort by time anyway, we can just concat and let sort happen/time recalc happen?
    // But drag-drop implies user wants specific order *overriding* time potentially?
    // For now, let's just update the list. Time recalc is handled in onDragEnd.

    todoList.value = [...otherItems, ...newVal];

    // We probably want to keep them somewhat correctly ordered by date globally if we had multiple dates?
    // But since we sort by time in sortListByTime, purely merging is fine as long as onDragEnd fixes times.
  }
});

const formatDateShort = (dateStr) => {
  const date = new Date(dateStr);
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  return `${String(date.getMonth() + 1)}.${String(date.getDate())}(${weekdays[date.getDay()]})`;
};

// Mock Data Removed

// Helper: Format Date
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
};

// Helper: Format Time
const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// Logic: Determine Status
const now = new Date();

const isCurrentItem = (item) => {
  if (!item.startAt || !item.endAt) return false;
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
// Logic: Time Recalculation after Drag
const onDragEnd = () => {
  if (filteredTodoList.value.length === 0) return;

  const originalStartTimes = filteredTodoList.value.map(t => new Date(t.startAt).getTime()).sort();
  const anchorTime = originalStartTimes[0];

  let currentTime = anchorTime; // Start from the earliest time in this date group

  // Update only the items in the current filtered view
  // We need to update them in the main todoList as well (by reference since filteredList items are from todoList objects)
  // Actually, computed set might have created new array but items are same objects? 
  // v-model on draggable with computed 'set' replaces the array in todoList. items are likely same references if we didn't clone.

  filteredTodoList.value.forEach((item) => {
    const start = new Date(currentTime);
    const end = new Date(start.getTime() + item.durationMinutes * 60000);

    item.startAt = start.toISOString();
    item.endAt = end.toISOString();

    currentTime = end.getTime() + 30 * 60000;
  });

  // Force update todoList to trigger reactivity if needed, though objects mutated in place usually works
  // But since we depend on startAt string for filtering, mutating it might cause issues?
  // It stays in the same date, so it should be fine.
  sortListByTime(); // Global sort to keep data clean
};

const deleteTodo = (id, index) => {
  if (confirm('정말 삭제하시겠습니까?')) {
    todoList.value.splice(index, 1);
  }
};

const openCreateModal = () => {
  modalMode.value = 'create';
  isReadOnlyExceptDesc.value = false;
  selectedTodo.value = {
    // Default to start at selected date's 09:00 or current time
    startAt: selectedDate.value ? `${selectedDate.value}T09:00:00` : new Date().toISOString(),
    endAt: selectedDate.value ? `${selectedDate.value}T10:00:00` : new Date().toISOString(),
  };
  isModalOpen.value = true;
};

const openEditModal = (todo) => {
  modalMode.value = 'edit';
  selectedTodo.value = todo;
  
  // Check if past (End time < Now)
  const end = new Date(todo.endAt);
  const now = new Date();
  isReadOnlyExceptDesc.value = end < now;

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
    // For new items, we need a temp ID if not provided by server yet.
    // However, if we are batch saving, we might send 0 or null as ID for new items?
    // Check API spec: PUT body has IDs. If ID is 0, backend probably treats as new.
    // Let's assume ID generation/mocking for local list compatibility.
    const newId = todoList.value.length > 0 ? Math.max(...todoList.value.map(t => t.id || 0)) + 1 : 1;

    // Ensure numeric ID to avoid clashes

    todoList.value.push({
      id: newId,
      planId: Number(route.params.id), // Ensure planId is set
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=200&fit=crop', // Default image
      ...newData
    });
  }

  // Sort by time after edit/add
  sortListByTime();
  closeModal();
};

const sortListByTime = () => {
  todoList.value.sort((a, b) => {
    return new Date(a.startAt) - new Date(b.startAt);
  });
};

// Dirty Check
const isDirty = computed(() => {
  return JSON.stringify(todoList.value) !== JSON.stringify(originalTodoList.value);
});

const saveAllChanges = async () => {
  if (confirm('모든 변경사항을 저장하시겠습니까?')) {
    // Map data to match API expectation if necessary.
    // API Expects: planId, attractionId, title, description, willStartAt, willEndAt
    // Local: startAt, endAt. Need mapping.
    const payload = todoList.value.map(item => ({
      id: item.id,
      planId: Number(route.params.id),
      attractionId: item.attractionId || 0, // Fallback if missing
      title: item.title,
      description: item.description || '',
      willStartAt: item.startAt || item.willStartAt, // Handle both
      willEndAt: item.endAt || item.willEndAt
    }));

    const result = await planStore.savePlanDetails(route.params.id, payload);
    if (result) {
      // Update local list with server response (which might have corrected IDs/times)
      // Map response back to local format
      todoList.value = result.map(item => ({
        ...item,
        startAt: item.willStartAt,
        endAt: item.willEndAt,
        // Calculate duration
        durationMinutes: Math.floor((new Date(item.willEndAt) - new Date(item.willStartAt)) / 60000),
        image: item.attractionImage || item.image // Use API image or fallback
      }));
      originalTodoList.value = JSON.parse(JSON.stringify(todoList.value));
    }
  }
};

// Auto Scroll to Current
onMounted(async () => {
  const planId = route.params.id;
  if (planId) {
    const data = await planStore.fetchPlanDetails(planId);
    // Map API data to local format
    todoList.value = data.map(item => ({
      ...item,
      startAt: item.willStartAt,
      endAt: item.willEndAt,
      durationMinutes: Math.floor((new Date(item.willEndAt) - new Date(item.willStartAt)) / 60000),
      image: item.attractionImage,
      latitude: item.latitude,
      longitude: item.longitude
    }));
    originalTodoList.value = JSON.parse(JSON.stringify(todoList.value));

    initSelectedDate();
  }

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
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Date Tabs */
.date-tabs-container {
  background: white;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  z-index: 10;
}

.date-tabs {
  display: flex;
  overflow-x: auto;
  padding: 0 20px;
  gap: 12px;
  scrollbar-width: none;
}

.date-tabs::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  flex: 0 0 auto;
  background: #f8f9fa;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 10px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 70px;
}

.tab-btn.active {
  background: #0095f6;
  border-color: #0095f6;
  color: white;
}

.tab-btn .day-label {
  font-size: 12px;
  font-weight: 700;
  color: #888;
}

.tab-btn.active .day-label {
  color: rgba(255, 255, 255, 0.9);
}

.tab-btn .date-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.tab-btn.active .date-label {
  color: white;
}

/* Header styles removed, using AppHeader */

.icon-btn {
  /* Helper mostly replaced, but kept if used elsewhere? 
     AppHeader handles the back button. 
  */
}

.delete-plan-btn {
  background: transparent;
  border: none;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline-content {
  flex: 1;
  padding: 20px;
  position: relative;
  padding-left: 20px;
  overflow-y: auto;
  /* Hide scrollbar for cleaner look */
  scrollbar-width: none;
}

.timeline-content::-webkit-scrollbar {
  display: none;
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
      #e0e0e0 100%);
  z-index: 0;
}

.todo-draggable-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 150px;
  /* Increased to clear the save button */
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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

.map-btn-container {
  position: fixed;
  bottom: 24px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 90; /* Below UI Overlay (100) but above content */
  pointer-events: none; /* Container passes clicks */
  transition: bottom 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.map-btn-container.with-save-btn {
  bottom: calc(90px + env(safe-area-inset-bottom)); /* Shift up above the save button */
}

.map-view-btn {
  pointer-events: auto;
  background: #333;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  cursor: pointer;
  transition: transform 0.2s;
}

.map-view-btn:active {
  transform: scale(0.95);
}
</style>
