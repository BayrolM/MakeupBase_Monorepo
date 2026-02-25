import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { CheckCircle, Loader2, KeyRound } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';

interface RecoverPageProps {
  onRecover: (email: string) => void;
  onNavigateToLogin: () => void;
  onBack?: () => void;
}

type FlowState = 'email' | 'verifying' | 'success' | 'reset' | 'complete';

export function RecoverPage({ onRecover, onNavigateToLogin, onBack }: RecoverPageProps) {
  const [flowState, setFlowState] = useState<FlowState>('email');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
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
  };

  // Simular verificación del correo
  useEffect(() => {
    if (flowState === 'verifying') {
      const timer = setTimeout(() => {
        setFlowState('success');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [flowState]);

  const handleContinueToReset = () => {
    setFlowState('reset');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setPasswordError('Ambos campos son obligatorios.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setPasswordError('');
    onRecover(email);
    setFlowState('complete');
  };

  const handleFinalRedirect = () => {
    onNavigateToLogin();
  };

  // Estado de verificación
  if (flowState === 'verifying') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
                <path d="M12 3L4 9V21H20V9L12 3Z" fill="currentColor" opacity="0.3"/>
                <path d="M12 3L4 9M12 3L20 9M12 3V21M4 9V21H20V9M4 9H20" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            
            <h2 className="text-foreground mb-3" style={{ fontSize: '24px', fontWeight: 600 }}>
              Verificando correo...
            </h2>
            
            <p className="text-foreground-secondary" style={{ fontSize: '14px', lineHeight: 1.6 }}>
              Estamos validando tu información. Por favor espera un momento.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Estado de éxito - correo enviado
  if (flowState === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
                <path d="M12 3L4 9V21H20V9L12 3Z" fill="currentColor" opacity="0.3"/>
                <path d="M12 3L4 9M12 3L20 9M12 3V21M4 9V21H20V9M4 9H20" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            
            <h2 className="text-foreground mb-3" style={{ fontSize: '24px', fontWeight: 600 }}>
              Enlace Enviado
            </h2>
            
            <p className="text-foreground-secondary mb-6" style={{ fontSize: '14px', lineHeight: 1.6 }}>
              Se ha enviado un enlace de recuperación a tu correo electrónico <strong className="text-foreground">{email}</strong>.
            </p>

            <Button
              onClick={handleContinueToReset}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 mb-3"
            >
              Continuar a restablecer contraseña
            </Button>

            <button
              onClick={onNavigateToLogin}
              className="text-foreground-secondary hover:text-foreground transition-colors"
              style={{ fontSize: '14px' }}
            >
              Volver al login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Estado de restablecimiento de contraseña
  if (flowState === 'reset') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
                <path d="M12 3L4 9V21H20V9L12 3Z" fill="currentColor" opacity="0.3"/>
                <path d="M12 3L4 9M12 3L20 9M12 3V21M4 9V21H20V9M4 9H20" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
          </div>
          
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-foreground mb-2" style={{ fontSize: '32px', fontWeight: 600 }}>
              Restablecer Contraseña
            </h1>
            <p className="text-foreground-secondary" style={{ fontSize: '16px' }}>
              Ingresa tu nueva contraseña
            </p>
          </div>

          {/* Reset Password Form */}
          <div className="bg-card border border-border rounded-lg p-8">
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-foreground">
                  Nueva contraseña <span className="text-danger">*</span>
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError('');
                  }}
                  className={`bg-input-background border-border text-foreground ${passwordError ? 'border-danger' : ''}`}
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">
                  Confirmar nueva contraseña <span className="text-danger">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError('');
                  }}
                  className={`bg-input-background border-border text-foreground ${passwordError ? 'border-danger' : ''}`}
                  placeholder="••••••••"
                />
                {passwordError && (
                  <p className="text-danger" style={{ fontSize: '13px' }}>{passwordError}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11"
              >
                🎀 GUARDAR CONTRASEÑA
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={onNavigateToLogin}
                className="text-primary hover:text-primary/80 transition-colors"
                style={{ fontSize: '14px' }}
              >
                Volver al login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado final - contraseña restablecida
  if (flowState === 'complete') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
                <path d="M12 3L4 9V21H20V9L12 3Z" fill="currentColor" opacity="0.3"/>
                <path d="M12 3L4 9M12 3L20 9M12 3V21M4 9V21H20V9M4 9H20" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            
            <h2 className="text-foreground mb-3" style={{ fontSize: '24px', fontWeight: 600 }}>
              ¡Contraseña Restablecida!
            </h2>
            
            <p className="text-foreground-secondary mb-6" style={{ fontSize: '14px', lineHeight: 1.6 }}>
              Contraseña restablecida con éxito. Ahora puedes iniciar sesión con tu nueva contraseña.
            </p>

            <Button
              onClick={handleFinalRedirect}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11"
            >
              Ir al Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* Theme Toggle */}
      <ThemeToggle />
      
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
              <path d="M12 3L4 9V21H20V9L12 3Z" fill="currentColor" opacity="0.3"/>
              <path d="M12 3L4 9M12 3L20 9M12 3V21M4 9V21H20V9M4 9H20" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-foreground mb-2" style={{ fontSize: '32px', fontWeight: 600 }}>
            Recuperar Contraseña
          </h1>
          <p className="text-foreground-secondary" style={{ fontSize: '16px' }}>
            Ingresa tu email para recibir instrucciones
          </p>
        </div>

        {/* Recover Form */}
        <div className="bg-card border border-border rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email <span className="text-danger">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`bg-input-background border-border text-foreground ${error ? 'border-danger' : ''}`}
                placeholder="correo@ejemplo.com"
              />
              {error && (
                <p className="text-danger" style={{ fontSize: '13px' }}>{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11"
            >
              🎀 ENVIAR INSTRUCCIONES
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onNavigateToLogin}
              className="text-primary hover:text-primary/80 transition-colors"
              style={{ fontSize: '14px' }}
            >
              Volver al login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}