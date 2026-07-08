"use client";

import { useEffect, useState } from "react";
import { getSystemStatus } from "@/services/authService";


export function SystemStatus(){
    const [initialized,setInitialized] = useState<boolean | null>(null);
    const [loading,setLoading] = useState(true);

    useEffect(()=>{
        const loadStatus = async()=>{
            try{
                const response = await getSystemStatus();
                setInitialized(response.initialized);
            }finally{
                setLoading(false);
            }
        };
        loadStatus();
    },[]);

    return { initialized, loading };
}