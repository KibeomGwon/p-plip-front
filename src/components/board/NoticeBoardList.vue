<template>
  <ul>
    <li v-for="noticeBoard in noticeBoardStore.noticeBoards" :key="noticeBoard.id">
      <!-- <router-link :to="{ name: 'noticeboard-detail', params: { id: noticeBoard.id } }"> -->
        <BoardSummary :title="noticeBoard.title" :likeCnt="noticeBoard.likeCnt" :authorName="noticeBoard.authorName" :createdAt="noticeBoard.createdAt" />
      <!-- </router-link> -->
    </li>
  </ul>
</template>

<script setup>
import { useNoticeBoardStore } from '@/stores/noticeboard';
import BoardSummary from './BoardSummary.vue';
import axios from 'axios';

import { onMounted } from 'vue';

const noticeBoardStore = useNoticeBoardStore();

const { VITE_SERVER_BASE_URL } = import.meta.env;

const getNoticeBoards = async () => {
    // try {
    //     const response = await axios.get(`${VITE_SERVER_BASE_URL}/noticeboards`);
    //     const data = response.data;
    //     noticeBoardStore.addNoticeBoard(data);
    // } catch (error) {
    //     console.error('Error fetching noticeboards:', error);
    // }
    const dummyData = [
        { id: 1, title: "공지사항 1", likeCnt: 100, authorName: "관리자", createdAt: "2023-12-01" },
        { id: 2, title: "공지사항 2", likeCnt: 50, authorName: "관리자", createdAt: "2023-12-02" }
    ];
    noticeBoardStore.setNoticeBoards(dummyData);
};

onMounted(() => {
    getNoticeBoards();
});

</script>

<style>

</style>