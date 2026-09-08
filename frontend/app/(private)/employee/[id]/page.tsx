import EmployeeManagerDetail from "./components/EmployeeManagerDetail";

type EmployeePageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EmployeePage({ params }: EmployeePageProps) {
    const { id } = await params;

    return (
        <EmployeeManagerDetail employeeId={Number(id)} />
    );
}
