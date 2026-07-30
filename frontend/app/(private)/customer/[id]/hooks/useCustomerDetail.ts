import { useEffect, useState } from "react";
import {
    getCustomerById, getCustomerIndicators, getCustomerSummary, getCustomerSalesHistory, getCustomerPreferences
} from "@/services/customerService";
import {
    Customer, CustomerIndicators, CustomerSummary, CustomerSalesHistoryResponse, CustomerPreferences
} from "@/types/Customer";

export function useCustomerDetail(id: number) {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [indicators, setIndicators] = useState<CustomerIndicators | null>(null);
    const [summary, setSummary] = useState<CustomerSummary | null>(null);
    const [salesHistory, setSalesHistory] = useState<CustomerSalesHistoryResponse | null>(null);
    const [preferences, setPreferences] = useState<CustomerPreferences | null>(null);

    const loadCustomer = async () => {
        try {
            setLoading(true);

            const [ customerResponse, indicatorsResponse, summaryResponse, preferencesResponse ] = 
            await Promise.all([
                getCustomerById(id),
                getCustomerIndicators(id),
                getCustomerSummary(id),
                getCustomerPreferences(id)
            ]);
            setCustomer(customerResponse.data);
            setIndicators(indicatorsResponse);
            setSummary(summaryResponse);
            setPreferences(preferencesResponse);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadSalesHistory = async ( page = 1 ) => {
        try {
            const response = await getCustomerSalesHistory(
                id,
                page,
                10
            );
            setSalesHistory(response);
        } catch(error) {
            console.error(
                "Error historial ventas:",
                error
            );
        }
    };

    useEffect(() => {
        loadCustomer();
        loadSalesHistory();
    }, [id]);

    return {
        customer, indicators, summary, salesHistory, loading, preferences,
        reload: loadCustomer,
        reloadSales: loadSalesHistory,
    };
}