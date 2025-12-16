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

    const suggestPlan = async (attractionId, query = "") => {
        isGeneratingPlan.value = true;
        let loadingToastId = null;

        try {
            // Persistent loading toast (10 minutes)
            loadingToastId = toastStore.addToast('AI 계획 생성중... 🤖', 'info', 600000);

            const response = await planApi.suggestPlan(attractionId, query);
            console.log("suggestPlan response:", response);

            // Remove loading toast before showing result
            if (loadingToastId) toastStore.removeToast(loadingToastId);

            if (response) {
                toastStore.addToast('AI 계획 생성이 완료되었습니다!', 'success');
                // Future: Reload plans or add the new plan to local state

                // Navigate to the newly created plan
                // Assuming response contains the created plan object with 'id'
                // Or if response is the plan itself
                const newPlanId = response.id || response.planId;

                if (newPlanId) {
                    if (confirm('여행 계획이 생성되었습니다. 상세 페이지로 이동하시겠습니까?')) {
                        router.push({ name: 'todo-list', params: { id: newPlanId } });
                    }
                }
            } else {
                // If response is null/undefined but no error throw, obscure case
                toastStore.addToast('계획 생성 응답이 올바르지 않습니다.', 'warning');
            }
        } catch (error) {
            console.error('Plan suggestion error:', error);
            // Remove loading toast in error case too if not reached above
            if (loadingToastId) toastStore.removeToast(loadingToastId);
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
        fetchPlans,
        fetchPlanDetails,
        savePlanDetails,
        deletePlan,
        ongoingPlans,
        pastPlans
    };
});
