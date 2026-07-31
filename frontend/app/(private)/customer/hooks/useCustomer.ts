import { useEffect, useState } from "react";
import { getCustomers, createCustomer, updateCustomer, changeCustomerStatus, getCustomerStats } from "@/services/customerService";
import { Customer } from "@/types/Customer";

export function useCustomer () {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        name: "",
        phone: "",
        status:"",
        hasDebt: "",
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
    const [stats, setStats] = useState({
        totalCustomers: 0,
        activeCustomers: 0,
        customersWithDebt: 0,
        totalDebt: 0,
    });

    const loadCustomerStats = async () => {
        try {
            const response = await getCustomerStats();
            setStats(response);
        } catch (error) {
            console.error(error);
        }
    };

    const updateFilter = (key:string,value:string)=>{
        setFilters(prev=>({
            ...prev,
            [key]:value
        }));
    };
    const loadCustomers = async (currentPage = page) => {
        try {
            setLoading(true);

            const response = await getCustomers(
                currentPage,
                filters
            );

            setCustomers(response.data);
            setPagination(response.pagination);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = ()=>{
        setPage(1);
        loadCustomers(1);
    };

    useEffect(() => {
        loadCustomerStats();
    }, []);
    useEffect(() => {
        loadCustomers();
    }, [page]);

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
        customers, loading, pagination, filters, stats, setFilters, page,
        setPage, loadCustomers, isModalOpen, selectedCustomer, openCreateModal, openEditModal, closeModal,
        handleSubmit, handleChangeStatus, updateFilter, applyFilters
    };
}