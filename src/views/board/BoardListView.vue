<template>
  <h1>Board View</h1>
    <div>
        <router-link :to="{ name: 'freeboard' }">Free Board</router-link>
    |
        <router-link :to="{ name: 'noticeboard' }">Notice Board</router-link>
    </div>
  <div>
    <nav-bar></nav-bar>
  </div>
</template>

<script setup>
import NavBar from '@/components/common/Navbar.vue';
</script>

<style>

</style>