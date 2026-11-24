"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, History, Wallet } from "lucide-react";
import { EmployeeBenefitTransactions } from "../../transactions/components/EmployeeBenefitTransactions";
import { InvalidBenefitState } from "../../transactions/components/InvalidBenefitState";

export default function EmployeeBenefitDetailPage() {
  const params = useParams();
  const router = useRouter();

  const employeeBenefitId = Number(params.employeeBenefitId);

  if (!Number.isInteger(employeeBenefitId) || employeeBenefitId <= 0) {
    return (
      <InvalidBenefitState
        title="Beneficio inválido"
        description="El identificador del beneficio proporcionado no es válido. Por favor, verifica el enlace o contacta al administrador del sistema."
        showHomeButton={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-2 -ml-3 sm:-ml-6 md:-ml-12 lg:-ml-16">
            <button
                type="button"
                onClick={() => router.back()}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95"
                title="Regresar"
            >
                <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white shadow-sm">
                    <Wallet className="h-4 w-4" />
                </div>

                <div>
                <div className="flex items-center gap-1.5">
                    <h1 className="text-base font-bold leading-none text-slate-900">
                        Gestión del Beneficio
                    </h1>
                    <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 sm:inline-flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Activo
                    </span>
                </div>
                </div>
            </div>
            </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-md bg-violet-100 p-1 text-violet-600">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Historial de transacciones
            </h2>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <EmployeeBenefitTransactions employeeBenefitId={employeeBenefitId}/>
        </div>
      </main>
    </div>
  );
}