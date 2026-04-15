import { redirect } from "next/navigation";

export default function AdminBackgroundsIndexRedirect() {
  redirect("/admin/scenarios");
}
