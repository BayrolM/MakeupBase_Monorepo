import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { UserRole } from '../../lib/store';
import { ThemeToggle } from '../ThemeToggle';
import { ChevronLeft } from 'lucide-react';

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

const DEPARTAMENTOS = [
  'Antioquia', 'Atlántico', 'Bogotá D.C.', 'Bolívar', 'Boyacá', 'Caldas', 
  'Cauca', 'Cundinamarca', 'Valle del Cauca', 'Santander'
];

export function RegisterPageColombia({ onRegister, onNavigateToLogin, onBack }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    tipoDocumento: 'CC',
    numeroDocumento: '',
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    fechaNacimiento: '',
    genero: 'Masculino',
    email: '',
    telefono: '',
    celular: '',
    departamento: 'Antioquia',
    ciudad: 'Medellín',
    direccion: '',
    barrio: '',
    codigoPostal: '',
    password: '',
    confirmPassword: '',
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

    if (!formData.numeroDocumento) {
      newErrors.numeroDocumento = 'El número de documento es obligatorio';
    } else if (!/^\d{8,10}$/.test(formData.numeroDocumento)) {
      newErrors.numeroDocumento = 'Documento debe tener entre 8 y 10 dígitos';
    }

    if (!formData.primerNombre) newErrors.primerNombre = 'El primer nombre es obligatorio';
    if (!formData.primerApellido) newErrors.primerApellido = 'El primer apellido es obligatorio';

    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
    } else {
      const edad = Math.floor((new Date().getTime() - new Date(formData.fechaNacimiento).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (edad < 18) newErrors.fechaNacimiento = 'Debes ser mayor de 18 años';
    }

    if (!formData.email) {
      newErrors.email = 'El email es obligatorio';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    if (!formData.celular) {
      newErrors.celular = 'El celular es obligatorio';
    } else if (!/^\d{10}$/.test(formData.celular)) {
      newErrors.celular = 'El celular debe tener 10 dígitos';
    }

    if (!formData.direccion) newErrors.direccion = 'La dirección es obligatoria';

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
    } else if (!/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      newErrors.password = 'Debe tener al menos una mayúscula y un número';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.aceptaTerminos) {
      newErrors.aceptaTerminos = 'Debes aceptar los términos';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const nombres = `${formData.primerNombre} ${formData.segundoNombre}`.trim();
    const apellidos = `${formData.primerApellido} ${formData.segundoApellido}`.trim();
    
    onRegister({
      nombre: nombres,
      apellido: apellidos,
      email: formData.email,
      telefono: formData.celular,
      password: formData.password,
      rol: 'cliente',
      tipoDocumento: formData.tipoDocumento,
      documento: formData.numeroDocumento,
      direccion: formData.direccion,
      ciudad: formData.ciudad,
    });
  };

  return (
    <div className="min-h-screen bg-background overflow-y-auto relative">
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

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
              <path d="M12 3L4 9V21H20V9L12 3Z" fill="currentColor" opacity="0.3"/>
              <path d="M12 3L4 9M12 3L20 9M12 3V21M4 9V21H20V9M4 9H20" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
        </div>
        
        <div className="text-center mb-6">
          <h1 className="text-foreground mb-1" style={{ fontSize: '28px', fontWeight: 600 }}>
            Crear Cuenta - Colombia
          </h1>
          <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
            Completa tus datos para registrarte
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* INFORMACIÓN PERSONAL */}
            <div>
              <h3 className="text-foreground mb-4" style={{ fontSize: '16px', fontWeight: 600 }}>
                Información Personal
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Tipo Documento <span className="text-danger">*</span></Label>
                  <Select value={formData.tipoDocumento} onValueChange={(value: string) => setFormData({ ...formData, tipoDocumento: value })}>
                    <SelectTrigger className="bg-input-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="CC" className="text-foreground">Cédula de Ciudadanía</SelectItem>
                      <SelectItem value="CE" className="text-foreground">Cédula de Extranjería</SelectItem>
                      <SelectItem value="PAS" className="text-foreground">Pasaporte</SelectItem>
                      <SelectItem value="TI" className="text-foreground">Tarjeta de Identidad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Número Documento <span className="text-danger">*</span></Label>
                  <Input
                    value={formData.numeroDocumento}
                    onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })}
                    className={`bg-input-background border-border text-foreground ${errors.numeroDocumento ? 'border-danger' : ''}`}
                    placeholder="123456789"
                  />
                  {errors.numeroDocumento && <p className="text-danger" style={{ fontSize: '12px' }}>{errors.numeroDocumento}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Primer Nombre <span className="text-danger">*</span></Label>
                  <Input
                    value={formData.primerNombre}
                    onChange={(e) => setFormData({ ...formData, primerNombre: e.target.value })}
                    className={`bg-input-background border-border text-foreground ${errors.primerNombre ? 'border-danger' : ''}`}
                    placeholder="Juan"
                  />
                  {errors.primerNombre && <p className="text-danger" style={{ fontSize: '12px' }}>{errors.primerNombre}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Segundo Nombre</Label>
                  <Input
                    value={formData.segundoNombre}
                    onChange={(e) => setFormData({ ...formData, segundoNombre: e.target.value })}
                    className="bg-input-background border-border text-foreground"
                    placeholder="Carlos"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Primer Apellido <span className="text-danger">*</span></Label>
                  <Input
                    value={formData.primerApellido}
                    onChange={(e) => setFormData({ ...formData, primerApellido: e.target.value })}
                    className={`bg-input-background border-border text-foreground ${errors.primerApellido ? 'border-danger' : ''}`}
                    placeholder="Pérez"
                  />
                  {errors.primerApellido && <p className="text-danger" style={{ fontSize: '12px' }}>{errors.primerApellido}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Segundo Apellido</Label>
                  <Input
                    value={formData.segundoApellido}
                    onChange={(e) => setFormData({ ...formData, segundoApellido: e.target.value })}
                    className="bg-input-background border-border text-foreground"
                    placeholder="López"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Fecha Nacimiento <span className="text-danger">*</span></Label>
                  <Input
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                    className={`bg-input-background border-border text-foreground ${errors.fechaNacimiento ? 'border-danger' : ''}`}
                  />
                  {errors.fechaNacimiento && <p className="text-danger" style={{ fontSize: '12px' }}>{errors.fechaNacimiento}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Género <span className="text-danger">*</span></Label>
                  <Select value={formData.genero} onValueChange={(value: string) => setFormData({ ...formData, genero: value })}>
                    <SelectTrigger className="bg-input-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="Masculino" className="text-foreground">Masculino</SelectItem>
                      <SelectItem value="Femenino" className="text-foreground">Femenino</SelectItem>
                      <SelectItem value="Otro" className="text-foreground">Otro</SelectItem>
                      <SelectItem value="Prefiero no decir" className="text-foreground">Prefiero no decir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* INFORMACIÓN DE CONTACTO */}
            <div>
              <h3 className="text-foreground mb-4" style={{ fontSize: '16px', fontWeight: 600 }}>
                Información de Contacto
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label className="text-foreground">Email <span className="text-danger">*</span></Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`bg-input-background border-border text-foreground ${errors.email ? 'border-danger' : ''}`}
                    placeholder="correo@ejemplo.com"
                  />
                  {errors.email && <p className="text-danger" style={{ fontSize: '12px' }}>{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Teléfono</Label>
                  <Input
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="bg-input-background border-border text-foreground"
                    placeholder="6041234567"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Celular <span className="text-danger">*</span></Label>
                  <Input
                    value={formData.celular}
                    onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                    className={`bg-input-background border-border text-foreground ${errors.celular ? 'border-danger' : ''}`}
                    placeholder="3001234567"
                  />
                  {errors.celular && <p className="text-danger" style={{ fontSize: '12px' }}>{errors.celular}</p>}
                </div>
              </div>
            </div>

            {/* INFORMACIÓN DE RESIDENCIA */}
            <div>
              <h3 className="text-foreground mb-4" style={{ fontSize: '16px', fontWeight: 600 }}>
                Información de Residencia
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Departamento <span className="text-danger">*</span></Label>
                  <Select value={formData.departamento} onValueChange={(value: string) => setFormData({ ...formData, departamento: value })}>
                    <SelectTrigger className="bg-input-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {DEPARTAMENTOS.map(dept => (
                        <SelectItem key={dept} value={dept} className="text-foreground">{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Ciudad <span className="text-danger">*</span></Label>
                  <Input
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    className="bg-input-background border-border text-foreground"
                    placeholder="Medellín"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label className="text-foreground">Dirección <span className="text-danger">*</span></Label>
                  <Input
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className={`bg-input-background border-border text-foreground ${errors.direccion ? 'border-danger' : ''}`}
                    placeholder="Cra 80 #25-35"
                  />
                  {errors.direccion && <p className="text-danger" style={{ fontSize: '12px' }}>{errors.direccion}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Barrio</Label>
                  <Input
                    value={formData.barrio}
                    onChange={(e) => setFormData({ ...formData, barrio: e.target.value })}
                    className="bg-input-background border-border text-foreground"
                    placeholder="El Poblado"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Código Postal</Label>
                  <Input
                    value={formData.codigoPostal}
                    onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                    className="bg-input-background border-border text-foreground"
                    placeholder="050022"
                  />
                </div>
              </div>
            </div>

            {/* SEGURIDAD */}
            <div>
              <h3 className="text-foreground mb-4" style={{ fontSize: '16px', fontWeight: 600 }}>
                Seguridad
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Contraseña <span className="text-danger">*</span></Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`bg-input-background border-border text-foreground ${errors.password ? 'border-danger' : ''}`}
                    placeholder="••••••••"
                  />
                  {errors.password && <p className="text-danger" style={{ fontSize: '12px' }}>{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Confirmar Contraseña <span className="text-danger">*</span></Label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={`bg-input-background border-border text-foreground ${errors.confirmPassword ? 'border-danger' : ''}`}
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && <p className="text-danger" style={{ fontSize: '12px' }}>{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* TÉRMINOS */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="terminos"
                checked={formData.aceptaTerminos}
                onCheckedChange={(checked: boolean) => setFormData({ ...formData, aceptaTerminos: checked })}
                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-1"
              />
              <label htmlFor="terminos" className="text-foreground cursor-pointer" style={{ fontSize: '13px' }}>
                Acepto los términos y condiciones y la política de privacidad
              </label>
            </div>
            {errors.aceptaTerminos && <p className="text-danger" style={{ fontSize: '12px' }}>{errors.aceptaTerminos}</p>}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11"
            >
              🎀 REGISTRARME
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