import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { requireCandidate, AuthRequest } from "../middleware/auth";
import { scoreToIQ } from "../lib/iq";

const router = Router();
const prisma = new PrismaClient();

router.get("/questions", requireCandidate, async (req: AuthRequest, res: Response) => {
  const candidateId = req.user!.id;

  const session = await prisma.testSession.findUnique({ where: { candidateId } });
  if (session?.finishedAt) return res.status(409).json({ error: "Teste já concluído" });
  if (!session) await prisma.testSession.create({ data: { candidateId } });

  const questions = await prisma.question.findMany({
    orderBy: { order: "asc" },
    select: { id:true, statement:true, imageUrl:true, optionA:true, optionB:true, optionC:true, optionD:true, optionE:true },
    // correctAnswer NUNCA é retornado
  });

  return res.json({ questions });
});

router.post("/submit", requireCandidate, async (req: AuthRequest, res: Response) => {
  const r = z.object({ answers: z.record(z.string(), z.enum(["A","B","C","D","E"])) }).safeParse(req.body);
  if (!r.success) return res.status(400).json({ error: "Formato inválido" });

  const candidateId = req.user!.id;
  const session = await prisma.testSession.findUnique({ where: { candidateId } });
  if (!session) return res.status(404).json({ error: "Sessão não encontrada" });
  if (session.finishedAt) return res.status(409).json({ error: "Teste já concluído" });

  const questions = await prisma.question.findMany();
  let score = 0;
  for (const q of questions) {
    if (r.data.answers[String(q.id)] === q.correctAnswer) score++;
  }

  const iq = scoreToIQ(score);
  await prisma.testSession.update({ where: { id: session.id }, data: { finishedAt: new Date(), score, iq } });

  return res.json({ success: true });
});

export default router;
