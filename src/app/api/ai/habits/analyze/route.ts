import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    // Fallback for logs -> habitLogs to support old/incorrect client payloads
    const { habitDefinitions, dailyRecords, habitId } = body;
    const habitLogs = body.habitLogs || body.logs || [];

    // 데이터 준비 및 통계 계산
    // If habitId is present but habitDefinitions is missing, assume 1 habit
    const totalHabits = habitDefinitions?.length || (habitId ? 1 : 0);
    let allLogs = habitLogs || [];
    // 개별 습관 분석일 경우 해당 습관의 로그만 필터링
    if (habitId) {
      allLogs = allLogs.filter((l: any) => l.habitId === habitId);
    }
    // 성공한 기록만 필터링 (completed가 false가 아닌 것)
    const successfulLogs = allLogs.filter((l: any) => l.completed !== false);
    const totalAttempts = allLogs.length;
    const successCount = successfulLogs.length;
    
    const totalDays = 30;
    // 달성률: (성공 횟수 / (습관 수 * 30일)) * 100
    const achievementRate = totalHabits > 0 && totalDays > 0 
      ? Math.round((successCount / (totalHabits * totalDays)) * 100) 
      : 0;

    // 수면 시간별, 기분별 달성률 계산
    const habitLogsByDate = new Map<string, any[]>();
    allLogs.forEach((log: any) => {
      if (!habitLogsByDate.has(log.date)) {
        habitLogsByDate.set(log.date, []);
      }
      habitLogsByDate.get(log.date)!.push(log);
    });

    const sleepStats: Record<string, { achieved: number; total: number }> = {
      '< 6시간': { achieved: 0, total: 0 },
      '6-8시간': { achieved: 0, total: 0 },
      '8-10시간': { achieved: 0, total: 0 },
      '> 10시간': { achieved: 0, total: 0 }
    };

    const moodStats: Record<string, { achieved: number; total: number }> = {
      '1-2 (나쁨)': { achieved: 0, total: 0 },
      '3 (보통)': { achieved: 0, total: 0 },
      '4-5 (좋음)': { achieved: 0, total: 0 }
    };

    dailyRecords?.forEach((record: any) => {
      const logsOnDate = habitLogsByDate.get(record.date) || [];
      // 개별 습관 분석일 경우 해당 습관의 로그만 필터링
      const relevantLogs = habitId 
        ? logsOnDate.filter((l: any) => l.habitId === habitId)
        : logsOnDate;
      // 해당 날짜에 '성공한' 습관이 하나라도 있으면 달성으로 간주 (상관관계 분석용)
      // 또는 개별 습관 분석일 경우 해당 습관의 성공 여부 확인
      const habitAchieved = relevantLogs.some((l: any) => l.completed !== false);

      // 수면 시간 계산
      let sleepDuration: number | undefined;
      if (record.sleepStart && record.sleepEnd) {
        const [startH, startM] = record.sleepStart.split(':').map(Number);
        const [endH, endM] = record.sleepEnd.split(':').map(Number);
        let startTotal = startH * 60 + startM;
        let endTotal = endH * 60 + endM;
        if (endTotal < startTotal) endTotal += 24 * 60;
        sleepDuration = (endTotal - startTotal) / 60;
      }

      // 기분 평균 계산
      const moods = [record.moodMorning, record.moodNoon, record.moodEvening]
        .filter(m => m !== undefined && m !== null) as number[];
      const avgMood = moods.length > 0 
        ? moods.reduce((a, b) => a + b, 0) / moods.length 
        : undefined;

      // 수면 시간별 통계
      if (sleepDuration !== undefined) {
        let range: string;
        if (sleepDuration < 6) range = '< 6시간';
        else if (sleepDuration < 8) range = '6-8시간';
        else if (sleepDuration < 10) range = '8-10시간';
        else range = '> 10시간';
        
        sleepStats[range].total++;
        if (habitAchieved) sleepStats[range].achieved++;
      }

      // 기분별 통계
      if (avgMood !== undefined) {
        let range: string;
        if (avgMood <= 2) range = '1-2 (나쁨)';
        else if (avgMood <= 3) range = '3 (보통)';
        else range = '4-5 (좋음)';
        
        moodStats[range].total++;
        if (habitAchieved) moodStats[range].achieved++;
      }
    });

    // Gemini에 전달할 프롬프트 생성
    const title = habitId ? "개별 습관 분석 요약" : "전체 습관 분석 요약";
    
    const prompt = `다음 데이터를 바탕으로 습관 성취에 대한 정밀 분석을 한국어로 작성해주세요.
단, 데이터가 부족한 경우("데이터 없음")에는 일반적인 조언보다는 "데이터가 더 모이면 정확한 분석이 가능합니다"라는 뉘앙스로 작성해주세요.

## 입력 데이터
- 분석 대상: ${habitId ? '개별 습관 (ID: ' + habitId + ')' : '전체 습관'}
- 총 습관 수: ${totalHabits}개
- 전체 달성률: ${achievementRate}%
- 총 기록 수: ${totalAttempts}회 (성공: ${successCount}회, 실패/미달성: ${totalAttempts - successCount}회)
- 분석 기간: 최근 30일
- 일일 기록(수면/기분) 데이터 수: ${dailyRecords?.length || 0}일

## 수면 시간별 달성률
${Object.entries(sleepStats)
  .filter(([_, stat]) => stat.total > 0)
  .map(([range, stat]) => {
    const rate = stat.total > 0 ? Math.round((stat.achieved / stat.total) * 100) : 0;
    return `- ${range}: ${rate}% (총 ${stat.total}일 중 ${stat.achieved}일 달성)`;
  })
  .join('\n') || '- 데이터 없음 (수면 기록이 없거나 구간에 해당하지 않음)'}

## 기분별 달성률
${Object.entries(moodStats)
  .filter(([_, stat]) => stat.total > 0)
  .map(([range, stat]) => {
    const rate = stat.total > 0 ? Math.round((stat.achieved / stat.total) * 100) : 0;
    return `- ${range}: ${rate}% (총 ${stat.total}일 중 ${stat.achieved}일 달성)`;
  })
  .join('\n') || '- 데이터 없음 (기분 기록이 없거나 구간에 해당하지 않음)'}

${habitId ? `## 개별 습관 상세 정보
- 이 습관의 총 시도 수: ${allLogs.length}회
- 이 습관의 성공 수: ${successfulLogs.length}회` : ''}

## 요청사항
다음 형식으로 분석 결과를 작성해주세요 (마크다운 형식):

### 📊 ${title}
(달성률과 전반적인 성취도에 대한 2-3줄 요약)

### 🔍 상관관계 분석
(데이터가 있는 경우에만 작성, 없으면 '데이터 부족' 언급)
- 수면 패턴과 습관 성취의 관계
- 기분 상태와 습관 성취의 관계

### 💡 인사이트 및 제안
- 가장 효과적인 컨디션(수면/기분) 분석
- (데이터 기반) 습관 형성을 위한 구체적인 개선 제안 2가지

### 📝 종합 의견
(격려와 함께, 데이터가 부족하다면 꾸준한 기록(수면, 기분 등)을 독려하는 메시지)
`;

    // Gemini API 호출 - 사용 가능한 모델 순서대로 시도 (flash가 가장 빠르고 저렴)
    // 실제 사용 가능한 모델: models/gemini-2.5-flash, models/gemini-2.5-pro, models/gemini-2.0-flash
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = [
      'models/gemini-2.5-flash',  // 최신 버전, 가장 빠름
      'models/gemini-2.0-flash',  // 대체
      'models/gemini-2.5-pro',    // 더 정확하지만 느림
      'gemini-2.5-flash',         // 접두사 없이도 시도
      'gemini-2.0-flash'
    ];
    let lastError: any = null;
    let analysis = '';
    const failedModels: string[] = [];
    
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        analysis = result.response.text();
        break; // 성공하면 중단
      } catch (err: any) {
        failedModels.push(modelName);
        lastError = err;
        
        const errorMessage = err?.message || '';
        
        // 429 (할당량 초과) 오류 처리
        if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests') || errorMessage.includes('quota')) {
          // 재시도 시간 추출 (RetryInfo에서 retryDelay 추출)
          let retryDelay = 60; // 기본값: 60초
          try {
            const retryMatch = errorMessage.match(/Please retry in ([\d.]+)s/i);
            if (retryMatch) {
              retryDelay = Math.ceil(parseFloat(retryMatch[1]));
            } else {
              // JSON에서 추출 시도
              const jsonMatch = errorMessage.match(/retryDelay[":\s]+"?(\d+)"?/i);
              if (jsonMatch) {
                retryDelay = Math.ceil(parseFloat(jsonMatch[1]));
              }
            }
          } catch (e) {
            // 추출 실패 시 기본값 사용
          }
          
          // 다음 모델 시도 (같은 모델이면 건너뛰기)
          const isQuotaExceeded = errorMessage.includes('quota') || errorMessage.includes('Quota exceeded');
          if (isQuotaExceeded && modelName === 'models/gemini-2.5-flash') {
            // 무료 티어 할당량 초과 시 다른 모델로 시도
            continue;
          }
          
          // 모든 모델에서 할당량 초과인 경우
          if (failedModels.length >= modelsToTry.length || isQuotaExceeded) {
            throw {
              ...err,
              quotaExceeded: true,
              retryAfter: retryDelay,
              message: `일일 사용 할당량(20회)을 초과했습니다. 약 ${Math.ceil(retryDelay / 60)}분 후 다시 시도해주세요.`
            };
          }
        }
        
        // 404가 아니면 다른 오류이므로 중단
        if (!errorMessage.includes('404') && !errorMessage.includes('not found')) {
          throw err;
        }
        // 404면 다음 모델 시도
        continue;
      }
    }
    
    if (!analysis) {
      const errorMsg = `모든 모델 시도 실패. 시도한 모델: ${failedModels.join(', ')}. 마지막 오류: ${lastError?.message || '알 수 없는 오류'}`;
      throw new Error(errorMsg);
    }

    return NextResponse.json({ analysis });
  } catch (err: any) {
    let errorMessage = 'AI 분석 중 오류가 발생했습니다.';
    let statusCode = 500;
    let retryAfter: number | undefined;
    
    const errMessage = err?.message || '';
    
    // 할당량 초과 오류 처리
    if (err?.quotaExceeded || errMessage.includes('429') || errMessage.includes('Too Many Requests') || errMessage.includes('quota') || errMessage.includes('Quota exceeded')) {
      statusCode = 429;
      
      // 이미 포맷된 메시지가 있으면 사용, 없으면 기본 메시지
      if (err?.message && !errMessage.includes('[GoogleGenerativeAI Error]')) {
        errorMessage = err.message;
      } else {
        retryAfter = err?.retryAfter || 60;
        const minutes = retryAfter ? Math.ceil(retryAfter / 60) : 1;
        errorMessage = `일일 사용 할당량(20회)을 초과했습니다. 약 ${minutes}분 후 다시 시도해주세요.\n\n무료 플랜은 하루에 20회까지 사용 가능합니다. 내일 다시 시도하거나 유료 플랜으로 업그레이드하세요.`;
      }
    } else if (errMessage.includes('401') || err?.status === 401) {
      errorMessage = 'API 키가 유효하지 않습니다. GEMINI_API_KEY를 확인해주세요.';
      statusCode = 401;
    } else {
      // 기술적 오류 메시지 정리
      if (errMessage.includes('[GoogleGenerativeAI Error]')) {
        // 기술적 세부사항 제거하고 사용자 친화적 메시지로 변환
        if (errMessage.includes('quota') || errMessage.includes('Quota exceeded')) {
          errorMessage = '일일 사용 할당량을 초과했습니다. 내일 다시 시도해주세요.';
          statusCode = 429;
        } else {
          errorMessage = 'AI 분석 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
        }
      } else {
        errorMessage = errMessage || 'AI 분석 중 오류가 발생했습니다.';
      }
    }
    
    console.error('Gemini analysis error:', err);
    return NextResponse.json(
      { 
        error: errorMessage, 
        detail: errMessage,
        retryAfter: retryAfter ? retryAfter : undefined
      },
      { status: statusCode }
    );
  }
}
