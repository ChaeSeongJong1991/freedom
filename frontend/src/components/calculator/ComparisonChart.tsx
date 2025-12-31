'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useCalculatorStore } from '@/store/calculatorStore';
import { calculateProjection } from '@/lib/calculator';
import { formatLargeAmount } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ComparisonChart() {
    const state = useCalculatorStore();

    const combinedData = useMemo(() => {
        // 1. Aggressive Scenario (10%)
        const aggState = {
            ...state,
            initialCapital: state.aggressive.initialCapital,
            monthlySaving: state.aggressive.monthlySaving,
            annualReturnRate: state.aggressive.annualReturnRate,
        };
        const aggData = calculateProjection(aggState);

        // 2. Stable/User Scenario
        // For "Stable", we can either use the `stable` object OR the user's current inputs.
        // Given the input UX, it's better to compare "Current Plan" (User Input) vs "Aggressive".
        // Or if the user wants "Stable (4%)" explicitly.
        // Let's follow the user's code: using `state.stable` explicitly.
        const staState = {
            ...state,
            initialCapital: state.stable.initialCapital,
            monthlySaving: state.stable.monthlySaving,
            annualReturnRate: state.stable.annualReturnRate,
        };
        const staData = calculateProjection(staState);

        // Also calculating "Current User Input" for context? 
        // The user request says "Compare Aggressive vs Stable". Let's stick to that for the chart.

        // 0. Calculate Main Plan to sync cutoff with WealthChart
        const mainState = {
            ...state,
            monthlySaving: state.monthlySavings
        };
        const mainData = calculateProjection(mainState);
        const mainParadiseIndex = mainData.findIndex(d => d.isParadise);

        // Merge data by Age
        const merged = aggData.map((d, i) => ({
            age: d.age,
            aggressiveAssets: d.totalAssets,
            stableAssets: staData[i]?.totalAssets || 0,
            aggIsParadise: d.isParadise,
            staIsParadise: staData[i]?.isParadise || false,
        }));

        // Use Main Chart's cutoff logic
        let cutoffIndex = mainData.length;
        if (mainParadiseIndex !== -1) {
            cutoffIndex = mainParadiseIndex;
        }

        // Apply buffer (same as WealthChart: +2 years)
        const buffer = 2;
        if (mainParadiseIndex !== -1) {
            return merged.slice(0, Math.min(cutoffIndex + 1 + buffer, merged.length));
        }

        return merged;
    }, [state]);

    // Calculate Asset Gap at the final visible point (Economic Freedom or max projection)
    const insightData = useMemo(() => {
        if (combinedData.length === 0) return { age: 0, gap: 0 };
        const lastPoint = combinedData[combinedData.length - 1];
        return {
            age: lastPoint.age,
            gap: lastPoint.aggressiveAssets - lastPoint.stableAssets
        };
    }, [combinedData]);

    return (
        <Card className="w-full shadow-sm border-slate-200">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-800">
                    시나리오 비교: <span className="text-blue-600">공격형(10%)</span> vs <span className="text-slate-500">안정형(4%)</span>
                </CardTitle>
                <p className="text-sm text-slate-500">
                    수익률 차이가 만드는 미래의 격차를 확인하세요.
                </p>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={combinedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="age" unit="세" />
                            <YAxis tickFormatter={(v) => formatLargeAmount(v)} width={60} />
                            <Tooltip
                                formatter={(value: number | string | undefined) => [`${Number(value || 0).toLocaleString()}원`, '']}
                                labelFormatter={(label) => `${label}세`}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend iconType="circle" />

                            {/* 공격적 시나리오: 굵은 파란 실선 */}
                            <Line
                                type="monotone"
                                dataKey="aggressiveAssets"
                                name="공격적 (10%)"
                                stroke="#2563eb"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6 }}
                            />

                            {/* 안정적 시나리오: 연한 회색 점선 */}
                            <Line
                                type="monotone"
                                dataKey="stableAssets"
                                name="안정적 (4%)"
                                stroke="#94a3b8"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                            />

                            <ReferenceLine y={state.targetMonthlySpending * 12 * 25} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: "경제적 자유 가이드라인 (4% 룰)", position: "insideTopRight", fill: "#f43f5e", fontSize: 12 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Gap Analysis Badge */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-start sm:items-center gap-3">
                    <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded shrink-0">Insight</div>
                    <p className="text-sm text-slate-700">
                        {insightData.age}세 시점, 공격적 투자가 안정적 저축보다
                        <span className="font-bold text-blue-700 mx-1">{formatLargeAmount(insightData.gap)}</span>
                        더 많은 자산을 만듭니다. (복리의 효과)
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
