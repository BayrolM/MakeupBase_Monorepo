import { useState } from 'react';
import { useStore, Rol } from '../../lib/store';
import { PageHeader } from '../PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Plus, Pencil, Shield } from 'lucide-react';

const MODULOS = [
  'usuarios',
  'productos',
  'ventas',
  'compras',
  'pedidos',
  'clientes',
  'proveedores',
  'devoluciones',
  'configuracion',
];

const ACCIONES = ['ver', 'crear', 'editar', 'eliminar'] as const;

export function ConfiguracionModule() {
  const { roles, addRol, updateRol } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    permisos: {} as Rol['permisos'],
  });

  const handleOpenDialog = (rol?: Rol) => {
    if (rol) {
      setEditingRol(rol);
      setFormData({
        nombre: rol.nombre,
        permisos: { ...rol.permisos },
      });
    } else {
      setEditingRol(null);
      const defaultPermisos: Rol['permisos'] = {};
      MODULOS.forEach(modulo => {
        defaultPermisos[modulo] = {
          ver: false,
          crear: false,
          editar: false,
          eliminar: false,
        };
      });
      setFormData({
        nombre: '',
        permisos: defaultPermisos,
      });
    }
    setIsDialogOpen(true);
  };

  const handleTogglePermiso = (modulo: string, accion: typeof ACCIONES[number], value: boolean) => {
    const newPermisos = { ...formData.permisos };
    if (!newPermisos[modulo]) {
      newPermisos[modulo] = { ver: false, crear: false, editar: false, eliminar: false };
    }
    newPermisos[modulo][accion] = value;
    setFormData({ ...formData, permisos: newPermisos });
  };

  const handleSave = () => {
    if (editingRol) {
      updateRol(editingRol.id, formData);
    } else {
      addRol(formData);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Configuración"
        subtitle="Gestión de roles y permisos"
        actionButton={{
          label: 'Nuevo Rol',
          icon: Plus,
          onClick: () => handleOpenDialog(),
        }}
      />

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((rol) => (
            <Card key={rol.id} className="bg-card border-border">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground">{rol.nombre}</CardTitle>
                    <p className="text-foreground-secondary" style={{ fontSize: '12px', marginTop: '2px' }}>
                      {Object.keys(rol.permisos).length} módulos configurados
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(rol.permisos).slice(0, 4).map(([modulo, permisos]) => {
                    const permisoCount = Object.values(permisos).filter(Boolean).length;
                    return (
                      <div key={modulo} className="flex items-center justify-between p-2 bg-surface rounded">
                        <span className="text-foreground capitalize" style={{ fontSize: '13px' }}>
                          {modulo}
                        </span>
                        <span className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                          {permisoCount}/4 permisos
                        </span>
                      </div>
                    );
                  })}
                  
                  {Object.keys(rol.permisos).length > 4 && (
                    <p className="text-foreground-secondary text-center pt-2" style={{ fontSize: '12px' }}>
                      +{Object.keys(rol.permisos).length - 4} módulos más
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => handleOpenDialog(rol)}
                  variant="outline"
                  className="w-full mt-4 border-border text-foreground hover:bg-surface gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Editar Permisos
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Permissions Matrix */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Matriz de Permisos</CardTitle>
            <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
              Vista general de permisos por rol
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-foreground-secondary" style={{ fontSize: '13px' }}>
                      Módulo
                    </th>
                    {roles.map(rol => (
                      <th key={rol.id} className="text-center py-3 px-4 text-foreground" style={{ fontSize: '13px' }}>
                        {rol.nombre}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODULOS.map(modulo => (
                    <tr key={modulo} className="border-b border-border">
                      <td className="py-3 px-4 text-foreground capitalize" style={{ fontSize: '14px' }}>
                        {modulo}
                      </td>
                      {roles.map(rol => {
                        const permisos = rol.permisos[modulo];
                        const count = permisos ? Object.values(permisos).filter(Boolean).length : 0;
                        return (
                          <td key={rol.id} className="text-center py-3 px-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                              count === 4 ? 'bg-success/20 text-success' :
                              count > 0 ? 'bg-warning/20 text-warning' :
                              'bg-foreground-secondary/20 text-foreground-secondary'
                            }`}>
                              {count}/4
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingRol ? 'Editar Rol' : 'Nuevo Rol'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-foreground">Nombre del Rol</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="bg-input-background border-border text-foreground"
                placeholder="Ej: Gerente de Ventas"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-foreground">Permisos por Módulo</Label>
              <div className="space-y-3">
                {MODULOS.map(modulo => (
                  <div key={modulo} className="p-4 bg-surface rounded-lg">
                    <h4 className="text-foreground capitalize mb-3" style={{ fontSize: '14px', fontWeight: 500 }}>
                      {modulo}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {ACCIONES.map(accion => (
                        <div key={accion} className="flex items-center gap-2">
                          <Checkbox
                            id={`${modulo}-${accion}`}
                            checked={formData.permisos[modulo]?.[accion] || false}
                            onCheckedChange={(checked) => handleTogglePermiso(modulo, accion, checked as boolean)}
                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <label
                            htmlFor={`${modulo}-${accion}`}
                            className="text-foreground-secondary capitalize cursor-pointer"
                            style={{ fontSize: '13px' }}
                          >
                            {accion}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-border text-foreground hover:bg-surface"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {editingRol ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
