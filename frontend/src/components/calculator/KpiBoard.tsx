'use client';

import React, { useMemo } from 'react';
import { useCalculatorStore } from '@/store/calculatorStore';
import { calculateProjection } from '@/lib/calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatLargeAmount, formatKoreanUnit } from '@/lib/utils';
import { Trophy, Clock, Wallet, TrendingUp } from 'lucide-react';

export const KpiBoard = () => {
    const state = useCalculatorStore();
    const { monthlySavings } = state;

    // 데이터 연산 및 핵심 지표 추출
    const { paradisePoint, finalPoint, yearsUntilParadise } = useMemo(() => {
        const data = calculateProjection({
            ...state,
            monthlySaving: monthlySavings // Map store's plural to logic's singular
        });
        const pPoint = data.find((d) => d.isParadise);
        const fPoint = data[data.length - 1];
        const years = pPoint ? pPoint.age - state.currentAge : null;

        return {
            paradisePoint: pPoint,
            finalPoint: fPoint,
            yearsUntilParadise: years
        };
    }, [state, monthlySavings]);

    const kpiData = [
        {
            title: "경제적 자유 달성 시점",
            value: paradisePoint ? `${paradisePoint.age}세` : "도달 불가",
            description: yearsUntilParadise ? `${yearsUntilParadise}년 남음` : "지출/수익률 조정 필요",
            icon: <Trophy className="w-5 h-5 text-amber-500" />,
            color: "text-amber-600"
        },
        {
            title: "은퇴 시 월 소득",
            value: paradisePoint ? formatKoreanUnit(paradisePoint.passiveIncome) : "₩ 0",
            description: "인플레이션 반영 실질 가치",
            icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
            color: "text-emerald-600"
        },
        {
            title: "경제적 자유 달성 자산",
            value: paradisePoint ? formatKoreanUnit(paradisePoint.totalAssets) : "도달 불가",
            description: "목표 달성 시점 순자산",
            icon: <Wallet className="w-5 h-5 text-blue-500" />,
            color: "text-blue-600"
        },
        {
            title: "경제적 자유 준비 기간",
            value: yearsUntilParadise ? `${yearsUntilParadise * 12}개월` : "-",
            description: "목표 달성까지 필요한 시간",
            icon: <Clock className="w-5 h-5 text-slate-500" />,
            color: "text-slate-600"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiData.map((kpi, index) => (
                <Card key={index} className="overflow-hidden border-none shadow-md bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">
                            {kpi.title}
                        </CardTitle>
                        {kpi.icon}
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${kpi.color}`}>
                            {kpi.value}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            {kpi.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
