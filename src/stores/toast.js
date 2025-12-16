import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToastStore = defineStore('toast', () => {
    const toasts = ref([]);

    /* 
     * type: 'success' | 'warning' | 'error' | 'info'
     * duration: ms (default 3000)
     */
    const addToast = (message, type = 'info', duration = 3000) => {
        const id = Date.now();
        toasts.value.push({ id, message, type });

        setTimeout(() => {
            removeToast(id);
        }, duration);

        return id;
    };

    const removeToast = (id) => {
        const index = toasts.value.findIndex(t => t.id === id);
        if (index !== -1) {
            toasts.value.splice(index, 1);
        }
    };

    return {
        toasts,
        addToast,
        removeToast
    };
});
