import { useState, useEffect } from "react";
import { useStore, Producto } from "../../lib/store";

import { StatusSwitch } from "../StatusSwitch";
import { Pagination } from "../Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  X,
  AlertTriangle,
  Upload,
  Package,
  Tag,
  Layers,
  Building2,
  DollarSign,
  Boxes,
  AlertCircle,
  Hash,
  Folders,
  Archive,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { productService } from "../../services/productService";
import { marcaService, Marca } from "../../services/marcaService";

export function ProductsModule() {
  const { productos, categorias, setProductos, currentUser } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [imagePreview, setImagePreview] = useState<string>("");

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

  const isAdmin = currentUser?.rol === "admin";
  const [marcas, setMarcas] = useState<Marca[]>([]);

  const refreshProductsLocal = async () => {
    try {
      const resp = await productService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        q: searchQuery,
      });

      setTotalItems(resp.total || 0);
      const mapped = resp.data.map((prod) => ({
        id: prod.id_producto.toString(),
        nombre: prod.nombre,
        descripcion: prod.descripcion || "",
        categoriaId: prod.id_categoria.toString(),
        marcaId: prod.id_marca?.toString() || "1",
        marca: (prod as any).nombre_marca || "Genérica",
        precioCompra: Number(prod.costo_promedio) || 0,
        precioVenta: Number(prod.precio_venta) || 0,
        stock: prod.stock_actual || 0,
        stockMinimo: prod.stock_min || 0,
        stockMaximo: prod.stock_max || 100,
        imagenUrl: prod.imagen_url || "",
        estado: prod.estado ? ("activo" as const) : ("inactivo" as const),
        fechaCreacion: new Date().toISOString(),
      }));
      setProductos(mapped);
    } catch (e) {
      console.error(e);
      toast.error("Error al cargar productos");
    }
  };

  useEffect(() => {
    refreshProductsLocal();
  }, [currentPage, itemsPerPage, searchQuery]);

  useEffect(() => {
    marcaService.getAll().then(setMarcas).catch(console.error);
  }, []);

  const handleOpenDialog = (product?: Producto) => {
    if (!isAdmin) {
      toast.error("Acceso denegado", {
        description:
          "Solo los administradores pueden crear o editar productos.",
      });
      return;
    }

    if (product) {
      setEditingProduct(product);
      setFormData({
        nombre: product.nombre,
        descripcion: product.descripcion,
        categoriaId: product.categoriaId,
        marcaId: product.marcaId || "",
        precioCompra: product.precioCompra.toString(),
        precioVenta: product.precioVenta.toString(),
        stock: product.stock.toString(),
        stockMinimo: product.stockMinimo.toString(),
        stockMaximo: product.stockMaximo.toString(),
        imagenUrl: product.imagenUrl || "",
        estado: product.estado,
      });
      setImagePreview(product.imagenUrl || "");
    } else {
      setEditingProduct(null);
      setFormData({
        nombre: "",
        descripcion: "",
        categoriaId: categorias[0]?.id || "",
        marcaId: marcas[0]?.id_marca.toString() || "",
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
    setIsDialogOpen(true);
  };



  const handleSave = async () => {
    if (
      !formData.nombre.trim() ||
      !formData.categoriaId
    ) {
      toast.error("Faltan campos obligatorios");
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

      await refreshProductsLocal();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      await productService.delete(Number(selectedProduct.id));
      await refreshProductsLocal();
      toast.success("Producto eliminado");
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStockStatus = (product: Producto) => {
    if (product.stock <= product.stockMinimo) {
      return {
        type: "low",
        color: "text-[#FFA500]",
        bgColor: "bg-[#FFA500]/10",
        label: "BAJO",
        message: "Stock mínimo alcanzado",
      };
    } else if (product.stock >= product.stockMaximo) {
      return {
        type: "high",
        color: "text-[#FF8C00]",
        bgColor: "bg-[#FF8C00]/10",
        label: "MÁXIMO",
        message: "Stock máximo alcanzado",
      };
    }
    return null;
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f6f3f5]">
      {/* HEADER PREMIUM */}
      <div className="px-8 pt-8 pb-5">
        <div className="relative overflow-hidden rounded-2xl shadow-xl">
          <div
            className="relative px-6 py-8"
            style={{
              background: `
                radial-gradient(ellipse at 80% 8%, rgba(140,70,90,0.6) 0%, transparent 50%),
                radial-gradient(ellipse at 12% 65%, rgba(80,25,40,0.55) 0%, transparent 50%),
                radial-gradient(ellipse at 55% 92%, rgba(110,45,65,0.45) 0%, transparent 45%),
                linear-gradient(158deg, #2e1020 0%, #3d1828 38%, #4a2035 62%, #2e1020 100%)
              `,
            }}
          >
            <div className="relative flex flex-wrap gap-6 justify-between items-center z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1
                      className="text-3xl font-bold tracking-tight"
                      style={{ color: "#fffff2" }}
                    >
                      Productos
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: "#fffff2" }}>
                      Gestión del catálogo de productos
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenDialog()}
                disabled={!isAdmin}
                style={{
                  backgroundColor: isAdmin ? "#7b1347ff" : "#d1d5db",
                  color: "#ffffff",
                  cursor: isAdmin ? "pointer" : "not-allowed",
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium shadow-sm hover:opacity-90 active:opacity-80 transition-opacity duration-150"
              >
                <Plus className="w-4 h-4" />
                Nuevo Producto
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="px-8 pb-8">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {/* Barra de búsqueda */}
          <div className="p-4 border-b border-gray-100 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#c47b96] focus:ring-2 focus:ring-[#c47b96]/20 transition-all duration-150"
                placeholder="Buscar por nombre, marca o categoría..."
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Tabla */}
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-200">
                <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-gray-400" />
                    ID
                  </div>
                </TableHead>
                <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-gray-400" />
                    Producto
                  </div>
                </TableHead>
                <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Folders className="w-3.5 h-3.5 text-gray-400" />
                    Categoría
                  </div>
                </TableHead>
                <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-gray-400" />
                    Marca
                  </div>
                </TableHead>
                <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                    Precio
                  </div>
                </TableHead>
                <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Archive className="w-3.5 h-3.5 text-gray-400" />
                    Stock
                  </div>
                </TableHead>
                <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-gray-400" />
                    Estado
                  </div>
                </TableHead>
                <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider text-right py-3">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {productos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-20">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#fff0f5] to-[#fce8f0] flex items-center justify-center">
                        <Package className="w-10 h-10 text-[#c47b96]" />
                      </div>
                      <div>
                        <p className="text-gray-700 font-semibold text-lg">
                          {searchQuery
                            ? `No se encontraron resultados para "${searchQuery}"`
                            : "No hay productos registrados"}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          {searchQuery
                            ? "Intenta con otros términos de búsqueda"
                            : "Los productos aparecerán aquí"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                productos.map((product) => {
                  const stockStatus = getStockStatus(product);
                  return (
                    <TableRow
                      key={product.id}
                      className="border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#fff0f5]/40 hover:to-transparent group"
                    >
                      <TableCell className="py-2.5">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsDetailDialogOpen(true);
                          }}
                          className="font-mono text-[11px] font-semibold text-gray-500 hover:text-[#c47b96] transition-all duration-200 flex items-center gap-2 group/btn"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover/btn:bg-[#c47b96] transition-colors"></div>
                          <span className="group-hover/btn:underline">
                            {product.id.slice(0, 8)}
                          </span>
                        </button>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="text-gray-800 font-semibold text-sm">
                          {product.nombre}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#c47b96]/5 text-gray-600 text-xs text-center justify-center min-w-[100px]">
                          <Layers className="w-3 h-3" />
                          {categorias.find((c) => c.id === product.categoriaId)
                            ?.nombre || "Sin cat."}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="text-gray-600 text-sm">
                          {product.marca}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-gray-900 font-bold text-sm">
                          {formatCurrency(product.precioVenta)}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span
                            className={`font-semibold text-sm ${stockStatus?.color || "text-gray-800"}`}
                          >
                            {product.stock} und.
                          </span>
                          {stockStatus && (
                            <span
                              className={`text-[10px] ${stockStatus.color} font-medium`}
                            >
                              {stockStatus.label}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <StatusSwitch
                          status={product.estado}
                          onChange={(newStatus: "activo" | "inactivo") => {
                            if (!isAdmin) return;
                            productService
                              .update(Number(product.id), {
                                estado: newStatus === "activo",
                              })
                              .then(refreshProductsLocal);
                          }}
                          disabled={!isAdmin}
                        />
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsDetailDialogOpen(true);
                            }}
                            title="Ver detalles"
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-150"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDialog(product)}
                            disabled={!isAdmin}
                            title={
                              !isAdmin ? "Acceso denegado" : "Editar producto"
                            }
                            className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 ${
                              isAdmin
                                ? "text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                                : "text-gray-300 cursor-not-allowed"
                            }`}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsDeleteDialogOpen(true);
                            }}
                            disabled={!isAdmin}
                            title={
                              !isAdmin ? "Acceso denegado" : "Eliminar producto"
                            }
                            className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 ${
                              isAdmin
                                ? "text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                                : "text-gray-300 cursor-not-allowed"
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(newItemsPerPage) => {
                setItemsPerPage(newItemsPerPage);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* ==================== DIALOG DE CREACIÓN/EDICIÓN ==================== */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white border border-gray-200 max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-0">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#c47b96] via-[#e092b2] to-[#c47b96]" />

          <div className="p-6">
            <DialogHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-[#fff0f5] to-[#fce8f0] rounded-xl">
                  <Package className="w-5 h-5 text-[#c47b96]" />
                </div>
                <div>
                  <DialogTitle className="text-[#2e1020] text-xl font-bold">
                    {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                  </DialogTitle>
                  <DialogDescription className="text-gray-500 text-sm mt-0.5">
                    {editingProduct
                      ? "Modifica los datos del producto existente"
                      : "Completa el formulario para crear un nuevo producto"}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-5 py-6">
              {/* Columna 1 */}
              <div className="space-y-4">


                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-[#c47b96]" />
                    Nombre <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11"
                    placeholder="Nombre del producto"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#c47b96]" />
                    Categoría <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={formData.categoriaId}
                    onValueChange={(v: string) =>
                      setFormData({ ...formData, categoriaId: v })
                    }
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 rounded-xl">
                      {categorias.map((c) => (
                        <SelectItem
                          key={c.id}
                          value={c.id}
                          className="text-gray-800"
                        >
                          {c.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-[#c47b96]" />
                    Marca
                  </Label>
                  <Select
                    value={formData.marcaId}
                    onValueChange={(v: string) =>
                      setFormData({ ...formData, marcaId: v })
                    }
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11">
                      <SelectValue placeholder="Seleccionar marca" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 rounded-xl">
                      {marcas.map((m) => (
                        <SelectItem
                          key={m.id_marca}
                          value={m.id_marca.toString()}
                          className="text-gray-800"
                        >
                          {m.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Columna 2 */}
              <div className="space-y-4">
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

              {/* Descripción - ocupa ambas columnas */}
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
                  placeholder="Escribe una breve descripción del producto..."
                  className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all resize-none"
                  rows={3}
                />
              </div>

              {/* Imagen - ocupa ambas columnas */}
              <div className="col-span-2 space-y-4">
                <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5 text-[#c47b96]" />
                  Imagen del Producto (URL)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3">
                    <Input
                      value={formData.imagenUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, imagenUrl: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11"
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                    <p className="text-[11px] text-gray-400 mt-2 px-1">
                      Pegue la dirección URL de la imagen. Se recomienda usar enlaces directos de alta calidad.
                    </p>
                  </div>
                  <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 h-[110px] overflow-hidden group hover:border-[#c47b96]/30 transition-all">
                    {imagePreview ? (
                      <div className="relative w-full h-full flex items-center justify-center p-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-full max-h-full object-contain rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Error+de+URL';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview("");
                            setFormData({ ...formData, imagenUrl: "" });
                          }}
                          className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-1 shadow-lg hover:bg-rose-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-gray-300">
                        <Package className="w-8 h-8 opacity-20" />
                        <span className="text-[10px] font-medium uppercase tracking-widest opacity-40">Sin Vista Previa</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-gray-100 pt-4 gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-6"
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-[#c47b96] to-[#e092b2] hover:shadow-lg hover:shadow-[#c47b96]/25 transition-all rounded-xl text-white font-semibold px-6"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Guardando...
                  </div>
                ) : editingProduct ? (
                  "Actualizar Producto"
                ) : (
                  "Crear Producto"
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==================== DIALOG DE DETALLE ==================== */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent
          className="text-white border border-white/10 w-[95vw] sm:max-w-[700px] !max-w-[700px] p-0 overflow-hidden rounded-[2rem] shadow-2xl"
          style={{
            background:
              "linear-gradient(158deg, #2e1020 0%, #3d1828 38%, #4a2035 62%, #2e1020 100%)",
            backgroundColor: "#2e1020",
          }}
        >
          {/* Header Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#b06080] via-[#e0a0be] to-[#b06080]" />

          {selectedProduct && (
            <div className="flex flex-col h-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="p-8 border-b border-white/10 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#e092b2]/10 rounded-xl border border-[#e092b2]/20">
                    <Package className="w-6 h-6 text-[#e092b2]" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-white leading-tight">
                      Detalle del Producto{" "}
                      <span className="text-[#e092b2]">
                        #{selectedProduct.id.slice(0, 8).toUpperCase()}
                      </span>
                    </DialogTitle>
                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-1">
                      Información Técnica y Comercial
                    </p>
                  </div>
                </div>
                <div
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase bg-white/5 border border-white/10 ${selectedProduct.estado === "activo" ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {selectedProduct.estado.toUpperCase()}
                </div>
              </div>

              {/* Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Image and Basic Info */}
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                  <div className="w-48 h-48 shrink-0 rounded-3xl bg-black/40 border-2 border-white/10 overflow-hidden flex items-center justify-center p-4 group relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#e092b2]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {selectedProduct.imagenUrl ? (
                      <img
                        src={selectedProduct.imagenUrl}
                        alt={selectedProduct.nombre}
                        className="w-full h-full object-contain relative z-10"
                      />
                    ) : (
                      <Package className="w-16 h-16 text-white/10" />
                    )}
                  </div>

                  <div className="flex-1 space-y-4 text-center md:text-left">
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
                        {selectedProduct.nombre}
                      </h2>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-white/60 text-[10px] uppercase font-bold tracking-wider">
                          <Building2 className="w-3 h-3 text-[#e092b2]" />
                          {selectedProduct.marca}
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-white/60 text-[10px] uppercase font-bold tracking-wider">
                          <Folders className="w-3 h-3 text-[#e092b2]" />
                          {categorias.find(c => c.id === selectedProduct.categoriaId)?.nombre || "Sin Categoría"}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10">
                      <Label className="text-white/30 text-[9px] uppercase font-bold tracking-widest mb-2 block text-left">
                        Descripción del Producto
                      </Label>
                      <p className="text-white/70 text-sm leading-relaxed text-left">
                        {selectedProduct.descripcion || (
                          <span className="text-white/20 italic">Sin descripción registrada para este artículo</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Technical Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Prices Card */}
                  <div className="space-y-3">
                    <Label className="text-white/30 text-[9px] uppercase font-bold tracking-widest flex items-center gap-2">
                       <DollarSign className="w-3 h-3" /> Estructura de Precios
                    </Label>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                      <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl">
                        <span className="text-white/40 text-xs font-semibold">Costo Compra</span>
                        <span className="text-white/80 font-mono text-sm">{formatCurrency(selectedProduct.precioCompra)}</span>
                      </div>
                      <div className="flex justify-between items-end p-2">
                        <div>
                          <p className="text-[#e092b2]/60 text-[8px] font-bold uppercase tracking-wider mb-1">Precio Sugerido Venta</p>
                          <p className="text-3xl font-black text-white tracking-tighter">{formatCurrency(selectedProduct.precioVenta)}</p>
                        </div>
                        <div className="px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                          <p className="text-emerald-400 text-[9px] font-bold">MARGEN POSITIVO</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stock Card */}
                  <div className="space-y-3">
                    <Label className="text-white/30 text-[9px] uppercase font-bold tracking-widest flex items-center gap-2">
                       <Archive className="w-3 h-3" /> Estado de Inventario
                    </Label>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <div className="space-y-1">
                          <p className="text-white font-black text-2xl tracking-tight">{selectedProduct.stock} <span className="text-xs text-white/40 font-normal">unid.</span></p>
                          <p className="text-white/30 text-[9px] uppercase font-bold">En Existencia Actual</p>
                        </div>
                        <div className={`p-4 rounded-xl ${getStockStatus(selectedProduct)?.bgColor || "bg-white/5"} border border-white/10`}>
                           <span className={`text-[10px] font-black uppercase ${getStockStatus(selectedProduct)?.color || "text-white/40"}`}>
                             {getStockStatus(selectedProduct)?.label || "ESTABLE"}
                           </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 pt-2">
                         <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                            <p className="text-white/30 text-[8px] font-bold uppercase mb-1">Stock Mín.</p>
                            <p className="text-white font-bold text-xs">{selectedProduct.stockMinimo} unidades</p>
                         </div>
                         <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                            <p className="text-white/30 text-[8px] font-bold uppercase mb-1">Stock Máx.</p>
                            <p className="text-white font-bold text-xs">{selectedProduct.stockMaximo} unidades</p>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-8 border-t border-white/10 bg-black/10 flex justify-end">
                <Button
                  onClick={() => setIsDetailDialogOpen(false)}
                  variant="ghost"
                  className="px-8 h-12 rounded-xl text-white/60 hover:text-white hover:bg-white/10 border border-white/10 transition-all font-bold uppercase text-[10px] tracking-widest"
                >
                  Regresar al Catálogo
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ==================== DIALOG DE ELIMINACIÓN ==================== */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white border border-gray-200 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-rose-400 via-rose-500 to-rose-400" />

          <div className="p-6">
            <DialogHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl">
                  <Trash2 className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <DialogTitle className="text-[#2e1020] text-xl font-bold">
                    Eliminar Producto
                  </DialogTitle>
                  <DialogDescription className="text-gray-500 text-sm mt-0.5">
                    Esta acción no se puede deshacer
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-rose-400" />
              </div>
              <p className="text-gray-700 font-medium">
                ¿Estás seguro de eliminar el producto{" "}
                <span className="font-bold text-[#c47b96]">
                  "{selectedProduct?.nombre}"
                </span>
                ?
              </p>
              <p className="text-gray-400 text-xs mt-3">
                Esta acción eliminará permanentemente el producto del sistema.
              </p>
            </div>

            <DialogFooter className="border-t border-gray-100 pt-4 gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmDelete}
                className="bg-gradient-to-r from-rose-500 to-rose-600 hover:shadow-lg hover:shadow-rose-500/25 transition-all rounded-xl text-white font-semibold flex-1"
              >
                Eliminar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
