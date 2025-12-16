import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { planApi } from '@/api/plan';
import { useToastStore } from '@/stores/toast';
import router from '@/router';

export const usePlanStore = defineStore('plan', () => {
    const isGeneratingPlan = ref(false);
    const plans = ref([]);
    const totalCount = ref(0); // For pagination if needed
    const isFetchingPlans = ref(false);
    const toastStore = useToastStore();

    const suggestPlan = async (attractionId, query = "", startDate, endDate) => {
        isGeneratingPlan.value = true;
        let loadingToastId = null;

        try {
            // Persistent loading toast removed or kept? User said "until response".
            // We can keep the "Generating..." toast or remove it since we have the navbar animation.
            // User: "respond with toast instead of alert when done".
            // Also "while pending, navbar icon twinkles".
            // So relying on navbar animation is better visual feedback than a persistent toast covering screen if the user wants to do other things.
            // But a "Started" toast is good.
            loadingToastId = toastStore.addToast('AI가 여행 계획을 생성하고 있습니다. (약 1분 소요)', 'info', 3000); // Short duration, just info

            // We don't need a long running toast blocking/showing if we have the icon.
            // Actually, keep it simple.

            const response = await planApi.suggestPlan(attractionId, query, startDate, endDate);
            console.log("suggestPlan response:", response);

            if (response) {
                const newPlanId = response.id || response.planId;
                toastStore.addToast('여행 계획 생성이 완료되었습니다! ✈️', 'success');
                // Optional: We could emit an event or let the user navigate manually via the Plan tab.
            } else {
                toastStore.addToast('계획 생성 응답이 올바르지 않습니다.', 'warning');
            }
        } catch (error) {
            console.error('Plan suggestion error:', error);
            toastStore.addToast('계획 생성 중 오류가 발생했습니다.', 'error');
        } finally {
            isGeneratingPlan.value = false;
        }
    };

    const suggestRandomPlan = async (sidoCode, gugunCode, startDate, endDate, regionName) => {
        console.log("Store: suggestRandomPlan called with", { sidoCode, gugunCode, startDate, endDate, regionName });
        isGeneratingPlan.value = true;
        let loadingToastId = null;
        try {
            loadingToastId = toastStore.addToast('AI가 랜덤 여행 계획을 생성하고 있습니다. 🎲', 'info', 3000);

            const response = await planApi.suggestRandomPlan(sidoCode, gugunCode, startDate, endDate, regionName);
            console.log("suggestRandomPlan response:", response);

            if (response) {
                const newPlanId = response.id || response.planId;
                toastStore.addToast('여행 계획 생성이 완료되었습니다! 🎲', 'success');
            } else {
                toastStore.addToast('계획 생성 응답이 올바르지 않습니다.', 'warning');
            }
        } catch (error) {
            console.error('Random Plan suggestion error:', error);
            toastStore.addToast('계획 생성 중 오류가 발생했습니다.', 'error');
        } finally {
            isGeneratingPlan.value = false;
        }
    };

    const fetchPlans = async (params = {}) => {
        isFetchingPlans.value = true;
        try {
            const data = await planApi.getPlans({
                pageNum: 1,
                pageSize: 100, // Fetch enough for now, or implement strict pagination later
                ...params
            });

            // The interceptor returns response.data.data if success is true
            // So 'data' here is the inner data object containing 'list'
            if (data && data.list) {
                plans.value = data.list;
                totalCount.value = data.totalCount;
            } else {
                console.error("Failed to fetch plans: Invalid structure", data);
            }
        } catch (error) {
            console.error("Error fetching plans:", error);
            // Error might be the rejected response object from interceptor
            const msg = error?.message || '여행 계획을 불러오는 중 오류가 발생했습니다.';
            toastStore.addToast(msg, 'error');
        } finally {
            isFetchingPlans.value = false;
        }
    };

    const fetchPlanDetails = async (planId) => {
        try {
            const response = await planApi.getPlanDetails(planId);
            // Handling wrapped response depending on axios interceptor
            // The interceptor returns res.data if success is true. 
            // The API response user showed has structure: { message, data: [...], ... }
            // So 'response' here should be the 'data' array if the interceptor unwraps it completely?
            // Let's check api/index.js again.
            // api/index.js: `if (res.success) { return res.data; }`
            // API Response: `data: [ { ... } ]`
            // So `response` will be `[ { ... } ]`.
            return response || [];
        } catch (error) {
            console.error("Error fetching plan details:", error);
            toastStore.addToast('세부 계획을 불러오는 중 오류가 발생했습니다.', 'error');
            return [];
        }
    };

    const savePlanDetails = async (planId, todoList) => {
        try {
            const response = await planApi.updatePlanDetails(planId, todoList);
            // Response structure: { message, data: { toDoItems: [...] }, ... }
            // Interceptor returns `res.data` -> `{ toDoItems: [...] }`
            if (response && response.toDoItems) {
                toastStore.addToast('계획이 성공적으로 저장되었습니다!', 'success');
                return response.toDoItems;
            }
            return null;
        } catch (error) {
            console.error("Error saving plan details:", error);
            toastStore.addToast('계획 저장 중 오류가 발생했습니다.', 'error');
            throw error;
        }
    };

    const deletePlan = async (planId) => {
        try {
            await planApi.deletePlan(planId);
            toastStore.addToast('계획이 삭제되었습니다.', 'success');
            // Remove from local plans if exists
            plans.value = plans.value.filter(p => p.id !== planId);
            return true;
        } catch (error) {
            console.error("Error deleting plan:", error);
            toastStore.addToast('계획 삭제 중 오류가 발생했습니다.', 'error');
            return false;
        }
    };

    const ongoingPlans = computed(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return plans.value.filter(plan => {
            const end = new Date(plan.endDate);
            return end >= today;
        });
    });

    const pastPlans = computed(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return plans.value.filter(plan => {
            const end = new Date(plan.endDate);
            return end < today;
        });
    });

    return {
        isGeneratingPlan,
        plans,
        isFetchingPlans,
        suggestPlan,
        suggestRandomPlan,
        fetchPlans,
        fetchPlanDetails,
        savePlanDetails,
        deletePlan,
        ongoingPlans,
        pastPlans
    };
});
