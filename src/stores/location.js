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

    return {
        location,
        isLoading,
        error,
        isInitialized,
        fetchCurrentLocation
    };
});
