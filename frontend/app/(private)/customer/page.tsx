"use client";

import CustomerManager from "./components/CustomerManager";
import { useCustomer } from "./hooks/useCustomer";

export default function CustomersPage() {
    const customer = useCustomer();

    return <CustomerManager {...customer} />;
}