import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useLocationStore = defineStore('location', () => {
    // Default to Jeju (or a sensible default)
    const location = ref({
        lat: 33.450701,
        lng: 126.570667
    });

    // Loading state
    const isLoading = ref(false);
    const error = ref(null);
    // Track if location has been initialized at least once
    const isInitialized = ref(false);

    const fetchCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                error.value = 'Geolocation is not supported by this browser.';
                reject(new Error(error.value));
                return;
            }

            isLoading.value = true;
            error.value = null;

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    location.value = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    isInitialized.value = true;
                    isLoading.value = false;
                    resolve(location.value);
                },
                (err) => {
                    error.value = `Geolocation error: ${err.message}`;
                    isLoading.value = false;
                    // Keep default location or previous location
                    reject(err);
                },
                {
                    enableHighAccuracy: true, // true로 설정하면 GPS나 정밀한 Wi-Fi 스캔을 시도함
                    timeout: 5000,            // 위치를 가져오는데 기다릴 최대 시간 (ms)
                    maximumAge: 0             // 캐시된 위치 값을 쓰지 않고 항상 새로 고침
                }
            );
        });
    };

    const updateLocation = (lat, lng) => {
        location.value = { lat, lng };
        // We might want to trigger a fetch or just update state.
        // MapComponent watches props/state triggers, but let's ensure consistency.
    };

    // Real-time tracking
    const watchId = ref(null);
    const isTracking = ref(false);

    const startTracking = () => {
        if (!navigator.geolocation) {
            console.error("Geolocation is not supported.");
            return;
        }
        if (isTracking.value) return;

        isTracking.value = true;
        console.log("Starting location tracking (interval: 5 min)...");

        // Initial fetch
        fetchCurrentLocation().catch(err => console.warn("Initial tracking fetch failed:", err));

        // Set interval for every 5 minutes (300,000 ms)
        watchId.value = setInterval(() => {
            console.log("Tracking interval: fetching location...");
            fetchCurrentLocation().catch(err => console.warn("Tracking fetch failed:", err));
        }, 300000);
    };

    const stopTracking = () => {
        if (watchId.value !== null) {
            clearInterval(watchId.value);
            watchId.value = null;
        }
        isTracking.value = false;
        console.log("Location tracking stopped.");
    };

    // Map Persistence
    const lastMapCenter = ref(null);
    const setMapCenter = (lat, lng) => {
        lastMapCenter.value = { lat, lng };
    };

    // AI Search Persistence
    const aiSearchResults = ref([]);
    const setAiSearchResults = (results) => {
        aiSearchResults.value = results;
    };

    const removeAiSearchResults = () => {
        aiSearchResults.value = [];
    };

    return {
        location,
        isLoading,
        error,
        isInitialized,
        isTracking,
        lastMapCenter,
        fetchCurrentLocation,
        updateLocation,
        startTracking,
        stopTracking,
        setMapCenter,
        aiSearchResults,
        setAiSearchResults,         
        removeAiSearchResults
    };
});
