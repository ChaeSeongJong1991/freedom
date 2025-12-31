'use client';

import React, { useMemo, useEffect, useState } from 'react';
import {
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
    Area,
    ComposedChart,
} from 'recharts';
import { useCalculatorStore } from '@/store/calculatorStore';
import { calculateProjection } from '@/lib/calculator';
import { formatLargeAmount } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const WealthChart = () => {
    const state = useCalculatorStore();
    const [isMounted, setIsMounted] = useState(false);

    // Next.js SSR Hydration 오류 방지
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 입력값 변경 시에만 연산 수행 (Memoization)
    const chartData = useMemo(() => {
        const fullData = calculateProjection({
            ...state,
            monthlySaving: state.monthlySavings // Map store -> logic
        });

        // Find the index where paradise is reached
        const paradiseIndex = fullData.findIndex(d => d.isParadise);

        // If paradise is reached, show data up to that point (plus 5 years for context, or strict?)
        // User said "until", but a little context is visually better. 
        // Let's stick to strict "until" + 1 year to show the cross clearly, 
        // OR if the user purely wants to see the "Runway to Paradise".

        if (paradiseIndex !== -1) {
            // Option: Show +2 years buffer to visualize the crossing
            const buffer = 2;
            return fullData.slice(0, Math.min(paradiseIndex + 1 + buffer, fullData.length));
        }

        return fullData;
    }, [state]);

    // 낙원 도달 시점(Golden Cross) 찾기
    const paradisePoint = chartData.find((d) => d.isParadise);

    if (!isMounted) return <div className="h-[400px] w-full animate-pulse bg-slate-100 rounded-lg" />;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">자산 성장 및 자본소득 전망 (실질가치)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="age"
                                unit="세"
                                tick={{ fontSize: 12 }}
                                tickMargin={10}
                            />
                            <YAxis
                                yAxisId="left"
                                tickFormatter={(value) => formatLargeAmount(value)}
                                tick={{ fontSize: 12 }}
                                label={{ value: '총 자산', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#64748b' }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tickFormatter={(value) => formatLargeAmount(value)}
                                tick={{ fontSize: 12 }}
                                hide={false} // 자본소득 규모가 작을 경우 대비
                                label={{ value: '월 소득', angle: 90, position: 'insideRight', fontSize: 12, fill: '#64748b' }}
                            />
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="top" height={36} />

                            {/* 전체 자산 곡선 (Area로 하단 채우기) */}
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="totalAssets"
                                name="총 자산"
                                stroke="#2563eb"
                                fill="#3b82f6"
                                fillOpacity={0.1}
                                strokeWidth={2}
                            />

                            {/* 월 자본소득 (Line) */}
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="passiveIncome"
                                name="월 자본소득"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={false}
                            />

                            {/* 목표 지출선 (Reference Line) */}
                            <ReferenceLine
                                yAxisId="right"
                                y={state.targetMonthlySpending}
                                label={{ position: 'right', value: '목표 지출', fill: '#f43f5e', fontSize: 12 }}
                                stroke="#f43f5e"
                                strokeDasharray="5 5"
                            />

                            {/* 낙원 도달 시점 하이라이트 */}
                            {paradisePoint && (
                                <ReferenceLine
                                    yAxisId="left"
                                    x={paradisePoint.age}
                                    stroke="#fbbf24"
                                    label={{ position: 'top', value: `경제적 자유 달성 (${paradisePoint.age}세)`, fill: '#d97706', fontSize: 12, fontWeight: 'bold' }}
                                />
                            )}
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

// 커스텀 툴팁: 한국인 유저에게 친숙한 포맷
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border rounded-lg shadow-lg">
                <p className="font-bold text-slate-900 mb-2">{`${label}세 (은퇴 ${Number(label) - 35 > 0 ? Number(label) - 35 : 0}년차 예상)`}</p>
                <p className="text-sm text-blue-600">
                    총 자산: <span className="font-semibold">{Number(payload[0].value).toLocaleString()}원</span>
                </p>
                {payload[1] && (
                    <p className="text-sm text-emerald-600">
                        월 자본소득: <span className="font-semibold">{Number(payload[1].value).toLocaleString()}원</span>
                    </p>
                )}
            </div>
        );
    }
    return null;
};
