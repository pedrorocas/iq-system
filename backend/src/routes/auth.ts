import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

const router = Router();
const prisma = new PrismaClient();

router.post("/admin/login", async (req: Request, res: Response) => {
  const r = z.object({ email: z.string().email(), password: z.string() }).safeParse(req.body);
  if (!r.success) return res.status(400).json({ error: "Dados inválidos" });

  const admin = await prisma.admin.findUnique({ where: { email: r.data.email } });
  if (!admin || !(await bcrypt.compare(r.data.password, admin.passwordHash)))
    return res.status(401).json({ error: "Credenciais inválidas" });

  const token = jwt.sign({ id: admin.id, role: "admin" }, process.env.JWT_SECRET!, { expiresIn: "8h" });
  return res.json({ token });
});

router.post("/candidate/login", async (req: Request, res: Response) => {
  const r = z.object({ name: z.string().min(1), email: z.string().email(), accessToken: z.string() }).safeParse(req.body);
  if (!r.success) return res.status(400).json({ error: "Dados inválidos" });

  const candidate = await prisma.candidate.findUnique({ where: { accessToken: r.data.accessToken } });
  if (!candidate) return res.status(404).json({ error: "Link inválido ou expirado" });
  if (candidate.email.toLowerCase() !== r.data.email.toLowerCase())
    return res.status(401).json({ error: "E-mail não corresponde ao convite" });

  const session = await prisma.testSession.findUnique({ where: { candidateId: candidate.id } });
  if (session?.finishedAt) return res.status(409).json({ error: "Você já realizou este teste" });

  await prisma.candidate.update({ where: { id: candidate.id }, data: { name: r.data.name, tokenUsed: true } });

  const token = jwt.sign({ id: candidate.id, role: "candidate" }, process.env.JWT_SECRET!, { expiresIn: "4h" });
  return res.json({ token, candidateName: candidate.name });
});

export default router;
