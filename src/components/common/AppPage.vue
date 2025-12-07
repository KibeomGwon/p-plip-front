<template>
  <div class="app-page">
    <slot></slot>
  </div>
</template>

<style scoped>
.app-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa; /* Default bg, can be overridden */
  width: 100%;
  position: relative;
}
</style>
