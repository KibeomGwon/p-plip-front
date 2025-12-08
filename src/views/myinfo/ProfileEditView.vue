<template>
  <AppPage class="profile-edit-page">
    <AppHeader title="프로필 수정">
      <template #right>
        <button class="save-btn" @click="saveProfile">저장</button>
      </template>
    </AppHeader>

    <div class="content">
      <!-- Profile Image -->
      <div class="profile-image-section">
        <div class="image-wrapper" @click="triggerImageUpload">
          <img :src="profileImage" alt="Profile" class="profile-img" />
          <div class="edit-overlay">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <input type="file" ref="fileInput" accept="image/*" @change="handleImageChange" style="display: none;" />
      </div>

      <!-- Form Fields -->
      <div class="form-group">
        <label class="label">이메일</label>
        <input type="email" v-model="email" class="input-field" disabled />
      </div>

      <div class="form-group">
        <label class="label">닉네임</label>
        <input type="text" v-model="nickname" class="input-field" placeholder="닉네임을 입력하세요" />
      </div>

      <div class="form-group">
        <label class="label">생년월일</label>
        <input type="date" v-model="birthdate" class="input-field" disabled />
      </div>

      <div class="form-group">
        <label class="label">자기소개</label>
        <textarea v-model="description" class="input-field textarea-field" placeholder="자기소개를 입력하세요"></textarea>
      </div>
    </div>
  </AppPage>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppHeader from '@/components/common/AppHeader.vue';
import AppPage from '@/components/common/AppPage.vue';

const router = useRouter();
const fileInput = ref(null);

// Form Data
const email = ref('');
const nickname = ref('');
const birthdate = ref('');
const description = ref('');
const profileImage = ref('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80');

// Mock API Call to fetch user data
onMounted(() => {
  // Simulate API delay
  setTimeout(() => {
    email.value = 'alex@example.com';
    nickname.value = '탐험가 Alex';
    birthdate.value = '1995-05-20';
    description.value = '여행을 사랑하는 탐험가입니다. 새로운 곳을 찾아 떠나는 것을 좋아해요!';
  }, 100);
});

const triggerImageUpload = () => {
  fileInput.value.click();
};

const handleImageChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      profileImage.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const saveProfile = () => {
  console.log('Saving profile:', {
    nickname: nickname.value,
    description: description.value,
    profileImage: profileImage.value
  });
  // Implement save logic here (API call)
  alert('프로필이 수정되었습니다.');
  router.back();
};
</script>

<style scoped>

.profile-edit-page {
  background-color: white; /* Override default gray from AppPage */
}

.profile-edit-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: white;
  touch-action: none; /* Prevent whole page drag */
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  padding-top: calc(12px + env(safe-area-inset-top));
  background: white;
  border-bottom: 1px solid #f0f0f0;
}

/* Header Replaced */

.save-btn {
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: #007bff;
  cursor: pointer;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  touch-action: pan-y; /* Allow vertical scrolling */
  overscroll-behavior: contain;
}

.profile-image-section {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.image-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
}

.profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-wrapper:hover .edit-overlay {
  opacity: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 14px;
  font-weight: 600;
  color: #666;
}

.input-field {
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 12px;
  font-size: 16px;
  background: #f9f9f9;
  outline: none;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: #87CEEB;
  background: white;
}

.input-field:disabled {
  background: #f0f0f0;
  color: #999;
  cursor: not-allowed;
}

.textarea-field {
  min-height: 120px;
  resize: none;
}
</style>
