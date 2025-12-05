import { defineStore } from "pinia";
import { ref } from 'vue';

export const useAttractionStore = defineStore('attraction', () => {
    // state
    const attractions = ref([]);

    const addAttraction = (attraction) => {
        attractions.value.push(attraction);
    };

    const removeAttraction = (id) => {
        attractions.value = attractions.value.filter(attraction => attraction.id !== id);
    };

    return { attractions, addAttraction, removeAttraction };
},
{
    // persist: true
}
);