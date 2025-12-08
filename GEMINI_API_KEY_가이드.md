# Google Gemini API 키 발급 가이드

## 방법 1: Google AI Studio (가장 간단한 방법) ⭐ 추천

### 1단계: Google AI Studio 접속
1. 브라우저에서 [Google AI Studio](https://aistudio.google.com/) 접속
2. Google 계정으로 로그인

### 2단계: API 키 생성
1. 왼쪽 메뉴에서 **"Get API key"** 클릭
2. 또는 상단 메뉴에서 **"Get API key"** 클릭
3. **"Create API key"** 버튼 클릭
4. Google Cloud 프로젝트 선택 (없으면 자동 생성)
5. API 키가 생성되면 **복사** 버튼 클릭

### 3단계: 환경 변수에 추가
`.env.local` 파일에 추가:
```env
GEMINI_API_KEY=여기에_복사한_API_키_붙여넣기
```

---

## 방법 2: Google Cloud Console (더 많은 제어 옵션)

### 1단계: Google Cloud Console 접속
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. Google 계정으로 로그인

### 2단계: 프로젝트 생성 (없는 경우)
1. 상단의 프로젝트 선택 드롭다운 클릭
2. **"새 프로젝트"** 클릭
3. 프로젝트 이름 입력 (예: "my-gemini-project")
4. **"만들기"** 클릭

### 3단계: Gemini API 활성화
1. 왼쪽 메뉴에서 **"API 및 서비스"** > **"라이브러리"** 클릭
2. 검색창에 **"Gemini API"** 입력
3. **"Generative Language API"** 선택
4. **"사용 설정"** 버튼 클릭

### 4단계: API 키 생성
1. 왼쪽 메뉴에서 **"API 및 서비스"** > **"사용자 인증 정보"** 클릭
2. 상단의 **"+ 사용자 인증 정보 만들기"** 클릭
3. **"API 키"** 선택
4. 생성된 API 키 복사

### 5단계: API 키 제한 설정 (보안 권장)
1. 생성된 API 키 옆의 **연필 아이콘** 클릭
2. **"애플리케이션 제한사항"** 섹션에서:
   - **"HTTP 리퍼러(웹사이트)"** 선택
   - **"웹사이트 제한사항"**에 허용할 도메인 추가
   - 또는 **"IP 주소 제한사항"** 설정
3. **"API 제한사항"** 섹션에서:
   - **"키 제한"** 선택
   - **"Generative Language API"**만 선택
4. **"저장"** 클릭

### 6단계: 환경 변수에 추가
`.env.local` 파일에 추가:
```env
GEMINI_API_KEY=여기에_복사한_API_키_붙여넣기
```

---

## 무료 사용량 제한

Google Gemini API는 **무료 티어**를 제공합니다:
- **무료 요청 수**: 분당 15회, 일일 1,500회
- **무료 모델**: `gemini-pro`, `gemini-pro-vision` 등
- **제한**: 일부 고급 모델은 유료

---

## API 키 확인 방법

### 1. 터미널에서 테스트
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"안녕하세요"}]}]}'
```

### 2. 프로젝트에서 테스트
브라우저에서 접속:
```
http://localhost:3000/api/ai/ping
```

---

## 보안 주의사항

⚠️ **중요**: API 키는 절대 공개 저장소(GitHub 등)에 올리지 마세요!

1. `.env.local` 파일은 `.gitignore`에 포함되어 있는지 확인
2. API 키를 코드에 직접 하드코딩하지 않기
3. 프로덕션 환경에서는 환경 변수 사용
4. API 키 제한 설정으로 보안 강화

---

## 문제 해결

### "API key not valid" 오류
- API 키가 올바르게 복사되었는지 확인
- `.env.local` 파일에 정확히 입력되었는지 확인
- 개발 서버를 재시작했는지 확인

### "API not enabled" 오류
- Google Cloud Console에서 Gemini API가 활성화되었는지 확인
- 올바른 프로젝트를 선택했는지 확인

### "Quota exceeded" 오류
- 무료 사용량 제한을 초과했을 수 있음
- 잠시 후 다시 시도하거나 유료 플랜으로 업그레이드

---

## 참고 링크

- [Google AI Studio](https://aistudio.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Gemini API 문서](https://ai.google.dev/docs)
- [API 키 관리](https://console.cloud.google.com/apis/credentials)

