import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { Sidebar } from "@/components/shared/Sidebar";
import { Card } from "@/components/ui/Card";

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-[#070711] text-white">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header title="Pengaturan" />
        <main className="flex-1 p-6">
          <Card title="Pengaturan Bisnis" description="Coming soon.">
            <p className="text-sm text-white/60">
              Pengaturan akun bisnis akan tersedia di sini. Untuk API keys dan
              wallet, gunakan{" "}
              <Link href="/developers" className="text-[#2DD4BF] underline">
                Developers
              </Link>
              .
            </p>
          </Card>
        </main>
      </div>
    </div>
  );
}
