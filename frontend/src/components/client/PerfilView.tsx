import { useState } from 'react';
import { useStore } from '../../lib/store';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { UserCircle, CheckCircle, Lock } from 'lucide-react';

export function PerfilView() {
  const { currentUser, updateUser } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nombre: currentUser?.nombre || '',
    email: currentUser?.email || '',
    telefono: currentUser?.telefono || '',
    direccion: 'Calle 31C #89-35',
    ciudad: 'Medellín',
    recibirOfertas: true,
    notificacionesPush: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.email) {
      newErrors.email = 'El email es obligatorio';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    if (!formData.telefono) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!/^\d+$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe contener solo números';
    }

    if (!formData.direccion) {
      newErrors.direccion = 'La dirección es obligatoria';
    }

    if (!formData.ciudad) {
      newErrors.ciudad = 'La ciudad es obligatoria';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    
    // Update user
    if (currentUser) {
      updateUser(currentUser.id, {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
      });
    }

    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-surface">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <UserCircle className="w-8 h-8 text-primary" />
            <h1 className="text-foreground" style={{ fontSize: '32px', fontWeight: 600 }}>
              Mi Perfil
            </h1>
          </div>
          <p className="text-foreground-secondary" style={{ fontSize: '16px' }}>
            Gestiona tu información personal
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Success Message */}
        {showSuccess && (
          <div className="bg-success/20 border border-success text-success rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <p style={{ fontSize: '14px' }}>
              Tus cambios se han guardado exitosamente
            </p>
          </div>
        )}

        <div className="bg-card border border-border rounded-lg p-8">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 pb-8 border-b border-border mb-8">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
              <UserCircle className="w-16 h-16 text-primary" />
            </div>
            <div>
              <h3 className="text-foreground mb-2" style={{ fontSize: '20px', fontWeight: 600 }}>
                {formData.nombre}
              </h3>
              <Button
                size="sm"
                variant="outline"
                className="border-border text-foreground hover:bg-surface"
              >
                Cambiar foto
              </Button>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-foreground">
                  Nombre <span className="text-danger">*</span>
                </Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  disabled={!isEditing}
                  className={`bg-input-background border-border text-foreground ${errors.nombre ? 'border-danger' : ''}`}
                  placeholder="Nombre completo"
                />
                {errors.nombre && (
                  <p className="text-danger" style={{ fontSize: '13px' }}>{errors.nombre}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email <span className="text-danger">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className={`bg-input-background border-border text-foreground ${errors.email ? 'border-danger' : ''}`}
                  placeholder="correo@ejemplo.com"
                />
                {errors.email && (
                  <p className="text-danger" style={{ fontSize: '13px' }}>{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono" className="text-foreground">
                  Teléfono <span className="text-danger">*</span>
                </Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  disabled={!isEditing}
                  className={`bg-input-background border-border text-foreground ${errors.telefono ? 'border-danger' : ''}`}
                  placeholder="3001234567"
                />
                {errors.telefono && (
                  <p className="text-danger" style={{ fontSize: '13px' }}>{errors.telefono}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ciudad" className="text-foreground">
                  Ciudad <span className="text-danger">*</span>
                </Label>
                <Input
                  id="ciudad"
                  value={formData.ciudad}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  disabled={!isEditing}
                  className={`bg-input-background border-border text-foreground ${errors.ciudad ? 'border-danger' : ''}`}
                  placeholder="Medellín"
                />
                {errors.ciudad && (
                  <p className="text-danger" style={{ fontSize: '13px' }}>{errors.ciudad}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion" className="text-foreground">
                Dirección <span className="text-danger">*</span>
              </Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                disabled={!isEditing}
                className={`bg-input-background border-border text-foreground ${errors.direccion ? 'border-danger' : ''}`}
                placeholder="Calle 31C #89-35"
              />
              {errors.direccion && (
                <p className="text-danger" style={{ fontSize: '13px' }}>{errors.direccion}</p>
              )}
            </div>

            {/* Preferences */}
            <div className="pt-6 border-t border-border space-y-4">
              <h3 className="text-foreground" style={{ fontSize: '16px', fontWeight: 600 }}>
                Preferencias
              </h3>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="ofertas"
                  checked={formData.recibirOfertas}
                  onCheckedChange={(checked) => setFormData({ ...formData, recibirOfertas: checked as boolean })}
                  disabled={!isEditing}
                  className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label htmlFor="ofertas" className="text-foreground cursor-pointer" style={{ fontSize: '14px' }}>
                  Recibir ofertas por email
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="notificaciones"
                  checked={formData.notificacionesPush}
                  onCheckedChange={(checked) => setFormData({ ...formData, notificacionesPush: checked as boolean })}
                  disabled={!isEditing}
                  className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label htmlFor="notificaciones" className="text-foreground cursor-pointer" style={{ fontSize: '14px' }}>
                  Notificaciones push
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 flex items-center gap-4">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    🎀 GUARDAR CAMBIOS
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setErrors({});
                    }}
                    variant="outline"
                    className="border-border text-foreground hover:bg-surface"
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Editar Perfil
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border text-foreground hover:bg-surface gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Cambiar contraseña
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
