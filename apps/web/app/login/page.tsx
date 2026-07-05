import { Suspense } from "react";
import { LoadingFallback } from "@/components/auth/LoadingFallback";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginForm />
    </Suspense>
  );
}
