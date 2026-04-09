import { useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
import { PageHeader } from '../PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { User, Lock, Camera, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export function PerfilUsuarioModule() {
  const { currentUser, updateUser } = useStore();
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  // Form states
  const [infoFormData, setInfoFormData] = useState({
    nombre: currentUser?.nombre || '',
    apellido: currentUser?.apellido || '',
    tipoDocumento: currentUser?.tipoDocumento || 'CC',
    numeroDocumento: currentUser?.numeroDocumento || '',
    telefono: currentUser?.telefono || '',
    direccion: currentUser?.direccion || '',
    ciudad: currentUser?.ciudad || '',
    pais: currentUser?.pais || 'Colombia',
    email: currentUser?.email || '',
  });

  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Update form data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setInfoFormData({
        nombre: currentUser.nombre || '',
        apellido: currentUser.apellido || '',
        tipoDocumento: currentUser.tipoDocumento || 'CC',
        numeroDocumento: currentUser.numeroDocumento || '',
        telefono: currentUser.telefono || '',
        direccion: currentUser.direccion || '',
        ciudad: currentUser.ciudad || '',
        pais: currentUser.pais || 'Colombia',
        email: currentUser.email || '',
      });
    }
  }, [currentUser]);

  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle info form changes
  const handleInfoChange = (field: string, value: string) => {
    setInfoFormData(prev => ({ ...prev, [field]: value }));
  };

  // Save personal information
  const handleSaveInfo = async () => {
    if (!currentUser) return;

    // Validations
    if (!infoFormData.nombre.trim()) {
      toast.error('Campo obligatorio', {
        description: 'El nombre es obligatorio.',
      });
      return;
    }

    if (!infoFormData.apellido.trim()) {
      toast.error('Campo obligatorio', {
        description: 'El apellido es obligatorio.',
      });
      return;
    }

    if (!infoFormData.numeroDocumento.trim()) {
      toast.error('Campo obligatorio', {
        description: 'El número de documento es obligatorio.',
      });
      return;
    }

    if (!infoFormData.telefono.trim()) {
      toast.error('Campo obligatorio', {
        description: 'El teléfono es obligatorio.',
      });
      return;
    }

    if (!infoFormData.email.trim()) {
      toast.error('Campo obligatorio', {
        description: 'El correo electrónico es obligatorio.',
      });
      return;
    }

    if (!validateEmail(infoFormData.email)) {
      toast.error('Formato inválido', {
        description: 'El formato del correo electrónico no es válido.',
      });
      return;
    }

    setIsSavingInfo(true);

    updateUser(currentUser.id, {
      nombre: infoFormData.nombre.trim(),
      apellido: infoFormData.apellido.trim(),
      tipoDocumento: infoFormData.tipoDocumento as any,
      numeroDocumento: infoFormData.numeroDocumento.trim(),
      telefono: infoFormData.telefono.trim(),
      direccion: infoFormData.direccion.trim(),
      ciudad: infoFormData.ciudad.trim(),
      pais: infoFormData.pais.trim(),
      email: infoFormData.email.trim(),
    });

    setIsSavingInfo(false);
    setIsEditingInfo(false);

    toast.success('Información actualizada', {
      description: 'Tus datos personales han sido actualizados exitosamente.',
    });
  };

  // Save password
  const handleSavePassword = async () => {
    if (!currentUser) return;

    // Validations
    if (!passwordFormData.currentPassword) {
      toast.error('Campo obligatorio', {
        description: 'Debes ingresar tu contraseña actual.',
      });
      return;
    }

    if (!passwordFormData.newPassword) {
      toast.error('Campo obligatorio', {
        description: 'Debes ingresar una nueva contraseña.',
      });
      return;
    }

    if (passwordFormData.newPassword.length < 8) {
      toast.error('Contraseña débil', {
        description: 'La nueva contraseña debe tener al menos 8 caracteres.',
      });
      return;
    }

    if (!passwordFormData.confirmPassword) {
      toast.error('Campo obligatorio', {
        description: 'Debes confirmar la nueva contraseña.',
      });
      return;
    }

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      toast.error('Las contraseñas no coinciden', {
        description: 'La nueva contraseña y su confirmación deben ser iguales.',
      });
      return;
    }

    // Verify current password (in a real app, this would be checked by the backend)
    // For this prototype, we simulate the check
    if (passwordFormData.currentPassword !== 'admin123' && passwordFormData.currentPassword !== currentUser.passwordHash) {
      toast.error('Contraseña actual incorrecta', {
        description: 'La contraseña actual que ingresaste no es correcta.',
      });
      return;
    }

    setIsSavingPassword(true);

    updateUser(currentUser.id, {
      passwordHash: passwordFormData.newPassword, // In real app, this would be hashed
    });

    setIsSavingPassword(false);
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

    toast.success('Contraseña actualizada', {
      description: 'Tu contraseña ha sido actualizada exitosamente.',
    });
  };

  // Handle photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Archivo inválido', {
          description: 'Solo se permiten archivos de imagen.',
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Archivo muy grande', {
          description: 'La imagen debe pesar menos de 5MB.',
        });
        return;
      }

      setPhotoFile(file);

      // Generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save photo
  const handleSavePhoto = async () => {
    if (!photoFile || !currentUser) return;

    setIsSavingPhoto(true);

    // In real app, the photo would be uploaded to server/cloud storage
    // For this prototype, we just simulate it
    toast.success('Foto actualizada', {
      description: 'Tu foto de perfil ha sido actualizada exitosamente.',
    });

    setIsSavingPhoto(false);
    setPhotoFile(null);
    setPreviewPhoto(null);
  };

  // Cancel info editing
  const handleCancelInfo = () => {
    setInfoFormData({
      nombre: currentUser?.nombre || '',
      apellido: currentUser?.apellido || '',
      tipoDocumento: currentUser?.tipoDocumento || 'CC',
      numeroDocumento: currentUser?.numeroDocumento || '',
      telefono: currentUser?.telefono || '',
      direccion: currentUser?.direccion || '',
      ciudad: currentUser?.ciudad || '',
      pais: currentUser?.pais || 'Colombia',
      email: currentUser?.email || '',
    });
    setIsEditingInfo(false);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground-secondary">Usuario no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Configuración"
        subtitle="Gestiona tu información personal y configuración de cuenta"
      />

      <div className="p-8 space-y-6 max-w-5xl mx-auto">
        {/* Photo Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Camera className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-foreground">Foto de Perfil</CardTitle>
                <p className="text-foreground-secondary" style={{ fontSize: '13px', marginTop: '2px' }}>
                  Actualiza tu imagen de perfil
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Current/Preview Photo */}
              <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-4 border-primary/30">
                {previewPhoto ? (
                  <img src={previewPhoto} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-primary" />
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap gap-3">
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <div className="inline-flex items-center justify-center gap-2 h-10 px-4 py-2 bg-surface hover:bg-surface/80 border border-border rounded-lg text-foreground transition-colors">
                      <Camera className="w-4 h-4" />
                      Seleccionar imagen
                    </div>
                  </label>

                  {photoFile && (
                    <Button
                      onClick={handleSavePhoto}
                      disabled={isSavingPhoto}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                    >
                      {isSavingPhoto ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Actualizar foto
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                  Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-foreground">Información Personal</CardTitle>
                  <p className="text-foreground-secondary" style={{ fontSize: '13px', marginTop: '2px' }}>
                    Actualiza tus datos personales
                  </p>
                </div>
              </div>

              {!isEditingInfo && (
                <Button
                  onClick={() => setIsEditingInfo(true)}
                  variant="outline"
                  className="border-border text-foreground hover:bg-surface"
                >
                  Editar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-foreground mb-4" style={{ fontSize: '15px', fontWeight: 600 }}>
                  Datos Básicos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-foreground">
                      Nombre <span className="text-danger">*</span>
                    </Label>
                    <Input
                      id="nombre"
                      value={infoFormData.nombre}
                      onChange={(e) => handleInfoChange('nombre', e.target.value)}
                      disabled={!isEditingInfo}
                      className="bg-input-background border-border text-foreground disabled:opacity-60"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apellido" className="text-foreground">
                      Apellido <span className="text-danger">*</span>
                    </Label>
                    <Input
                      id="apellido"
                      value={infoFormData.apellido}
                      onChange={(e) => handleInfoChange('apellido', e.target.value)}
                      disabled={!isEditingInfo}
                      className="bg-input-background border-border text-foreground disabled:opacity-60"
                      placeholder="Tu apellido"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipoDocumento" className="text-foreground">
                      Tipo de Documento <span className="text-danger">*</span>
                    </Label>
                    <Select
                      value={infoFormData.tipoDocumento}
                      onValueChange={(value) => handleInfoChange('tipoDocumento', value)}
                      disabled={!isEditingInfo}
                    >
                      <SelectTrigger className="bg-input-background border-border text-foreground disabled:opacity-60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="CC" className="text-foreground hover:bg-surface">
                          Cédula de Ciudadanía
                        </SelectItem>
                        <SelectItem value="TI" className="text-foreground hover:bg-surface">
                          Tarjeta de Identidad
                        </SelectItem>
                        <SelectItem value="CE" className="text-foreground hover:bg-surface">
                          Cédula de Extranjería
                        </SelectItem>
                        <SelectItem value="PAS" className="text-foreground hover:bg-surface">
                          Pasaporte
                        </SelectItem>
                        <SelectItem value="NIT" className="text-foreground hover:bg-surface">
                          NIT
                        </SelectItem>
                        <SelectItem value="OTRO" className="text-foreground hover:bg-surface">
                          Otro
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numeroDocumento" className="text-foreground">
                      Número de Documento <span className="text-danger">*</span>
                    </Label>
                    <Input
                      id="numeroDocumento"
                      value={infoFormData.numeroDocumento}
                      onChange={(e) => handleInfoChange('numeroDocumento', e.target.value)}
                      disabled={!isEditingInfo}
                      className="bg-input-background border-border text-foreground disabled:opacity-60"
                      placeholder="Número de documento"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-border" />

              {/* Contact Information */}
              <div>
                <h3 className="text-foreground mb-4" style={{ fontSize: '15px', fontWeight: 600 }}>
                  Información de Contacto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-foreground">
                      Teléfono <span className="text-danger">*</span>
                    </Label>
                    <Input
                      id="telefono"
                      value={infoFormData.telefono}
                      onChange={(e) => handleInfoChange('telefono', e.target.value)}
                      disabled={!isEditingInfo}
                      className="bg-input-background border-border text-foreground disabled:opacity-60"
                      placeholder="+57 300 123 4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      Correo Electrónico <span className="text-danger">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={infoFormData.email}
                      onChange={(e) => handleInfoChange('email', e.target.value)}
                      disabled={!isEditingInfo}
                      className="bg-input-background border-border text-foreground disabled:opacity-60"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-border" />

              {/* Location Information */}
              <div>
                <h3 className="text-foreground mb-4" style={{ fontSize: '15px', fontWeight: 600 }}>
                  Ubicación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="direccion" className="text-foreground">
                      Dirección
                    </Label>
                    <Input
                      id="direccion"
                      value={infoFormData.direccion}
                      onChange={(e) => handleInfoChange('direccion', e.target.value)}
                      disabled={!isEditingInfo}
                      className="bg-input-background border-border text-foreground disabled:opacity-60"
                      placeholder="Calle 123 # 45-67"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ciudad" className="text-foreground">
                      Ciudad
                    </Label>
                    <Input
                      id="ciudad"
                      value={infoFormData.ciudad}
                      onChange={(e) => handleInfoChange('ciudad', e.target.value)}
                      disabled={!isEditingInfo}
                      className="bg-input-background border-border text-foreground disabled:opacity-60"
                      placeholder="Medellín"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pais" className="text-foreground">
                      País
                    </Label>
                    <Input
                      id="pais"
                      value={infoFormData.pais}
                      onChange={(e) => handleInfoChange('pais', e.target.value)}
                      disabled={!isEditingInfo}
                      className="bg-input-background border-border text-foreground disabled:opacity-60"
                      placeholder="Colombia"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditingInfo && (
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    onClick={handleCancelInfo}
                    variant="outline"
                    disabled={isSavingInfo}
                    className="border-border text-foreground hover:bg-surface gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveInfo}
                    disabled={isSavingInfo}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                  >
                    {isSavingInfo ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Guardar cambios
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-foreground">Seguridad</CardTitle>
                <p className="text-foreground-secondary" style={{ fontSize: '13px', marginTop: '2px' }}>
                  Cambia tu contraseña
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-foreground">
                  Contraseña Actual <span className="text-danger">*</span>
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordFormData.currentPassword}
                  onChange={(e) => setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value })}
                  className="bg-input-background border-border text-foreground"
                  placeholder="Tu contraseña actual"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-foreground">
                  Nueva Contraseña <span className="text-danger">*</span>
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordFormData.newPassword}
                  onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                  className="bg-input-background border-border text-foreground"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">
                  Confirmar Nueva Contraseña <span className="text-danger">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordFormData.confirmPassword}
                  onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
                  className="bg-input-background border-border text-foreground"
                  placeholder="Confirma tu nueva contraseña"
                />
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSavePassword}
                  disabled={isSavingPassword}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                >
                  {isSavingPassword ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Actualizar contraseña
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mt-4">
                <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                  💡 <span className="text-foreground">Recomendación:</span> Utiliza una contraseña segura con al menos 8 caracteres, que incluya mayúsculas, minúsculas, números y símbolos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Information (Read-only) */}
        <Card className="bg-card border-border border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-foreground-secondary" style={{ fontSize: '13px' }}>
                  Rol de Usuario
                </p>
                <p className="text-foreground" style={{ fontSize: '16px', fontWeight: 600, marginTop: '2px' }}>
                  {currentUser.rol === 'admin' ? 'Administrador' : 
                   currentUser.rol === 'vendedor' ? 'Vendedor' : 
                   currentUser.rol === 'bodeguero' ? 'Bodeguero' : 
                   currentUser.rol === 'cliente' ? 'Cliente' : 'Sin rol'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-foreground-secondary" style={{ fontSize: '11px' }}>
                  Los roles y permisos son asignados por administradores
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}