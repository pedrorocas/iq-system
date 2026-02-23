"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function AdminLogin() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const r = await api<{token:string}>("/auth/admin/login", { method:"POST", body: JSON.stringify({email,password}) });
      localStorage.setItem("admin_token", r.token);
      router.push("/admin/results");
    } catch(err:any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-brand-600 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
        <div className="text-3xl text-center mb-4">🧑‍💼</div>
        <h1 className="text-xl font-bold text-center mb-1">Portal do RH</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Faça login para acessar</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">E-mail</label>
            <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
          <div><label className="block text-sm font-medium mb-1">Senha</label>
            <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors">{loading?"Entrando...":"Entrar"}</button>
        </form>
      </div>
    </div>
  );
}
