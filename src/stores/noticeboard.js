import { defineStore } from "pinia";
import { ref } from 'vue';

export const useNoticeBoardStore = defineStore('noticeboard', () => {
    // state
    const noticeBoards = ref([]);

    const addNoticeBoard = (noticeBoard) => {
        noticeBoards.value.push(noticeBoard);
    };

    const removeNoticeBoard = (id) => {
        noticeBoards.value = noticeBoards.value.filter(noticeBoard => noticeBoard.id !== id);
    };

    const setNoticeBoards = (data) => {
        noticeBoards.value = data;
    };

    return { noticeBoards, addNoticeBoard, removeNoticeBoard, setNoticeBoards };
},
{
    // persist: true
}
);