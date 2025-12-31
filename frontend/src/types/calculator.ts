export interface CalculatorState {
    initialCapital: number;
    monthlySaving: number; // Note: State uses 'monthlySavings' usually, checking consistency
    annualReturnRate: number;
    inflationRate: number;
    targetMonthlySpending: number;
    currentAge: number;
}

export interface ChartDataPoint {
    age: number;
    year: number;
    totalAssets: number;
    passiveIncome: number;
    isParadise: boolean;
}
