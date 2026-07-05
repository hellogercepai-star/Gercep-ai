import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { Sidebar } from "@/components/shared/Sidebar";
import { Card } from "@/components/ui/Card";

export default function ProduksiPage() {
  return (
    <div className="flex min-h-screen bg-[#070711] text-white">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header title="Produksi" />
        <main className="flex-1 p-6">
          <Card
            title="Modul Produksi"
            description="Business OS dogfood — coming soon."
          >
            <p className="text-sm text-white/60">
              Modul produksi/manufacturing belum tersedia. Produk utama Gercep
              saat ini adalah{" "}
              <Link href="/developers" className="text-[#2DD4BF] underline">
                Developer Gateway
              </Link>
              .
            </p>
            <Link
              href="/developers"
              className="mt-4 inline-block rounded-full bg-white px-4 py-2 text-xs font-medium text-[#070711]"
            >
              Buka Developers
            </Link>
          </Card>
        </main>
      </div>
    </div>
  );
}
