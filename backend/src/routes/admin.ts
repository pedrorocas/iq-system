import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { requireAdmin, AuthRequest } from "../middleware/auth";
import { sendTestInvite } from "../lib/email";
import { getIQClassification } from "../lib/iq";

const router = Router();
const prisma = new PrismaClient();

// GET /admin/results
router.get("/results", requireAdmin, async (_req: AuthRequest, res: Response) => {
  const candidates = await prisma.candidate.findMany({
    orderBy: { createdAt: "desc" },
    include: { session: true },
  });

  return res.json({ candidates: candidates.map(c => ({
    id: c.id, name: c.name, email: c.email, createdAt: c.createdAt,
    status: !c.session ? "pendente" : c.session.finishedAt ? "concluido" : "em_andamento",
    finishedAt: c.session?.finishedAt ?? null,
    score: c.session?.score ?? null,
    iq: c.session?.iq ?? null,
    iqClassification: c.session?.iq ? getIQClassification(c.session.iq) : null,
  }))});
});

// POST /admin/candidates
router.post("/candidates", requireAdmin, async (req: AuthRequest, res: Response) => {
  const r = z.object({ name: z.string().min(2), email: z.string().email() }).safeParse(req.body);
  if (!r.success) return res.status(400).json({ error: "Dados inválidos" });

  const existing = await prisma.candidate.findUnique({ where: { email: r.data.email } });
  if (existing) return res.status(409).json({ error: "Este e-mail já foi convidado" });

  const candidate = await prisma.candidate.create({ data: r.data });

  try {
    await sendTestInvite(candidate.name, candidate.email, candidate.accessToken);
  } catch (err) {
    console.error("Erro ao enviar e-mail:", err);
    return res.status(201).json({ candidate, warning: "Candidato criado mas houve erro ao enviar o e-mail." });
  }

  return res.status(201).json({ candidate });
});

// DELETE /admin/candidates/:id
router.delete("/candidates/:id", requireAdmin, async (req: AuthRequest, res: Response) => {
  const c = await prisma.candidate.findUnique({ where: { id: req.params.id } });
  if (!c) return res.status(404).json({ error: "Candidato não encontrado" });
  await prisma.testSession.deleteMany({ where: { candidateId: c.id } });
  await prisma.candidate.delete({ where: { id: c.id } });
  return res.json({ success: true });
});

// GET /admin/export/csv
router.get("/export/csv", requireAdmin, async (_req: AuthRequest, res: Response) => {
  const candidates = await prisma.candidate.findMany({ orderBy: { createdAt: "desc" }, include: { session: true } });
  const rows = [
    ["Nome","E-mail","Data do Teste","Nota (/60)","QI","Classificação","Status"],
    ...candidates.map(c => [
      c.name, c.email,
      c.session?.finishedAt ? new Date(c.session.finishedAt).toLocaleDateString("pt-BR") : "-",
      c.session?.score != null ? String(c.session.score) : "-",
      c.session?.iq != null ? String(c.session.iq) : "-",
      c.session?.iq ? getIQClassification(c.session.iq) : "-",
      !c.session ? "Pendente" : c.session.finishedAt ? "Concluído" : "Em andamento",
    ]),
  ];
  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  res.setHeader("Content-Type","text/csv; charset=utf-8");
  res.setHeader("Content-Disposition","attachment; filename=resultados-qi.csv");
  return res.send("\uFEFF" + csv);
});

export default router;
