import { useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { UserCircle, CheckCircle, Lock, Eye, EyeOff, Camera, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { authService } from '../../services/authService';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useRef } from 'react';

export function PerfilView() {
  const { currentUser, setCurrentUser } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Password Change State
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    nombres: currentUser?.nombres || '',
    apellidos: currentUser?.apellidos || '',
    email: currentUser?.email || '',
    telefono: currentUser?.telefono || '',
    direccion: currentUser?.direccion || '',
    ciudad: currentUser?.ciudad || '',
    recibirOfertas: true,
    notificacionesPush: false,
  });

  // Sync with currentUser if it changes (e.g. after refresh)
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        nombres: currentUser.nombres,
        apellidos: currentUser.apellidos,
        email: currentUser.email,
        telefono: currentUser.telefono,
        direccion: currentUser.direccion || '',
        ciudad: currentUser.ciudad || '',
      }));
    }
  }, [currentUser]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombres) {
      newErrors.nombres = 'El nombre es obligatorio';
    }
    
    if (!formData.apellidos) {
      newErrors.apellidos = 'El apellido es obligatorio';
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

    setIsSaving(true);
    setErrors({});
    
    try {
      // Update profile in backend
      await authService.updateProfile({
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        telefono: formData.telefono,
        direccion: formData.direccion,
        ciudad: formData.ciudad,
      });

      // Update current user in store
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          telefono: formData.telefono,
          direccion: formData.direccion,
          ciudad: formData.ciudad,
        });
      }

      setIsEditing(false);
      setShowSuccess(true);
      toast.success('Perfil actualizado correctamente');
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      toast.error('Error al actualizar perfil', {
        description: error.message || 'Inténtalo de nuevo más tarde'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    // Validaciones básicas
    if (!file.type.startsWith('image/')) {
      toast.error('Formato inválido', {
        description: 'Por favor selecciona una imagen (PNG, JPG, etc.)'
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Archivo muy pesado', {
        description: 'La imagen debe ser menor a 2MB'
      });
      return;
    }

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
    const filePath = fileName; // No usar subcarpetas redundantes si el bucket ya es 'avatars'

    try {
      // 1. Subir a Supabase Storage
      // NOTA: El usuario debe crear un bucket llamado 'avatars' y ponerlo público
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // 2. Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Actualizar backend
      await authService.updateProfile({ foto_perfil: publicUrl });
      
      // 4. Actualizar store local
      setCurrentUser({
        ...currentUser,
        foto_perfil: publicUrl
      });

      toast.success('Foto de perfil actualizada');
    } catch (error: any) {
      console.error('Error al subir imagen:', error);
      toast.error('Error al subir la imagen', {
        description: error.message || 'Verifica que el bucket "avatars" exista y tenga permisos de subida públicos.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleChangePassword = async () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es obligatoria';
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es obligatoria';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    setIsChangingPassword(true);
    setPasswordErrors({});

    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Contraseña actualizada correctamente');
      setIsPasswordDialogOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error('Error al cambiar contraseña', {
        description: error.message || 'La contraseña actual es incorrecta'
      });
    } finally {
      setIsChangingPassword(false);
    }
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
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-primary/10">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                ) : currentUser?.foto_perfil ? (
                  <img src={currentUser.foto_perfil} alt="PFP" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="w-16 h-16 text-primary" />
                )}
              </div>
              <button 
                onClick={handleFileClick}
                disabled={isUploading}
                className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
            </div>
            <div>
              <h3 className="text-foreground mb-2" style={{ fontSize: '20px', fontWeight: 600 }}>
                {formData.nombres} {formData.apellidos}
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={handleFileClick}
                disabled={isUploading}
                className="border-border text-foreground hover:bg-surface"
              >
                {isUploading ? 'Subiendo...' : 'Cambiar foto'}
              </Button>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombres" className="text-foreground">
                  Nombres <span className="text-danger">*</span>
                </Label>
                <Input
                  id="nombres"
                  value={formData.nombres}
                  onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                  disabled={!isEditing || isSaving}
                  className={`bg-input-background border-border text-foreground ${errors.nombres ? 'border-danger' : ''}`}
                  placeholder="Nombres"
                />
                {errors.nombres && (
                  <p className="text-danger" style={{ fontSize: '13px' }}>{errors.nombres}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellidos" className="text-foreground">
                  Apellidos <span className="text-danger">*</span>
                </Label>
                <Input
                  id="apellidos"
                  value={formData.apellidos}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                  disabled={!isEditing || isSaving}
                  className={`bg-input-background border-border text-foreground ${errors.apellidos ? 'border-danger' : ''}`}
                  placeholder="Apellidos"
                />
                {errors.apellidos && (
                  <p className="text-danger" style={{ fontSize: '13px' }}>{errors.apellidos}</p>
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
                  disabled={!isEditing || isSaving}
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
                  disabled={!isEditing || isSaving}
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
                  disabled={!isEditing || isSaving}
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
                disabled={!isEditing || isSaving}
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
                  onCheckedChange={(checked: boolean) => setFormData({ ...formData, recibirOfertas: checked })}
                  disabled={!isEditing || isSaving}
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
                  onCheckedChange={(checked: boolean) => setFormData({ ...formData, notificacionesPush: checked })}
                  disabled={!isEditing || isSaving}
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
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[150px]"
                  >
                    {isSaving ? 'Guardando...' : '🎀 GUARDAR CAMBIOS'}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setErrors({});
                      // Reset form to current user data
                      if (currentUser) {
                        setFormData({
                          nombres: currentUser.nombres,
                          apellidos: currentUser.apellidos,
                          email: currentUser.email,
                          telefono: currentUser.telefono,
                          direccion: currentUser.direccion || '',
                          ciudad: currentUser.ciudad || '',
                          recibirOfertas: true,
                          notificacionesPush: false,
                        });
                      }
                    }}
                    variant="outline"
                    className="border-border text-foreground hover:bg-surface"
                    disabled={isSaving}
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
                    onClick={() => setIsPasswordDialogOpen(true)}
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

      {/* Password Change Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={(open: boolean) => {
        if (!open && !isChangingPassword) {
          setIsPasswordDialogOpen(false);
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setPasswordErrors({});
        }
      }}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Cambiar Contraseña</DialogTitle>
            <DialogDescription className="text-foreground-secondary">
              Ingresa tu contraseña actual y la nueva que deseas utilizar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña Actual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className={`bg-input-background border-border pr-10 ${passwordErrors.currentPassword ? 'border-danger' : ''}`}
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-secondary"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.currentPassword && <p className="text-danger text-xs">{passwordErrors.currentPassword}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className={`bg-input-background border-border pr-10 ${passwordErrors.newPassword ? 'border-danger' : ''}`}
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-secondary"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.newPassword && <p className="text-danger text-xs">{passwordErrors.newPassword}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className={`bg-input-background border-border ${passwordErrors.confirmPassword ? 'border-danger' : ''}`}
                disabled={isChangingPassword}
              />
              {passwordErrors.confirmPassword && <p className="text-danger text-xs">{passwordErrors.confirmPassword}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPasswordDialogOpen(false)}
              disabled={isChangingPassword}
              className="border-border"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="bg-primary text-primary-foreground min-w-[120px]"
            >
              {isChangingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
