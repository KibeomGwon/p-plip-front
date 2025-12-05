<template>
    <div>
        <ul>
            <li v-for="freeBoard in freeBoardStore.freeBoards" :key="freeBoard.id">
                <!-- <router-link :to="{ name: 'freeboard-detail', params: { id: freeBoard.id } }"> -->
                    <BoardSummary :title="freeBoard.title" :likeCnt="freeBoard.likeCnt" :authorName="freeBoard.authorName" :createdAt="freeBoard.createdAt" />
                <!-- </router-link> -->
            </li>
        </ul>
    </div>
</template>

<script setup>
import axios from 'axios';
import { useFreeBoardStore } from '@/stores/freeboard';
import { onMounted } from 'vue';
import BoardSummary from './BoardSummary.vue';

const { VITE_SERVER_BASE_URL } = import.meta.env;

const freeBoardStore = useFreeBoardStore();

const fetchFreeBoardList = async () => {
    // try {
    //     const response = await axios.get(`${VITE_SERVER_BASE_URL}/freeboard`);
    //     const data = response.json();

    //     // response.json() 처리 과정 필요.
    //     freeBoardStore.addFreeBoard(data);
    // } catch (error) {
    //     console.error('Error fetching free board list:', error);
    // }
    const dummyData = [
        { id: 1, title: "자유게시판 글 1", likeCnt: 10, authorName: "작성자1", createdAt: "2023-12-01" },
        { id: 2, title: "자유게시판 글 2", likeCnt: 5, authorName: "작성자2", createdAt: "2023-12-02" }
    ];
    freeBoardStore.setFreeBoards(dummyData);
};

onMounted(() => {
    fetchFreeBoardList();
});
</script>

<style>

</style>