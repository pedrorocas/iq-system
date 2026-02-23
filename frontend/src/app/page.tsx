import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-brand-600">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full mx-4 text-center">
        <div className="text-4xl mb-4">🧠</div>
        <h1 className="text-2xl font-bold mb-2">Teste de Raciocínio Lógico</h1>
        <p className="text-gray-500 text-sm mb-8">Candidatos: acesse pelo link enviado ao seu e-mail.</p>
        <Link href="/admin" className="block w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-lg transition-colors">
          Portal do RH →
        </Link>
      </div>
    </main>
  );
}
