import { redirect } from "next/navigation";

export default function KeuanganRedirectPage() {
  redirect("/dashboard/transactions");
}
