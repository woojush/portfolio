# Firebase 사용되지 않는 데이터 정리 보고서

## 현재 사용 중인 컬렉션 목록

### 1. **learningEntries** ✅ 사용 중
- 용도: 학습 기록 저장
- 사용 위치: `src/lib/repositories/learningRepository.ts`
- 상태: 활발히 사용 중

### 2. **experienceItems** ✅ 사용 중
- 용도: 경험 기록 저장
- 사용 위치: `src/lib/repositories/experienceRepository.ts`
- 상태: 활발히 사용 중

### 3. **writingEntries** ✅ 사용 중
- 용도: 글쓰기 기록 저장
- 사용 위치: `src/lib/repositories/writingsRepository.ts`
- 상태: 활발히 사용 중

### 4. **journeyItems** ✅ 사용 중
- 용도: 여정/이력 기록 저장
- 사용 위치: `src/lib/repositories/journeyRepository.ts`
- 상태: 활발히 사용 중

### 5. **homepage_settings** ✅ 사용 중
- 용도: 홈페이지 설정 저장 (이미지, 텍스트, 색상 등)
- 사용 위치: `src/lib/repositories/dashboardRepository.ts`
- 상태: 활발히 사용 중

### 6. **dashboard_memos** ✅ 사용 중
- 용도: 오늘 메모 저장
- 사용 위치: `src/lib/repositories/dashboardRepository.ts`
- 상태: 활발히 사용 중

### 7. **dashboard_habit_definitions** ✅ 사용 중
- 용도: 습관 정의 저장
- 사용 위치: `src/lib/repositories/dashboardRepository.ts`
- 상태: 활발히 사용 중

### 8. **dashboard_habit_logs** ✅ 사용 중
- 용도: 습관 로그 저장
- 사용 위치: `src/lib/repositories/dashboardRepository.ts`
- 상태: 활발히 사용 중

### 9. **dashboard_todos** ✅ 사용 중
- 용도: 할 일 목록 저장
- 사용 위치: `src/lib/repositories/dashboardRepository.ts`
- 상태: 활발히 사용 중

### 10. **dashboard_daily_records** ✅ 사용 중
- 용도: 하루 기록 저장 (수면, 기분, 날씨 등)
- 사용 위치: `src/lib/repositories/dashboardRepository.ts`
- 상태: 활발히 사용 중

### 11. **dashboard_goals** ✅ 사용 중
- 용도: 주간/월간 목표 저장
- 사용 위치: `src/lib/repositories/dashboardRepository.ts`
- 상태: 활발히 사용 중

### 12. **dashboard_habit_diagnoses** ✅ 사용 중
- 용도: AI 습관 진단 결과 저장
- 사용 위치: `src/lib/repositories/dashboardRepository.ts`
- 상태: 활발히 사용 중

---

## 삭제 가능한 컬렉션

### 1. **test** ⚠️ 테스트용 컬렉션
- 용도: Firebase 연결 테스트용
- 사용 위치: `src/app/test-firebase/page.tsx`
- 상태: **테스트 페이지이므로 삭제 가능**
- 권장 조치: 
  - `test` 컬렉션의 모든 문서 삭제
  - `src/app/test-firebase/page.tsx` 파일 삭제 (선택사항)

---

## 사용되지 않는 필드 확인

### ExperienceItem
- `title` 필드: 코드에서 사용되지 않음 (대신 `periodLabel`, `category`, `role` 사용)
- 확인 필요: Firestore에 `title` 필드가 있는지 확인

### JourneyItem
- `date` 필드: 코드에서 사용되지 않음 (대신 `period` 사용)
- 확인 필요: Firestore에 `date` 필드가 있는지 확인

### WritingEntry (구버전)
- `type` 필드: `src/lib/firestore/types.ts`에는 없지만 `src/lib/firestore/writings.ts`에 정의됨
- 확인 필요: 실제 Firestore 데이터와 일치하는지 확인

---

## 권장 정리 작업

1. **test 컬렉션 삭제**
   - Firestore 콘솔에서 `test` 컬렉션 전체 삭제
   - 또는 `src/app/test-firebase/page.tsx` 파일만 삭제 (컬렉션은 유지)

2. **사용되지 않는 필드 확인**
   - Firestore에서 실제 데이터 구조 확인
   - 코드와 불일치하는 필드 정리

3. **구버전 파일 정리**
   - `src/lib/firestore/` 폴더의 구버전 파일들 확인
   - `src/lib/repositories/` 폴더의 새 버전과 중복 여부 확인

---

## 주의사항

⚠️ **삭제 전 백업 권장**
- 중요한 데이터가 있을 수 있으므로 삭제 전 Firestore 백업 권장
- 특히 `test` 컬렉션은 테스트 데이터일 가능성이 높지만, 확인 후 삭제 권장
