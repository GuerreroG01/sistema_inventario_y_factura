"use client";

import EmployeeManager from "./components/EmployeeManager";
import { useEmployees } from "./hooks/useEmployees";

export default function EmployeePage() {
    const {
        employees, loading, error, createEmployee, updateEmployee, updateEmployeeStatus, loadingSummary, totalEmployees,
        activeEmployees, inactiveEmployees, totalSalaries
    } = useEmployees();

    return (
        <EmployeeManager
            employees={employees}
            loading={loading}
            error={error}
            createEmployee={createEmployee}
            updateEmployee={updateEmployee}
            onChangeStatus={(employee) =>
                updateEmployeeStatus(
                    employee.id,
                    employee.status === "ACTIVE"
                        ? "INACTIVE"
                        : "ACTIVE"
                )
            }
            loadingSummary={loadingSummary}
            totalEmployees={totalEmployees}
            activeEmployees={activeEmployees}
            inactiveEmployees={inactiveEmployees}
            totalSalaries={totalSalaries}
        />
    );
}