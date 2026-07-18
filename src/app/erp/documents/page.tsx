import { DocumentsManager } from "@/components/erp/DocumentsManager";

export default function ErpDocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black">Document vault</h1>
        <p className="text-sm text-slate-500">GST · bills · salary · warranties · agreements — upload / delete</p>
      </div>
      <DocumentsManager />
    </div>
  );
}
