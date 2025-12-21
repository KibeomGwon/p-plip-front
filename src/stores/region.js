import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { attractionApi } from '@/axios/attraction';

export const useRegionStore = defineStore('region', () => {
    const regionData = ref({});
    const sidoCodeMap = ref({});
    const gugunCodeMap = ref({});
    const isLoaded = ref(false);
    const isLoading = ref(false);

    const fetchRegions = async () => {
        if (isLoaded.value || isLoading.value) return;

        isLoading.value = true;
        try {
            const res = await attractionApi.getRegions();
            console.log("Region Store Fetch:", res);

            // 2-char Name Mapping
            const sidoMap = {
                '세종특별자치시': '세종',
                '제주특별자치도': '제주',
                '강원특별자치도': '강원',
                '전북특별자치도': '전북',
                '경기도': '경기',
                '충청북도': '충북',
                '충청남도': '충남',
                '경상북도': '경북',
                '경상남도': '경남',
                '전라북도': '전북',
                '전라남도': '전남',
                '제주도': '제주'
            };

            const newRegionData = {};
            const newSidoCodeMap = {};
            const newGugunCodeMap = {};

            let list = [];
            if (Array.isArray(res)) {
                list = res;
            } else if (res && Array.isArray(res.data)) {
                list = res.data;
            } else if (res && res.response && Array.isArray(res.response)) { // Just in case
                list = res.response;
            }

            if (list.length > 0) {
                list.forEach(item => {
                    let sName = item.sido.sidoName;
                    if (sidoMap[sName]) {
                        sName = sidoMap[sName];
                    } else {
                        sName = sName.substring(0, 2);
                    }

                    const sCode = item.sido.sidoCode;
                    newSidoCodeMap[sName] = sCode;

                    // Map Gugun names to 2 chars and store codes
                    newRegionData[sName] = [];
                    newGugunCodeMap[sName] = {};

                    if (item.guguns) {
                        item.guguns.forEach(g => {
                            const gName = g.gugunName.substring(0, 2);
                            newRegionData[sName].push(gName);
                            newGugunCodeMap[sName][gName] = g.gugunCode;
                        });
                    }
                });
            }

            regionData.value = newRegionData;
            sidoCodeMap.value = newSidoCodeMap;
            gugunCodeMap.value = newGugunCodeMap;
            isLoaded.value = true;

        } catch (error) {
            console.error('Error fetching regions in store:', error);
        } finally {
            isLoading.value = false;
        }
    };

    return {
        regionData,
        sidoCodeMap,
        gugunCodeMap,
        isLoaded,
        isLoading,
        fetchRegions
    };
});
