<template>
  <div>
    <input v-model="searchQuery" type="text" placeholder="Search">
    <button @click="handleSearch">Search</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useAttractionStore } from '@/stores/attraction';

const attractionStore = useAttractionStore();

const { VITE_SERVER_BASE_URL } = import.meta.env;
const searchQuery = ref('');

const handleSearch = async () => {
  try {
    const response = await axios.get(`${VITE_SERVER_BASE_URL}/search?q=${searchQuery.value}`);
    const data = response.json();
    // data 처리 과정 필요.
    
    attractionStore.addAttraction(data);    
  } catch (error) {
    console.error('Error fetching search results:', error);
  }
};

</script>

<style scoped>

</style>