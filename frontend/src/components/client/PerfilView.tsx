import { useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
import { UserCircle, CheckCircle, Lock, Eye, EyeOff, Camera, Loader2, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { authService } from '../../services/authService';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useRef } from 'react';

/* ── Luxury CSS variable helpers ── */
const V = (name: string) => `var(--luxury-${name})`;
const C = {
  bgSoft: V('bg-soft'),
  accent: V('pink-soft'),
  accentDark: V('accent-dark'),
  accentDeep: V('pink'),
  textDark: V('text-dark'),
  textMuted: V('text-muted'),
  shadowSm: V('shadow-sm'),
  shadow: V('shadow'),
  white: '#ffffff',
  danger: '#ef4444',
  success: '#10b981',
};

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

    if (!formData.nombres) newErrors.nombres = 'El nombre es obligatorio';
    if (!formData.apellidos) newErrors.apellidos = 'El apellido es obligatorio';
    
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

    if (!formData.direccion) newErrors.direccion = 'La dirección es obligatoria';
    if (!formData.ciudad) newErrors.ciudad = 'La ciudad es obligatoria';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    setErrors({});
    
    try {
      await authService.updateProfile({
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        telefono: formData.telefono,
        direccion: formData.direccion,
        ciudad: formData.ciudad,
      });

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

    if (!file.type.startsWith('image/')) {
      toast.error('Formato inválido', { description: 'Por favor selecciona una imagen (PNG, JPG, etc.)' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Archivo muy pesado', { description: 'La imagen debe ser menor a 2MB' });
      return;
    }

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);

      await authService.updateProfile({ foto_perfil: publicUrl });
      
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

    if (!passwordData.currentPassword) newErrors.currentPassword = 'La contraseña actual es obligatoria';
    
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

  // Luxury UI Form Components
  const InputField = ({ label, id, value, onChange, disabled, error, type = "text", placeholder = "" }: any) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label htmlFor={id} style={{ fontSize: '13px', fontWeight: 600, color: C.textMuted }}>
        {label} <span style={{ color: C.danger }}>*</span>
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        style={{
          width: '100%', height: '44px', borderRadius: '12px',
          border: `1px solid ${error ? C.danger : C.accentDark}`,
          padding: '0 16px', outline: 'none', fontSize: '14px',
          color: disabled ? C.textMuted : C.textDark,
          background: disabled ? '#f9fafb' : C.white,
          boxSizing: 'border-box',
          transition: 'all 0.2s',
        }}
        onFocus={(e) => {
          if(!disabled) e.currentTarget.style.borderColor = C.accentDeep;
          if(!disabled) e.currentTarget.style.boxShadow = `0 0 0 3px ${C.accent}`;
        }}
        onBlur={(e) => {
          if(!disabled) e.currentTarget.style.borderColor = error ? C.danger : C.accentDark;
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      {error && <p style={{ color: C.danger, fontSize: '12px', margin: 0 }}>{error}</p>}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bgSoft, fontFamily: "'DM Sans', sans-serif" }}>
      
      {/* ── HERO HEADER ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${C.textDark} 0%, ${C.accentDeep} 100%)`,
          padding: '40px 0',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '40px'
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 32px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <div style={{
              width: '48px', height: '48px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <UserCircle style={{ width: 24, height: 24, color: C.white }} />
            </div>
            <h1 style={{ 
              fontFamily: "'Cormorant Garamond', serif", 
              fontSize: '42px', 
              fontWeight: 600, 
              color: C.white, 
              margin: 0 
            }}>
              Mi Perfil
            </h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '0 0 0 64px' }}>
            Gestiona tu información personal y preferencias
          </p>
        </div>
        
        {/* Decoración */}
        <div style={{ position: 'absolute', right: '5%', top: '-20%', fontSize: '150px', opacity: 0.05, transform: 'rotate(15deg)', pointerEvents: 'none' }}>
          ✿
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 32px 80px 32px' }}>
        
        {/* Success Message */}
        {showSuccess && (
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.1)', 
            border: `1px solid ${C.success}`, 
            color: C.success, 
            borderRadius: '12px', 
            padding: '16px', 
            marginBottom: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px' 
          }}>
            <CheckCircle style={{ width: 20, height: 20 }} />
            <p style={{ fontSize: '14px', margin: 0, fontWeight: 500 }}>
              Tus cambios se han guardado exitosamente
            </p>
          </div>
        )}

        <div style={{ background: C.white, borderRadius: '24px', padding: '40px', border: `1px solid ${C.accent}`, boxShadow: `0 8px 30px ${C.shadowSm}` }}>
          
          {/* Avatar Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', paddingBottom: '32px', borderBottom: `1px solid ${C.accent}`, marginBottom: '32px' }}>
            <div style={{ position: 'relative' }} className="group">
              <div style={{ 
                width: '96px', height: '96px', 
                borderRadius: '50%', 
                background: C.bgSoft, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                overflow: 'hidden', 
                border: `2px solid ${C.accentDark}` 
              }}>
                {isUploading ? (
                  <Loader2 style={{ width: 32, height: 32, color: C.accentDeep }} className="animate-spin" />
                ) : currentUser?.foto_perfil ? (
                  <img src={currentUser.foto_perfil} alt="PFP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <UserCircle style={{ width: 64, height: 64, color: C.accentDeep, opacity: 0.5 }} />
                )}
              </div>
              <button 
                onClick={handleFileClick}
                disabled={isUploading || !isEditing}
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: isEditing ? C.accentDeep : '#e5e7eb',
                  color: C.white, border: 'none', cursor: isEditing && !isUploading ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 4px 10px ${C.shadowSm}`,
                  transition: 'transform 0.2s'
                }}
              >
                <Camera style={{ width: 16, height: 16 }} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileUpload}
              />
            </div>
            <div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 600, color: C.textDark, margin: '0 0 8px 0' }}>
                {formData.nombres} {formData.apellidos}
              </h3>
              <button
                onClick={handleFileClick}
                disabled={isUploading || !isEditing}
                style={{
                  background: 'none',
                  border: `1px solid ${C.accentDark}`,
                  color: C.textDark,
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isEditing && !isUploading ? 'pointer' : 'not-allowed',
                  opacity: isEditing ? 1 : 0.5,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => { if(isEditing && !isUploading) e.currentTarget.style.background = C.bgSoft }}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                {isUploading ? 'Subiendo...' : 'Cambiar foto de perfil'}
              </button>
            </div>
          </div>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <InputField 
                label="Nombres" id="nombres" value={formData.nombres} 
                onChange={(e: any) => setFormData({ ...formData, nombres: e.target.value })} 
                disabled={!isEditing || isSaving} error={errors.nombres} 
              />
              <InputField 
                label="Apellidos" id="apellidos" value={formData.apellidos} 
                onChange={(e: any) => setFormData({ ...formData, apellidos: e.target.value })} 
                disabled={!isEditing || isSaving} error={errors.apellidos} 
              />
              <InputField 
                label="Email" id="email" type="email" value={formData.email} 
                onChange={(e: any) => setFormData({ ...formData, email: e.target.value })} 
                disabled={!isEditing || isSaving} error={errors.email} placeholder="correo@ejemplo.com"
              />
              <InputField 
                label="Teléfono" id="telefono" value={formData.telefono} 
                onChange={(e: any) => setFormData({ ...formData, telefono: e.target.value })} 
                disabled={!isEditing || isSaving} error={errors.telefono} placeholder="3001234567"
              />
              <InputField 
                label="Ciudad" id="ciudad" value={formData.ciudad} 
                onChange={(e: any) => setFormData({ ...formData, ciudad: e.target.value })} 
                disabled={!isEditing || isSaving} error={errors.ciudad} placeholder="Medellín"
              />
            </div>

            <InputField 
              label="Dirección" id="direccion" value={formData.direccion} 
              onChange={(e: any) => setFormData({ ...formData, direccion: e.target.value })} 
              disabled={!isEditing || isSaving} error={errors.direccion} placeholder="Calle 31C #89-35"
            />

            {/* Preferences */}
            <div style={{ paddingTop: '24px', borderTop: `1px solid ${C.accent}`, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: C.textDark, margin: 0 }}>
                Preferencias
              </h3>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: isEditing ? 'pointer' : 'default', opacity: isEditing ? 1 : 0.6 }}>
                <input
                  type="checkbox"
                  checked={formData.recibirOfertas}
                  onChange={(e) => setFormData({ ...formData, recibirOfertas: e.target.checked })}
                  disabled={!isEditing || isSaving}
                  style={{ width: '18px', height: '18px', accentColor: C.accentDeep, cursor: isEditing ? 'pointer' : 'default' }}
                />
                <span style={{ fontSize: '14px', color: C.textDark }}>Recibir ofertas por email</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: isEditing ? 'pointer' : 'default', opacity: isEditing ? 1 : 0.6 }}>
                <input
                  type="checkbox"
                  checked={formData.notificacionesPush}
                  onChange={(e) => setFormData({ ...formData, notificacionesPush: e.target.checked })}
                  disabled={!isEditing || isSaving}
                  style={{ width: '18px', height: '18px', accentColor: C.accentDeep, cursor: isEditing ? 'pointer' : 'default' }}
                />
                <span style={{ fontSize: '14px', color: C.textDark }}>Notificaciones push</span>
              </label>
            </div>

            {/* Actions */}
            <div style={{ paddingTop: '32px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                      background: `linear-gradient(135deg, ${C.textDark} 0%, ${C.accentDeep} 100%)`,
                      color: C.white, border: 'none', padding: '14px 32px', borderRadius: '12px',
                      fontSize: '14px', fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      boxShadow: `0 8px 20px ${C.shadowSm}`
                    }}
                  >
                    {isSaving ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : <Save style={{ width: 16, height: 16 }} />}
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setErrors({});
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
                    disabled={isSaving}
                    style={{
                      background: 'none', color: C.textDark, border: `1px solid ${C.accentDark}`,
                      padding: '14px 32px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
                      cursor: isSaving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                  >
                    <X style={{ width: 16, height: 16 }} />
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      background: `linear-gradient(135deg, ${C.textDark} 0%, ${C.accentDeep} 100%)`,
                      color: C.white, border: 'none', padding: '14px 32px', borderRadius: '12px',
                      fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                      boxShadow: `0 8px 20px ${C.shadowSm}`
                    }}
                  >
                    Editar Perfil
                  </button>
                  <button
                    onClick={() => setIsPasswordDialogOpen(true)}
                    style={{
                      background: 'none', color: C.textDark, border: `1px solid ${C.accentDark}`,
                      padding: '14px 32px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                  >
                    <Lock style={{ width: 16, height: 16 }} />
                    Cambiar contraseña
                  </button>
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
        <DialogContent style={{ background: C.white, border: `1px solid ${C.accent}`, borderRadius: '24px' }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: C.textDark }}>Cambiar Contraseña</DialogTitle>
            <DialogDescription style={{ color: C.textMuted }}>
              Ingresa tu contraseña actual y la nueva que deseas utilizar.
            </DialogDescription>
          </DialogHeader>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '16px' }}>
            <div style={{ position: 'relative' }}>
              <InputField 
                label="Contraseña Actual" id="currentPassword" 
                type={showCurrentPassword ? "text" : "password"} 
                value={passwordData.currentPassword} 
                onChange={(e: any) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} 
                disabled={isChangingPassword} error={passwordErrors.currentPassword} 
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                style={{ position: 'absolute', right: '16px', top: '38px', background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted }}
              >
                {showCurrentPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <InputField 
                label="Nueva Contraseña" id="newPassword" 
                type={showNewPassword ? "text" : "password"} 
                value={passwordData.newPassword} 
                onChange={(e: any) => setPasswordData({ ...passwordData, newPassword: e.target.value })} 
                disabled={isChangingPassword} error={passwordErrors.newPassword} 
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{ position: 'absolute', right: '16px', top: '38px', background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted }}
              >
                {showNewPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>

            <InputField 
              label="Confirmar Nueva Contraseña" id="confirmPassword" 
              type="password" value={passwordData.confirmPassword} 
              onChange={(e: any) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} 
              disabled={isChangingPassword} error={passwordErrors.confirmPassword} 
            />
          </div>

          <DialogFooter style={{ marginTop: '24px', gap: '12px' }}>
            <button
              onClick={() => setIsPasswordDialogOpen(false)}
              disabled={isChangingPassword}
              style={{
                background: 'none', color: C.textDark, border: `1px solid ${C.accentDark}`,
                padding: '12px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              style={{
                background: `linear-gradient(135deg, ${C.textDark} 0%, ${C.accentDeep} 100%)`,
                color: C.white, border: 'none', padding: '12px 24px', borderRadius: '10px',
                fontSize: '14px', fontWeight: 600, cursor: isChangingPassword ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              {isChangingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
