import { getProducts } from "@/services/productService";
import HomeClient from "./components/HomeClient";

export default async function PageProducts() {
  const data = await getProducts(1, {});

  return <HomeClient productsData={data} />;
}