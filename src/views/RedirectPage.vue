<template>
  <div>
    <h1>잠시 후 이동합니다...</h1>
    <p v-if="seoData.title">타이틀: {{ seoData.title }}</p>
    <p v-if="seoData.description">설명: {{ seoData.description }}</p>
    <img v-if="seoData.thumbnail" :src="getProxiedImageUrl(seoData.thumbnail)" alt="Thumbnail" />
    <p>원본 URL: <a :href="originalUrl">{{ originalUrl }}</a></p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { SeoInfo } from '../types'; // 타입 임포트
// VueUse/Head 라이브러리 설치 시 사용:
// import { useHead } from '@vueuse/head'; // npm install @vueuse/head

const route = useRoute();
const router = useRouter();
const uniqueId = route.params.id as string; // 라우트 파라미터 타입 지정

const originalUrl = ref<string>('');
const seoData = ref<SeoInfo>({ // SeoInfo 타입 적용
  title: '',
  description: '',
  thumbnail: ''
});

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL as string;

// 썸네일 이미지를 프록시하는 함수
const getProxiedImageUrl = (originalImageUrl: string) => {
  if (!originalImageUrl) return '';
  return `${API_BASE_URL}/proxy-image?url=${encodeURIComponent(originalImageUrl)}`;
};

onMounted(async () => {
  if (!uniqueId) {
    console.error('Unique ID not found in URL');
    router.push('/'); // ID 없으면 홈으로 리다이렉트
    return;
  }

  try {
    // 1. 외부 API 서버에서 해당 식별자의 원본 URL 및 SEO 정보 가져오기
    const response = await fetch(`${API_BASE_URL}/get-seo-by-id/${uniqueId}`);
    if (!response.ok) throw new Error('SEO 정보 가져오기 실패');
    const data = (await response.json()) as SeoInfo & { target_url: string }; // 타입 캐스팅

    originalUrl.value = data.target_url;
    seoData.value.title = data.title;
    seoData.value.description = data.description;
    seoData.value.thumbnail = data.thumbnail;

    // 2. HTML 문서의 <head> 태그에 SEO 정보 동적 삽입
    // useHead 라이브러리 사용 권장
    // useHead({
    //   title: seoData.value.title,
    //   meta: [
    //     { name: 'description', content: seoData.value.description },
    //     { property: 'og:title', content: seoData.value.title },
    //     { property: 'og:description', content: seoData.value.description },
    //     { property: 'og:image', content: seoData.value.thumbnail },
    //     { property: 'og:url', content: window.location.href },
    //   ],
    // });

    // 직접 DOM 조작 (간단한 예시, 라이브러리 사용 권장)
    document.title = seoData.value.title;
    let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = seoData.value.description;

    // OG Tag들도 유사하게 동적으로 추가할 수 있습니다.
    const createOrUpdateMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    createOrUpdateMeta('og:title', seoData.value.title);
    createOrUpdateMeta('og:description', seoData.value.description);
    createOrUpdateMeta('og:image', seoData.value.thumbnail);
    createOrUpdateMeta('og:url', window.location.href);


    // 3. 외부 API 서버에 접속 횟수 증가 요청
    await fetch(`${API_BASE_URL}/record-visit/${uniqueId}`, { method: 'POST' });

    // 4. HTML 문서 로딩 후, 원본 URL로 리다이렉션
    setTimeout(() => {
      window.location.href = originalUrl.value;
    }, 2000); // 2초 후 리다이렉트
  } catch (error) {
    console.error('Error in redirect page:', error);
    alert('잘못된 접근이거나 정보를 가져오지 못했습니다.');
    router.push('/'); // 에러 발생 시 홈 페이지로 리다이렉트
  }
});
</script>