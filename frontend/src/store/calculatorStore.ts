import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { CalculatorState as SharedCalculatorState } from '@/types/calculator';

// Define Scenario specific fields
interface Scenario {
    initialCapital: number;
    monthlySaving: number;
    annualReturnRate: number;
}

interface CalculatorStore extends Omit<SharedCalculatorState, 'monthlySaving'> {
    monthlySavings: number; // Keep for backward compatibility (synced with stable)

    // Scenarios
    aggressive: Scenario;
    stable: Scenario;

    // Actions
    setField: (field: keyof Omit<CalculatorStore, 'setField' | 'reset' | 'updateScenario' | 'aggressive' | 'stable'>, value: number) => void;
    updateScenario: (type: 'aggressive' | 'stable', field: keyof Scenario, value: number) => void;
    reset: () => void;
}

const initialAggressive: Scenario = {
    initialCapital: 100000000,
    monthlySaving: 3000000,
    annualReturnRate: 10,
};

const initialStable: Scenario = {
    initialCapital: 100000000,
    monthlySaving: 3000000,
    annualReturnRate: 4,
};

const initialState = {
    initialCapital: 100000000,
    monthlySavings: 3000000,
    annualReturnRate: 7, // User's custom input (kept separate from scenarios for now, or synced?)
    targetMonthlySpending: 5000000,
    inflationRate: 2.5,
    currentAge: 35,
    aggressive: initialAggressive,
    stable: initialStable,
};

export const useCalculatorStore = create<CalculatorStore>()(
    persist(
        (set) => ({
            ...initialState,
            setField: (field, value) => set((state) => {
                // If updating main fields, we might want to sync 'stable' or just keep them separate?
                // For this implementation, we'll keep the root fields as "Custom/My Plan"
                // and 'stable/aggressive' as the preset comparisons. 
                // However, to make the comparison meaningful, 'stable' should probably reflect the user's inputs?
                // OR compare User(Custom) vs Aggressive vs Stable.

                // Let's keep it simple: Root fields are the source of truth for the MAIN UI.
                return { [field]: value };
            }),
            updateScenario: (type, field, value) => set((state) => ({
                [type]: { ...state[type], [field]: value }
            })),
            reset: () => set(initialState),
        }),
        {
            name: 'calculator-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
