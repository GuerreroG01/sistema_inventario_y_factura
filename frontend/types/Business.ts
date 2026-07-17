export type Business = {
  id: number;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export type BusinessWithLicense = {
  business: Business;
  license: {
    id: number;
    business_id: number;
    license_key: string;
    type: string;
    duration: number;
    duration_unit: string;
    status: string;
    expires_at: string;
  };
}

export type BusinessListResponse = {
  total: number;
  page: number;
  totalPages: number;
  businesses: Pick<Business, "id" | "name">[];
}