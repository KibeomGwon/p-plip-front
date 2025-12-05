import { defineStore } from "pinia";
import { ref } from 'vue';

export const useFreeBoardStore = defineStore('freeboard', () => {
    // state
    const freeBoards = ref([]);

    const addFreeBoard = (freeBoard) => {
        freeBoards.value.push(freeBoard);
    };

    const removeFreeBoard = (id) => {
        freeBoards.value = freeBoards.value.filter(freeBoard => freeBoard.id !== id);
    };

    const setFreeBoards = (data) => {
        freeBoards.value = data;
    };

    return { freeBoards, addFreeBoard, removeFreeBoard, setFreeBoards };
},
{
    // persist: true
}
);