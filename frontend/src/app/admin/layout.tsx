"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string|null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("admin_token");
    if (!t && pathname !== "/admin") router.push("/admin");
    else setToken(t);
  }, [pathname, router]);

  const logout = () => { localStorage.removeItem("admin_token"); router.push("/admin"); };

  if (pathname === "/admin") return <>{children}</>;

  const nav = [
    { href:"/admin/results", icon:"📊", label:"Resultados" },
    { href:"/admin/candidates", icon:"👥", label:"Candidatos" },
    { href:"/admin/questions", icon:"📝", label:"Questões" },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-brand-900 text-white flex flex-col">
        <div className="p-5 border-b border-brand-700">
          <div className="text-xl mb-1">🧠</div>
          <div className="font-bold text-sm">Portal do RH</div>
          <div className="text-xs text-brand-100 opacity-60">Teste de QI</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(n => (
            <Link key={n.href} href={n.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname===n.href?"bg-brand-600":"hover:bg-brand-700"}`}>
              <span>{n.icon}</span>{n.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-brand-700">
          <button onClick={logout} className="w-full text-left px-3 py-2 text-sm text-brand-200 hover:text-white rounded-lg hover:bg-brand-700 transition-colors">↩ Sair</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
