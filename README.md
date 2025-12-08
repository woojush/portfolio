## Shin Woo-Ju Personal Site

Next.js (App Router) + TypeScript + Tailwind CSS 기반의 개인 아카이브 / 스토리형 이력서 웹입니다.

### Tech Stack

- Next.js 14 (App Router, SSG/SSR 지원)
- React 18
- TypeScript
- Tailwind CSS

### Run

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 에 접속하면 됩니다.


### Firebase 설정 방법

1. **Firebase 프로젝트 및 Web 앱 생성**

   - [Firebase 콘솔](https://console.firebase.google.com/)에서 새 프로젝트를 생성합니다.
   - "앱 추가"에서 Web 앱을 선택하고, 앱을 등록합니다.
   - 등록이 완료되면 `firebaseConfig` 객체( apiKey, authDomain, projectId 등 )를 확인할 수 있습니다.

2. **환경 변수 설정 (.env.local)**

   - 이 저장소 루트에 있는 `.env.example` 파일을 복사해서 `.env.local` 파일을 만듭니다.
   - 아래 항목에 Firebase 콘솔에서 발급받은 값을 채워 넣습니다.

   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
   NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID

   # Admin 편집용 6자리 코드 예시 (원하는 값으로 변경)
   EDITOR_CODE=123456
   ```

   - `.env.local` 파일은 Git에 커밋하지 않아야 합니다. (일반적으로 `.gitignore`에 포함합니다.)

3. **Firestore Database 생성 및 test 컬렉션 추가**

   - Firebase 콘솔에서 Firestore Database를 생성합니다(프로덕션 모드 또는 테스트 모드 선택).
   - Firestore에서 `test` 라는 이름의 컬렉션을 만들고, 문서를 하나 추가합니다.
     - 문서 ID는 자동 생성으로 두어도 되고, 직접 지정해도 됩니다.
     - 필드 예시:

       ```json
       {
         "message": "Hello from Firestore"
       }
       ```

4. **연결 테스트**

   - 개발 서버를 실행합니다.

     ```bash
     npm run dev
     ```

   - 브라우저에서 `http://localhost:3000/test-firebase` 로 이동합니다.
   - Firestore 설정이 올바르면 `test` 컬렉션의 문서들이 작은 카드 형태로 표시됩니다.
   - 문서가 없다면 "문서가 없습니다" 라는 안내가 나오므로, 콘솔에서 문서를 추가한 뒤 새로고침하면 됩니다.


