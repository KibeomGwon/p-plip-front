<template>
    <div>
        <p>{{ title }}</p>
        <p>{{ likeCnt }}</p>
        <p>{{ authorName }}</p>
        <p>{{ createdAt }}</p>
    </div>
</template>

<script setup>
const props = defineProps({
    title: String,
    likeCnt: Number,
    authorName: String,
    createdAt: String
});
</script>

<style>

</style>