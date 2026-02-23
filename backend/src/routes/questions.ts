import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import { z } from "zod";
import { requireAdmin, AuthRequest } from "../middleware/auth";
import { uploadImage, deleteImage } from "../lib/storage";

const router = Router();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// GET /questions — lista todas as questões
router.get("/", requireAdmin, async (_req: AuthRequest, res: Response) => {
  const questions = await prisma.question.findMany({ orderBy: { order: "asc" } });
  return res.json({ questions });
});

// GET /questions/:id
router.get("/:id", requireAdmin, async (req: AuthRequest, res: Response) => {
  const q = await prisma.question.findUnique({ where: { id: Number(req.params.id) } });
  if (!q) return res.status(404).json({ error: "Questão não encontrada" });
  return res.json({ question: q });
});

// POST /questions — cria questão (com imagem opcional)
router.post("/", requireAdmin, upload.single("image"), async (req: AuthRequest, res: Response) => {
  const r = z.object({
    statement: z.string().min(1),
    optionA: z.string().min(1),
    optionB: z.string().min(1),
    optionC: z.string().min(1),
    optionD: z.string().min(1),
    optionE: z.string().min(1),
    correctAnswer: z.enum(["A","B","C","D","E"]),
    order: z.coerce.number().optional(),
  }).safeParse(req.body);

  if (!r.success) return res.status(400).json({ error: "Dados inválidos", details: r.error.flatten() });

  let imageUrl: string | undefined;
  if (req.file) {
    imageUrl = await uploadImage(req.file.buffer, req.file.originalname, req.file.mimetype);
  }

  // Ordem padrão = última posição
  const count = await prisma.question.count();
  const question = await prisma.question.create({
    data: { ...r.data, imageUrl, order: r.data.order ?? count + 1 },
  });

  return res.status(201).json({ question });
});

// PUT /questions/:id — edita questão
router.put("/:id", requireAdmin, upload.single("image"), async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const existing = await prisma.question.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Questão não encontrada" });

  const r = z.object({
    statement: z.string().min(1).optional(),
    optionA: z.string().min(1).optional(),
    optionB: z.string().min(1).optional(),
    optionC: z.string().min(1).optional(),
    optionD: z.string().min(1).optional(),
    optionE: z.string().min(1).optional(),
    correctAnswer: z.enum(["A","B","C","D","E"]).optional(),
    order: z.coerce.number().optional(),
    removeImage: z.string().optional(), // "true" para remover imagem existente
  }).safeParse(req.body);

  if (!r.success) return res.status(400).json({ error: "Dados inválidos" });

  let imageUrl = existing.imageUrl;

  // Remove imagem existente se solicitado
  if (r.data.removeImage === "true" && existing.imageUrl) {
    await deleteImage(existing.imageUrl);
    imageUrl = null;
  }

  // Faz upload de nova imagem
  if (req.file) {
    if (existing.imageUrl) await deleteImage(existing.imageUrl);
    imageUrl = await uploadImage(req.file.buffer, req.file.originalname, req.file.mimetype);
  }

  const { removeImage, ...updateData } = r.data;
  const question = await prisma.question.update({ where: { id }, data: { ...updateData, imageUrl } });
  return res.json({ question });
});

// DELETE /questions/:id
router.delete("/:id", requireAdmin, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const existing = await prisma.question.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Questão não encontrada" });
  if (existing.imageUrl) await deleteImage(existing.imageUrl);
  await prisma.question.delete({ where: { id } });
  return res.json({ success: true });
});

export default router;
