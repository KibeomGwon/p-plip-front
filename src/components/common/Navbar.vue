<template>
    <nav class="bottom-nav">
        <ul class="nav-list">
            <li class="nav-item">
                <router-link :to="{ name: 'plan' }" class="nav-link">
                    <div class="icon-container" :class="{ 'twinkle': planStore.isGeneratingPlan }">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M9 12H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                            <path d="M9 16H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <span class="nav-label">플랜</span>
                </router-link>
            </li>
            <li class="nav-item">
                <router-link :to="{ name: 'roulette' }" class="nav-link">
                    <div class="icon-container">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                            <path d="M12 2L12 12" stroke="currentColor" stroke-width="2" />
                            <path d="M12 12L19 19" stroke="currentColor" stroke-width="2" />
                            <path d="M12 12L5 19" stroke="currentColor" stroke-width="2" />
                        </svg>
                    </div>
                    <span class="nav-label">랜덤여행</span>
                </router-link>
            </li>
            <li class="nav-item">
                <router-link :to="{ name: 'main' }" class="nav-link">
                    <div class="icon-container">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <span class="nav-label">홈</span>
                </router-link>
            </li>
            <li class="nav-item">
                <router-link :to="{ name: 'board' }" class="nav-link">
                    <div class="icon-container">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <span class="nav-label">커뮤니티</span>
                </router-link>
            </li>
            <li class="nav-item">
                <router-link :to="{ name: 'profile' }" class="nav-link">
                    <div class="icon-container">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <span class="nav-label">내정보</span>
                </router-link>
            </li>
        </ul>
    </nav>
</template>

<script setup>
import { ref } from 'vue';
import { usePlanStore } from '@/stores/plan'; // Import Plan Store

const planStore = usePlanStore();
</script>

<style scoped>
.bottom-nav {
    height: 100%;
    background: white;
    border-top: 1px solid #eee;
}

.nav-list {
    display: flex;
    justify-content: space-around;
    align-items: center;
    list-style: none;
    padding: 0;
    margin: 0;
    height: 100%;
}

.nav-item {
    flex: 1;
    height: 100%;
}

.nav-link {
    text-decoration: none;
    color: #999;
    /* Inactive color */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 4px;
    transition: color 0.2s;
}

.icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    /* For animation glow */
    padding: 4px;
}

/* Twinkle Animation for Generating Plan */
/* Moved to global App.vue for reusability */

.nav-label {
    font-size: 11px;
    font-weight: 500;
}

.nav-link.router-link-active {
    color: #0095f6;
    /* Active color (P-PliP Blue) */
}

.nav-link.router-link-active .nav-label {
    font-weight: 700;
}
</style>