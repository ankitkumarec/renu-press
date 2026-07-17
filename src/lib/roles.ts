export type AppRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "MANAGER"
  | "EMPLOYEE"
  | "DESIGNER"
  | "CUSTOMER";

export function isErpRole(role: string) {
  return ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(role);
}

export function isStaffRole(role: string) {
  return ["EMPLOYEE", "DESIGNER", "MANAGER", "ADMIN", "SUPER_ADMIN"].includes(role);
}

export function isCustomerRole(role: string) {
  return role === "CUSTOMER";
}

export function homeForRole(role: string) {
  if (isErpRole(role)) return "/erp";
  if (role === "EMPLOYEE" || role === "DESIGNER") return "/staff";
  return "/portal";
}

export const PRODUCTION_STAGES = [
  "DESIGN",
  "APPROVAL",
  "PRINTING",
  "LAMINATION",
  "CUTTING",
  "PACKING",
  "DISPATCH",
  "DELIVERY",
] as const;

export const EXPENSE_CATEGORIES = [
  "Raw Materials",
  "Ink & Chemicals",
  "Rent",
  "Electricity",
  "Salary",
  "Transport",
  "Machine Maintenance",
  "Marketing",
  "Vendor Payment",
  "Misc",
] as const;

export const INVENTORY_CATEGORIES = [
  "Paper",
  "Vinyl",
  "Ink",
  "Flex",
  "Frames",
  "Mug Stock",
  "T-Shirt Stock",
  "Caps",
  "Gift Items",
  "Machine Parts",
  "Raw Materials",
] as const;
