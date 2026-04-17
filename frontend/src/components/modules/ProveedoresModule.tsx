import { useState, useEffect, useMemo } from "react";
import { useStore, Proveedor, Status } from "../../lib/store";
import { toast } from "sonner";
import { providerService } from "../../services/providerService";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../Pagination";

// Sub-componentes
import { ProveedorHeader } from "./proveedores/ProveedorHeader";
import { ProveedorTable } from "./proveedores/ProveedorTable";
import { ProveedorFormDialog } from "./proveedores/ProveedorFormDialog";
import { ProveedorDetailDialog } from "./proveedores/ProveedorDetailDialog";
import { ProveedorDeleteDialog } from "./proveedores/ProveedorDeleteDialog";

export function ProveedoresModule() {
  const { proveedores, setProveedores } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(
    null,
  );
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const filteredProveedores = useMemo(() => {
    return proveedores.filter(
      (p) =>
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nit.includes(searchQuery),
    );
  }, [proveedores, searchQuery]);

  const {
    currentPage,
    itemsPerPage,
    totalPages,
    handlePageChange,
    handleLimitChange,
  } = usePagination({ totalItems: filteredProveedores.length });

  const paginatedProveedores = useMemo(() => {
    return filteredProveedores.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
  }, [filteredProveedores, currentPage, itemsPerPage]);

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    nit: "",
    direccion: "",
    estado: "activo" as "activo" | "inactivo",
  });

  const refreshProveedores = async () => {
    try {
      const data = await providerService.getAll();
      const mapped = (
        Array.isArray(data) ? data : (data as any).data || []
      ).map((prov: any) => ({
        id: prov.id_proveedor.toString(),
        nombre: prov.nombre,
        email: prov.email || "",
        telefono: prov.telefono || "",
        nit: prov.documento_nit || "",
        direccion: "",
        estado: prov.estado ? ("activo" as const) : ("inactivo" as const),
        fechaRegistro: new Date().toISOString(),
      }));
      setProveedores(mapped);
    } catch (e) {
      console.error(e);
      toast.error("Error al cargar proveedores");
    }
  };

  useEffect(() => {
    refreshProveedores();
  }, []);

  const handleOpenDialog = (proveedor?: Proveedor) => {
    if (proveedor) {
      setEditingProveedor(proveedor);
      setFormData({
        nombre: proveedor.nombre,
        email: proveedor.email,
        telefono: proveedor.telefono,
        nit: proveedor.nit,
        direccion: proveedor.direccion,
        estado: proveedor.estado,
      });
    } else {
      setEditingProveedor(null);
      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        nit: "",
        direccion: "",
        estado: "activo",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nombre.trim() || !formData.nit.trim()) {
      toast.error("Nombre y NIT son obligatorios");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        nombre: formData.nombre.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        documento_nit: formData.nit.trim(),
        estado: formData.estado === "activo",
      };

      if (editingProveedor) {
        await providerService.update(Number(editingProveedor.id), payload);
        toast.success("Proveedor actualizado");
      } else {
        await providerService.create(payload);
        toast.success("Proveedor creado");
      }

      await refreshProveedores();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProveedor) return;
    setIsSaving(true);
    try {
      await providerService.delete(Number(selectedProveedor.id));
      await refreshProveedores();
      toast.success("Proveedor eliminado permanentemente");
      setIsDeleteDialogOpen(false);
      setSelectedProveedor(null);
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (
    proveedor: any,
    newStatus: "activo" | "inactivo",
  ) => {
    try {
      await providerService.update(Number(proveedor.id), {
        estado: newStatus === "activo",
      });
      await refreshProveedores();
      toast.success(`Proveedor ${newStatus}`);
    } catch (e) {
      toast.error("Error al cambiar el estado");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f3f5]">
      <ProveedorHeader onOpenDialog={() => handleOpenDialog()} />

      <div className="px-8 pb-8">
        <ProveedorTable
          proveedores={paginatedProveedores}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onViewDetail={(p) => {
            setSelectedProveedor(p);
            setIsDetailDialogOpen(true);
          }}
          onEdit={handleOpenDialog}
          onDelete={(p) => {
            setSelectedProveedor(p);
            setIsDeleteDialogOpen(true);
          }}
          onStatusChange={handleStatusChange}
        />

        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredProveedores.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleLimitChange}
            />
          </div>
        )}
      </div>

      <ProveedorFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingProveedor={editingProveedor}
        formData={formData}
        setFormData={setFormData}
        isSaving={isSaving}
        onSave={handleSave}
      />

      <ProveedorDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        proveedor={selectedProveedor}
      />

      <ProveedorDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        proveedor={selectedProveedor}
        isSaving={isSaving}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}