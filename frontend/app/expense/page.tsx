"use client";

import { useState } from "react";
import { useExpenses } from "./hooks/useExpense";
import ExpenseMetricCard from "./components/ExpenseMetricCard";
import ExpensesTable from "./components/ExpensesTable";
import ExpenseForm from "./components/ExpensesForm";
import { Expense } from "@/types/Expense";

export default function ExpensesPage() {

    const {
        expenses,
        addExpense,
        editExpense,
        removeExpense
    } = useExpenses();

    const [isOpen, setIsOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

    const handleCreate = () => {
        setSelectedExpense(null);
        setIsOpen(true);
    };

    const handleEdit = (expense: Expense) => {
        setSelectedExpense(expense);
        setIsOpen(true);
    };

    return (
        <div className="space-y-6">

            <ExpenseMetricCard
                label="Total Gastos"
                value={expenses
                    .reduce((acc, e) => acc + Number(e.amount), 0)
                    .toFixed(2)
                }
                change={{
                    percentage: 5.2,
                    direction: "up"
                }}
                onCreate={handleCreate}
            />

            <ExpensesTable
                expenses={expenses}
                onEdit={handleEdit}
                onDelete={removeExpense}
            />
            {isOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg">
                        <ExpenseForm
                            initialData={selectedExpense}
                            onClose={() => setIsOpen(false)}
                            onSubmit={(data) => {

                                if (selectedExpense) {
                                    editExpense(selectedExpense.id, data);
                                } else {
                                    addExpense(data);
                                }

                                setIsOpen(false);
                            }}
                        />
                    </div>
                </div>
            )}

        </div>
    );
}