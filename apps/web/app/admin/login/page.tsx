import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata = {
  title: "Admin Login · Gercep AI",
  robots: "noindex, nofollow",
};

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#030308] text-white/50">
          Loading...
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
