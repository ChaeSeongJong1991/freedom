import { CalculatorState, ChartDataPoint } from '@/types/calculator';

export const calculateProjection = (state: CalculatorState): ChartDataPoint[] => {
    const {
        initialCapital,
        monthlySaving,
        annualReturnRate,
        inflationRate,
        targetMonthlySpending,
        currentAge,
    } = state;

    const data: ChartDataPoint[] = [];

    // 1. Calculate Real Annual Return Rate (Fisher Equation)
    // (1 + nominal) = (1 + real) * (1 + inflation)
    // 1 + real = (1 + nominal) / (1 + inflation)
    const realAnnualRate = (1 + annualReturnRate / 100) / (1 + inflationRate / 100) - 1;

    // 2. Calculate Real Monthly Rate
    const realMonthlyRate = Math.pow(1 + realAnnualRate, 1 / 12) - 1;

    let currentAssets = initialCapital;
    const maxAge = 100; // Simulate up to 100 years old

    for (let age = currentAge; age <= maxAge; age++) {
        const year = age - currentAge;

        // Monthly Compounding (12 iterations for the year)
        // We assume savings are added at the end of each month
        for (let month = 0; month < 12; month++) {
            currentAssets = (currentAssets + monthlySaving) * (1 + realMonthlyRate);
        }

        // Monthly Passive Income (Real Value) based on Current Assets and Real Monthly Rate
        // Or simpler: Current Assets * Real Annual / 12?
        // User requested: "Current Assets * Real Monthly Rate"
        const passiveIncome = currentAssets * realMonthlyRate;

        // Paradise Condition: Passive Income >= Target Monthly Spending
        const isParadise = passiveIncome >= targetMonthlySpending;

        data.push({
            age,
            year,
            totalAssets: Math.floor(currentAssets),
            passiveIncome: Math.floor(passiveIncome),
            isParadise,
        });

        // Optional: Break if assets exceed a realistic cap to prevent overflow, 
        // though native number supports up to 1.79E+308, well beyond 1000억 (1E+11)
        if (currentAssets > 1000000000000000) break;
    }

    return data;
};
