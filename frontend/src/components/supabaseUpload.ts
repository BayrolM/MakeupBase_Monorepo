import { supabase } from "../lib/supabase";

export const uploadToSupabase = async (
  file: File, 
  bucketName: string = "products"
): Promise<{ secure_url: string }> => {
  const fileExt = file.name.split(".").pop() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

  console.log(`📤 Subiendo a Supabase bucket: ${bucketName}, archivo: ${fileName}`);
  console.log(`📎 File size: ${file.size}, type: ${file.type}`);

  // Direct upload - sin verificar buckets (confiamos en que existe)
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

  if (error) {
    console.error("❌ Error upload Supabase:", error);
    throw new Error(error.message || "Error al subir el archivo");
  }

  console.log("✅ Upload completado:", data);

  // Obtener URL pública
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  console.log("🔗 Public URL:", urlData.publicUrl);

  if (!urlData.publicUrl) {
    throw new Error("No se pudo obtener la URL pública del archivo");
  }

  return { secure_url: urlData.publicUrl };
};