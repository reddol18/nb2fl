<template>
  <div>
    <h1>SEO 정보 가져오기</h1>
    <input type="text" v-model="urlInput" placeholder="URL을 입력하세요" />
    <button @click="fetchSeoInfo">정보 가져오기</button>

    <div v-if="seoInfo">
      <h2>SEO 정보</h2>
      <img v-if="seoInfo.thumbnail" :src="getProxiedImageUrl(seoInfo.thumbnail)" alt="Thumbnail" style="max-width: 200px;" />
      <h3>{{ seoInfo.title }}</h3>
      <p>{{ seoInfo.description }}</p>
      <input type="password" v-model="password" placeholder="6자리 비밀번호" />
      <button @click="confirmAndRedirect">확인</button>
    </div>

    <div v-if="generatedUrl">
      <h3>생성된 URL:</h3>
      <p>{{ generatedUrl }}</p>
      <h3>유니크 식별자:</h3>
      <p>{{ uniqueId }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { SeoInfo, GenerateRedirectUrlResponse } from '../types'; // 타입 임포트

const urlInput = ref<string>('');
const password = ref<string>('');
const seoInfo = ref<SeoInfo | null>(null); // SeoInfo 타입 적용
const generatedUrl = ref<string | null>(null);
const uniqueId = ref<string | null>(null);
const router = useRouter();

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL as string; // 환경 변수 타입 지정

// 썸네일 이미지를 프록시하는 함수
const getProxiedImageUrl = (originalImageUrl: string) => {
  if (!originalImageUrl) return '';
  return `${API_BASE_URL}/proxy-image?url=${encodeURIComponent(originalImageUrl)}`;
};

async function fetchSeoInfo(): Promise<void> {
  if (!urlInput.value) {
    alert('URL을 입력해주세요.');
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/get-seo?url=${encodeURIComponent(urlInput.value)}`);
    console.log(response);
    if (!response.ok) throw new Error('SEO 정보를 가져오지 못했습니다.');
    seoInfo.value = (await response.json()) as SeoInfo; // 타입 캐스팅
  } catch (error) {
    console.error('Error fetching SEO info:', error);
    alert('SEO 정보를 가져오는 데 실패했습니다.');
  }
}

async function confirmAndRedirect(): Promise<void> {
  if (!seoInfo.value) return;

  try {
    const response = await fetch(`${API_BASE_URL}/generate-redirect-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_url: urlInput.value,
        title: seoInfo.value.title,
        description: seoInfo.value.description,
        thumbnail: seoInfo.value.thumbnail,
        password: password.value,
      }),
    });
    if (!response.ok) throw new Error('URL 생성에 실패했습니다.');
    const data = (await response.json()) as GenerateRedirectUrlResponse; // 타입 캐스팅
    generatedUrl.value = data.redirectUrl;
    uniqueId.value = data.uniqueId;
  } catch (error) {
    console.error('Error generating redirect URL:', error);
    alert('리다이렉트 URL 생성에 실패했습니다.');
  }
}

</script>