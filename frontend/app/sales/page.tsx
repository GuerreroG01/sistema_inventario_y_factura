"use client";

import SalesPage from "./components/SalesPage";
import { useSales } from "./hooks/useSales";

export default function SalesContainer() {
  const salesProps = useSales();

  return <SalesPage {...salesProps} />;
}