"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Candidate { id:string; name:string; email:string; createdAt:string; status:string; }
const STATUS_LABEL: Record<string,string> = { pendente:"Pendente", em_andamento:"Em andamento", concluido:"Concluído" };
const STATUS_COLOR: Record<string,string> = { pendente:"bg-yellow-100 text-yellow-700", em_andamento:"bg-blue-100 text-blue-700", concluido:"bg-green-100 text-green-700" };

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false); const [msg, setMsg] = useState(""); const [err, setErr] = useState("");
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") || "" : "";

  const load = () => { setLoading(true); api<{candidates:Candidate[]}>("/admin/results",{},token).then(r=>setCandidates(r.candidates)).finally(()=>setLoading(false)); };
  useEffect(()=>{ load(); }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault(); setSending(true); setMsg(""); setErr("");
    try {
      await api("/admin/candidates", { method:"POST", body: JSON.stringify({name,email}) }, token);
      setMsg(`✅ Convite enviado para ${email}!`); setName(""); setEmail(""); load();
    } catch(e:any) { setErr(e.message); }
    finally { setSending(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este candidato? Os dados do teste também serão apagados.")) return;
    try { await api(`/admin/candidates/${id}`, { method:"DELETE" }, token); load(); }
    catch(e:any) { alert(e.message); }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">Candidatos</h1>

      <div className="bg-white rounded-xl border p-6 mb-6 shadow-sm">
        <h2 className="font-semibold mb-4">Convidar novo candidato</h2>
        <form onSubmit={handleInvite} className="flex gap-3 flex-wrap">
          <input type="text" required placeholder="Nome completo" value={name} onChange={e=>setName(e.target.value)} className="flex-1 min-w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <input type="email" required placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} className="flex-1 min-w-52 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <button type="submit" disabled={sending} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium px-4 py-2 rounded-lg text-sm whitespace-nowrap">{sending?"Enviando...":"Enviar convite"}</button>
        </form>
        {msg && <p className="text-green-600 text-sm mt-3">{msg}</p>}
        {err && <p className="text-red-600 text-sm mt-3 bg-red-50 p-2 rounded-lg">{err}</p>}
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? <div className="text-center py-12 text-gray-400">Carregando...</div> : candidates.length===0 ? <div className="text-center py-12 text-gray-400">Nenhum candidato ainda.</div> : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b"><tr>
              {["Candidato","Convidado em","Status",""].map(h=><th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {candidates.map(c=>(
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><p className="text-sm font-medium">{c.name}</p><p className="text-xs text-gray-400">{c.email}</p></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(c.createdAt).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLOR[c.status]}`}>{STATUS_LABEL[c.status]}</span></td>
                  <td className="px-4 py-3"><button onClick={()=>handleDelete(c.id)} className="text-xs text-red-500 hover:text-red-700">Remover</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
