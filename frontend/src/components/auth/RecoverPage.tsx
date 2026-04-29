import { useState, useEffect } from 'react';
import { CheckCircle, Loader2, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/authService';

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

interface RecoverPageProps {
  initialToken?: string;
  onRecover?: (email: string) => void;
  onNavigateToLogin: () => void;
  onBack?: () => void;
}

type FlowState = 'email' | 'verifying' | 'success' | 'reset' | 'complete';

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

export function RecoverPage({ initialToken, onRecover, onNavigateToLogin, onBack }: RecoverPageProps) {
  const [flowState, setFlowState] = useState<FlowState>('email');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [token, setToken] = useState(initialToken);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (initialToken) {
      setFlowState('reset');
    }
  }, [initialToken]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, ingresa un correo válido.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Por favor, ingresa un correo válido.');
      return;
    }
    setError('');
    setFlowState('verifying');
    try {
      await authService.forgotPassword(email);
      setFlowState('success');
    } catch (err: any) {
      setError(err.message || 'Error al solicitar recuperación');
      setFlowState('email');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setPasswordError('Ambos campos son obligatorios.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setPasswordError('La contraseña debe tener al menos una mayúscula, un número y un carácter especial.');
      return;
    }
    setPasswordError('');
    setFlowState('verifying'); // use verifying state as loading
    try {
      await authService.resetPassword(token!, newPassword);
      if (onRecover) onRecover(email);
      setFlowState('complete');
    } catch (err: any) {
      setPasswordError(err.message || 'Error al restablecer la contraseña');
      setFlowState('reset');
    }
  };

  const handleFinalRedirect = () => {
    onNavigateToLogin();
  };

  const renderBackground = () => (
    <>
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '400px', height: '400px', background: C.accent, borderRadius: '50%', filter: 'blur(100px)', opacity: 0.4, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '400px', height: '400px', background: C.accentDeep, borderRadius: '50%', filter: 'blur(120px)', opacity: 0.15, pointerEvents: 'none' }} />
    </>
  );

  const renderBackButton = () => onBack && (
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
  );

  const renderLogoSection = (title: string, subtitle: string) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', boxShadow: `0 8px 24px rgba(0,0,0,0.1)` }}>
          <img src="/logo.png" alt="Glamour ML Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 600, color: C.textDark, margin: 0, lineHeight: 1.1 }}>
            GLAMOUR ML
          </h1>
          <p style={{ color: C.textMuted, fontSize: '14px', margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>
            {title}
          </p>
        </div>
      </div>
      <p style={{ color: C.textDark, fontSize: '16px', lineHeight: 1.6, marginBottom: '40px', maxWidth: '360px', opacity: 0.8 }}>
        {subtitle}
      </p>
    </div>
  );

  const buttonStyle = {
    width: '100%', height: '52px', borderRadius: '12px',
    background: C.textDark, color: C.white, border: 'none', cursor: 'pointer',
    fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px',
    boxShadow: `0 8px 24px rgba(0,0,0,0.1)`, transition: 'all 0.2s',
    marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
  };

  const renderFormContainer = (children: React.ReactNode) => (
    <div style={{ flex: 1, width: '100%', maxWidth: '420px' }}>
      <div style={{ background: C.white, borderRadius: '24px', padding: '48px', border: `1px solid ${C.accentDeep}`, boxShadow: `0 20px 60px rgba(0,0,0,0.04)` }}>
        {children}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bgSoft, display: 'flex', alignItems: 'center', justifyItems: 'center', padding: '16px', position: 'relative', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden' }}>
      {renderBackground()}
      {renderBackButton()}
      
      <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', margin: '0 auto', gap: '40px', alignItems: 'center', zIndex: 2 }} className="md:flex-row">
        
        {flowState === 'email' && (
          <>
            {renderLogoSection('Recuperación', 'Ingresa tu correo electrónico asociado para recibir instrucciones de recuperación.')}
            {renderFormContainer(
              <>
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: C.textDark, marginBottom: '8px', fontFamily: "'Cormorant Garamond', serif" }}>Recuperar Contraseña</h2>
                <p style={{ fontSize: '14px', color: C.textMuted, marginBottom: '32px' }}>Ingresa tu email para recibir instrucciones.</p>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <InputField 
                    label="Correo electrónico" id="email" type="email" value={email} 
                    onChange={(e: any) => setEmail(e.target.value)} 
                    error={error} placeholder="correo@ejemplo.com"
                  />
                  <button
                    type="submit"
                    style={buttonStyle}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.15)`; e.currentTarget.style.background = '#000000'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.1)`; e.currentTarget.style.background = C.textDark; }}
                  >
                    ENVIAR INSTRUCCIONES
                  </button>
                </form>
                <div style={{ marginTop: '32px', textAlign: 'center', paddingTop: '24px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  <button onClick={onNavigateToLogin} style={{ background: 'none', border: 'none', color: C.textDark, cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }}>
                    Volver al login
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {flowState === 'verifying' && (
          <>
            {renderLogoSection('Procesando', 'Por favor espera un momento mientras procesamos tu solicitud.')}
            {renderFormContainer(
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(176,96,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <Loader2 style={{ width: 32, height: 32, color: C.accentDeep }} className="animate-spin" />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: C.textDark, marginBottom: '16px', fontFamily: "'Cormorant Garamond', serif" }}>Verificando...</h2>
                <p style={{ fontSize: '14px', color: C.textMuted, lineHeight: 1.6 }}>Estamos validando tu información. Por favor espera un momento.</p>
              </div>
            )}
          </>
        )}

        {flowState === 'success' && (
          <>
            {renderLogoSection('Correo Enviado', 'Revisa tu bandeja de entrada o spam para continuar.')}
            {renderFormContainer(
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <CheckCircle style={{ width: 32, height: 32, color: C.success }} />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: C.textDark, marginBottom: '16px', fontFamily: "'Cormorant Garamond', serif" }}>Enlace Enviado</h2>
                <p style={{ fontSize: '14px', color: C.textMuted, lineHeight: 1.6, marginBottom: '32px' }}>
                  Se ha enviado un enlace a <strong style={{ color: C.textDark }}>{email}</strong>. Por favor, revisa tu correo.
                </p>
                <button onClick={onNavigateToLogin} style={{ background: 'none', border: 'none', color: C.textDark, cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }}>
                  Volver al login
                </button>
              </div>
            )}
          </>
        )}

        {flowState === 'reset' && (
          <>
            {renderLogoSection('Restablecer', 'Crea una nueva contraseña segura para tu cuenta.')}
            {renderFormContainer(
              <>
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: C.textDark, marginBottom: '8px', fontFamily: "'Cormorant Garamond', serif" }}>Nueva Contraseña</h2>
                <p style={{ fontSize: '14px', color: C.textMuted, marginBottom: '32px' }}>Ingresa tu nueva contraseña.</p>
                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <InputField 
                    label="Nueva contraseña" id="newPassword" type={showPassword ? "text" : "password"} value={newPassword} 
                    onChange={(e: any) => { setNewPassword(e.target.value); setPasswordError(''); }} 
                    placeholder="••••••••" toggleVisibility={() => setShowPassword(!showPassword)} isVisible={showPassword}
                  />
                  <InputField 
                    label="Confirmar contraseña" id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} 
                    onChange={(e: any) => { setConfirmPassword(e.target.value); setPasswordError(''); }} 
                    error={passwordError} placeholder="••••••••" toggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)} isVisible={showConfirmPassword}
                  />
                  <button
                    type="submit"
                    style={buttonStyle}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.15)`; e.currentTarget.style.background = '#000000'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.1)`; e.currentTarget.style.background = C.textDark; }}
                  >
                    GUARDAR CONTRASEÑA
                  </button>
                </form>
                <div style={{ marginTop: '32px', textAlign: 'center', paddingTop: '24px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  <button onClick={onNavigateToLogin} style={{ background: 'none', border: 'none', color: C.textDark, cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }}>
                    Volver al login
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {flowState === 'complete' && (
          <>
            {renderLogoSection('¡Listo!', 'Tu contraseña ha sido actualizada correctamente.')}
            {renderFormContainer(
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <CheckCircle style={{ width: 32, height: 32, color: C.success }} />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: C.textDark, marginBottom: '16px', fontFamily: "'Cormorant Garamond', serif" }}>¡Contraseña Restablecida!</h2>
                <p style={{ fontSize: '14px', color: C.textMuted, lineHeight: 1.6, marginBottom: '32px' }}>
                  Contraseña restablecida con éxito. Ahora puedes iniciar sesión con tu nueva contraseña.
                </p>
                <button
                  onClick={handleFinalRedirect}
                  style={buttonStyle}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.15)`; e.currentTarget.style.background = '#000000'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.1)`; e.currentTarget.style.background = C.textDark; }}
                >
                  Ir al Login
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}