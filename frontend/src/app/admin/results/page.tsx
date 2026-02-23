"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Result { id:string; name:string; email:string; status:string; finishedAt:string|null; score:number|null; iq:number|null; iqClassification:string|null; }

const STATUS_LABEL: Record<string,string> = { pendente:"Pendente", em_andamento:"Em andamento", concluido:"Concluído" };
const STATUS_COLOR: Record<string,string> = { pendente:"bg-yellow-100 text-yellow-700", em_andamento:"bg-blue-100 text-blue-700", concluido:"bg-green-100 text-green-700" };

export default function ResultsPage() {
  const [candidates, setCandidates] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState(""); const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false); const [inviteMsg, setInviteMsg] = useState(""); const [inviteError, setInviteError] = useState("");
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") || "" : "";
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  useEffect(() => {
    api<{candidates:Result[]}>("/admin/results",{},token).then(r=>setCandidates(r.candidates)).finally(()=>setLoading(false));
  }, [token]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault(); setInviteLoading(true); setInviteMsg(""); setInviteError("");
    try {
      await api("/admin/candidates", { method:"POST", body: JSON.stringify({name:inviteName,email:inviteEmail}) }, token);
      setInviteMsg(`Convite enviado para ${inviteEmail}!`);
      setInviteName(""); setInviteEmail("");
      api<{candidates:Result[]}>("/admin/results",{},token).then(r=>setCandidates(r.candidates));
    } catch(err:any) { setInviteError(err.message); }
    finally { setInviteLoading(false); }
  };

  const filtered = candidates.filter(c =>
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())) &&
    (filter==="todos" || c.status===filter)
  );
  const stats = { total:candidates.length, pendente:candidates.filter(c=>c.status==="pendente").length, em_andamento:candidates.filter(c=>c.status==="em_andamento").length, concluido:candidates.filter(c=>c.status==="concluido").length };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Resultados</h1>
        <div className="flex gap-2">
          <a href={`${API}/admin/export/csv`} target="_blank" className="text-sm border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50">↓ Exportar CSV</a>
          <button onClick={()=>setShowInvite(true)} className="text-sm bg-brand-600 hover:bg-brand-700 text-white font-medium px-4 py-1.5 rounded-lg">+ Convidar</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[["Total",stats.total,"text-gray-900"],["Pendente",stats.pendente,"text-yellow-600"],["Em andamento",stats.em_andamento,"text-blue-600"],["Concluído",stats.concluido,"text-green-600"]].map(([l,v,c])=>(
          <div key={l as string} className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500 mb-1">{l}</p><p className={`text-2xl font-bold ${c}`}>{v}</p></div>
        ))}
      </div>

      <div className="flex gap-3 mb-4">
        <input type="text" placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        <select value={filter} onChange={e=>setFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="todos">Todos</option><option value="pendente">Pendente</option><option value="em_andamento">Em andamento</option><option value="concluido">Concluído</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? <div className="text-center py-12 text-gray-400">Carregando...</div> : filtered.length===0 ? <div className="text-center py-12 text-gray-400">Nenhum resultado.</div> : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b"><tr>
              {["Candidato","Data","Nota","QI","Classificação","Status"].map(h=><th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(c=>(
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><p className="text-sm font-medium">{c.name}</p><p className="text-xs text-gray-400">{c.email}</p></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.finishedAt ? new Date(c.finishedAt).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"}) : "—"}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{c.score!=null?`${c.score}/60`:"—"}</td>
                  <td className="px-4 py-3 text-sm font-bold text-brand-600">{c.iq??"—"}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{c.iqClassification??"—"}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLOR[c.status]}`}>{STATUS_LABEL[c.status]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showInvite && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">Convidar candidato</h2>
            <form onSubmit={handleInvite} className="space-y-3">
              <div><label className="block text-sm font-medium mb-1">Nome</label>
                <input type="text" required value={inviteName} onChange={e=>setInviteName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
              <div><label className="block text-sm font-medium mb-1">E-mail</label>
                <input type="email" required value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
              {inviteMsg && <p className="text-green-600 text-sm bg-green-50 p-2 rounded-lg">{inviteMsg}</p>}
              {inviteError && <p className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">{inviteError}</p>}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={()=>{setShowInvite(false);setInviteMsg("");setInviteError("");}} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={inviteLoading} className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-2 rounded-lg text-sm">{inviteLoading?"Enviando...":"Enviar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
