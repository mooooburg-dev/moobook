import { redirect } from "next/navigation";

export default function AdminPreviewIndexRedirect() {
  redirect("/admin/scenarios");
}
