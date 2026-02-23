"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

interface Question {
  id: number; statement: string; imageUrl?: string;
  optionA: string; optionB: string; optionC: string; optionD: string; optionE: string;
}
type Step = "login"|"test"|"confirm"|"done"|"error"|"already_done";

export default function TestPage() {
  const params = useSearchParams();
  const accessToken = params.get("token") || "";
  const [step, setStep] = useState<Step>("login");
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [jwt, setJwt] = useState(""); const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number,string>>({}); const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const r = await api<{token:string}>("/auth/candidate/login", { method:"POST", body: JSON.stringify({name,email,accessToken}) });
      setJwt(r.token); setStep("test");
    } catch(err:any) { err.message?.includes("já realizou") ? setStep("already_done") : setError(err.message); }
    finally { setLoading(false); }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api<{questions:Question[]}>("/test/questions", {}, jwt); setQuestions(r.questions); }
    catch(err:any) { err.message?.includes("concluído") ? setStep("already_done") : setStep("error"); }
    finally { setLoading(false); }
  }, [jwt]);

  useEffect(() => { if (step==="test" && jwt) load(); }, [step,jwt,load]);

  const submit = async () => {
    setLoading(true); setError("");
    try { await api("/test/submit", { method:"POST", body: JSON.stringify({answers}) }, jwt); setStep("done"); }
    catch(err:any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const opts: [string,string][] = questions[current] ? [
    ["A",questions[current].optionA],["B",questions[current].optionB],["C",questions[current].optionC],
    ["D",questions[current].optionD],["E",questions[current].optionE]
  ] : [];

  if (!accessToken) return <Screen><p className="text-center text-gray-500">Link inválido.</p></Screen>;
  if (step==="already_done") return <Screen><div className="text-center"><div className="text-5xl mb-4">✅</div><h2 className="text-xl font-bold mb-2">Teste já realizado</h2><p className="text-gray-500">O RH entrará em contato em breve.</p></div></Screen>;
  if (step==="error") return <Screen><div className="text-center"><div className="text-4xl mb-4">⚠️</div><p className="text-gray-500">Erro ao carregar o teste. Tente novamente.</p></div></Screen>;
  if (step==="done") return <Screen><div className="text-center"><div className="text-6xl mb-6">🎉</div><h2 className="text-2xl font-bold mb-3">Teste concluído!</h2><p className="text-gray-600">Suas respostas foram registradas. O RH entrará em contato em breve.</p><p className="text-sm text-gray-400 mt-4">Você pode fechar esta janela.</p></div></Screen>;

  if (step==="login") return (
    <Screen>
      <div className="text-3xl text-center mb-4">🧠</div>
      <h1 className="text-xl font-bold text-center mb-1">Teste de Raciocínio Lógico</h1>
      <p className="text-sm text-gray-500 text-center mb-6">Confirme seus dados para iniciar</p>
      <form onSubmit={handleLogin} className="space-y-4">
        <div><label className="block text-sm font-medium mb-1">Nome completo</label>
          <input type="text" required value={name} onChange={e=>setName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
        <div><label className="block text-sm font-medium mb-1">E-mail</label>
          <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">⚠️ O teste só pode ser realizado <strong>uma única vez</strong>.</div>
        <button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors">{loading?"Verificando...":"Iniciar Teste →"}</button>
      </form>
    </Screen>
  );

  if (step==="confirm") {
    const unanswered = questions.length - Object.keys(answers).length;
    return (
      <Screen>
        <div className="text-center">
          <div className="text-4xl mb-4">📋</div>
          <h2 className="text-xl font-bold mb-2">Confirmar envio</h2>
          {unanswered>0 ? <p className="text-amber-600 bg-amber-50 rounded-lg p-3 text-sm mb-4">Você deixou <strong>{unanswered} questão(ões)</strong> sem resposta.</p>
            : <p className="text-green-600 bg-green-50 rounded-lg p-3 text-sm mb-4">✅ Todas as questões foram respondidas.</p>}
          <p className="text-gray-500 text-sm mb-6">Após confirmar, <strong>não será possível refazer</strong>.</p>
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <div className="flex gap-3">
            <button onClick={()=>setStep("test")} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50">Revisar</button>
            <button onClick={submit} disabled={loading} className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors">{loading?"Enviando...":"Confirmar"}</button>
          </div>
        </div>
      </Screen>
    );
  }

  // Test screen
  if (loading && questions.length===0) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Carregando questões...</p></div>;
  const q = questions[current];
  const answered = Object.keys(answers).length;
  const progress = questions.length ? Math.round(answered/questions.length*100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b sticky top-0 z-10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex justify-between text-sm">
          <span>Questão <strong className="text-brand-600">{current+1}</strong> de {questions.length}</span>
          <span className="text-gray-500">{answered} respondidas</span>
        </div>
        <div className="max-w-2xl mx-auto mt-2 bg-gray-200 rounded-full h-1.5">
          <div className="bg-brand-500 h-1.5 rounded-full transition-all" style={{width:`${progress}%`}} />
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {q && <>
          <div className="bg-white rounded-xl border p-6 mb-4 shadow-sm">
            <p className="text-gray-900 leading-relaxed whitespace-pre-line">{q.statement}</p>
            {q.imageUrl && <img src={q.imageUrl} alt={`Questão ${current+1}`} className="mt-4 max-w-full rounded-lg border" />}
          </div>
          <div className="space-y-2">
            {opts.map(([letter,text]) => (
              <button key={letter} onClick={()=>setAnswers(p=>({...p,[q.id]:letter}))}
                className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${answers[q.id]===letter?"border-brand-500 bg-brand-50":"border-gray-200 bg-white hover:border-brand-300"}`}>
                <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${answers[q.id]===letter?"bg-brand-500 text-white":"bg-gray-100 text-gray-500"}`}>{letter}</span>
                <span className="text-sm text-gray-800 pt-0.5">{text}</span>
              </button>
            ))}
          </div>
        </>}
      </div>

      <div className="bg-white border-t sticky bottom-0 px-4 py-4">
        <div className="max-w-2xl mx-auto flex gap-3 mb-3">
          <button onClick={()=>setCurrent(c=>Math.max(0,c-1))} disabled={current===0} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Anterior</button>
          {current<questions.length-1
            ? <button onClick={()=>setCurrent(c=>c+1)} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg">Próxima →</button>
            : <button onClick={()=>setStep("confirm")} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg">Concluir ✓</button>}
        </div>
        <div className="max-w-2xl mx-auto flex flex-wrap gap-1 justify-center">
          {questions.map((q,i) => (
            <button key={q.id} onClick={()=>setCurrent(i)} className={`w-6 h-6 rounded text-xs font-medium transition-colors ${i===current?"bg-brand-600 text-white":answers[q.id]?"bg-brand-200 text-brand-700":"bg-gray-200 text-gray-500 hover:bg-gray-300"}`}>{i+1}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Screen({children}:{children:React.ReactNode}) {
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-brand-600 px-4"><div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">{children}</div></div>;
}
