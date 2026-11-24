import { useState, useCallback } from "react";
import { getEmployeeVacationBenefit, calculateEmployeeThirteenthMonth, 
    calculateEmployeeIndemnification,
} from "@/services/Worksheet/Benefit/NicaraguaLaborBenefitsService";

import {
    CalculationDate, EmployeeVacationBenefit, EmployeeThirteenthMonthBenefitResponse, EmployeeIndemnificationBenefitResponse,
} from "@/types/worksheet/benefit/NicaraguaLaborBenefits";

interface UseNicaraguaLaborBenefitsProps {
    businessId: number;
    employeeId: number;
}

export function useNicaraguaLaborBenefits({
    businessId,
    employeeId,
}: UseNicaraguaLaborBenefitsProps) {

    // Loading states
    const [loadingVacation, setLoadingVacation] = useState(false);
    const [loadingThirteenthMonth, setLoadingThirteenthMonth] = useState(false);
    const [loadingIndemnification, setLoadingIndemnification] = useState(false);

    // Results
    const [vacationResult, setVacationResult] =
        useState<EmployeeVacationBenefit | null>(null);

    const [thirteenthMonthResult, setThirteenthMonthResult] =
        useState<EmployeeThirteenthMonthBenefitResponse | null>(null);

    const [indemnificationResult, setIndemnificationResult] =
        useState<EmployeeIndemnificationBenefitResponse | null>(null);

    // Errors
    const [vacationError, setVacationError] = useState<string | null>(null);
    const [thirteenthMonthError, setThirteenthMonthError] = useState<string | null>(null);
    const [indemnificationError, setIndemnificationError] = useState<string | null>(null);

    // Calculate vacations
    const calculateVacation = useCallback(
        async (filters?: CalculationDate) => {
            setLoadingVacation(true);
            setVacationError(null);

            try {
                const result = await getEmployeeVacationBenefit(
                    businessId,
                    employeeId,
                    filters
                );

                setVacationResult(result);

                return result;

            } catch (error: any) {
                setVacationError(error.message);
                throw error;

            } finally {
                setLoadingVacation(false);
            }
        },
        [businessId, employeeId]
    );

    // Calculate thirteenth month
    const calculateThirteenthMonth = useCallback(
        async (data?: CalculationDate) => {
            setLoadingThirteenthMonth(true);
            setThirteenthMonthError(null);

            try {
                const result = await calculateEmployeeThirteenthMonth(
                    employeeId,
                    data
                );

                setThirteenthMonthResult(result);

                return result;

            } catch (error: any) {
                setThirteenthMonthError(error.message);
                throw error;

            } finally {
                setLoadingThirteenthMonth(false);
            }
        },
        [employeeId]
    );

    // Calculate indemnification
    const calculateIndemnification = useCallback(
        async (data?: CalculationDate) => {
            setLoadingIndemnification(true);
            setIndemnificationError(null);

            try {
                const result = await calculateEmployeeIndemnification(
                    employeeId,
                    data
                );

                setIndemnificationResult(result);

                return result;

            } catch (error: any) {
                setIndemnificationError(error.message);
                throw error;

            } finally {
                setLoadingIndemnification(false);
            }
        },
        [employeeId]
    );

    return {
        // Functions
        calculateVacation,
        calculateThirteenthMonth,
        calculateIndemnification,

        // Loading
        loadingVacation,
        loadingThirteenthMonth,
        loadingIndemnification,

        // Results
        vacationResult,
        thirteenthMonthResult,
        indemnificationResult,

        // Errors
        vacationError,
        thirteenthMonthError,
        indemnificationError,
    };
}