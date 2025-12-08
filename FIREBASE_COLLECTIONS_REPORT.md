# Firebase 컬렉션 사용 현황 보고서

## ✅ 현재 사용 중인 컬렉션

### 1. Dashboard 관련 컬렉션
- `dashboard_memos` - 오늘 메모 저장
- `dashboard_habit_definitions` - 습관 정의
- `dashboard_habit_logs` - 습관 기록
- `dashboard_todos` - 할 일 목록
- `dashboard_daily_records` - 하루 기록 (수면, 기분, 날씨 등)
- `dashboard_goals` - 주간/월간 목표
- `dashboard_habit_diagnoses` - AI 습관 진단 결과

### 2. 콘텐츠 컬렉션
- `learningEntries` - 학습 기록
- `experienceItems` - 경험 기록
- `writingEntries` - 글쓰기 기록
- `journeyItems` - 여정 기록

### 3. 설정 컬렉션
- `homepage_settings` - 홈페이지 설정 (이미지, 텍스트, Navbar 색상 등)

## ❓ 확인 필요: 사용되지 않을 수 있는 컬렉션

### 확인 필요 사항
1. `src/lib/firestore/` 폴더의 파일들이 실제로 사용되는지 확인
   - `learning.ts` - `learningRepository.ts`로 대체되었을 수 있음
   - `experience.ts` - `experienceRepository.ts`로 대체되었을 수 있음
   - `writings.ts` - `writingsRepository.ts`로 대체되었을 수 있음
   - `journey.ts` - `journeyRepository.ts`로 대체되었을 수 있음

2. `src/data/` 폴더의 하드코딩된 데이터
   - `learning.ts` - Firestore로 마이그레이션 완료, 삭제 가능
   - 기타 하드코딩된 데이터 파일들

## 🔍 삭제 가능한 파일/컬렉션 후보

### 코드 파일 (확인 후 삭제 가능)
- `src/lib/firestore/learning.ts` - `src/lib/repositories/learningRepository.ts` 사용 중
- `src/lib/firestore/experience.ts` - `src/lib/repositories/experienceRepository.ts` 사용 중
- `src/lib/firestore/writings.ts` - `src/lib/repositories/writingsRepository.ts` 사용 중
- `src/lib/firestore/journey.ts` - `src/lib/repositories/journeyRepository.ts` 사용 중 (확인 필요)
- `src/data/learning.ts` - Firestore로 마이그레이션 완료

### Firebase 컬렉션
- 위 파일들이 사용하는 컬렉션은 실제로 repository에서도 사용 중이므로 삭제 불가
- 단, 테스트용 컬렉션이나 더미 데이터는 삭제 가능

