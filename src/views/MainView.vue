<template>
    <div>
        <SearchBar />
    </div>
    <div>
        <MapComponent />
    </div>
    <div>
        <nav-bar></nav-bar>
    </div>
    <router-view />
</template>

<script setup>
import MapComponent from '@/components/main/Mapcomponent.vue';
import SearchBar from '@/components/main/SearchBar.vue';
import NavBar from '@/components/common/Navbar.vue';
</script>

<style>

</style>
