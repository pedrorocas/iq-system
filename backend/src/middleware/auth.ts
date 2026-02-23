import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id: string; role: "admin" | "candidate" };
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Não autorizado" });
  try {
    const p = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (p.role !== "admin") return res.status(403).json({ error: "Acesso negado" });
    req.user = { id: p.id, role: "admin" };
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}

export function requireCandidate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Não autorizado" });
  try {
    const p = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (p.role !== "candidate") return res.status(403).json({ error: "Acesso negado" });
    req.user = { id: p.id, role: "candidate" };
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}
