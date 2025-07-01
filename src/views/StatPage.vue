<template>
  <div>
    <h1>통계 조회</h1>
    <input type="text" v-model="uniqueIdInput" placeholder="유니크 식별자 입력" />
    <input type="password" v-model="password" placeholder="6자리 비밀번호" />
    <button @click="fetchVisitCount">조회</button>

    <div v-if="visitCount !== null">
      <h2>접속 횟수: {{ visitCount }}</h2>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { VisitCountResponse } from '../types'; // 타입 임포트

const uniqueIdInput = ref<string>('');
const password = ref<string>('');
const visitCount = ref<number | null>(null); // number 또는 null 타입

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL as string;

async function fetchVisitCount(): Promise<void> {
  if (!uniqueIdInput.value) {
    alert('유니크 식별자를 입력해주세요.');
    return;
  }
  try {
    const response = await fetch(
      `${API_BASE_URL}/get-visit-count`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uniqueId: uniqueIdInput.value,
          password: password.value,
        }),
      }
    );
    if (!response.ok) {
      if (response.status === 404) {
        alert('해당 식별자를 찾을 수 없습니다.');
      } else {
        throw new Error('접속 횟수를 가져오지 못했습니다.');
      }
      visitCount.value = null;
      return;
    }
    const data = (await response.json()) as VisitCountResponse; // 타입 캐스팅
    visitCount.value = data.visitCount;
  } catch (error) {
    console.error('Error fetching visit count:', error);
    alert('접속 횟수를 가져오는 데 실패했습니다.');
  }
}
</script>
