import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { GenericCombobox } from "../../GenericCombobox";
import {
  X,
  Plus,
  Pencil,
  Tag,
  Layers,
  Building2,
  DollarSign,
  Boxes,
  AlertCircle,
  Archive,
  Upload,
  Loader2,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { Producto, Categoria, Marca } from "../../../lib/store";
import { uploadToCloudinary } from "../../Cloudinary";
import { validateProductField } from "../../../utils/productUtils";
import { productService } from "../../../services/productService";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: Producto | null;
  categorias: Categoria[];
  marcas: Marca[];
  refreshProducts: () => Promise<void>;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  editingProduct,
  categorias,
  marcas,
  refreshProducts,
}: ProductFormDialogProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    categoriaId: "",
    marcaId: "",
    precioCompra: "",
    precioVenta: "",
    stock: "",
    stockMinimo: "",
    stockMaximo: "",
    imagenUrl: "",
    estado: "activo" as "activo" | "inactivo",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        nombre: editingProduct.nombre,
        descripcion: editingProduct.descripcion,
        categoriaId: editingProduct.categoriaId,
        marcaId: editingProduct.marcaId || "",
        precioCompra: editingProduct.precioCompra.toString(),
        precioVenta: editingProduct.precioVenta.toString(),
        stock: editingProduct.stock.toString(),
        stockMinimo: editingProduct.stockMinimo.toString(),
        stockMaximo: editingProduct.stockMaximo.toString(),
        imagenUrl: editingProduct.imagenUrl || "",
        estado: editingProduct.estado,
      });
      setImagePreview(editingProduct.imagenUrl || "");
    } else {
      setFormData({
        nombre: "",
        descripcion: "",
        categoriaId: categorias[0]?.id || "",
        marcaId: marcas[0]?.id || "",
        precioCompra: "0",
        precioVenta: "0",
        stock: "0",
        stockMinimo: "0",
        stockMaximo: "100",
        imagenUrl: "",
        estado: "activo",
      });
      setImagePreview("");
    }
    setFieldErrors({});
  }, [editingProduct, open, categorias, marcas]);

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateProductField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe pesar más de 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const data = await uploadToCloudinary(file);
      setFormData((prev) => ({ ...prev, imagenUrl: data.secure_url }));
      setImagePreview(data.secure_url);
      toast.success("Imagen cargada correctamente");
    } catch (error: any) {
      toast.error(error.message || "Error al subir la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    const nombreErr = validateProductField("nombre", formData.nombre);
    if (nombreErr) newErrors.nombre = nombreErr;
    const catErr = validateProductField("categoriaId", formData.categoriaId);
    if (catErr) newErrors.categoriaId = catErr;
    const marcaErr = validateProductField("marcaId", formData.marcaId);
    if (marcaErr) newErrors.marcaId = marcaErr;

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      toast.error("Corrige los errores antes de continuar");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        id_categoria: Number(formData.categoriaId),
        id_marca: Number(formData.marcaId) || 1,
        precio_venta: Number(formData.precioVenta),
        costo_promedio: Number(formData.precioCompra),
        stock_actual: Number(formData.stock),
        stock_min: Number(formData.stockMinimo),
        stock_max: Number(formData.stockMaximo),
        imagen_url: formData.imagenUrl,
        estado: formData.estado === "activo",
      };

      if (editingProduct) {
        await productService.update(Number(editingProduct.id), payload);
        toast.success("Producto actualizado");
      } else {
        await productService.create(payload);
        toast.success("Producto creado");
      }

      await refreshProducts();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-0">
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0 luxury-icon-gradient" style={{ width: 44, height: 44, borderRadius: 12 }}>
              {editingProduct ? (
                <Pencil className="w-5 h-5" />
              ) : (
                <Package className="w-5 h-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                {editingProduct
                  ? "Modifica los datos del producto existente"
                  : "Completa el formulario para crear un nuevo producto"}
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-5 py-6">
            <div className="space-y-4" style={{ position: "relative", zIndex: 50 }}>
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-[#c47b96]" />
                  Nombre <span className="text-rose-500">*</span>
                </Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => handleFieldChange("nombre", e.target.value)}
                  className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${fieldErrors.nombre ? "border-rose-400" : ""}`}
                  placeholder="Nombre del producto"
                  maxLength={80}
                />
                {fieldErrors.nombre && <p className="text-rose-500 text-xs mt-1">{fieldErrors.nombre}</p>}
              </div>

              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#c47b96]" />
                    Categoría <span className="text-rose-500">*</span>
                  </Label>
                  <GenericCombobox
                    options={categorias
                      .filter((c) => c.estado === "activo")
                      .map((c) => ({
                        value: c.id.toString(),
                        label: c.nombre,
                      }))}
                    value={formData.categoriaId}
                    onChange={(v) => {
                      setFormData({ ...formData, categoriaId: v });
                      handleFieldChange("categoriaId", v);
                    }}
                    placeholder="Seleccionar categoría"
                    disabled={isSaving}
                  />
                  {fieldErrors.categoriaId && (
                    <p className="text-rose-500 text-xs mt-1">{fieldErrors.categoriaId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-[#c47b96]" />
                    Marca <span className="text-rose-500">*</span>
                  </Label>
                  <GenericCombobox
                    options={marcas.map((m) => ({
                      value: m.id,
                      label: m.nombre,
                    }))}
                    value={formData.marcaId}
                    onChange={(v) => {
                      setFormData({ ...formData, marcaId: v });
                      handleFieldChange("marcaId", v);
                    }}
                    placeholder="Seleccionar marca"
                    disabled={isSaving}
                  />
                  {fieldErrors.marcaId && (
                    <p className="text-rose-500 text-xs mt-1">{fieldErrors.marcaId}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4" style={{ position: "relative", zIndex: 40 }}>
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-[#c47b96]" />
                  Precio Compra
                </Label>
                <Input
                  type="number"
                  value={formData.precioCompra}
                  onChange={(e) =>
                    setFormData({ ...formData, precioCompra: e.target.value })
                  }
                  className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-[#c47b96]" />
                  Precio Venta <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="number"
                  value={formData.precioVenta}
                  onChange={(e) =>
                    setFormData({ ...formData, precioVenta: e.target.value })
                  }
                  className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <Boxes className="w-3.5 h-3.5 text-[#c47b96]" />
                    Stock Actual
                  </Label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-[#c47b96]" />
                    Stock Mínimo
                  </Label>
                  <Input
                    type="number"
                    value={formData.stockMinimo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stockMinimo: e.target.value,
                      })
                    }
                    className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11"
                  />
                </div>
              </div>
            </div>

            <div className="col-span-2 space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <Archive className="w-3.5 h-3.5 text-[#c47b96]" />
                Descripción (Opcional)
              </Label>
              <Textarea
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] min-h-[100px] transition-all"
                placeholder="Detalles sobre el producto..."
              />
            </div>

            <div className="col-span-2 space-y-4 pt-4">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <Upload className="w-3.5 h-3.5 text-[#c47b96]" />
                Imagen del Producto
              </Label>
              <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                <div className="w-32 h-32 rounded-xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden shadow-inner">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-10 h-10 text-gray-200" />
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-xs text-gray-500">
                    Sube una imagen clara del producto. Formatos aceptados:
                    JPG, PNG. Máximo 5MB.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <input
                        type="file"
                        id="image-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                      <Label
                        htmlFor="image-upload"
                        className={`inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer shadow-sm ${
                          isUploading ? "opacity-50 pointer-events-none" : ""
                        }`}
                      >
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#c47b96]" />
                        ) : (
                          <Upload className="w-4 h-4 text-[#c47b96]" />
                        )}
                        {isUploading ? "Subiendo..." : "Seleccionar Imagen"}
                      </Label>
                    </div>
                    {imagePreview && (
                      <button
                        onClick={() => {
                          setFormData({ ...formData, imagenUrl: "" });
                          setImagePreview("");
                        }}
                        className="px-4 py-2 text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6 pt-4 border-t border-gray-100 sticky bottom-0 bg-white z-10">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-5 h-10 text-sm"
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <button
            onClick={handleSave}
            disabled={isSaving || isUploading}
            className={`rounded-lg font-semibold px-6 h-10 text-sm border-0 luxury-button-modal ${
              (isSaving || isUploading) ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{editingProduct ? "Actualizando..." : "Creando..."}</span>
              </div>
            ) : editingProduct ? (
              "Actualizar Producto"
            ) : (
              "Crear Producto"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
