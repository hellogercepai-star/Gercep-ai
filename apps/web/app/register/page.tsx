import { Suspense } from "react";
import { LoadingFallback } from "@/components/auth/LoadingFallback";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RegisterForm />
    </Suspense>
  );
}
