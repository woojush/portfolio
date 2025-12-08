import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'missing key' }, { status: 500 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 사용 가능한 모델 순서대로 시도 (flash가 가장 빠르고 저렴)
    // 실제 사용 가능한 모델: models/gemini-2.5-flash, models/gemini-2.5-pro, models/gemini-2.0-flash
    const modelsToTry = [
      'models/gemini-2.5-flash',  // 최신 버전, 가장 빠름
      'models/gemini-2.0-flash',  // 대체
      'models/gemini-2.5-pro',    // 더 정확하지만 느림
      'gemini-2.5-flash',         // 접두사 없이도 시도
      'gemini-2.0-flash'
    ];
    let lastError: any = null;
    let responseMessage = '';
    let usedModel = '';
    const failedModels: string[] = [];
    
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('짧게 인사해줘');
        responseMessage = result.response.text();
        usedModel = modelName;
        break; // 성공하면 중단
      } catch (err: any) {
        failedModels.push(modelName);
        lastError = err;
        // 404가 아니면 다른 오류이므로 중단
        if (!err?.message?.includes('404') && !err?.message?.includes('not found')) {
          throw err;
        }
        // 404면 다음 모델 시도
        continue;
      }
    }
    
    if (!responseMessage) {
      const errorMsg = `모든 모델 시도 실패. 시도한 모델: ${failedModels.join(', ')}. 마지막 오류: ${lastError?.message || '알 수 없는 오류'}`;
      throw new Error(errorMsg);
    }
    
    return NextResponse.json({ message: responseMessage, model: usedModel });
  } catch (err: any) {
    let errorMessage = 'AI request failed';
    let statusCode = 500;
    
    if (err?.message?.includes('429') || err?.status === 429) {
      errorMessage = 'API 할당량이 초과되었습니다. 잠시 후 다시 시도해주세요.';
      statusCode = 429;
    } else if (err?.message?.includes('401') || err?.status === 401) {
      errorMessage = 'API 키가 유효하지 않습니다. GEMINI_API_KEY를 확인해주세요.';
      statusCode = 401;
    } else {
      errorMessage = err?.message || (typeof err === 'string' ? err : 'AI request failed');
    }
    
    console.error('Gemini error:', err);
    return NextResponse.json(
      { error: errorMessage, detail: err?.message || errorMessage },
      { status: statusCode }
    );
  }
}
