# 홈 화면 이미지 추가 가이드

## 방법 1: 정적 이미지 파일 사용 (추천)

### 단계:
1. 이미지 파일을 `public/images/` 폴더에 저장
   - 예: `public/images/hero-background.jpg`
   - 권장 형식: JPG, PNG, WebP
   - 권장 크기: 1920x1080 이상 (고해상도)

2. `.env.local` 파일에 이미지 경로 추가:
   ```env
   NEXT_PUBLIC_HERO_IMAGE_URL=/images/hero-background.jpg
   ```

3. 개발 서버 재시작:
   ```bash
   npm run dev
   ```

### 이미지 최적화 팁:
- **크기**: 1920x1080px 이상 권장 (배경 이미지용)
- **파일 크기**: 500KB 이하 권장 (로딩 속도)
- **형식**: WebP > JPG > PNG 순서로 권장
- **압축**: [TinyPNG](https://tinypng.com/) 또는 [Squoosh](https://squoosh.app/) 사용

---

## 방법 2: 외부 URL 사용

### 단계:
1. 이미지를 호스팅 서비스에 업로드
   - [Cloudinary](https://cloudinary.com/) (무료)
   - [Imgur](https://imgur.com/) (무료)
   - [GitHub](https://github.com/) (무료, 저장소에 이미지 업로드)
   - [Unsplash](https://unsplash.com/) (무료 스톡 이미지)

2. `.env.local` 파일에 URL 추가:
   ```env
   NEXT_PUBLIC_HERO_IMAGE_URL=https://example.com/path/to/image.jpg
   ```

3. 개발 서버 재시작

---

## 방법 3: Firestore에서 관리 (향후 구현)

관리자 페이지에서 이미지 URL을 동적으로 변경할 수 있도록 구현 가능합니다.

---

## 현재 상태

- ✅ 정적 이미지 지원 (`/images/` 경로)
- ✅ 환경 변수 지원 (`NEXT_PUBLIC_HERO_IMAGE_URL`)
- ⏳ Firestore 동적 관리 (TODO)

---

## 이미지 스타일 추천

현재 홈 페이지는 어두운 테마이므로:
- **분위기**: 조용하고 차분한 느낌
- **색상**: 어두운 톤, 따뜻한 베이지/그린 악센트와 잘 어울리는 이미지
- **구도**: 단순하고 미니멀한 구도
- **예시**: 
  - 자연 풍경 (숲, 바다, 산)
  - 추상적인 질감
  - 부드러운 그라디언트
  - 작업 공간/책상

---

## 문제 해결

### 이미지가 보이지 않을 때:
1. 파일 경로 확인: `public/images/` 폴더에 파일이 있는지 확인
2. 파일명 확인: 대소문자 구분 주의
3. 환경 변수 확인: `.env.local` 파일이 올바른지 확인
4. 서버 재시작: 환경 변수 변경 후 반드시 재시작
5. 브라우저 캐시: 하드 리프레시 (Cmd+Shift+R / Ctrl+Shift+R)

