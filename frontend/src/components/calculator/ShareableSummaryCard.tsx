'use client';

import React, { forwardRef } from 'react';
import { useCalculatorStore } from '@/store/calculatorStore';
import { calculateProjection } from '@/lib/calculator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatKoreanUnit } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

// forwardRef를 사용하여 부모 컴포넌트가 이 DOM에 접근할 수 있게 합니다.
const ShareableSummaryCard = forwardRef<HTMLDivElement>((props, ref) => {
    const state = useCalculatorStore();

    // 0. Calculate Main Plan to sync target age with WealthChart
    const mainState = {
        ...state,
        monthlySaving: state.monthlySavings
    };
    const mainData = calculateProjection(mainState);
    const mainParadiseIndex = mainData.findIndex(d => d.isParadise);

    const aggData = calculateProjection({ ...state, ...state.aggressive });
    const staData = calculateProjection({ ...state, ...state.stable });

    let targetIndex = aggData.length - 1;

    // Use Main Chart's cutoff logic (Economic Freedom Age)
    if (mainParadiseIndex !== -1) {
        targetIndex = mainParadiseIndex;
    } else {
        // If main plan never reaches, default to 70 or simple arbitrary future point
        targetIndex = Math.min(Math.max(70 - state.currentAge, 0), aggData.length - 1);
    }

    // Bound check
    targetIndex = Math.min(targetIndex, aggData.length - 1);

    // 데이터 안전 장치
    if (!aggData[targetIndex] || !staData[targetIndex]) return null;

    const targetAge = aggData[targetIndex].age;
    const aggFinalAsset = aggData[targetIndex].totalAssets;
    const staFinalAsset = staData[targetIndex]?.totalAssets || 0;
    const difference = aggFinalAsset - staFinalAsset;

    return (
        // 캡처용 고정 사이즈 컨테이너 (SNS 공유 최적화 비율)
        <div ref={ref} className="w-[600px] bg-slate-900 p-8 rounded-3xl text-white font-sans antialiased">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                        나의 경제적 자유 계획 리포트
                    </h1>
                    <p className="text-slate-400 text-sm">경제적 자유 시뮬레이션 결과</p>
                </div>
                <Wallet className="w-10 h-10 text-emerald-400 opacity-50" />
            </div>

            <Card className="bg-white/10 border-none backdrop-blur-md mb-6">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-slate-100">{targetAge}세 (경제적 자유 달성 시점) 자산 차이</CardTitle>
                    <CardDescription className="text-slate-300">공격적 투자(연 {state.aggressive.annualReturnRate}%) vs 안정적 저축(연 {state.stable.annualReturnRate}%)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        {difference > 0 ? (
                            <TrendingUp className="w-12 h-12 text-emerald-400" />
                        ) : (
                            <TrendingDown className="w-12 h-12 text-rose-400" />
                        )}
                        <div>
                            <p className="text-sm text-slate-300 mb-1">수익률의 차이가 만든 결과</p>
                            <p className="text-4xl font-extrabold text-emerald-300">
                                {formatKoreanUnit(Math.abs(difference))} {difference > 0 ? '더 많음' : '차이'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-blue-500/20 rounded-xl border border-blue-500/30">
                    <p className="text-slate-300 text-sm mb-2">공격적 시나리오 예상 자산</p>
                    <p className="text-xl font-bold text-blue-300">{formatKoreanUnit(aggFinalAsset)}</p>
                </div>
                <div className="p-4 bg-slate-500/20 rounded-xl border border-slate-500/30">
                    <p className="text-slate-300 text-sm mb-2">안정적 시나리오 예상 자산</p>
                    <p className="text-xl font-bold text-slate-300">{formatKoreanUnit(staFinalAsset)}</p>
                </div>
            </div>

            <div className="mt-8 text-center text-xs text-slate-500">
                * 본 결과는 인플레이션을 반영한 실질 가치 기준 시뮬레이션입니다.
                <br />www.paradise-calculator-pro.com
            </div>
        </div>
    );
});

ShareableSummaryCard.displayName = 'ShareableSummaryCard';
export default ShareableSummaryCard;
