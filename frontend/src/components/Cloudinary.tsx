/**
 * Utilidad para cargar imágenes r Cloudinary usando el método "Unsigned Upload".
 * @param file El archivo (File) a cargar.
 * @returns El objeto de respuesta de Cloudinary que incluye el secure_url.
 */
export const uploadToCloudinary = async (file: File) => {
  const cloud_name = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset_name = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloud_name || !preset_name) {
    throw new Error("Credenciales de Cloudinary no configuradas en .env");
  }

  console.log("Iniciando subida a Cloudinary...");
  console.log("Cloud Name:", cloud_name);
  console.log("Upload Preset:", preset_name);

  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", preset_name);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,

      {
        method: "POST",
        body: data,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Error al cargar la imagen");
    }

    const fileData = await response.json();
    return fileData;
  } catch (error) {
    console.error("Error al cargar la imagen en Cloudinary:", error);
    throw error;
  }
};

