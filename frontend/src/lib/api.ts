const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function api<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers: HeadersInit = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erro inesperado");
  return data as T;
}

export async function apiForm<T>(path: string, formData: FormData, token: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erro inesperado");
  return data as T;
}

export async function apiFormPut<T>(path: string, formData: FormData, token: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erro inesperado");
  return data as T;
}
