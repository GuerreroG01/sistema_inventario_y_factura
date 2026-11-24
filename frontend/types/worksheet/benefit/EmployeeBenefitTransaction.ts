import { BenefitType, BenefitUnit } from "./BenefitRule";
import { EmployeeBenefitStatus } from "./EmployeeBenefit";

export type BenefitTransactionType =
    | "ACCRUAL"
    | "USAGE"
    | "PAYMENT"
    | "ADJUSTMENT"
    | "REVERSAL";

/** Modelo completo de una transacción */
export interface BenefitTransaction {
    id: number;
    employee_benefit_id: number;

    transaction_type: BenefitTransactionType;

    amount: number | string;
    balance_before: number | string;
    balance_after: number | string;

    date: string;

    reference_type: string | null;
    reference_id: number | null;

    idempotency_key: string | null;
    isReversed: boolean;

    reverses_transaction_id: number | null;

    period_start_date: string | null;
    period_end_date: string | null;

    description: string | null;
    created_by: number | null;

    createdAt?: string;
    updatedAt?: string;
}

/** Respuesta del saldo actual (getBenefitBalance) */
export interface BenefitBalance {
    employee_benefit_id: number;
    employee_id: number;
    type: BenefitType;
    unit: BenefitUnit;
    balance: number;
    status: EmployeeBenefitStatus;
    start_date: string | null;
    end_date: string | null;
}

/** Payload común para movimientos que modifican saldo */
export interface CreateBenefitTransactionData {
    amount: number;
    date?: string | null;
    description?: string | null;
    referenceType?: string | null;
    referenceId?: number | null;
    idempotencyKey?: string | null;
    allowNegativeBalance?: boolean;
    period_start_date: string | null;
    period_end_date: string | null;
}

/** Payload específico para ajuste (description obligatorio) */
export interface AdjustBenefitTransactionData
    extends CreateBenefitTransactionData {
    description: string;
}

/** Payload para pago completo de beneficio monetario */
export interface CreateBenefitPaymentData {
    date: string;
    description?: string | null;
    referenceType?: string | null;
    referenceId?: number | null;
}

export interface ReverseBenefitTransactionData {
    date?: string | null;
    description?: string | null;
    idempotencyKey?: string | null;
    allowNegativeBalance?: boolean;
}

export interface BenefitTransactionFilters {
    page?: number;
    limit?: number;
    transactionType?: BenefitTransactionType;
    from?: string;
    to?: string;
    order?: "ASC" | "DESC";
}

export interface BenefitTransactionPaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface BenefitTransactionPagination {
    data: BenefitTransaction[];
    pagination: BenefitTransactionPaginationData;
}

export interface BenefitTransactionResult {
    benefit: {
        id: number;
        employee_id: number;
        business_id: number;
        benefit_rule_id: number | null;
        type: BenefitType;
        benefit_mode: string;
        balance: number | string;
        unit: BenefitUnit;
        status: EmployeeBenefitStatus;
        start_date: string | null;
        end_date: string | null;
        createdAt?: string;
        updatedAt?: string;
    };
    transaction: BenefitTransaction;
    originalTransaction?: BenefitTransaction;
}