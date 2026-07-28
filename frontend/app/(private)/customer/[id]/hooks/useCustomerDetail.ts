import { useEffect, useState } from "react";
import { getCustomerById } from "@/services/customerService";
import { Customer } from "@/types/Customer";

export function useCustomerDetail(id: number) {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);

    const loadCustomer = async () => {
        try {
            setLoading(true);

            const response = await getCustomerById(id);
            setCustomer(response.data);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomer();
    }, [id]);

    return {
        customer,
        loading,
        reload: loadCustomer,
    };
}