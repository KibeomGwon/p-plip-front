<template>
    <div class="main-view">
        <!-- Header -->
        <header class="header">
            <div class="logo-container">
                <!-- Exact Plus Icon Match -->
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                    class="logo-icon">
                    <circle cx="12" cy="12" r="12" fill="#3B82F6" />
                    <path d="M12 7V17M7 12H17" stroke="white" stroke-width="2.5" stroke-linecap="round" />
                </svg>
                <span class="logo-text">P-PLIP</span>
            </div>
            <div class="header-right">
                <!-- Notification Icon can go here if needed later -->
            </div>
        </header>

        <div class="content">
            <!-- Nearby Attractions -->
            <section class="section">
                <div class="section-header">
                    <div>
                        <h2 class="title">근처 관광지</h2>
                        <p class="subtitle">리뷰가 많이 달린 근처 관광지에요</p>
                    </div>
                </div>

                <div class="horizontal-scroll" ref="scrollContainer" v-if="formattedPlaces.length > 0"
                    @wheel="onUserInteraction" @touchstart="onUserInteraction" @pointerdown="onUserInteraction"
                    @mousedown="onMouseDown" @mouseleave="onMouseLeave" @mouseup="onMouseUp" @mousemove="onMouseMove">
                    <div v-for="(place, index) in formattedPlaces" :key="place.id || index" class="card"
                        @click="goToDetail(place.no)">
                        <div class="card-image" :style="{ backgroundImage: `url(${place.image})` }">
                        </div>
                        <div class="card-body">
                            <div class="card-header-row">
                                <h3 class="card-title">{{ place.title }}</h3>
                                <span class="card-dist" v-if="place.dist">{{ place.dist }}</span>
                            </div>
                            <p class="card-desc">{{ place.desc }}</p>
                            <div class="card-footer">
                                <!-- Message Bubble Icon -->
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666"
                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                <span class="review-count">{{ place.reviewCnt || 0 }} reviews</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="loading-state">
                    <div v-if="isLoading">
                        <div class="spinner"></div>
                        <p>위치 정보를 불러오는 중...</p>
                    </div>
                    <div v-else class="empty-state">
                        <p>근처에 관광지가 없습니다.</p>
                    </div>
                </div>
            </section>

            <!-- View on Map Button -->
            <section class="section map-section">
                <div class="map-card" @click="handleMapClick">
                    <div class="icon-circle bg-green">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                            <line x1="8" y1="2" x2="8" y2="18"></line>
                            <line x1="16" y1="6" x2="16" y2="22"></line>
                        </svg>
                    </div>
                    <div class="map-text">
                        <h3>지도로 보기</h3>
                        <p>View on Map</p>
                    </div>
                    <div class="arrow-right">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </div>
                </div>
            </section>

            <!-- AI Guide Link -->
            <div class="ai-guide-container">
                <button class="ai-guide-btn" @click="$router.push({ path: '/ai-guide', query: { hideStart: 'true' } })">
                    <span class="ai-icon">🤖</span>
                    <span class="ai-text">AI 기능 가이드</span>
                </button>
            </div>

        </div>

        <!-- Bottom Navigation -->
        <div class="bottom-nav-wrapper">
            <NavBar />
        </div>

    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import NavBar from '@/components/common/Navbar.vue';
import { attractionApi } from '@/axios/attraction';
import defaultImage from '@/assets/common/default_image.png';
import { useLocationStore } from '@/stores/location';
import { storeToRefs } from 'pinia';

const router = useRouter();
const locationStore = useLocationStore();
const { location } = storeToRefs(locationStore);
const places = ref([]);
const isLoading = ref(true);

// Computed property to safeguard against bad data
const formattedPlaces = computed(() => {
    if (!Array.isArray(places.value)) return [];
    return places.value.map(place => ({
        ...place,
        id: place.no || place.contentId || Math.random(), // Fallback ID
        image: place.thumbnail || place.firstImage1 || place.firstImage2 || defaultImage,
        title: place.title || '제목 없음',
        reviewCnt: place.reviewCnt || 0,
        desc: place.overview || '상세 정보가 없습니다.',
        dist: place.distance ? `${(place.distance / 1000).toFixed(2)}km` : ''
    }));
});



const goToDetail = (id) => {
    if (id) router.push({ name: 'place-detail', params: { id } });
};

const handleMapClick = () => {
    const hideGuide = localStorage.getItem('hideAiGuide');
    if (hideGuide === 'true') {
        router.push('/map');
    } else {
        router.push('/ai-guide');
    }
};

const fetchNearbyPlaces = async () => {
    try {
        isLoading.value = true;
        places.value = []; // Reset

        // Default location (Jeju)
        let lat = 33.450701;
        let lng = 126.570667;

        // Default location (Jeju)
        // let lat = 33.450701;
        // let lng = 126.570667;

        if (location.value && location.value.lat) {
            lat = location.value.lat;
            lng = location.value.lng;
        }

        // Fetch places
        console.log("Fetching attractions...");
        const params = {
            latitude: lat,
            longitude: lng
        };
        const response = await attractionApi.getMostReviewAttractions(params);
        console.log("Attraction response:", response);

        if (response && response.data) {
            // Handle various response structures
            if (Array.isArray(response.data)) {
                places.value = response.data;
            } else if (response.data.list && Array.isArray(response.data.list)) {
                places.value = response.data.list;
            } else {
                console.warn("Unknown response structure", response.data);
                places.value = [];
            }
        } else if (Array.isArray(response)) {
            places.value = response;
        }

    } catch (error) {
        console.error("Failed to fetch nearby places:", error);
    } finally {
        isLoading.value = false;
    }
};

const scrollContainer = ref(null);
let autoScrollInterval = null;
let restartTimer = null;
const isDragging = ref(false);
const startX = ref(0);
const scrollLeft = ref(0);

const startAutoScroll = () => {
    stopAutoScroll(); // Clear existing if any
    autoScrollInterval = setInterval(() => {
        if (!scrollContainer.value) return;

        const container = scrollContainer.value;
        if (container.children.length > 0) {
            const firstCard = container.children[0];
            // Calculate effective card width including gap (16px)
            const cardWithGap = firstCard.offsetWidth + 16;

            // Use Math.round to handle smooth scroll offsets better
            const currentScroll = container.scrollLeft;
            const currentIndex = Math.round(currentScroll / cardWithGap);
            const nextScroll = (currentIndex + 1) * cardWithGap;

            // Check if we reached the end (approximate)
            if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
                container.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                container.scrollTo({ left: nextScroll, behavior: 'smooth' });
            }
        }
    }, 4000);
};

const stopAutoScroll = () => {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
};

const onUserInteraction = () => {
    stopAutoScroll();
    if (restartTimer) clearTimeout(restartTimer);
    restartTimer = setTimeout(() => {
        startAutoScroll();
    }, 4000); // Resume after 4 seconds of inactivity
};

// Drag functionality
const onMouseDown = (e) => {
    isDragging.value = true;
    startX.value = e.pageX - scrollContainer.value.offsetLeft;
    scrollLeft.value = scrollContainer.value.scrollLeft;
    onUserInteraction(); // Pause auto-scroll
};

const onMouseLeave = () => {
    isDragging.value = false;
    onUserInteraction(); // Resume timer
};

const onMouseUp = () => {
    isDragging.value = false;
    onUserInteraction(); // Resume timer
};

const onMouseMove = (e) => {
    if (!isDragging.value) return;
    e.preventDefault();
    const x = e.pageX - scrollContainer.value.offsetLeft;
    const walk = (x - startX.value) * 2; // Scroll-fast
    scrollContainer.value.scrollLeft = scrollLeft.value - walk;
};

onMounted(() => {
    // Start tracking when view mounts
    locationStore.startTracking();
    fetchNearbyPlaces();
});

// Watch location changes from store
watch(location, (newLoc) => {
    if (newLoc && newLoc.lat) {
        // console.log("MainView: Location updated, refetching...");
        fetchNearbyPlaces();
    }
}, { deep: true });

onUnmounted(() => {
    stopAutoScroll();
    if (restartTimer) clearTimeout(restartTimer);
});

// Watch for data updates to start scrolling
// Watch changed
watch(formattedPlaces, async (newVal) => {
    if (newVal.length > 0) {
        await nextTick();
        startAutoScroll();
    }
});
</script>

<style scoped>
.main-view {
    display: flex;
    flex-direction: column;
    height: 100vh;
    /* Fallback */
    height: 100dvh;
    /* Mobile viewport height */
    background-color: #f8f9fa;
    position: relative;
    width: 100%;
}

.header {
    background: white;
    padding: 16px 20px;
    padding-top: calc(16px + env(safe-area-inset-top));
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    /* Prevent header from shrinking */
    z-index: 10;
}

.logo-container {
    display: flex;
    align-items: center;
    gap: 8px;
}

.logo-text {
    font-size: 20px;
    font-weight: 800;
    color: #1e293b;
    letter-spacing: -0.5px;
}

.content {
    flex: 1;
    overflow-y: auto;
    padding-bottom: calc(60px + env(safe-area-inset-bottom) + 20px);
    /* Space for navbar */
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    /* Explicitly align to top */
    -webkit-overflow-scrolling: touch;
    /* Smooth scroll on iOS */
}

.section {
    padding: 24px 20px;
    flex-shrink: 0;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.title {
    font-size: 20px;
    font-weight: 700;
    color: #111;
    margin-bottom: 4px;
    /* Space for subtitle */
}

.subtitle {
    font-size: 14px;
    color: #888;
    font-weight: 500;
    margin: 0;
}

.horizontal-scroll {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    padding-bottom: 20px;
    margin: 0 -20px;
    padding: 0 20px 20px 20px;
    scrollbar-width: none;
}

.horizontal-scroll::-webkit-scrollbar {
    display: none;
}

.card {
    min-width: 280px;
    /* Increased slightly */
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    transition: transform 0.2s;
    display: flex;
    flex-direction: column;
    position: relative;
}

.card:active {
    transform: scale(0.98);
}

.card-image {
    height: 180px;
    /* Increased height */
    background-size: cover;
    background-position: center;
    position: relative;
    background-color: #eee;
}

.card-body {
    padding: 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.card-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    gap: 8px;
}

.card-dist {
    font-size: 12px;
    color: #3B82F6;
    font-weight: 600;
    white-space: nowrap;
}

.card-title {
    font-size: 18px;
    /* Larger text */
    font-weight: 700;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #111;
    flex: 1;
}

.card-desc-wrapper {
    flex: 1;
    margin-bottom: 12px;
}

.card-desc {
    font-size: 13px;
    /* Slightly smaller for description */
    color: #666;

    /* Multi-line truncation */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    /* Override nowrap */
    line-height: 1.4;
    height: 36px;
    /* Approx 2 lines */
    margin: 0;
}

.card-footer {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: auto;
}

.review-count {
    font-size: 13px;
    color: #555;
    font-weight: 500;
}

/* Map Section */
.map-section {
    padding-top: 0;
    /* margin-top: auto; REMOVED to keep content at top */
}

.map-card {
    background: white;
    padding: 20px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    border: 1px solid #f0f0f0;
}

.icon-circle {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.bg-green {
    background-color: #10B981;
}

.bg-green svg {
    stroke: white;
}

.map-text h3 {
    font-size: 17px;
    font-weight: 700;
    color: #111;
    margin-bottom: 4px;
}

.map-text p {
    font-size: 14px;
    color: #888;
}

.arrow-right {
    margin-left: auto;
}

/* AI Guide */
.ai-guide-container {
    display: flex;
    justify-content: center;
    margin-top: 10px;
    margin-bottom: 30px;
}

.ai-guide-btn {
    background: transparent;
    border: none;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    cursor: pointer;
}

.ai-text {
    font-size: 14px;
    color: #666;
    text-decoration: underline;
    text-underline-offset: 4px;
}

.loading-state,
.empty-state {
    flex: 1;
    /* Occupy available space */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    padding: 20px;
    text-align: center;
    color: #888;
}

.spinner {
    width: 30px;
    height: 30px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3B82F6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.spacer-bottom {
    display: none;
    /* No longer needed as we use padding-bottom */
}

.bottom-nav-wrapper {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 430px;
    /* Keep consistent with app width */
    height: calc(60px + env(safe-area-inset-bottom));
    padding-bottom: env(safe-area-inset-bottom);
    z-index: 50;
    background: white;
    border-top: 1px solid #eee;
}
</style>
