"use client";
import { useState, useEffect, useRef } from "react";
import { api, apiForm, apiFormPut } from "@/lib/api";

interface Question { id:number; statement:string; imageUrl?:string; optionA:string; optionB:string; optionC:string; optionD:string; optionE:string; correctAnswer:string; order:number; }

const EMPTY = { statement:"", optionA:"", optionB:"", optionC:"", optionD:"", optionE:"", correctAnswer:"A", order:0 };

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Question|null>(null);
  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState<File|null>(null);
  const [imagePreview, setImagePreview] = useState<string|null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<number|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") || "" : "";

  const load = () => {
    setLoading(true);
    api<{questions:Question[]}>("/questions", {}, token).then(r=>setQuestions(r.questions)).finally(()=>setLoading(false));
  };

  useEffect(()=>{ load(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setImageFile(null); setImagePreview(null); setRemoveImage(false); setError(""); setShowForm(true); };
  const openEdit = (q: Question) => { setEditing(q); setForm({statement:q.statement,optionA:q.optionA,optionB:q.optionB,optionC:q.optionC,optionD:q.optionD,optionE:q.optionE,correctAnswer:q.correctAnswer,order:q.order}); setImageFile(null); setImagePreview(q.imageUrl||null); setRemoveImage(false); setError(""); setShowForm(true); };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setRemoveImage(false);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, String(v)));
      if (imageFile) fd.append("image", imageFile);
      if (removeImage) fd.append("removeImage", "true");

      if (editing) {
        await apiFormPut<any>(`/questions/${editing.id}`, fd, token);
      } else {
        await apiForm<any>("/questions", fd, token);
      }
      setShowForm(false); load();
    } catch(err:any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try { await api(`/questions/${id}`, { method:"DELETE" }, token); load(); }
    catch(err:any) { alert(err.message); }
    finally { setDeleteId(null); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Questões</h1>
          <p className="text-sm text-gray-500">{questions.length} questão(ões) cadastrada(s)</p>
        </div>
        <button onClick={openNew} className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">+ Nova questão</button>
      </div>

      {loading ? <div className="text-center py-12 text-gray-400">Carregando...</div> : questions.length===0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-gray-500 mb-4">Nenhuma questão cadastrada ainda.</p>
          <button onClick={openNew} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm">Cadastrar primeira questão</button>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q,i) => (
            <div key={q.id} className="bg-white rounded-xl border p-4 flex gap-4 items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-sm font-bold">{i+1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 line-clamp-2">{q.statement}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {["A","B","C","D","E"].map(l => (
                    <span key={l} className={`text-xs px-2 py-0.5 rounded-full font-medium ${q.correctAnswer===l?"bg-green-100 text-green-700 ring-1 ring-green-400":"bg-gray-100 text-gray-500"}`}>
                      {l}: {(q as any)[`option${l}`]}
                    </span>
                  ))}
                </div>
                {q.imageUrl && <p className="text-xs text-brand-600 mt-1">🖼️ Tem imagem</p>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={()=>openEdit(q)} className="text-xs border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50">Editar</button>
                <button onClick={()=>setDeleteId(q.id)} className="text-xs border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50">Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-xl w-full my-auto">
            <h2 className="text-lg font-bold mb-4">{editing?"Editar":"Nova"} questão</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Enunciado <span className="text-red-500">*</span></label>
                <textarea required rows={3} value={form.statement} onChange={e=>setForm(p=>({...p,statement:e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" placeholder="Digite o enunciado da questão..." />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Imagem <span className="text-gray-400 font-normal">(opcional)</span></label>
                {imagePreview && !removeImage ? (
                  <div className="relative inline-block mb-2">
                    <img src={imagePreview} alt="Preview" className="max-h-32 rounded-lg border" />
                    <button type="button" onClick={()=>{setImagePreview(null);setImageFile(null);setRemoveImage(!!editing);if(fileRef.current)fileRef.current.value="";}} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✕</button>
                  </div>
                ) : (
                  <div onClick={()=>fileRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-brand-400 transition-colors">
                    <p className="text-sm text-gray-500">📁 Clique para selecionar uma imagem</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF até 5MB</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </div>

              <div className="grid grid-cols-1 gap-3">
                {["A","B","C","D","E"].map(l => (
                  <div key={l} className="flex gap-2 items-center">
                    <span className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold ${form.correctAnswer===l?"bg-green-500 text-white":"bg-gray-100 text-gray-500"}`}>{l}</span>
                    <input required type="text" value={(form as any)[`option${l}`]} onChange={e=>setForm(p=>({...p,[`option${l}`]:e.target.value}))} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder={`Opção ${l}`} />
                    <button type="button" onClick={()=>setForm(p=>({...p,correctAnswer:l}))} className={`text-xs px-2 py-1.5 rounded-lg border transition-colors ${form.correctAnswer===l?"bg-green-100 border-green-400 text-green-700 font-semibold":"border-gray-300 text-gray-500 hover:bg-gray-50"}`}>{form.correctAnswer===l?"✓ Correta":"Marcar"}</button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ordem</label>
                <input type="number" value={form.order} onChange={e=>setForm(p=>({...p,order:Number(e.target.value)}))} className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <p className="text-xs text-gray-400 mt-1">Define a ordem de exibição no teste</p>
              </div>

              {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={()=>setShowForm(false)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm">{saving?"Salvando...":editing?"Salvar alterações":"Criar questão"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId!==null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="text-3xl mb-3">🗑️</div>
            <h3 className="font-bold text-lg mb-2">Excluir questão?</h3>
            <p className="text-sm text-gray-500 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={()=>setDeleteId(null)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={()=>handleDelete(deleteId)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
