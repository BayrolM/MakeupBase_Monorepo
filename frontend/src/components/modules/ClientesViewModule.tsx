import { useState, useEffect } from "react";
import { useStore, TipoDocumento } from "../../lib/store";

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
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Search,
  AlertTriangle,
  X,
  UserCheck,
  Users,
  Hash,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  User,
  Building2,
  ShoppingBag,
  Lock,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

import { userService } from "../../services/userService";
import { Cliente } from "../../lib/store";

export function ClientesViewModule() {
  const { users, clientes, setClientes, ventas, pedidos } =
    useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingCliente, setEditingCliente] = useState<any>(null);
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    tipoDocumento: "CC" as TipoDocumento,
    numeroDocumento: "",
    fechaNacimiento: "",
    email: "",
    passwordHash: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    pais: "Colombia",
    estado: "activo" as "activo" | "inactivo",
  });



  const fetchClientes = async () => {
    try {
      const response = await userService.getAll({
        id_rol: 2,
        q: searchQuery.length >= 2 ? searchQuery : undefined,
      });

      const mapped: Cliente[] = response.data.map((u: any) => {
        const nombres = u.nombres || u.nombre || "";
        const apellidos = u.apellidos || u.apellido || "";
        return {
          id: u.id_usuario.toString(),
          nombre: `${nombres} ${apellidos}`.trim() || "Sin Nombre",
          nombres: nombres,
          apellidos: apellidos,
          email: u.email,
          telefono: u.telefono || "",
          documento: u.documento || "",
          numeroDocumento: u.documento || "",
          id_rol: u.id_rol,
          rol: "cliente" as const,
          estado: u.estado ? "activo" : "inactivo",
          totalCompras: Number(u.total_ventas) || 0,
          fechaRegistro: u.fecha_registro || new Date().toISOString(),
          tipoDocumento: u.tipo_documento || "CC",
          direccion: u.direccion || "",
          ciudad: u.ciudad || "",
          pais: u.pais || "Colombia",
        };
      });
      setClientes(mapped);
    } catch (error: any) {
      toast.error("Error al cargar clientes", { description: error.message });
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleOpenDialog = (cliente?: any) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        nombres: cliente.nombres,
        apellidos: cliente.apellidos,
        tipoDocumento: cliente.tipoDocumento,
        numeroDocumento: cliente.numeroDocumento,
        fechaNacimiento: cliente.fechaNacimiento || "",
        email: cliente.email,
        passwordHash: cliente.passwordHash,
        telefono: cliente.telefono,
        direccion: cliente.direccion || "",
        ciudad: cliente.ciudad || "",
        pais: cliente.pais || "Colombia",
        estado: cliente.estado,
      });
    } else {
      setEditingCliente(null);
      setFormData({
        nombres: "",
        apellidos: "",
        tipoDocumento: "CC",
        numeroDocumento: "",
        fechaNacimiento: "",
        email: "",
        passwordHash: "",
        telefono: "",
        direccion: "",
        ciudad: "",
        pais: "Colombia",
        estado: "activo",
      });
    }
    setIsDialogOpen(true);
  };

  const validateForm = () => {
    if (!formData.nombres.trim()) {
      toast.error("Campo obligatorio", {
        description: "El nombre es obligatorio.",
      });
      return false;
    }

    if (!formData.apellidos.trim()) {
      toast.error("Campo obligatorio", {
        description: "El apellido es obligatorio.",
      });
      return false;
    }

    if (formData.nombres.trim().length > 100) {
      toast.error("Nombre demasiado largo", {
        description: "El nombre no debe superar 100 caracteres.",
      });
      return false;
    }

    if (formData.apellidos.trim().length > 100) {
      toast.error("Apellido demasiado largo", {
        description: "El apellido no debe superar 100 caracteres.",
      });
      return false;
    }

    if (!formData.numeroDocumento.trim()) {
      toast.error("Campo obligatorio", {
        description: "El número de documento es obligatorio.",
      });
      return false;
    }

    const docExists = users.some(
      (u) =>
        u.numeroDocumento === formData.numeroDocumento.trim() &&
        (!editingCliente || u.id !== editingCliente.id),
    );
    if (docExists) {
      toast.error("Documento duplicado", {
        description: "Ya existe un usuario con este número de documento.",
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("Campo obligatorio", {
        description: "El correo electrónico es obligatorio.",
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Email inválido", {
        description: "Por favor ingresa un correo electrónico válido.",
      });
      return false;
    }

    const emailExists = users.some(
      (u) =>
        u.email.toLowerCase() === formData.email.trim().toLowerCase() &&
        (!editingCliente || u.id !== editingCliente.id),
    );
    if (emailExists) {
      toast.error("Email duplicado", {
        description: "Ya existe un usuario con este correo electrónico.",
      });
      return false;
    }

    if (!editingCliente && !formData.passwordHash.trim()) {
      toast.error("Campo obligatorio", {
        description: "La contraseña es obligatoria para nuevos clientes.",
      });
      return false;
    }

    if (!formData.telefono.trim()) {
      toast.error("Campo obligatorio", {
        description: "El teléfono es obligatorio.",
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const clienteData = {
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        tipo_documento: formData.tipoDocumento,
        documento: formData.numeroDocumento.trim(),
        email: formData.email.trim(),
        password_hash: formData.passwordHash || undefined,
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim() || undefined,
        ciudad: formData.ciudad.trim() || undefined,
        id_rol: 2,
        estado: formData.estado === "activo",
      };

      if (editingCliente) {
        await userService.update(editingCliente.id, clienteData);
        toast.success("Cliente actualizado correctamente", {
          description: `${clienteData.nombres} ${clienteData.apellidos} ha sido actualizado exitosamente.`,
        });
      } else {
        await userService.create(clienteData as any);
        toast.success("Cliente registrado exitosamente", {
          description: `${clienteData.nombres} ${clienteData.apellidos} ha sido agregado al sistema.`,
        });
      }

      await fetchClientes();
      setIsDialogOpen(false);
      setIsSaving(false);
    } catch (error: any) {
      setIsSaving(false);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error desconocido del servidor";
      toast.error(
        editingCliente
          ? "No se pudo actualizar el cliente"
          : "Error al registrar el cliente",
        {
          description: errorMessage || "Inténtalo nuevamente.",
        },
      );
    }
  };

  const handleOpenDetailDialog = (cliente: any) => {
    setSelectedCliente(cliente);
    setIsDetailDialogOpen(true);
  };

  const handleOpenDeleteDialog = (cliente: any) => {
    const clienteExists = users.find((u) => u.id === cliente.id);
    if (!clienteExists) {
      toast.error("Cliente no encontrado", {
        description:
          "El cliente que intentas eliminar no existe o ya fue eliminado.",
      });
      return;
    }

    const ventasCount = ventas.filter((v) => v.clienteId === cliente.id).length;
    const pedidosCount = pedidos.filter(
      (p) => p.clienteId === cliente.id,
    ).length;

    if (ventasCount > 0 || pedidosCount > 0) {
      toast.error(
        "No se puede eliminar un cliente con transacciones asociadas",
        {
          description: `Este cliente tiene ${ventasCount + pedidosCount} transacción(es) asociada(s). Desactívalo en lugar de eliminarlo.`,
        },
      );
      return;
    }

    setSelectedCliente(cliente);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCliente) return;

    setIsDeleting(true);

    try {
      await userService.deactivate(selectedCliente.id);
      toast.success("Cliente desactivado correctamente", {
        description: `${selectedCliente.nombres} ${selectedCliente.apellidos} ha sido desactivado del sistema.`,
      });
      await fetchClientes();
      setIsDeleteDialogOpen(false);
      setSelectedCliente(null);
      setIsDeleting(false);
    } catch (error) {
      setIsDeleting(false);
      toast.error("No se pudo eliminar el cliente", {
        description:
          "Ocurrió un error durante la eliminación. Inténtalo nuevamente.",
      });
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value.trim());
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const filteredClientes = clientes.filter((cliente) => {
    if (!searchQuery || searchQuery.length < 2) return true;

    const query = searchQuery.toLowerCase();
    return (
      cliente.nombres.toLowerCase().includes(query) ||
      cliente.apellidos.toLowerCase().includes(query) ||
      (cliente.nombres + " " + cliente.apellidos)
        .toLowerCase()
        .includes(query) ||
      cliente.email.toLowerCase().includes(query) ||
      cliente.numeroDocumento.includes(query)
    );
  });

  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);
  const paginatedClientes = filteredClientes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getTotalCompras = (clienteId: string) => {
    return ventas.filter(
      (v) => v.clienteId === clienteId && v.estado === "activo",
    ).length;
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
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1
                      className="text-3xl font-bold tracking-tight"
                      style={{ color: "#fffff2" }}
                    >
                      Clientes
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: "#fffff2" }}>
                      Gestión de clientes registrados
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenDialog()}
                style={{ backgroundColor: "#7b1347ff", color: "#ffffff" }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium shadow-sm hover:opacity-90 active:opacity-80 transition-opacity duration-150 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Nuevo Cliente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="px-8 pb-8">
        <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl overflow-hidden shadow-xl">
          {/* Barra de búsqueda */}
          <div className="p-4 border-b border-gray-100 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#c47b96] focus:ring-2 focus:ring-[#c47b96]/20 transition-all duration-150"
                placeholder="Buscar clientes por nombre, email o documento..."
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
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
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" />
                    ID
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Cliente
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" />
                    Documento
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    Teléfono
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Ciudad
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Compras
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    Estado
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider text-right py-3">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {clientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-20">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#fff0f5] to-[#fce8f0] flex items-center justify-center">
                        <Users className="w-10 h-10 text-[#c47b96]" />
                      </div>
                      <div>
                        <p className="text-gray-700 font-semibold text-lg">
                          No hay clientes registrados
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          Comienza agregando tu primer cliente al sistema
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredClientes.length === 0 && searchQuery.length >= 2 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-20">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#fff0f5] to-[#fce8f0] flex items-center justify-center">
                        <Search className="w-10 h-10 text-[#c47b96]" />
                      </div>
                      <div>
                        <p className="text-gray-700 font-semibold text-lg">
                          No se encontraron resultados
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          No hay clientes que coincidan con "{searchQuery}"
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedClientes.map((cliente) => {
                  const comprasCount = getTotalCompras(cliente.id);
                  return (
                    <TableRow
                      key={cliente.id}
                      className="border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#fff0f5]/40 hover:to-transparent group"
                    >
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[#c47b96] transition-colors"></div>
                          <span className="font-mono text-[11px] font-semibold text-gray-500">
                            {cliente.id.slice(0, 8)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c47b96] to-[#e092b2] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {cliente.nombres?.charAt(0).toUpperCase()}
                            {cliente.apellidos?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-gray-800 font-semibold text-sm">
                              {cliente.nombres} {cliente.apellidos}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex flex-col">
                          <span className="text-gray-600 text-sm font-mono">
                            {cliente.tipoDocumento}
                          </span>
                          <span className="text-gray-800 text-sm font-medium">
                            {cliente.numeroDocumento}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="text-gray-600 text-sm">
                          {cliente.email}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="text-gray-800 text-sm">
                          {cliente.telefono}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-600 text-sm">
                            {cliente.ciudad || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#c47b96]/10 text-[#c47b96] text-xs font-medium">
                          <ShoppingBag className="w-3 h-3" />
                          {comprasCount}{" "}
                          {comprasCount === 1 ? "compra" : "compras"}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <StatusSwitch
                          status={cliente.estado}
                          onChange={async (newStatus) => {
                            try {
                              await userService.update(cliente.id, {
                                estado: newStatus === "activo",
                              });
                              await fetchClientes();
                            } catch (e) {
                              toast.error("Error al cambiar estado");
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenDetailDialog(cliente)}
                            title="Ver detalles"
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-150"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDialog(cliente)}
                            title="Editar cliente"
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteDialog(cliente)}
                            title="Eliminar cliente"
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-150"
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
        {filteredClientes.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredClientes.length}
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
        <DialogContent className="bg-white border border-gray-200 max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-0">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#c47b96] via-[#e092b2] to-[#c47b96]" />

          <div className="p-6">
            <DialogHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-[#fff0f5] to-[#fce8f0] rounded-xl">
                  <Users className="w-5 h-5 text-[#c47b96]" />
                </div>
                <div>
                  <DialogTitle className="text-[#2e1020] text-xl font-bold">
                    {editingCliente ? "Editar Cliente" : "Nuevo Cliente"}
                  </DialogTitle>
                  <DialogDescription className="text-gray-500 text-sm mt-0.5">
                    {editingCliente
                      ? "Modifica la información del cliente existente"
                      : "Completa los campos para registrar un nuevo cliente"}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-5 py-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#c47b96]" />
                    Nombre <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    value={formData.nombres}
                    onChange={(e) =>
                      setFormData({ ...formData, nombres: e.target.value })
                    }
                    className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11"
                    placeholder="Ej: Juan"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#c47b96]" />
                    Apellido <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    value={formData.apellidos}
                    onChange={(e) =>
                      setFormData({ ...formData, apellidos: e.target.value })
                    }
                    className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11"
                    placeholder="Ej: Pérez"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-[#c47b96]" />
                    Tipo Documento <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={formData.tipoDocumento}
                    onValueChange={(value: TipoDocumento) =>
                      setFormData({ ...formData, tipoDocumento: value })
                    }
                    disabled={isSaving}
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 rounded-xl">
                      <SelectItem value="CC" className="text-gray-800">
                        Cédula de Ciudadanía
                      </SelectItem>
                      <SelectItem value="TI" className="text-gray-800">
                        Tarjeta de Identidad
                      </SelectItem>
                      <SelectItem value="CE" className="text-gray-800">
                        Cédula de Extranjería
                      </SelectItem>
                      <SelectItem value="PAS" className="text-gray-800">
                        Pasaporte
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 text-[#c47b96]" />
                    Número Documento <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    value={formData.numeroDocumento}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numeroDocumento: e.target.value,
                      })
                    }
                    className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11"
                    placeholder="Ej: 1234567890"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#c47b96]" />
                    Email <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11"
                    placeholder="cliente@correo.com"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#c47b96]" />
                    Teléfono <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                    className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11"
                    placeholder="3001234567"
                    disabled={isSaving}
                  />
                </div>
              </div>

              {!editingCliente && (
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-[#c47b96]" />
                    Contraseña <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="password"
                    value={formData.passwordHash}
                    onChange={(e) =>
                      setFormData({ ...formData, passwordHash: e.target.value })
                    }
                    className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11"
                    placeholder="Ingresa una contraseña segura"
                    disabled={isSaving}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#c47b96]" />
                  Dirección
                </Label>
                <Input
                  value={formData.direccion}
                  onChange={(e) =>
                    setFormData({ ...formData, direccion: e.target.value })
                  }
                  className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11"
                  placeholder="Calle 50 #30-20"
                  disabled={isSaving}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-[#c47b96]" />
                    Ciudad
                  </Label>
                  <Input
                    value={formData.ciudad}
                    onChange={(e) =>
                      setFormData({ ...formData, ciudad: e.target.value })
                    }
                    className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11"
                    placeholder="Medellín"
                    disabled={isSaving}
                  />
                </div>

                {editingCliente && (
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-[#c47b96]" />
                      Estado
                    </Label>
                    <Select
                      value={formData.estado}
                      onValueChange={(value: "activo" | "inactivo") =>
                        setFormData({ ...formData, estado: value })
                      }
                      disabled={isSaving}
                    >
                      <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 rounded-xl">
                        <SelectItem value="activo" className="text-gray-800">
                          Activo
                        </SelectItem>
                        <SelectItem value="inactivo" className="text-gray-800">
                          Inactivo
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
                    {editingCliente ? "Actualizando..." : "Creando..."}
                  </div>
                ) : editingCliente ? (
                  "Actualizar Cliente"
                ) : (
                  "Crear Cliente"
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

          {selectedCliente && (
            <div className="flex flex-col h-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="p-8 border-b border-white/10 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c47b96] to-[#e092b2] flex items-center justify-center text-white font-black text-2xl shadow-xl border border-white/20">
                    {selectedCliente.nombres?.charAt(0).toUpperCase()}
                    {selectedCliente.apellidos?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-black text-white leading-tight tracking-tight">
                      {selectedCliente.nombres} {selectedCliente.apellidos}
                    </DialogTitle>
                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-1">
                      EXPEDIENTE DE CLIENTE <span className="text-[#e092b2]">#{selectedCliente.id.slice(0, 8).toUpperCase()}</span>
                    </p>
                  </div>
                </div>
                <div
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase bg-white/5 border border-white/10 ${selectedCliente.estado === "activo" ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {selectedCliente.estado.toUpperCase()}
                </div>
              </div>

              {/* Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Identification */}
                  <div className="space-y-3">
                    <Label className="text-white/30 text-[9px] uppercase font-bold tracking-widest flex items-center gap-2">
                       <Hash className="w-3 h-3" /> Identificación
                    </Label>
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">{selectedCliente.tipoDocumento}</p>
                      <p className="text-white font-bold text-lg">{selectedCliente.numeroDocumento}</p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="space-y-3">
                    <Label className="text-white/30 text-[9px] uppercase font-bold tracking-widest flex items-center gap-2">
                       <Phone className="w-3 h-3" /> Canales de Contacto
                    </Label>
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-black/20 rounded-lg">
                           <Mail className="w-3.5 h-3.5 text-[#e092b2]" />
                        </div>
                        <p className="text-white/80 text-xs font-medium truncate">{selectedCliente.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-black/20 rounded-lg">
                           <Phone className="w-3.5 h-3.5 text-[#e092b2]" />
                        </div>
                        <p className="text-white/80 text-xs font-medium">{selectedCliente.telefono}</p>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-3 md:col-span-2">
                    <Label className="text-white/30 text-[9px] uppercase font-bold tracking-widest flex items-center gap-2">
                       <MapPin className="w-3 h-3" /> Geo-localización de Entrega
                    </Label>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 flex flex-col md:flex-row gap-6 md:items-center">
                       <div className="flex-1 space-y-1">
                          <p className="text-white/30 text-[8px] font-bold uppercase">Ciudad / Residencia</p>
                          <p className="text-white font-bold text-base">{selectedCliente.ciudad || "No registrada"}</p>
                       </div>
                       <div className="flex-1 space-y-1 md:border-l md:border-white/10 md:pl-6">
                          <p className="text-white/30 text-[8px] font-bold uppercase">Dirección Principal</p>
                          <p className="text-white/80 text-sm italic">"{selectedCliente.direccion || "No registrada"}"</p>
                       </div>
                    </div>
                  </div>

                  {/* Activity and Registration */}
                  <div className="space-y-3 md:col-span-2">
                    <Label className="text-white/30 text-[9px] uppercase font-bold tracking-widest flex items-center gap-2">
                       <Activity className="w-3 h-3" /> Historial y Registro
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="p-6 rounded-2xl bg-[#e092b2]/5 border border-[#e092b2]/10 flex items-center justify-between">
                          <div>
                             <p className="text-[#e092b2]/60 text-[9px] font-black uppercase tracking-wider mb-1">Volumen de Compras</p>
                             <p className="text-3xl font-black text-white">{getTotalCompras(selectedCliente.id)}</p>
                          </div>
                          <ShoppingBag className="w-10 h-10 text-[#e092b2]/20" />
                       </div>
                       <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                          <p className="text-white/30 text-[9px] font-black uppercase tracking-wider mb-2">Miembro desde</p>
                          <div className="flex items-center gap-3">
                             <Calendar className="w-5 h-5 text-white/40" />
                             <p className="text-white font-bold text-lg">
                                {new Date(selectedCliente.fechaRegistro).toLocaleDateString("es-CO", { day: 'numeric', month: 'long', year: 'numeric' })}
                             </p>
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
                  Regresar a Clientes
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
                    Eliminar Cliente
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
                ¿Estás seguro de desactivar al cliente{" "}
                <span className="font-bold text-[#c47b96]">
                  {selectedCliente?.nombres} {selectedCliente?.apellidos}
                </span>
                ?
              </p>
              <p className="text-gray-400 text-xs mt-3">
                El cliente quedará inactivo en el sistema.
              </p>
            </div>

            <DialogFooter className="border-t border-gray-100 pt-4 gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl flex-1"
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-gradient-to-r from-rose-500 to-rose-600 hover:shadow-lg hover:shadow-rose-500/25 transition-all rounded-xl text-white font-semibold flex-1"
              >
                {isDeleting ? (
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Eliminando...
                  </div>
                ) : (
                  "Desactivar Cliente"
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
