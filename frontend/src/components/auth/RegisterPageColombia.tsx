import { useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { UserRole } from '../../lib/store';
import { ChevronLeft, User, Hash, Mail, Phone, Lock, MapPin, Building2, CreditCard, Eye, EyeOff } from 'lucide-react';

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
};

interface RegisterPageProps {
  onRegister: (data: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    password: string;
    rol: UserRole;
    tipoDocumento: string;
    documento: string;
    direccion: string;
    ciudad: string;
  }) => void;
  onNavigateToLogin: () => void;
  onBack?: () => void;
}

export function RegisterPageColombia({ onRegister, onNavigateToLogin, onBack }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    tipoDocumento: 'CC',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    ciudad: '',
    direccion: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'nombres':
      case 'apellidos': {
        const label = name === 'nombres' ? 'El nombre' : 'El apellido';
        if (!value.trim()) return `${label} es obligatorio`;
        if (value.trim().length > 80) return `Máximo 80 caracteres`;
        return '';
      }
      case 'numeroDocumento':
        if (!value.trim()) return 'El documento es obligatorio';
        if (value.trim().length > 10) return 'Máximo 10 caracteres';
        return '';
      case 'email':
        if (!value.trim()) return 'El email es obligatorio';
        if (!emailRegex.test(value.trim())) return 'Formato inválido';
        if (value.trim().length > 100) return 'Máximo 100 caracteres';
        return '';
      case 'telefono':
        if (!value.trim()) return 'El teléfono es obligatorio';
        if (!/^\d+$/.test(value.trim())) return 'Solo números';
        if (value.trim().length < 7) return 'Mínimo 7 dígitos';
        if (value.trim().length > 15) return 'Máximo 15 dígitos';
        return '';
      case 'password':
        if (!value) return 'La contraseña es obligatoria';
        if (value.length < 8) return 'Mínimo 8 caracteres';
        return '';
      case 'confirmPassword':
        if (!value) return 'Confirma tu contraseña';
        if (value !== formData.password) return 'Las contraseñas no coinciden';
        return '';
      case 'direccion':
        if (value.trim() && value.trim().length < 3) return 'Mínimo 3 caracteres';
        if (value.trim().length > 30) return 'Máximo 30 caracteres';
        return '';
      case 'ciudad':
        if (value.trim().length > 50) return 'Máximo 50 caracteres';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    if (name === 'password' && formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: value !== formData.confirmPassword ? 'Las contraseñas no coinciden' : '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fields = ['nombres', 'apellidos', 'numeroDocumento', 'email', 'telefono', 'password', 'confirmPassword', 'direccion', 'ciudad'];
    const newErrors: Record<string, string> = {};
    fields.forEach(f => {
      const err = validateField(f, (formData as any)[f] || '');
      if (err) newErrors[f] = err;
    });
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setIsLoading(true);
    onRegister({
      nombre: formData.nombres.trim(),
      apellido: formData.apellidos.trim(),
      email: formData.email.trim(),
      telefono: formData.telefono.trim(),
      password: formData.password,
      rol: 'cliente',
      tipoDocumento: formData.tipoDocumento,
      documento: formData.numeroDocumento.trim(),
      direccion: formData.direccion.trim(),
      ciudad: formData.ciudad.trim(),
    });
    setIsLoading(false);
  };

  const fieldProps = (name: string) => ({
    value: (formData as any)[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange(name, e.target.value),
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: C.bgSoft, fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Panel izquierdo decorativo ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 px-10 py-10"
        style={{
          background: `linear-gradient(135deg, ${C.textDark} 0%, ${C.accentDeep} 100%)`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative blur circles */}
        <div style={{ position: 'absolute', top: '-10%', left: '-20%', width: '300px', height: '300px', background: C.white, borderRadius: '50%', filter: 'blur(100px)', opacity: 0.1, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-20%', width: '300px', height: '300px', background: C.accent, borderRadius: '50%', filter: 'blur(100px)', opacity: 0.2, pointerEvents: 'none' }} />

        {/* Logo & Content */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, marginBottom: '40px', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = C.white}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            >
              <ChevronLeft style={{ width: 16, height: 16 }} />
              Volver al inicio
            </button>
          )}
          <div style={{ width: '80px', height: '80px', borderRadius: '16px', overflow: 'hidden', boxShadow: `0 8px 30px rgba(0,0,0,0.2)`, border: '1px solid rgba(255,255,255,0.2)', marginBottom: '24px', background: '#000' }}>
            <img src="/logo.png" alt="Glamour ML" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 600, color: C.white, lineHeight: 1.1, marginBottom: '12px' }}>
            Bienvenida a<br />Glamour ML
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: 1.6 }}>
            Crea tu cuenta y descubre nuestra colección de productos de belleza y cuidado personal.
          </p>
        </div>

        {/* Decoración inferior */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 2 }}>
          {['Catálogo exclusivo de productos', 'Seguimiento de tus pedidos', 'Ofertas y descuentos especiales'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.white }} />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Panel derecho: formulario ── */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* Header móvil */}
        <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 16px 24px' }}>
          {onBack && (
            <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.textMuted, background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
              <ChevronLeft style={{ width: 16, height: 16 }} /> Volver
            </button>
          )}
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${C.accent}`, background: '#000' }}>
            <img src="/logo.png" alt="Glamour ML" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px', maxWidth: '640px', width: '100%', margin: '0 auto' }}>

          <div style={{ background: C.white, borderRadius: '24px', padding: '40px', border: `1px solid ${C.accentDeep}`, boxShadow: `0 20px 60px rgba(0,0,0,0.04)` }}>
            {/* Título */}
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 600, color: C.textDark, margin: '0 0 4px 0' }}>Crear cuenta</h1>
              <p style={{ color: C.textMuted, fontSize: '14px', margin: 0 }}>Completa tus datos para registrarte</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Identificación */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Identificación</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: C.textDark, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CreditCard style={{ width: 14, height: 14, color: C.accentDeep }} /> Tipo Doc. <span style={{ color: C.danger }}>*</span>
                    </label>
                    <Select value={formData.tipoDocumento} onValueChange={v => setFormData(p => ({ ...p, tipoDocumento: v }))}>
                      <SelectTrigger style={{ height: '44px', borderRadius: '8px', border: `1px solid ${C.accent}`, background: C.white, color: C.textDark, fontSize: '14px', outline: 'none', boxShadow: 'none' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent style={{ background: C.white, border: `1px solid ${C.accent}`, borderRadius: '12px' }}>
                        <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                        <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                        <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                        <SelectItem value="PAS">Pasaporte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: C.textDark, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Hash style={{ width: 14, height: 14, color: C.accentDeep }} /> Número <span style={{ color: C.danger }}>*</span>
                    </label>
                    <input
                      {...fieldProps('numeroDocumento')}
                      placeholder="1234567890" maxLength={10}
                      style={{ width: '100%', height: '44px', borderRadius: '8px', border: `1px solid ${errors.numeroDocumento ? C.danger : C.accent}`, padding: '0 16px', fontSize: '14px', color: C.textDark, outline: 'none', transition: 'border-color 0.2s', background: C.white }}
                      onFocus={e => e.currentTarget.style.borderColor = C.accentDeep}
                      onBlur={e => e.currentTarget.style.borderColor = errors.numeroDocumento ? C.danger : C.accent}
                    />
                    {errors.numeroDocumento && <p style={{ color: C.danger, fontSize: '11px', margin: 0 }}>{errors.numeroDocumento}</p>}
                  </div>
                </div>
              </div>

              {/* Datos personales */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Datos Personales</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: C.textDark, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User style={{ width: 14, height: 14, color: C.accentDeep }} /> Nombre <span style={{ color: C.danger }}>*</span>
                    </label>
                    <input
                      {...fieldProps('nombres')}
                      placeholder="Juan" maxLength={80}
                      style={{ width: '100%', height: '44px', borderRadius: '8px', border: `1px solid ${errors.nombres ? C.danger : C.accent}`, padding: '0 16px', fontSize: '14px', color: C.textDark, outline: 'none', transition: 'border-color 0.2s', background: C.white }}
                      onFocus={e => e.currentTarget.style.borderColor = C.accentDeep}
                      onBlur={e => e.currentTarget.style.borderColor = errors.nombres ? C.danger : C.accent}
                    />
                    {errors.nombres && <p style={{ color: C.danger, fontSize: '11px', margin: 0 }}>{errors.nombres}</p>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: C.textDark, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User style={{ width: 14, height: 14, color: C.accentDeep }} /> Apellido <span style={{ color: C.danger }}>*</span>
                    </label>
                    <input
                      {...fieldProps('apellidos')}
                      placeholder="Pérez" maxLength={80}
                      style={{ width: '100%', height: '44px', borderRadius: '8px', border: `1px solid ${errors.apellidos ? C.danger : C.accent}`, padding: '0 16px', fontSize: '14px', color: C.textDark, outline: 'none', transition: 'border-color 0.2s', background: C.white }}
                      onFocus={e => e.currentTarget.style.borderColor = C.accentDeep}
                      onBlur={e => e.currentTarget.style.borderColor = errors.apellidos ? C.danger : C.accent}
                    />
                    {errors.apellidos && <p style={{ color: C.danger, fontSize: '11px', margin: 0 }}>{errors.apellidos}</p>}
                  </div>
                </div>
              </div>

              {/* Contacto */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Contacto</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: C.textDark, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail style={{ width: 14, height: 14, color: C.accentDeep }} /> Email <span style={{ color: C.danger }}>*</span>
                    </label>
                    <input
                      {...fieldProps('email')}
                      type="email" placeholder="correo@ejemplo.com" maxLength={100}
                      style={{ width: '100%', height: '44px', borderRadius: '8px', border: `1px solid ${errors.email ? C.danger : C.accent}`, padding: '0 16px', fontSize: '14px', color: C.textDark, outline: 'none', transition: 'border-color 0.2s', background: C.white }}
                      onFocus={e => e.currentTarget.style.borderColor = C.accentDeep}
                      onBlur={e => e.currentTarget.style.borderColor = errors.email ? C.danger : C.accent}
                    />
                    {errors.email && <p style={{ color: C.danger, fontSize: '11px', margin: 0 }}>{errors.email}</p>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: C.textDark, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone style={{ width: 14, height: 14, color: C.accentDeep }} /> Teléfono <span style={{ color: C.danger }}>*</span>
                    </label>
                    <input
                      {...fieldProps('telefono')}
                      placeholder="3001234567" maxLength={15}
                      style={{ width: '100%', height: '44px', borderRadius: '8px', border: `1px solid ${errors.telefono ? C.danger : C.accent}`, padding: '0 16px', fontSize: '14px', color: C.textDark, outline: 'none', transition: 'border-color 0.2s', background: C.white }}
                      onFocus={e => e.currentTarget.style.borderColor = C.accentDeep}
                      onBlur={e => e.currentTarget.style.borderColor = errors.telefono ? C.danger : C.accent}
                    />
                    {errors.telefono && <p style={{ color: C.danger, fontSize: '11px', margin: 0 }}>{errors.telefono}</p>}
                  </div>
                </div>
              </div>

              {/* Residencia */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Residencia</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: C.textDark, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building2 style={{ width: 14, height: 14, color: C.accentDeep }} /> Ciudad
                    </label>
                    <input
                      {...fieldProps('ciudad')}
                      placeholder="Medellín" maxLength={50}
                      style={{ width: '100%', height: '44px', borderRadius: '8px', border: `1px solid ${errors.ciudad ? C.danger : C.accent}`, padding: '0 16px', fontSize: '14px', color: C.textDark, outline: 'none', transition: 'border-color 0.2s', background: C.white }}
                      onFocus={e => e.currentTarget.style.borderColor = C.accentDeep}
                      onBlur={e => e.currentTarget.style.borderColor = errors.ciudad ? C.danger : C.accent}
                    />
                    {errors.ciudad && <p style={{ color: C.danger, fontSize: '11px', margin: 0 }}>{errors.ciudad}</p>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: C.textDark, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin style={{ width: 14, height: 14, color: C.accentDeep }} /> Dirección
                    </label>
                    <input
                      {...fieldProps('direccion')}
                      placeholder="Cra 80 #25-35" maxLength={30}
                      style={{ width: '100%', height: '44px', borderRadius: '8px', border: `1px solid ${errors.direccion ? C.danger : C.accent}`, padding: '0 16px', fontSize: '14px', color: C.textDark, outline: 'none', transition: 'border-color 0.2s', background: C.white }}
                      onFocus={e => e.currentTarget.style.borderColor = C.accentDeep}
                      onBlur={e => e.currentTarget.style.borderColor = errors.direccion ? C.danger : C.accent}
                    />
                    {errors.direccion && <p style={{ color: C.danger, fontSize: '11px', margin: 0 }}>{errors.direccion}</p>}
                  </div>
                </div>
              </div>

              {/* Seguridad */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Seguridad</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: C.textDark, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lock style={{ width: 14, height: 14, color: C.accentDeep }} /> Contraseña <span style={{ color: C.danger }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={e => handleChange('password', e.target.value)}
                        placeholder="Mínimo 8 chars" maxLength={225}
                        style={{ width: '100%', height: '44px', borderRadius: '8px', border: `1px solid ${errors.password ? C.danger : C.accent}`, padding: '0 40px 0 16px', fontSize: '14px', color: C.textDark, outline: 'none', transition: 'border-color 0.2s', background: C.white, boxSizing: 'border-box' }}
                        onFocus={e => e.currentTarget.style.borderColor = C.accentDeep}
                        onBlur={e => e.currentTarget.style.borderColor = errors.password ? C.danger : C.accent}
                      />
                      <button type="button" onClick={() => setShowPassword(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer' }}>
                        {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                      </button>
                    </div>
                    {errors.password && <p style={{ color: C.danger, fontSize: '11px', margin: 0 }}>{errors.password}</p>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: C.textDark, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lock style={{ width: 14, height: 14, color: C.accentDeep }} /> Confirmar <span style={{ color: C.danger }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={e => handleChange('confirmPassword', e.target.value)}
                        placeholder="Repite contraseña" maxLength={225}
                        style={{ width: '100%', height: '44px', borderRadius: '8px', border: `1px solid ${errors.confirmPassword ? C.danger : C.accent}`, padding: '0 40px 0 16px', fontSize: '14px', color: C.textDark, outline: 'none', transition: 'border-color 0.2s', background: C.white, boxSizing: 'border-box' }}
                        onFocus={e => e.currentTarget.style.borderColor = C.accentDeep}
                        onBlur={e => e.currentTarget.style.borderColor = errors.confirmPassword ? C.danger : C.accent}
                      />
                      <button type="button" onClick={() => setShowConfirm(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer' }}>
                        {showConfirm ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p style={{ color: C.danger, fontSize: '11px', margin: 0 }}>{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%', height: '52px', borderRadius: '12px',
                  background: C.textDark, color: C.white, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px',
                  boxShadow: `0 8px 24px rgba(0,0,0,0.1)`, transition: 'all 0.2s',
                  marginTop: '16px', opacity: isLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  if(!isLoading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.15)`;
                    e.currentTarget.style.background = '#000000';
                  }
                }}
                onMouseLeave={(e) => {
                  if(!isLoading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.1)`;
                    e.currentTarget.style.background = C.textDark;
                  }
                }}
              >
                {isLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: C.white, borderRadius: '50%' }} className="animate-spin" />
                    Registrando...
                  </span>
                ) : 'Crear mi cuenta'}
              </button>

              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <span style={{ color: C.textMuted, fontSize: '14px', marginRight: '6px' }}>
                  ¿Ya tienes cuenta?
                </span>
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  style={{ background: 'none', border: 'none', color: C.textDark, cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = C.accentDeep}
                  onMouseLeave={(e) => e.currentTarget.style.color = C.textDark}
                >
                  Ingresar
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
