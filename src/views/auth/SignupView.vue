<template>
  <div class="signup-container">
    <div class="header">
      <button class="icon-btn back-btn" @click="$router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h2 class="header-title">회원가입</h2>
      <div class="placeholder"></div>
    </div>

    <div class="content">
      <div class="input-group">
        <label class="label">이메일</label>
        <div class="email-input-wrapper">
          <input 
            type="email" 
            v-model="email" 
            placeholder="이메일을 입력하세요" 
            class="input-field email-field" 
            :disabled="isVerified"
          />
          <button 
            class="action-btn-small" 
            @click="sendCode" 
            :disabled="isVerified || !email"
            v-if="!isVerified"
          >
            이메일 인증
          </button>
        </div>
        <span v-if="isVerified" class="verified-text">확인완료</span>
      </div>

      <div class="input-group" v-if="isCodeSent && !isVerified">
        <div class="email-input-wrapper">
          <input 
            type="text" 
            v-model="verificationCode" 
            placeholder="인증 코드를 입력하세요" 
            class="input-field email-field" 
          />
          <button class="action-btn-small" @click="verifyCode">확인</button>
        </div>
      </div>

      <div class="input-group">
        <label class="label">비밀번호</label>
        <input type="password" v-model="password" placeholder="비밀번호를 입력하세요" class="input-field" />
      </div>

      <div class="input-group">
        <label class="label">이름</label>
        <input type="text" v-model="name" placeholder="이름을 입력하세요" class="input-field" />
      </div>

      <div class="input-group">
        <label class="label">닉네임</label>
        <input type="text" v-model="nickname" placeholder="닉네임을 입력하세요" class="input-field" />
      </div>

      <div class="input-group">
        <label class="label">생년월일</label>
        <input type="date" v-model="birthdate" class="input-field" />
      </div>

      <div class="input-group">
        <label class="label">자기소개</label>
        <textarea v-model="description" placeholder="자기소개를 입력하세요" class="input-field textarea-field"></textarea>
      </div>

      <button class="signup-submit-btn" @click="handleSignup" :disabled="!isVerified">가입하기</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const password = ref('');
const name = ref('');
const nickname = ref('');
const birthdate = ref('');
const description = ref('');

// Verification State
const isCodeSent = ref(false);
const verificationCode = ref('');
const isVerified = ref(false);

const sendCode = () => {
  if (!email.value) return;
  console.log('Sending code to:', email.value);
  // Mock sending code
  // TODO: email 중복확인 api 호출 -> email 중복시 alert | email 중복아닐시 인증번호 전송 api 호출
  alert(`인증 코드가 ${email.value}로 전송되었습니다.`);
  isCodeSent.value = true;
};

const verifyCode = () => {
  console.log('Verifying code:', verificationCode.value);
  // Mock verification
  if (verificationCode.value === '1234') { // Mock code
    isVerified.value = true;
    isCodeSent.value = false;
    alert('이메일 인증이 완료되었습니다.');
  } else {
    alert('인증 코드가 올바르지 않습니다. (테스트 코드: 1234)');
  }
};

const handleSignup = () => {
  if (!isVerified.value) {
    alert('이메일 인증을 완료해주세요.');
    return;
  }
  
  console.log('Signup with:', {
    email: email.value,
    password: password.value,
    name: name.value,
    nickname: nickname.value,
    birthdate: birthdate.value,
    description: description.value
  });
  // Implement signup logic here
  alert('회원가입이 완료되었습니다.');
  router.push({ name: 'login' });
};
</script>

<style scoped>
.signup-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: white;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  padding-top: calc(12px + env(safe-area-inset-top));
  background: white;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.icon-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.placeholder {
  width: 24px;
}

.content {
  flex: 1;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
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
}

.signup-submit-btn {
  margin-top: 12px;
  padding: 16px;
  background: #87CEEB; /* My Plan button color */
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s;
  margin-bottom: 40px;
}

.signup-submit-btn:active {
  transform: scale(0.98);
}

.textarea-field {
  min-height: 100px;
  resize: vertical;
}

.email-input-wrapper {
  display: flex;
  gap: 8px;
}

.email-field {
  flex: 1;
}

.action-btn-small {
  padding: 0 16px;
  background: #333;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.action-btn-small:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.verified-text {
  font-size: 12px;
  color: #4CAF50;
  font-weight: 600;
  margin-top: 4px;
}
</style>
