
export const CONCEPT_TYPE_STYLES = {
    EARNING: {
        label: "Percepción",
        className: "border-emerald-200/80 bg-emerald-50 text-emerald-700",
    },
    DEDUCTION: {
        label: "Deducción",
        className: "border-rose-200/80 bg-rose-50 text-rose-700",
    },
    EMPLOYER_COST: {
        label: "Costo patronal",
        className: "border-violet-200/80 bg-violet-50 text-violet-700",
    }
} as const;

export type ConceptType = keyof typeof CONCEPT_TYPE_STYLES;

export function getConceptType(type: string) {
    if (Object.prototype.hasOwnProperty.call(CONCEPT_TYPE_STYLES, type)) {
        return CONCEPT_TYPE_STYLES[type as ConceptType];
    }

    return {
        label: type || "Otro",
        className: "border-slate-200/80 bg-slate-100 text-slate-700",
    };
}
