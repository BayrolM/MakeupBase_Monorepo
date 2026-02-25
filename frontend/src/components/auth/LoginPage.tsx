import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { ThemeToggle } from '../ThemeToggle';
import { ChevronLeft } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => boolean | void | Promise<boolean>;
  onNavigateToRegister: () => void;
  onNavigateToRecover: () => void;
  onBack?: () => void;
}

export function LoginPage({ onLogin, onNavigateToRegister, onNavigateToRecover, onBack }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* Theme Toggle */}
      <ThemeToggle />
      
      {/* Back to Home Button - Top Left Corner */}
      {onBack && (
        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-foreground-secondary hover:text-primary transition-colors group"
            style={{ fontSize: '14px', fontWeight: 500 }}
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Volver al inicio</span>
          </button>
        </div>
      )}

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
            GLAMOUR ML
          </h1>
          <p className="text-foreground-secondary" style={{ fontSize: '16px' }}>
            Bienvenida a tu plataforma de gestión
          </p>
        </div>

        {/* Demo Credentials Info */}
        <div className="bg-surface border border-border rounded-xl p-5 mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-primary">
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3 className="text-foreground" style={{ fontSize: '14px', fontWeight: 600 }}>
              Cuentas de Prueba
            </h3>
          </div>
          
          <div className="grid gap-3">
            {/* Admin Account */}
            <div className="bg-card border border-border rounded-lg p-3 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                  <span className="text-primary" style={{ fontSize: '11px', fontWeight: 600 }}>A</span>
                </div>
                <span className="text-foreground" style={{ fontSize: '13px', fontWeight: 600 }}>
                  Administrador
                </span>
              </div>
              <div className="space-y-1 pl-8">
                <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                  <span className="text-foreground-secondary/70">Email:</span>{' '}
                  <span className="text-primary font-mono">admin@glamour.com</span>
                </p>
                <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                  <span className="text-foreground-secondary/70">Pass:</span>{' '}
                  <span className="text-primary font-mono">admin123</span>
                </p>
              </div>
            </div>

            {/* Client Account */}
            <div className="bg-card border border-border rounded-lg p-3 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded bg-primary-light/30 flex items-center justify-center">
                  <span className="text-primary" style={{ fontSize: '11px', fontWeight: 600 }}>C</span>
                </div>
                <span className="text-foreground" style={{ fontSize: '13px', fontWeight: 600 }}>
                  Cliente
                </span>
              </div>
              <div className="space-y-1 pl-8">
                <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                  <span className="text-foreground-secondary/70">Email:</span>{' '}
                  <span className="text-primary font-mono">carlos.cliente@mail.com</span>
                </p>
                <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                  <span className="text-foreground-secondary/70">Pass:</span>{' '}
                  <span className="text-primary font-mono">cliente123</span>
                </p>
              </div>
            </div>
          </div>

          <p className="text-foreground-secondary text-center mt-3" style={{ fontSize: '11px' }}>
            La vista dependerá del rol con el que inicies sesión
          </p>
        </div>

        {/* Login Form */}
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
                className={`bg-input-background border-border text-foreground ${errors.email ? 'border-danger' : ''}`}
                placeholder="correo@ejemplo.com"
              />
              {errors.email && (
                <p className="text-danger" style={{ fontSize: '13px' }}>{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Contraseña <span className="text-danger">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`bg-input-background border-border text-foreground ${errors.password ? 'border-danger' : ''}`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-danger" style={{ fontSize: '13px' }}>{errors.password}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked: boolean) => setRememberMe(checked)}
                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label htmlFor="remember" className="text-foreground-secondary cursor-pointer" style={{ fontSize: '14px' }}>
                Recordar sesión
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11"
            >
              🎀 INGRESAR
            </Button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            <button
              onClick={onNavigateToRecover}
              className="text-primary hover:text-primary/80 transition-colors"
              style={{ fontSize: '14px' }}
            >
              ¿Olvidaste tu contraseña?
            </button>
            
            <div className="flex items-center justify-center gap-2">
              <span className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                ¿No tienes cuenta?
              </span>
              <button
                onClick={onNavigateToRegister}
                className="text-primary hover:text-primary/80 transition-colors"
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                Regístrate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}