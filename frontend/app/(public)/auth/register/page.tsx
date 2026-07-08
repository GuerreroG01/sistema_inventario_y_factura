"use client";

import { useState } from "react";
import { useRegister } from "./hooks/useRegister";
import RegisterForm from "./components/RegisterForm";
import { RegisterRequest } from "@/types/Auth";
import { SystemStatus } from "../../Utils/SystemStatus";

export default function RegisterPage() {
    const { register, loading, error, user } = useRegister();
    const { initialized, loading: statusLoading } = SystemStatus();
    const initialData: RegisterRequest = {
        Usuario: "",
        Clave: "",
        Email: "",
        Telefono: ""
    };
    const [formData, setFormData] = useState(initialData);


    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleRegister = async (
        data: RegisterRequest
    ) => {
        await register(data);
        setFormData(initialData);
    };

    return (

        <RegisterForm
            data={formData}
            loading={loading}
            error={error}
            user={user}
            onChange={handleChange}
            onSubmit={handleRegister}
            initialized={initialized}
        />
    );
}