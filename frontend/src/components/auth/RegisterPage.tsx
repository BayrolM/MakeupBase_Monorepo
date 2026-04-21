import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { UserRole } from '../../lib/store';

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
    email: string;
    telefono: string;
    password: string;
    rol: UserRole;
  }) => void;
  onNavigateToLogin: () => void;
  onBack?: () => void;
}

export function RegisterPage({ onRegister, onNavigateToLogin, onBack }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    rol: 'cliente' as UserRole,
    aceptaTerminos: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    } else if (!/^\d{10}$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe tener 10 dígitos';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      newErrors.password = 'La contraseña debe tener al menos una mayúscula y un número';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.aceptaTerminos) {
      newErrors.aceptaTerminos = 'Debes aceptar los términos y condiciones';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onRegister({
      nombre: formData.nombre,
      email: formData.email,
      telefono: formData.telefono,
      password: formData.password,
      rol: formData.rol,
    });
  };

  // Luxury Input Field Minimalist
  const InputField = ({ label, id, value, onChange, error, type = "text", placeholder = "" }: any) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label htmlFor={id} style={{ fontSize: '13px', fontWeight: 600, color: C.textDark, opacity: 0.8 }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%', height: '48px', borderRadius: '8px',
          border: `1px solid ${error ? C.danger : C.accent}`,
          padding: '0 16px', outline: 'none', fontSize: '14px',
          color: C.textDark, background: 'rgba(255,255,255,0.8)', boxSizing: 'border-box',
          transition: 'all 0.3s ease',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = C.accentDeep;
          e.currentTarget.style.background = C.white;
          e.currentTarget.style.boxShadow = `0 4px 12px rgba(176,96,128,0.08)`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? C.danger : C.accent;
          e.currentTarget.style.background = 'rgba(255,255,255,0.8)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      {error && <p style={{ color: C.danger, fontSize: '12px', margin: 0, marginTop: '2px' }}>{error}</p>}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bgSoft, display: 'flex', alignItems: 'center', justifyItems: 'center', padding: '16px', position: 'relative', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden' }}>
      
      {/* Soft Background Blur Elements */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '400px', height: '400px', background: C.accent, borderRadius: '50%', filter: 'blur(100px)', opacity: 0.4, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '400px', height: '400px', background: C.accentDeep, borderRadius: '50%', filter: 'blur(120px)', opacity: 0.15, pointerEvents: 'none' }} />

      {/* Theme Toggle */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10 }}>

      </div>
      
      {/* Back to Home Button */}
      {onBack && (
        <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10 }}>
          <button
            onClick={onBack}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              color: C.textMuted, background: 'none', border: 'none', 
              cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              transition: 'color 0.2s', padding: '8px 12px', borderRadius: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = C.textDark;
              e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = C.textMuted;
              e.currentTarget.style.background = 'none';
            }}
          >
            <ChevronLeft style={{ width: 16, height: 16 }} />
            <span>Volver al inicio</span>
          </button>
        </div>
      )}

      {/* Main Content Container */}
      <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', md: {flexDirection: 'row'}, margin: '0 auto', gap: '40px', alignItems: 'center', zIndex: 2 }} className="md:flex-row">
        
        {/* Left Side: Branding & Info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', boxShadow: `0 8px 24px rgba(0,0,0,0.1)` }}>
              <img src="/logo.png" alt="Glamour ML Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 600, color: C.textDark, margin: 0, lineHeight: 1.1 }}>
                GLAMOUR ML
              </h1>
              <p style={{ color: C.textMuted, fontSize: '14px', margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>
                Nueva Cuenta
              </p>
            </div>
          </div>

          <p style={{ color: C.textDark, fontSize: '16px', lineHeight: 1.6, marginBottom: '40px', maxWidth: '360px', opacity: 0.8 }}>
            Únete a nuestra comunidad para descubrir lo mejor en maquillaje y cuidado personal, con acceso a beneficios exclusivos.
          </p>

          <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.8)' }}>
            <p style={{ fontSize: '14px', color: C.textDark, fontWeight: 500, lineHeight: 1.5, margin: 0 }}>
              "Creemos que el maquillaje no es solo un producto, sino una herramienta para resaltar tu luz propia y empoderar tu día a día."
            </p>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div style={{ flex: 1, width: '100%', maxWidth: '460px' }}>
          <div style={{ background: C.white, borderRadius: '24px', padding: '40px', border: `1px solid ${C.accentDeep}`, boxShadow: `0 20px 60px rgba(0,0,0,0.04)` }}>
            
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: C.textDark, marginBottom: '8px', fontFamily: "'Cormorant Garamond', serif" }}>Regístrate</h2>
            <p style={{ fontSize: '14px', color: C.textMuted, marginBottom: '24px' }}>Completa tus datos para empezar.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <InputField 
                label="Nombre completo" id="nombre" value={formData.nombre} 
                onChange={(e: any) => setFormData({ ...formData, nombre: e.target.value })} 
                error={errors.nombre} placeholder="Ej. María Pérez"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <InputField 
                  label="Correo electrónico" id="email" type="email" value={formData.email} 
                  onChange={(e: any) => setFormData({ ...formData, email: e.target.value })} 
                  error={errors.email} placeholder="correo@ejemplo.com"
                />
                <InputField 
                  label="Teléfono" id="telefono" value={formData.telefono} 
                  onChange={(e: any) => setFormData({ ...formData, telefono: e.target.value })} 
                  error={errors.telefono} placeholder="3001234567"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <InputField 
                  label="Contraseña" id="password" type="password" value={formData.password} 
                  onChange={(e: any) => setFormData({ ...formData, password: e.target.value })} 
                  error={errors.password} placeholder="••••••••"
                />
                <InputField 
                  label="Confirmar" id="confirmPassword" type="password" value={formData.confirmPassword} 
                  onChange={(e: any) => setFormData({ ...formData, confirmPassword: e.target.value })} 
                  error={errors.confirmPassword} placeholder="••••••••"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="rol" style={{ fontSize: '13px', fontWeight: 600, color: C.textDark, opacity: 0.8 }}>
                  Tipo de cuenta
                </label>
                <select
                  id="rol"
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value as UserRole })}
                  style={{
                    width: '100%', height: '48px', borderRadius: '8px',
                    border: `1px solid ${C.accent}`,
                    padding: '0 16px', outline: 'none', fontSize: '14px',
                    color: C.textDark, background: 'rgba(255,255,255,0.8)', boxSizing: 'border-box',
                    transition: 'all 0.3s ease', cursor: 'pointer', appearance: 'none'
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = C.accentDeep; e.currentTarget.style.background = C.white; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.background = 'rgba(255,255,255,0.8)'; }}
                >
                  <option value="cliente">Cliente</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="bodeguero">Bodeguero</option>
                  <option value="admin">Administrador</option>
                </select>
                {/* Custom arrow for select */}
                <div style={{ position: 'absolute', right: '64px', marginTop: '36px', pointerEvents: 'none' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="terminos"
                  checked={formData.aceptaTerminos}
                  onChange={(e) => setFormData({ ...formData, aceptaTerminos: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: C.textDark, cursor: 'pointer', border: '1px solid rgba(0,0,0,0.1)' }}
                />
                <label htmlFor="terminos" style={{ color: C.textDark, cursor: 'pointer', fontSize: '13px', fontWeight: 500, opacity: 0.8 }}>
                  Acepto los términos y condiciones
                </label>
              </div>
              {errors.aceptaTerminos && <p style={{ color: C.danger, fontSize: '12px', margin: '-8px 0 0 0' }}>{errors.aceptaTerminos}</p>}

              <button
                type="submit"
                style={{
                  width: '100%', height: '52px', borderRadius: '12px',
                  background: C.textDark, color: C.white, border: 'none', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px',
                  boxShadow: `0 8px 24px rgba(0,0,0,0.1)`, transition: 'all 0.2s',
                  marginTop: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.15)`;
                  e.currentTarget.style.background = '#000000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.1)`;
                  e.currentTarget.style.background = C.textDark;
                }}
              >
                REGISTRARSE
              </button>
            </form>

            <div style={{ marginTop: '24px', textAlign: 'center', paddingTop: '24px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <span style={{ color: C.textMuted, fontSize: '14px', marginRight: '6px' }}>
                ¿Ya tienes cuenta?
              </span>
              <button
                onClick={onNavigateToLogin}
                style={{ background: 'none', border: 'none', color: C.textDark, cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = C.accentDeep}
                onMouseLeave={(e) => e.currentTarget.style.color = C.textDark}
              >
                Ingresar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
