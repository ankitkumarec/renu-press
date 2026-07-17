import { redirect } from "next/navigation";

/** Site CMS still lives under shared settings — redirect to dedicated page reuse */
export default function ErpSettingsRedirect() {
  redirect("/erp/site-settings");
}
