<template>
    <div>
        <ul>
            <li><router-link :to="{ name: 'main' }">홈</router-link></li>
            <li><router-link :to="{ name: 'favorites' }">즐겨찾기</router-link></li>
            <li><router-link :to="{ name: 'board' }">게시판</router-link></li>
            <li><router-link :to="{ name: 'plan' }">플랜</router-link></li>
            <li><router-link :to="{ name: 'myinfo' }">내 정보</router-link></li>
        </ul>
        <router-view />
    </div>    
</template>

<script setup>
import { ref } from 'vue';


</script>

<style>

</style>