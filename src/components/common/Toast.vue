<template>
    <div class="toast-container">
        <transition-group name="toast">
            <div v-for="toast in toasts" :key="toast.id" class="toast-item" :class="toast.type">
                <span class="toast-icon">
                    <template v-if="toast.type === 'success'">✅</template>
                    <template v-else-if="toast.type === 'warning'">✋</template>
                    <template v-else-if="toast.type === 'error'">❌</template>
                    <template v-else-if="toast.type === 'custom'">🤖</template>
                    <template v-else>ℹ️</template>
                </span>
                <span class="toast-message">{{ toast.message }}</span>
                <img :src="tripffy" class="mascot-image" alt="mascot" />
            </div>
        </transition-group>
    </div>
</template>

<script setup>
import { useToastStore } from '@/stores/toast';
import { storeToRefs } from 'pinia';
import tripffy from '@/assets/common/tripffy.png';

const toastStore = useToastStore();
const { toasts } = storeToRefs(toastStore);
</script>

<style scoped>
.toast-container {
    position: fixed;
    bottom: 100px;
    /* Adjusted bottom position */
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 15px;
    /* Increased gap */
    pointer-events: none;
    width: auto;
    /* Auto width */
    align-items: center;
}

.toast-item {
    pointer-events: auto;
    display: flex;
    align-items: center;
    padding: 14px 24px;
    /* Increased padding */
    padding-right: 50px;
    /* Space for mascot */
    border-radius: 50px;
    background: #333;
    /* Default background */
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    font-size: 15px;
    font-weight: 600;
    color: white;
    min-width: 300px;
    justify-content: flex-start;
    /* Align start */
    gap: 12px;
    position: relative;
    /* For mascot positioning */
    overflow: visible;
    /* Allow mascot to stick out */
}

/* Color Themes */
.toast-item.success {
    background: #4CAF50;
}

.toast-item.warning {
    background: #FF9800;
}

.toast-item.error {
    background: #F44336;
}

.toast-item.info {
    background: #2196F3;
}

.toast-item.custom {
    background: #607D8B;
}

.toast-icon {
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    width: 28px;
    height: 28px;
}

.toast-message {
    line-height: 1.4;
}

/* Mascot Image */
.mascot-image {
    position: absolute;
    top: -22px;
    /* Peek out from top */
    right: 10px;
    width: 45px;
    /* Adjust size */
    height: auto;
    z-index: 10;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    transform: rotate(10deg);
}

/* Transitions */
.toast-enter-active,
.toast-leave-active {
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    /* Bouncy effect */
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
}
</style>
