import { HrStaffDetail } from "@/components/erp/HrStaffDetail";

export default async function HrStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <HrStaffDetail staffId={id} />;
}
