# Firebase 미사용 데이터 최종 정리 보고서

## ✅ 오류 해결 완료

**문제**: `TypeError: Cannot read properties of undefined (reading 'call')`
**원인**: `LearningSection.tsx`가 `src/lib/firestore/learning.ts`의 `getLearningSubjects()`를 사용했는데, 이 함수가 내부적으로 `getLearningEntries()`를 호출하며 모듈 로딩 문제 발생
**해결**: `LearningSection.tsx`를 `learningRepository.getSubjects()`를 사용하도록 수정 완료

---

## 📊 Firebase 컬렉션 사용 현황

### ✅ 사용 중인 컬렉션 (12개) - **삭제 금지**

#### Dashboard 관련 (7개)
1. `dashboard_memos` - 오늘 메모
2. `dashboard_habit_definitions` - 습관 정의
3. `dashboard_habit_logs` - 습관 기록
4. `dashboard_todos` - 할 일 목록
5. `dashboard_daily_records` - 하루 기록
6. `dashboard_goals` - 주간/월간 목표
7. `dashboard_habit_diagnoses` - AI 습관 진단

#### 콘텐츠 컬렉션 (4개)
8. `learningEntries` - 학습 기록
9. `experienceItems` - 경험 기록
10. `writingEntries` - 글쓰기 기록
11. `journeyItems` - 여정 기록

#### 설정 컬렉션 (1개)
12. `homepage_settings` - 홈페이지 설정

---

## 🗑️ 삭제 가능한 코드 파일

### ✅ 즉시 삭제 가능 (1개)

1. **`src/data/learning.ts`**
   - **이유**: Firestore로 완전히 마이그레이션 완료
   - **사용처**: 없음 (모든 코드가 repository 사용)
   - **삭제 안전도**: ✅ 안전

### ⚠️ 확인 후 삭제 가능 (3개)

2. **`src/data/experience.ts`**
   - **확인 필요**: Firestore 사용 중인지 확인
   - **조치**: 사용하지 않으면 삭제

3. **`src/data/writings.ts`**
   - **확인 필요**: Firestore 사용 중인지 확인
   - **조치**: 사용하지 않으면 삭제

4. **`src/data/journey.ts`**
   - **확인 필요**: Firestore 사용 중인지 확인
   - **조치**: 사용하지 않으면 삭제

### 🔄 리팩토링 후 삭제 가능 (3개)

5. **`src/lib/firestore/learning.ts`**
   - **상태**: 이제 사용되지 않음 (LearningSection 수정 완료)
   - **조치**: ✅ 삭제 가능

6. **`src/lib/firestore/experience.ts`**
   - **상태**: `ExperienceAdminTab.tsx`에서 사용 중
   - **조치**: repository로 마이그레이션 후 삭제

7. **`src/lib/firestore/writings.ts`**
   - **상태**: `WritingsAdminTab.tsx`에서 사용 중
   - **조치**: repository로 마이그레이션 후 삭제

### ✅ 유지 필요 (2개)

8. **`src/lib/firestore/journey.ts`**
   - **이유**: 여러 컴포넌트에서 직접 사용 중
   - **조치**: 유지

9. **`src/data/profile.ts`**
   - **이유**: `HeroContactLinks.tsx`에서 사용 중
   - **조치**: 유지

---

## 📋 삭제 실행 계획

### Phase 1: 즉시 삭제 (안전)
- [x] `src/data/learning.ts` ✅
- [ ] `src/lib/firestore/learning.ts` ✅ (이제 사용 안 함)

### Phase 2: 확인 후 삭제
- [ ] `src/data/experience.ts` (사용 여부 확인 필요)
- [ ] `src/data/writings.ts` (사용 여부 확인 필요)
- [ ] `src/data/journey.ts` (사용 여부 확인 필요)

### Phase 3: 리팩토링 후 삭제
- [ ] `src/lib/firestore/experience.ts` (AdminTab 마이그레이션 필요)
- [ ] `src/lib/firestore/writings.ts` (AdminTab 마이그레이션 필요)

---

## ⚠️ 주의사항

1. **Firebase 컬렉션은 절대 삭제하지 마세요** - 모든 컬렉션이 사용 중입니다
2. **삭제 전에 반드시 사용 여부를 확인하세요**
3. **AdminTab 컴포넌트들은 repository로 마이그레이션 후 삭제하세요**

