import { useState } from 'react';
import { ChevronLeft, Info, Key, User, Eye, EyeOff } from 'lucide-react';

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

interface LoginPageProps {
  onLogin: (email: string, password: string) => boolean | void | Promise<boolean>;
  onNavigateToRegister: () => void;
  onNavigateToRecover: () => void;
  onBack?: () => void;
}

// Luxury Input Field Minimalist
const InputField = ({ label, id, value, onChange, error, type = "text", placeholder = "", toggleVisibility, isVisible }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label htmlFor={id} style={{ fontSize: '13px', fontWeight: 600, color: C.textDark, opacity: 0.8 }}>
      {label}
    </label>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%', height: '48px', borderRadius: '8px',
          border: `1px solid ${error ? C.danger : C.accent}`,
          padding: toggleVisibility ? '0 40px 0 16px' : '0 16px', outline: 'none', fontSize: '14px',
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
      {toggleVisibility && (
        <button
          type="button"
          onClick={toggleVisibility}
          style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
    {error && <p style={{ color: C.danger, fontSize: '12px', margin: 0, marginTop: '2px' }}>{error}</p>}
  </div>
);

export function LoginPage({ onLogin, onNavigateToRegister, onNavigateToRecover, onBack }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'El email es obligatorio';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Formato de email inválido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onLogin(email, password);
  };

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
      <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', margin: '0 auto', gap: '40px', alignItems: 'center', zIndex: 2 }} className="md:flex-row">
        
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
                Acceso Exclusivo
              </p>
            </div>
          </div>

          <p style={{ color: C.textDark, fontSize: '16px', lineHeight: 1.6, marginBottom: '40px', maxWidth: '360px', opacity: 0.8 }}>
            Ingresa a tu cuenta para gestionar tus pedidos, guardar tus productos favoritos y disfrutar de una experiencia personalizada.
          </p>

          {/* Elegant Demo Credentials Box */}
          <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Info style={{ width: 16, height: 16, color: C.accentDeep }} />
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: C.textDark, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                Cuentas de Prueba
              </h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Admin Account Button */}
              <div 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: C.white, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid transparent', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
                onClick={() => { setEmail('admin@glamour.com'); setPassword('admin123'); }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateX(0)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: C.bgSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Key style={{ width: 14, height: 14, color: C.textDark }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: C.textDark, margin: 0 }}>Administrador</p>
                    <p style={{ fontSize: '11px', color: C.textMuted, margin: 0 }}>admin@glamour.com</p>
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: C.accentDeep, fontWeight: 600 }}>Usar</span>
              </div>

              {/* Client Account Button */}
              <div 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: C.white, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid transparent', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
                onClick={() => { setEmail('carlos.cliente@mail.com'); setPassword('cliente123'); }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateX(0)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: C.bgSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User style={{ width: 14, height: 14, color: C.textDark }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: C.textDark, margin: 0 }}>Cliente</p>
                    <p style={{ fontSize: '11px', color: C.textMuted, margin: 0 }}>carlos.cliente@mail.com</p>
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: C.accentDeep, fontWeight: 600 }}>Usar</span>
              </div>

            </div>
          </div>
        </div>

        {/* Right Side: Minimalist Login Form */}
        <div style={{ flex: 1, width: '100%', maxWidth: '420px' }}>
          <div style={{ background: C.white, borderRadius: '24px', padding: '48px', border: `1px solid ${C.accentDeep}`, boxShadow: `0 20px 60px rgba(0,0,0,0.04)` }}>
            
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: C.textDark, marginBottom: '8px', fontFamily: "'Cormorant Garamond', serif" }}>Iniciar Sesión</h2>
            <p style={{ fontSize: '14px', color: C.textMuted, marginBottom: '32px' }}>Qué gusto verte de nuevo.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <InputField 
                label="Correo electrónico" id="email" type="email" value={email} 
                onChange={(e: any) => setEmail(e.target.value)} 
                error={errors.email} placeholder="correo@ejemplo.com"
              />

              <div style={{ position: 'relative' }}>
                <InputField 
                  label="Contraseña" id="password" type={showPassword ? "text" : "password"} value={password} 
                  onChange={(e: any) => setPassword(e.target.value)} 
                  error={errors.password} placeholder="••••••••"
                  toggleVisibility={() => setShowPassword(!showPassword)}
                  isVisible={showPassword}
                />
                <button
                  type="button"
                  onClick={onNavigateToRecover}
                  style={{ position: 'absolute', right: '0', top: '0', background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: '12px', fontWeight: 500, transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = C.accentDeep}
                  onMouseLeave={(e) => e.currentTarget.style.color = C.textMuted}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '-8px' }}>
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: C.textDark, cursor: 'pointer', border: '1px solid rgba(0,0,0,0.1)' }}
                />
                <label htmlFor="remember" style={{ color: C.textDark, cursor: 'pointer', fontSize: '13px', fontWeight: 500, opacity: 0.8 }}>
                  Mantener sesión iniciada
                </label>
              </div>

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
                INGRESAR
              </button>
            </form>

            <div style={{ marginTop: '32px', textAlign: 'center', paddingTop: '24px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <span style={{ color: C.textMuted, fontSize: '14px', marginRight: '6px' }}>
                ¿Aún no tienes cuenta?
              </span>
              <button
                onClick={onNavigateToRegister}
                style={{ background: 'none', border: 'none', color: C.textDark, cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = C.accentDeep}
                onMouseLeave={(e) => e.currentTarget.style.color = C.textDark}
              >
                Regístrate ahora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}