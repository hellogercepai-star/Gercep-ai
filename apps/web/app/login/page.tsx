import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#070711]">
          <p className="text-sm text-white/50">Memuat...</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
