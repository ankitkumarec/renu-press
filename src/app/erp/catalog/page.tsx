import { CatalogMediaManager } from "@/components/erp/CatalogMediaManager";

export default function ErpCatalogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black">Gifts · Catalog · Site images</h1>
        <p className="text-sm text-slate-500">
          Trophy, mug, gift products + homepage gallery images — JPG/PNG upload yahi se
        </p>
      </div>
      <CatalogMediaManager />
    </div>
  );
}
