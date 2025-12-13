'use client';

// 이미지 슬라이더 컴포넌트 - 여러 이미지를 좌우로 넘기며 볼 수 있게 함

import { useState } from 'react';

interface ImageSliderProps {
  images: Array<{ src: string; alt: string }>;
}

export function ImageSlider({ images }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) return null;
  if (images.length === 1) {
    return (
      <div className="my-4">
        <img 
          src={images[0].src} 
          alt={images[0].alt} 
          className="rounded-lg max-w-full w-1/2" 
        />
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="my-4 relative w-1/2">
      {/* 이미지 컨테이너 */}
      <div className="relative overflow-hidden rounded-lg bg-slate-100">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <img
                src={image.src}
                alt={image.alt || `이미지 ${index + 1}`}
                className="w-full h-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 네비게이션 버튼 */}
      {images.length > 1 && (
        <>
          {/* 이전 버튼 */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition"
            aria-label="이전 이미지"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* 다음 버튼 */}
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition"
            aria-label="다음 이미지"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* 인디케이터 */}
          <div className="flex justify-center gap-2 mt-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition ${
                  index === currentIndex
                    ? 'w-6 bg-black'
                    : 'w-2 bg-slate-300'
                }`}
                aria-label={`이미지 ${index + 1}로 이동`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

