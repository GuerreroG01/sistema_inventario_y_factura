"use client";

import { useState } from "react";
import { useExpenses } from "./hooks/useExpense";
import ExpenseMetricCard from "./components/ExpenseMetricCard";
import ExpensesTable from "./components/ExpensesTable";
import ExpenseForm from "./components/ExpensesForm";
import ExpenseFilters from "./components/ExpenseFilters";
import { Expense } from "@/types/Expense";

export default function ExpensesPage() {

    const {expenses, pagination, page, setPage, addExpense, editExpense, removeExpense, filters, updateFilter, refresh} = useExpenses();

    const [isOpen, setIsOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [filtersOpen, setFiltersOpen] = useState(false);
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
                onCreate={handleCreate}
            />
            <ExpenseFilters
                filters={filters}
                updateFilter={updateFilter}
                applyFilters={refresh}
                open={filtersOpen}
                setOpen={setFiltersOpen}
                categories={[
                    "Servicios",
                    "Alquiler",
                    "Compras",
                    "Transporte",
                ]}
            />

            <ExpensesTable
                expenses={expenses}
                page={page}
                pagination={pagination}
                onPageChange={setPage}
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