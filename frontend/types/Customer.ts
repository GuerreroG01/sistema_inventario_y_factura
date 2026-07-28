export type Customer = {
    id:number;
    name:string;
    phone:string | null;
    email:string | null;
    address:string | null;
    identification:string | null;
    credit_limit:number;
    balance:number;
    status:"ACTIVE" | "INACTIVE";
    created_by?:number;
    updated_by?:number;
    business_id:number;
    createdAt?:string;
    updatedAt?:string;
}

export type CustomerResponse = {
    success: boolean;
    data: Customer;
};