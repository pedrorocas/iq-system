import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTestInvite(name: string, email: string, token: string) {
  const url = `${process.env.FRONTEND_URL}/teste?token=${token}`;
  await resend.emails.send({
    from: "RH <rh@suaempresa.com.br>",
    to: email,
    subject: "Convite para Teste de Raciocínio Lógico",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:8px;">
        <h2 style="color:#1a1a2e">Olá, ${name}!</h2>
        <p style="color:#444;line-height:1.6">Você foi convidado(a) a realizar o <strong>Teste de Raciocínio Lógico</strong> como parte do nosso processo seletivo.</p>
        <p style="color:#444;line-height:1.6">O teste contém <strong>60 questões</strong> de múltipla escolha.</p>
        <div style="background:#fff3cd;border-left:4px solid #ffc107;padding:12px 16px;margin:20px 0;border-radius:4px;">
          <strong>⚠️ Atenção:</strong> O teste só pode ser realizado <strong>uma única vez</strong>.
        </div>
        <a href="${url}" style="display:inline-block;background:#1a1a2e;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:bold;">Iniciar Teste →</a>
        <p style="color:#999;font-size:12px;margin-top:24px;">Ou acesse: <a href="${url}">${url}</a></p>
      </div>
    `,
  });
}
