import { defineStore } from "pinia";
import { ref } from 'vue';

export const useFreeBoardStore = defineStore('freeboard', () => {
    // state
    const freeBoards = ref([
      {
        id: 1,
        title: '갑자기 떠난 강릉 바다 후기',
        author: '탐험가 Alex',
        avatarColor: '#E0C3A5',
        likes: 128,
        comments: 12,
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 2,
        title: '즉흥적으로 들어간 카페가 인생 카페',
        author: '카페인중독',
        avatarColor: '#FFB7B2',
        avatarImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
        likes: 201,
        comments: 35,
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 3,
        title: '오늘 발견한 동네 숨은 맛집',
        author: '맛잘알',
        avatarColor: '#E2F0CB',
        avatarImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
        likes: 99,
        comments: 23,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 4,
        title: '나만 알고 싶은 서울 야경 스팟',
        author: '탐험가 Alex',
        avatarColor: '#C7CEEA',
        likes: 87,
        comments: 9,
        image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 5,
        title: '계획 없이 온 제주도 3일차',
        author: '제주앓이',
        avatarColor: '#FFDAC1',
        likes: 42,
        comments: 5,
        image: 'https://images.unsplash.com/photo-1542332205-4da5d5d19266?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 6,
        title: '퇴근 후 급번개로 한강 치맥',
        author: '칼퇴요정',
        avatarColor: '#B5EAD7',
        likes: 155,
        comments: 18,
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
      }
    ]);

    const addFreeBoard = (freeBoard) => {
        freeBoards.value.push(freeBoard);
    };

    const removeFreeBoard = (id) => {
        freeBoards.value = freeBoards.value.filter(freeBoard => freeBoard.id !== id);
    };

    const updateFreeBoard = (updatedBoard) => {
        const index = freeBoards.value.findIndex(board => board.id === updatedBoard.id);
        if (index !== -1) {
            freeBoards.value[index] = { ...freeBoards.value[index], ...updatedBoard };
        }
    };

    const setFreeBoards = (data) => {
        freeBoards.value = data;
    };

    return { freeBoards, addFreeBoard, removeFreeBoard, updateFreeBoard, setFreeBoards };
},
{
    // persist: true
}
);