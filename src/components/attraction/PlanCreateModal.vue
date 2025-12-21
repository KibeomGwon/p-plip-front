<template>
    <Teleport to="body">
        <div class="modal-overlay" v-if="isVisible" @click="close">
            <div class="modal-content" @click.stop>
                <h3 class="modal-title">여행 계획 생성</h3>
                <p class="modal-subtitle">새로운 여행을 시작해보세요!</p>

                <div class="input-wrapper">
                    <input v-model="titleInput" type="text" placeholder="여행 제목을 입력하세요 (예: 제주도 우정 여행)"
                        class="title-input" @keyup.enter="confirm" autofocus />
                </div>

                <div class="modal-actions">
                    <button class="cancel-btn" @click="close">취소</button>
                    <button class="confirm-btn" @click="confirm" :disabled="!isValid">
                        생성하기
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true
    }
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const isVisible = ref(props.modelValue);
const titleInput = ref("");

watch(() => props.modelValue, (newVal) => {
    isVisible.value = newVal;
    if (newVal) {
        titleInput.value = ""; // Reset input
    }
});

const isValid = computed(() => {
    return titleInput.value.trim().length > 0;
});

const close = () => {
    emit('update:modelValue', false);
};

const confirm = () => {
    if (isValid.value) {
        emit('confirm', titleInput.value.trim());
        close();
    }
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    padding: 24px;
    box-sizing: border-box;
    animation: fadeIn 0.2s ease-out;
}

.modal-content {
    width: 100%;
    max-width: 320px;
    background: white;
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.modal-title {
    font-size: 18px;
    font-weight: 700;
    color: #111;
    margin: 0 0 8px;
    text-align: center;
}

.modal-subtitle {
    font-size: 14px;
    color: #666;
    margin: 0 0 24px;
    text-align: center;
}

.input-wrapper {
    margin-bottom: 24px;
}

.title-input {
    width: 100%;
    padding: 14px;
    border: 1px solid #eee;
    border-radius: 12px;
    background: #f8f9fa;
    font-size: 16px;
    box-sizing: border-box;
    font-family: inherit;
    outline: none;
    transition: all 0.2s;
}

.title-input:focus {
    border-color: #4CAF50;
    background: white;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.modal-actions {
    display: flex;
    gap: 12px;
}

.cancel-btn {
    flex: 1;
    padding: 14px;
    border-radius: 12px;
    border: none;
    background: #f5f5f5;
    color: #666;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
}

.confirm-btn {
    flex: 1;
    padding: 14px;
    border-radius: 12px;
    border: none;
    background: #4CAF50;
    color: white;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.confirm-btn:disabled {
    background: #e0e0e0;
    color: #999;
    cursor: not-allowed;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes popIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}
</style>
