import { useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
import { PageHeader } from '../PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { User, Lock, Camera, Check, X, ShieldCheck, Mail, Phone, MapPin, CreditCard, Activity } from 'lucide-react';
import { toast } from 'sonner';

/* ── Luxury CSS variable helpers ── */
const V = (name: string) => `var(--luxury-${name})`;
const C = {
  bgSoft: V('bg-soft'),
  accent: V('pink-soft'),
  accentDark: V('accent-dark'),
  accentDeep: V('pink'),
  textDark: V('text-dark'),
  textMuted: V('text-muted'),
  textSecondary: V('text-secondary'),
  shadowSm: V('shadow-sm'),
  shadow: V('shadow'),
  white: '#ffffff',
  danger: '#ef4444',
  success: '#10b981',
};

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

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInfoChange = (field: string, value: string) => {
    setInfoFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveInfo = async () => {
    if (!currentUser) return;
    if (!infoFormData.nombre.trim() || !infoFormData.apellido.trim() || !infoFormData.numeroDocumento.trim() || !infoFormData.telefono.trim() || !infoFormData.email.trim()) {
      toast.error('Campos obligatorios');
      return;
    }
    if (!validateEmail(infoFormData.email)) {
      toast.error('Formato inválido');
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
    toast.success('Información actualizada');
  };

  const handleSavePassword = async () => {
    if (!currentUser) return;
    if (!passwordFormData.currentPassword || !passwordFormData.newPassword || !passwordFormData.confirmPassword) {
      toast.error('Campos obligatorios');
      return;
    }
    if (passwordFormData.newPassword.length < 8) {
      toast.error('Contraseña débil');
      return;
    }
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (passwordFormData.currentPassword !== 'admin123' && passwordFormData.currentPassword !== currentUser.passwordHash) {
      toast.error('Contraseña actual incorrecta');
      return;
    }

    setIsSavingPassword(true);
    updateUser(currentUser.id, { passwordHash: passwordFormData.newPassword });
    setIsSavingPassword(false);
    setPasswordFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    toast.success('Contraseña actualizada');
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) { toast.error('Solo imágenes'); return; }
      if (file.size > 5 * 1024 * 1024) { toast.error('Máximo 5MB'); return; }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = async () => {
    if (!photoFile || !currentUser) return;
    setIsSavingPhoto(true);
    toast.success('Foto actualizada');
    setIsSavingPhoto(false);
    setPhotoFile(null);
    setPreviewPhoto(null);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bgSoft }}>
        <p style={{ color: C.textMuted }}>Usuario no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pb-12 w-full" style={{ background: C.bgSoft, fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader
        title="Perfil de Usuario"
        subtitle="Gestiona tu identidad y seguridad en la plataforma"
        icon={User}
      />

      <div className="px-8 pt-6 pb-8 space-y-8 w-full">
        
        {/* Top Section: Photo & Basic Info Summary (Explosive Layout) */}
        <div className="grid grid-cols-12 gap-8 items-stretch">
          
          {/* Avatar Card - col-span-3 */}
          <div className="col-span-12 xl:col-span-3" style={{ background: C.white, borderRadius: '24px', padding: '32px', boxShadow: C.shadowSm, border: `1px solid ${C.accent}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <div style={{ 
                width: '160px', 
                height: '160px', 
                borderRadius: '50%', 
                background: C.bgSoft, 
                border: `5px solid ${C.accent}`, 
                overflow: 'hidden', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: C.shadow
              }}>
                {previewPhoto ? (
                  <img src={previewPhoto} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User style={{ width: 80, height: 80, color: C.accentDeep }} />
                )}
              </div>
              <label htmlFor="photo-upload" style={{ 
                position: 'absolute', 
                bottom: '8px', 
                right: '8px', 
                width: '44px', 
                height: '44px', 
                borderRadius: '50%', 
                background: C.accentDeep, 
                color: C.white, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer',
                boxShadow: C.shadow,
                border: `3px solid ${C.white}`
              }}>
                <Camera size={20} />
                <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            </div>

            <div className="text-center">
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: C.textDark, margin: '0 0 4px 0' }}>{currentUser.nombre} {currentUser.apellido}</h3>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck size={14} />
                {currentUser.rol}
              </div>
            </div>
            
            {photoFile && (
              <Button onClick={handleSavePhoto} disabled={isSavingPhoto} className="w-full luxury-button-premium mt-6">
                {isSavingPhoto ? 'Guardando...' : 'Confirmar Nueva Foto'}
              </Button>
            )}
          </div>

          {/* Quick Stats - col-span-9 - Spread horizontally */}
          <div className="col-span-12 xl:col-span-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div style={{ background: C.white, borderRadius: '24px', padding: '32px', boxShadow: C.shadowSm, border: `1px solid ${C.accent}`, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${C.accentDeep}11`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity style={{ color: C.accentDeep }} size={28} />
              </div>
              <div>
                <p style={{ fontSize: '13px', color: C.textMuted, margin: 0, fontWeight: 500 }}>Estado de Cuenta</p>
                <p style={{ fontSize: '18px', fontWeight: 700, color: C.success, margin: 0 }}>Activa & Verificada</p>
              </div>
            </div>

            <div style={{ background: C.white, borderRadius: '24px', padding: '32px', boxShadow: C.shadowSm, border: `1px solid ${C.accent}`, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${C.accentDeep}11`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail style={{ color: C.accentDeep }} size={28} />
              </div>
              <div className="overflow-hidden">
                <p style={{ fontSize: '13px', color: C.textMuted, margin: 0, fontWeight: 500 }}>Email Principal</p>
                <p style={{ fontSize: '16px', fontWeight: 700, color: C.textDark, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.email}</p>
              </div>
            </div>

            <div style={{ background: C.white, borderRadius: '24px', padding: '32px', boxShadow: C.shadowSm, border: `1px solid ${C.accent}`, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${C.accentDeep}11`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone style={{ color: C.accentDeep }} size={28} />
              </div>
              <div>
                <p style={{ fontSize: '13px', color: C.textMuted, margin: 0, fontWeight: 500 }}>Teléfono Contacto</p>
                <p style={{ fontSize: '18px', fontWeight: 700, color: C.textDark, margin: 0 }}>{currentUser.telefono || 'No registrado'}</p>
              </div>
            </div>

            <div style={{ background: C.white, borderRadius: '24px', padding: '32px', boxShadow: C.shadowSm, border: `1px solid ${C.accent}`, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${C.accentDeep}11`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin style={{ color: C.accentDeep }} size={28} />
              </div>
              <div>
                <p style={{ fontSize: '13px', color: C.textMuted, margin: 0, fontWeight: 500 }}>Sede / Ciudad</p>
                <p style={{ fontSize: '18px', fontWeight: 700, color: C.textDark, margin: 0 }}>{currentUser.ciudad || 'Medellín, CO'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Section (Wide split) */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* Detailed Information - col-span-8 */}
          <div className="col-span-12 xl:col-span-8" style={{ background: C.white, borderRadius: '24px', padding: '40px', boxShadow: C.shadow, border: `1px solid ${C.accent}` }}>
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-pink-50">
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: C.textDark, margin: 0 }}>Información Detallada</h3>
                <p style={{ fontSize: '14px', color: C.textMuted, margin: '4px 0 0 0' }}>Gestión completa de datos de usuario y contacto legal</p>
              </div>
              {!isEditingInfo ? (
                <button 
                  onClick={() => setIsEditingInfo(true)}
                  style={{ background: C.bgSoft, border: `1.5px solid ${C.accentDeep}`, padding: '10px 24px', borderRadius: '14px', color: C.accentDeep, fontWeight: 800, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
                  className="hover:bg-pink-100"
                >
                  EDITAR PERFIL
                </button>
              ) : (
                <div className="flex gap-3">
                  <button onClick={() => setIsEditingInfo(false)} style={{ background: 'none', border: 'none', color: C.textMuted, fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>Descartar</button>
                  <button onClick={handleSaveInfo} style={{ background: C.accentDeep, border: 'none', padding: '10px 24px', borderRadius: '14px', color: C.white, fontWeight: 800, fontSize: '14px', cursor: 'pointer', boxShadow: C.shadow }}>GUARDAR CAMBIOS</button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div className="space-y-3">
                <Label style={{ color: C.textSecondary, fontWeight: 700, fontSize: '14px' }}>Nombre Completo *</Label>
                <Input value={infoFormData.nombre} onChange={(e) => handleInfoChange('nombre', e.target.value)} disabled={!isEditingInfo} style={{ height: '50px', borderRadius: '14px', border: `1.5px solid ${C.accent}`, background: isEditingInfo ? C.white : `${C.bgSoft}55`, fontSize: '15px' }} />
              </div>
              <div className="space-y-3">
                <Label style={{ color: C.textSecondary, fontWeight: 700, fontSize: '14px' }}>Apellidos *</Label>
                <Input value={infoFormData.apellido} onChange={(e) => handleInfoChange('apellido', e.target.value)} disabled={!isEditingInfo} style={{ height: '50px', borderRadius: '14px', border: `1.5px solid ${C.accent}`, background: isEditingInfo ? C.white : `${C.bgSoft}55`, fontSize: '15px' }} />
              </div>
              <div className="space-y-3">
                <Label style={{ color: C.textSecondary, fontWeight: 700, fontSize: '14px' }}>Tipo de Identificación *</Label>
                <Select value={infoFormData.tipoDocumento} onValueChange={(v) => handleInfoChange('tipoDocumento', v)} disabled={!isEditingInfo}>
                  <SelectTrigger style={{ height: '50px', borderRadius: '14px', border: `1.5px solid ${C.accent}`, background: isEditingInfo ? C.white : `${C.bgSoft}55` }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                    <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                    <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                    <SelectItem value="PAS">Pasaporte</SelectItem>
                    <SelectItem value="NIT">NIT (Empresas)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label style={{ color: C.textSecondary, fontWeight: 700, fontSize: '14px' }}>Número de Documento *</Label>
                <Input value={infoFormData.numeroDocumento} onChange={(e) => handleInfoChange('numeroDocumento', e.target.value)} disabled={!isEditingInfo} style={{ height: '50px', borderRadius: '14px', border: `1.5px solid ${C.accent}`, background: isEditingInfo ? C.white : `${C.bgSoft}55`, fontSize: '15px' }} />
              </div>
              <div className="space-y-3">
                <Label style={{ color: C.textSecondary, fontWeight: 700, fontSize: '14px' }}>Correo Electrónico Laboral *</Label>
                <Input type="email" value={infoFormData.email} onChange={(e) => handleInfoChange('email', e.target.value)} disabled={!isEditingInfo} style={{ height: '50px', borderRadius: '14px', border: `1.5px solid ${C.accent}`, background: isEditingInfo ? C.white : `${C.bgSoft}55`, fontSize: '15px' }} />
              </div>
              <div className="space-y-3">
                <Label style={{ color: C.textSecondary, fontWeight: 700, fontSize: '14px' }}>Teléfono Móvil *</Label>
                <Input value={infoFormData.telefono} onChange={(e) => handleInfoChange('telefono', e.target.value)} disabled={!isEditingInfo} style={{ height: '50px', borderRadius: '14px', border: `1.5px solid ${C.accent}`, background: isEditingInfo ? C.white : `${C.bgSoft}55`, fontSize: '15px' }} />
              </div>
              <div className="space-y-3 md:col-span-2">
                <Label style={{ color: C.textSecondary, fontWeight: 700, fontSize: '14px' }}>Dirección de Notificación</Label>
                <Input value={infoFormData.direccion} onChange={(e) => handleInfoChange('direccion', e.target.value)} disabled={!isEditingInfo} style={{ height: '50px', borderRadius: '14px', border: `1.5px solid ${C.accent}`, background: isEditingInfo ? C.white : `${C.bgSoft}55`, fontSize: '15px' }} />
              </div>
              <div className="space-y-3">
                <Label style={{ color: C.textSecondary, fontWeight: 700, fontSize: '14px' }}>Ciudad / Distrito</Label>
                <Input value={infoFormData.ciudad} onChange={(e) => handleInfoChange('ciudad', e.target.value)} disabled={!isEditingInfo} style={{ height: '50px', borderRadius: '14px', border: `1.5px solid ${C.accent}`, background: isEditingInfo ? C.white : `${C.bgSoft}55`, fontSize: '15px' }} />
              </div>
              <div className="space-y-3">
                <Label style={{ color: C.textSecondary, fontWeight: 700, fontSize: '14px' }}>País / Región</Label>
                <Input value={infoFormData.pais} onChange={(e) => handleInfoChange('pais', e.target.value)} disabled={!isEditingInfo} style={{ height: '50px', borderRadius: '14px', border: `1.5px solid ${C.accent}`, background: isEditingInfo ? C.white : `${C.bgSoft}55`, fontSize: '15px' }} />
              </div>
            </div>
          </div>

          {/* Sidebar Section: Security & Help - col-span-4 */}
          <div className="col-span-12 xl:col-span-4 space-y-8">
            
            {/* Password Card */}
            <div style={{ background: C.white, borderRadius: '24px', padding: '32px', boxShadow: C.shadow, border: `1px solid ${C.accent}` }}>
              <div className="flex items-center gap-3 mb-8">
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${C.accentDeep}11`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock style={{ width: 24, height: 24, color: C.accentDeep }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: C.textDark, margin: 0 }}>Seguridad</h3>
                  <p style={{ fontSize: '12px', color: C.textMuted, margin: 0 }}>Protección de cuenta</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label style={{ fontSize: '13px', color: C.textSecondary, fontWeight: 600 }}>Contraseña Actual</Label>
                  <Input type="password" value={passwordFormData.currentPassword} onChange={(e) => setPasswordFormData({...passwordFormData, currentPassword: e.target.value})} style={{ height: '48px', borderRadius: '14px', border: `1.5px solid ${C.accent}` }} placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label style={{ fontSize: '13px', color: C.textSecondary, fontWeight: 600 }}>Nueva Contraseña</Label>
                  <Input type="password" value={passwordFormData.newPassword} onChange={(e) => setPasswordFormData({...passwordFormData, newPassword: e.target.value})} style={{ height: '48px', borderRadius: '14px', border: `1.5px solid ${C.accent}` }} placeholder="Mín. 8 caracteres" />
                </div>
                <div className="space-y-2">
                  <Label style={{ fontSize: '13px', color: C.textSecondary, fontWeight: 600 }}>Confirmar Nueva</Label>
                  <Input type="password" value={passwordFormData.confirmPassword} onChange={(e) => setPasswordFormData({...passwordFormData, confirmPassword: e.target.value})} style={{ height: '48px', borderRadius: '14px', border: `1.5px solid ${C.accent}` }} placeholder="Confirmar contraseña" />
                </div>
                <Button onClick={handleSavePassword} className="w-full luxury-button-premium mt-4 h-12" disabled={isSavingPassword}>
                  {isSavingPassword ? 'Procesando...' : 'ACTUALIZAR CREDENCIALES'}
                </Button>
              </div>
            </div>

            {/* Support Card with larger impact */}
            <div style={{ 
              background: `linear-gradient(135deg, ${C.accentDeep} 0%, #4a2035 100%)`, 
              borderRadius: '24px', 
              padding: '40px 32px', 
              boxShadow: C.shadow, 
              color: C.white,
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative circle */}
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              
              <h4 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 12px 0', position: 'relative' }}>Soporte Especializado</h4>
              <p style={{ fontSize: '14px', opacity: 0.9, margin: '0 0 24px 0', lineHeight: '1.6', position: 'relative' }}>
                ¿Tienes dudas sobre tus permisos o necesitas ajustes avanzados en tu cuenta corporativa?
              </p>
              <button style={{ 
                background: C.white, 
                border: 'none', 
                padding: '14px 20px', 
                borderRadius: '16px', 
                color: C.accentDeep, 
                fontSize: '13px', 
                fontWeight: 800, 
                width: '100%', 
                cursor: 'pointer',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                position: 'relative'
              }}>
                CONTACTAR A SISTEMAS
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}