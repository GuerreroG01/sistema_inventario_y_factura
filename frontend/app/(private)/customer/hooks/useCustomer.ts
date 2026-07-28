import { useEffect, useState } from "react";
import { getCustomers, createCustomer, updateCustomer, changeCustomerStatus } from "@/services/customerService";
import { Customer } from "@/types/Customer";

export function useCustomer () {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        name: "",
        phone: "",
        hasDebt: false,
    });
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const response = await getCustomers(page, filters);
            setCustomers(response.data);
            setPagination(response.pagination);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, [page]);

    const totalDebtCount = customers.filter(
        (customer) => customer.balance > 0
    ).length;

    const activeCustomersCount = customers.filter(
        (customer) => customer.status === "ACTIVE"
    ).length;

    const openCreateModal = () => {
        setSelectedCustomer(null);
        setIsModalOpen(true);
    };

    const openEditModal = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCustomer(null);
    };

    const handleSubmit = async (
        values: Omit<Customer, "id" | "balance" | "status">
    ) => {
        try {
            setLoading(true);

            if (selectedCustomer) {
                await updateCustomer(selectedCustomer.id, values);
            } else {
                await createCustomer(values);
            }

            await loadCustomers();
            closeModal();

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleChangeStatus = async (customer: Customer) => {
        try {
            setLoading(true);

            const newStatus =
                customer.status === "ACTIVE"
                    ? "INACTIVE"
                    : "ACTIVE";

            await changeCustomerStatus(customer.id, newStatus);

            await loadCustomers();

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return {
        customers, loading, pagination, filters, totalDebtCount, activeCustomersCount, setFilters,
        setPage, loadCustomers, isModalOpen, selectedCustomer, openCreateModal, openEditModal, closeModal,
        handleSubmit, handleChangeStatus
    };
}