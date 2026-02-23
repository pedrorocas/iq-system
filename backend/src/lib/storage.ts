import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function uploadImage(
  buffer: Buffer,
  filename: string,
  mimetype: string
): Promise<string> {
  const ext = filename.split(".").pop();
  const path = `questions/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("question-images")
    .upload(path, buffer, { contentType: mimetype, upsert: false });

  if (error) throw new Error(`Erro ao fazer upload: ${error.message}`);

  const { data } = supabase.storage
    .from("question-images")
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function deleteImage(imageUrl: string): Promise<void> {
  // Extrai o path da URL pública
  const path = imageUrl.split("/question-images/")[1];
  if (!path) return;
  await supabase.storage.from("question-images").remove([path]);
}
