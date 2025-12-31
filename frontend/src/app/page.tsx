'use client';

import React, { useRef } from 'react';
import { InputSection } from '@/components/calculator/InputSection';
import { WealthChart } from '@/components/calculator/WealthChart';
import { KpiBoard } from '@/components/calculator/KpiBoard';
import ComparisonChart from '@/components/calculator/ComparisonChart';
import ShareableSummaryCard from '@/components/calculator/ShareableSummaryCard';
import ShareButton from '@/components/calculator/ShareButton';

export default function ParadiseCalculatorPage() {
  // 1. 캡처 대상 요소를 가리킬 Ref 생성
  const shareCardRef = useRef<HTMLDivElement>(null);

  return (
    <main className="min-h-screen bg-slate-50/50 pb-20">
      {/* 상단 헤더 영역 */}
      <header className="w-full border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            경제적 자유
          </h1>
          <div className="text-sm text-slate-500 font-medium">
            {new Date().toLocaleDateString('ko-KR')} 기준 시뮬레이션
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: 입력 제어판 (Sticky 적용으로 차트를 보며 조절 가능) */}
          <section className="lg:col-span-4 space-y-6">
            <div className="lg:sticky lg:top-24">
              <InputSection />
              <p className="mt-4 text-xs text-slate-400 leading-relaxed px-2">
                * 본 계산기는 실질 수익률(인플레이션 반영)을 기준으로 하며, 세금 및 기타 금융 변수에 따라 실제 결과와 다를 수 있습니다.
              </p>
            </div>
          </section>

          {/* Right Column: 시각화 및 결과 지표 */}
          <section className="lg:col-span-8 space-y-8">
            {/* KPI 보드 옆이나 아래에 공유 버튼 배치 */}
            <div className="flex justify-end">
              <ShareButton targetRef={shareCardRef} />
            </div>

            {/* KPI 보드: 요약 수치를 최상단에 배치하여 가독성 확보 */}
            <KpiBoard />

            {/* 메인 차트 */}
            <WealthChart />

            {/* 시나리오 비교 차트 (New Feature) */}
            <ComparisonChart />
          </section>

        </div>
      </div>

      {/* 중요: 캡처용 카드는 화면 밖에 숨겨둡니다. 
        display: none을 쓰면 캡처가 안 되므로 position을 이용해 숨깁니다.
      */}
      <div className="fixed top-[-9999px] left-[-9999px] pointer-events-none">
        <ShareableSummaryCard ref={shareCardRef} />
      </div>

    </main>
  );
}
