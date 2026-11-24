
/**
 * Excepciones aceptables durante el cálculo de prestaciones.
 *
 * Estas situaciones no representan errores críticos del sistema.
 * El empleado se omite temporalmente, se registra una advertencia
 * y el worker continúa procesando los siguientes empleados.
 */

export const BENEFIT_CALCULATION_WARNINGS = new Set([

    // El empleado no pertenece al negocio.
    "employee_not_in_business",

    // El empleado todavía no tiene historial laboral.
    "employee_has_no_employment_history",

    // El empleado no tiene relación laboral vigente en la fecha del cálculo.
    "employee_has_no_employment_on_calculation_date",

    // El empleado no tiene un puesto registrado.
    "employee_position_not_found",

    // El empleado no tiene historial de puestos.
    "employee_position_history_not_found",

    // No existe un puesto aplicable al período.
    "employee_position_not_found_for_period",

    // El empleado no tiene historial salarial.
    "employee_salary_history_not_found",

    // El empleado no tiene historial salarial.
    "employee_has_no_salary_history",
    // No existe un salario aplicable al período.
    "employee_salary_not_found_for_period",

]);
    
/**
 * Determina si una excepción corresponde a una
 * situación aceptable durante el cálculo de prestaciones.
 *
 * @param {Error|string} error
 * @returns {boolean}
 */
export function isBenefitCalculationWarning(error) {
    const errorCode =
        typeof error === "string"
            ? error
            : error?.message;

    return BENEFIT_CALCULATION_WARNINGS.has(errorCode);
}
