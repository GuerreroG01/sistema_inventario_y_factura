"use client";

import { ReactNode } from "react";

interface LicenseCardProps {
    title: string;
    value: string;
    icon: ReactNode;
    color: "blue" | "purple" | "emerald";
}

export default function LicenseCard({
    title,
    value,
    icon,
    color,
}: LicenseCardProps) {
    const styles = {
        blue: {
            bg: "bg-blue-50",
            border: "border-blue-100",
            icon: "text-blue-600",
        },
        purple: {
            bg: "bg-purple-50",
            border: "border-purple-100",
            icon: "text-purple-600",
        },
        emerald: {
            bg: "bg-emerald-50",
            border: "border-emerald-100",
            icon: "text-emerald-600",
        },
    }[color];

    return (
        <div className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-semibold text-gray-500">
                    {title}
                </p>

                <div
                    className={`
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        border
                        ${styles.bg}
                        ${styles.border}
                        ${styles.icon}
                    `}
                >
                    {icon}
                </div>
            </div>

            <p className="text-xl font-bold text-gray-900">
                {value}
            </p>
        </div>
    );
}