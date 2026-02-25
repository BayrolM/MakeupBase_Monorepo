import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { UserRole } from '../../lib/store';

interface RegisterPageProps {
  onRegister: (data: {
    nombre: string;
    email: string;
    telefono: string;
    password: string;
    rol: UserRole;
  }) => void;
  onNavigateToLogin: () => void;
}

export function RegisterPage({ onRegister, onNavigateToLogin }: RegisterPageProps) {
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
          <h1 className="text-foreground mb-2" style={{ fontSize: '32px', fontWeight: 600 }}>
            GLAMOUR ML
          </h1>
          <p className="text-foreground-secondary" style={{ fontSize: '16px' }}>
            Crea tu cuenta
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-card border border-border rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-foreground">
                Nombre <span className="text-danger">*</span>
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className={`bg-input-background border-border text-foreground ${errors.nombre ? 'border-danger' : ''}`}
                placeholder="Nombre completo"
              />
              {errors.nombre && (
                <p className="text-danger" style={{ fontSize: '13px' }}>{errors.nombre}</p>
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
                className={`bg-input-background border-border text-foreground ${errors.telefono ? 'border-danger' : ''}`}
                placeholder="3001234567"
              />
              {errors.telefono && (
                <p className="text-danger" style={{ fontSize: '13px' }}>{errors.telefono}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Contraseña <span className="text-danger">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`bg-input-background border-border text-foreground ${errors.password ? 'border-danger' : ''}`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-danger" style={{ fontSize: '13px' }}>{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">
                Confirmar Contraseña <span className="text-danger">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`bg-input-background border-border text-foreground ${errors.confirmPassword ? 'border-danger' : ''}`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="text-danger" style={{ fontSize: '13px' }}>{errors.confirmPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rol" className="text-foreground">
                Rol <span className="text-danger">*</span>
              </Label>
              <Select value={formData.rol} onValueChange={(value: UserRole) => setFormData({ ...formData, rol: value })}>
                <SelectTrigger className="bg-input-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="cliente" className="text-foreground">Cliente</SelectItem>
                  <SelectItem value="vendedor" className="text-foreground">Vendedor</SelectItem>
                  <SelectItem value="bodeguero" className="text-foreground">Bodeguero</SelectItem>
                  <SelectItem value="admin" className="text-foreground">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11"
            >
              🎀 REGISTRARSE
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                ¿Ya tienes cuenta?
              </span>
              <button
                onClick={onNavigateToLogin}
                className="text-primary hover:text-primary/80 transition-colors"
                style={{ fontSize: '14px', fontWeight: 500 }}
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
