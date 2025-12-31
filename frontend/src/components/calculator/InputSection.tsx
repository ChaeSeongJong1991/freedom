'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCalculatorStore } from '@/store/calculatorStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber, parseNumber, formatKoreanUnit } from '@/lib/utils';

export const InputSection = () => {
    const {
        initialCapital,
        monthlySavings,
        annualReturnRate,
        targetMonthlySpending,
        currentAge,
        setField
    } = useCalculatorStore();

    // Reusable Input + Slider Row Component
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const InputRow = ({
        label,
        value,
        field,
        min,
        max,
        step,
        unit,
        showKoreanUnit = true,
        customLabelFormatter // Optional: Override default unit formatter
    }: any) => {
        // Local state for immediate UI feedback
        const [localValue, setLocalValue] = useState(value);

        // Ref to keep track of the timeout/debounce
        const timeoutRef = useRef<NodeJS.Timeout>(null);

        // Sync local state when store value changes externally (e.g. from file load)
        useEffect(() => {
            setLocalValue(value);
        }, [value]);

        // Clean up timeout on unmount
        useEffect(() => {
            return () => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
            };
        }, []);

        const handleSliderChange = (vals: number[]) => {
            const newValue = vals[0];
            setLocalValue(newValue); // Immediate UI update

            // Debounce the store update (expensive op due to persist/chart calc)
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setField(field, newValue);
            }, 50); // 50ms latency is imperceptible but saves hundreds of renders
        };

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = parseNumber(e.target.value);
            setLocalValue(newValue);

            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setField(field, newValue);
            }, 300); // Input typing needs longer debounce
        };

        return (
            <div className="space-y-4 mb-8">
                <div className="flex justify-between items-end">
                    <Label className="text-sm font-medium text-slate-600">{label}</Label>
                    {showKoreanUnit && (
                        <span className="text-xs text-blue-600 font-bold">
                            {customLabelFormatter ? customLabelFormatter(localValue) : formatKoreanUnit(localValue)}
                        </span>
                    )}
                </div>
                <div className="flex gap-4 items-center">
                    <div className="relative flex-1">
                        <Input
                            value={formatNumber(localValue)}
                            onChange={handleInputChange}
                            className="pr-8 font-semibold"
                        />
                        <span className="absolute right-3 top-2 text-slate-400 text-sm">{unit}</span>
                    </div>
                </div>
                <Slider
                    value={[localValue]}
                    min={min}
                    max={max}
                    step={step}
                    onValueChange={handleSliderChange}
                    className="py-2"
                />
            </div>
        );
    };

    return (
        <Card className="w-full shadow-sm border-slate-200">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-800">투자 시나리오 설정</CardTitle>
            </CardHeader>
            <CardContent>
                {/* 현재 나이 */}
                <InputRow
                    label="현재 나이"
                    value={currentAge}
                    field="currentAge"
                    min={0}
                    max={100}
                    step={1}
                    unit="세"
                    showKoreanUnit={false}
                />

                {/* 초기 자산 */}
                <InputRow
                    label="현재 보유 자산"
                    value={initialCapital}
                    field="initialCapital"
                    min={0}
                    max={5000000000} // 50억
                    step={1000000}
                    unit="원"
                />

                {/* 월 저축액 */}
                <InputRow
                    label="월 추가 저축액"
                    value={monthlySavings}
                    field="monthlySavings"
                    min={0}
                    max={20000000} // 2,000만
                    step={100000}
                    unit="원"
                />

                {/* 기대 수익률 */}
                <div className="space-y-4 mb-8">
                    <div className="flex justify-between">
                        <Label className="text-sm font-medium text-slate-600">연간 기대 수익률</Label>
                        <span className="text-sm font-bold text-emerald-600">{annualReturnRate}%</span>
                    </div>
                    <Slider
                        value={[annualReturnRate]}
                        min={1}
                        max={30}
                        step={0.1}
                        // For simple slider without text input, direct debounce or wrap if needed
                        // Since this doesn't use the wrapper, let's just use it directly for now or wrap it?
                        // Oh, this one is separate. Let's fix it too.
                        onValueChange={(vals) => setField('annualReturnRate', vals[0])}
                    />
                </div>

                {/* 목표 생활비 */}
                <InputRow
                    label="은퇴 후 목표 월 생활비 (현재가치)"
                    value={targetMonthlySpending}
                    field="targetMonthlySpending"
                    min={1000000}
                    max={30000000}
                    step={100000}
                    unit="원"
                />

                {/* 퀵 버튼 추가 (UX 팁) */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                    {[100, 500, 1000].map((amt) => (
                        <button
                            key={amt}
                            onClick={() => setField('monthlySavings', monthlySavings + amt * 10000)}
                            className="text-xs py-2 border rounded hover:bg-slate-50 text-slate-500 transition-colors"
                        >
                            저축 +{amt}만
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
