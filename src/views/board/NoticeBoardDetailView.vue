<template>
    <div>
        <button>목록</button>
    </div>
    <div>
        <h1>{{ title }}</h1>
        <p>{{ authorName }}</p>
        <p>{{ createdAt }}</p>
    </div>
    <div>
        <ol>
            <!-- TODO: 처리필요 -->
            <li v-for="image in boardDetail.freeBoardImages" :key="image.id">
                <img :src="image" alt="freeBoardImages">
            </li>
        </ol>
        <p>{{ content }}</p>
    </div>
    <div>
        <p>{{ likeCnt }}</p>
    </div>
    <div>
        <ul>
            <li v-for="comment in comments" :key="comment.id">
                {{ comment.authorNickname }}
                <img :src="comment.profileImage" alt="profileImage">
                {{ comment.content }}
                {{ comment.createdAt }}
            </li>
        </ul>
    </div>
</template>

<script setup>
import axios from 'axios';
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
const { VITE_SERVER_BASE_URL } = import.meta.env;

const boardDetail = ref(null);
const comments = ref([]);
const route = useRoute();

const id = computed(() => route.params.id);

const fetchBoardDetail = async () => {
    try {
        const response = await axios.get(`${VITE_SERVER_BASE_URL}/noticeboard/${id.value}`);
        const data = response.json();

        // data 처리 필요.
        boardDetail.value = data;

    } catch (error) {
        console.error('Error fetching board detail:', error);
    }
};

const fetchComments = async () => {
    try {
        const response = await axios.get(`${VITE_SERVER_BASE_URL}/noticeboard/${id.value}/comment`);
        const data = response.json();

        // data 처리 필요.
        comments.value = data;
    } catch (error) {
        console.error('Error fetching comments:', error);
    }
};

onMounted(() => {
    fetchBoardDetail();
    fetchComments();
}); 
</script>

<style>

</style>