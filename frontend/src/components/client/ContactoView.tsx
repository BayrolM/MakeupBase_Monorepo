import { useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Send } from 'lucide-react';
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
  shadowSm: V('shadow-sm'),
  shadow: V('shadow'),
  white: '#ffffff',
};

export function ContactoView({ onNavigate }: { onNavigate?: (route: string) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('¡Mensaje enviado!', {
        description: 'Nos pondremos en contacto contigo lo más pronto posible.',
      });
      setIsSubmitting(false);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bgSoft, fontFamily: "'DM Sans', sans-serif" }}>
      
      {/* ── HERO HEADER ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${C.textDark} 0%, ${C.accentDeep} 100%)`,
          padding: '80px 0',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '40px'
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px', position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <h1 style={{ 
            fontFamily: "'Cormorant Garamond', serif", 
            fontSize: '56px', 
            fontWeight: 600, 
            color: C.white, 
            margin: '0 0 16px 0',
            lineHeight: 1.1
          }}>
            Ponte en Contacto
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            ¿Tienes alguna duda, sugerencia o quieres asesoría personalizada? Escríbenos y con gusto te atenderemos.
          </p>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 32px 80px 32px' }}>
        
        {/* Back Button */}
        {onNavigate && (
          <button
            onClick={() => onNavigate("inicio")}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: C.accentDeep, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, marginBottom: '32px' }}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} />
            Volver al inicio
          </button>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', md: { gridTemplateColumns: '1fr 1fr' }, gap: '40px' }} className="md:grid-cols-2">
          
          {/* Formulario */}
          <div style={{ background: C.white, borderRadius: '24px', padding: '40px', border: `1px solid ${C.accent}`, boxShadow: `0 8px 30px ${C.shadowSm}` }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 600, color: C.textDark, marginBottom: '24px' }}>
              Envíanos un mensaje
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: C.textMuted, marginBottom: '8px' }}>Nombre completo</label>
                <input 
                  required
                  type="text" 
                  placeholder="Ej. María Pérez"
                  style={{ width: '100%', height: '44px', borderRadius: '12px', border: `1px solid ${C.accentDark}`, padding: '0 16px', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: C.textMuted, marginBottom: '8px' }}>Correo electrónico</label>
                <input 
                  required
                  type="email" 
                  placeholder="maria@ejemplo.com"
                  style={{ width: '100%', height: '44px', borderRadius: '12px', border: `1px solid ${C.accentDark}`, padding: '0 16px', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: C.textMuted, marginBottom: '8px' }}>Asunto</label>
                <input 
                  required
                  type="text" 
                  placeholder="¿En qué te podemos ayudar?"
                  style={{ width: '100%', height: '44px', borderRadius: '12px', border: `1px solid ${C.accentDark}`, padding: '0 16px', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: C.textMuted, marginBottom: '8px' }}>Mensaje</label>
                <textarea 
                  required
                  placeholder="Escribe tu mensaje aquí..."
                  style={{ width: '100%', minHeight: '120px', borderRadius: '12px', border: `1px solid ${C.accentDark}`, padding: '16px', outline: 'none', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  background: isSubmitting ? '#e5e7eb' : `linear-gradient(135deg, ${C.textDark} 0%, ${C.accentDeep} 100%)`,
                  color: isSubmitting ? '#9ca3af' : C.white,
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: isSubmitting ? 'none' : `0 8px 20px ${C.shadowSm}`,
                  marginTop: '8px'
                }}
              >
                {isSubmitting ? 'Enviando...' : <><Send style={{ width: 18, height: 18 }} /> Enviar Mensaje</>}
              </button>
            </form>
          </div>

          {/* Info de contacto */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: C.white, borderRadius: '24px', padding: '40px', border: `1px solid ${C.accent}`, boxShadow: `0 8px 30px ${C.shadowSm}`, height: '100%' }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 600, color: C.textDark, marginBottom: '32px' }}>
                Información Directa
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: C.bgSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin style={{ width: 22, height: 22, color: C.accentDeep }} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: C.textDark, marginBottom: '4px' }}>Ubicación</h4>
                    <p style={{ fontSize: '14px', color: C.textMuted, lineHeight: 1.5 }}>Centro Comercial La Estación<br/>Local 104, Medellín, Colombia</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: C.bgSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone style={{ width: 22, height: 22, color: C.accentDeep }} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: C.textDark, marginBottom: '4px' }}>Teléfono / WhatsApp</h4>
                    <p style={{ fontSize: '14px', color: C.textMuted }}>+57 300 123 4567</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: C.bgSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail style={{ width: 22, height: 22, color: C.accentDeep }} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: C.textDark, marginBottom: '4px' }}>Correo Electrónico</h4>
                    <p style={{ fontSize: '14px', color: C.textMuted }}>contacto@glamourml.com</p>
                  </div>
                </div>
              </div>

              {/* Redes Sociales mock */}
              <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: `1px dashed ${C.accent}` }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: C.textDark, marginBottom: '16px' }}>Síguenos en redes sociales</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {['Instagram', 'Facebook', 'TikTok'].map((social) => (
                    <div key={social} style={{ padding: '8px 16px', borderRadius: '20px', border: `1px solid ${C.accent}`, fontSize: '13px', color: C.textMuted, cursor: 'pointer' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = C.accentDeep;
                        e.currentTarget.style.color = C.accentDeep;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = C.accent;
                        e.currentTarget.style.color = C.textMuted;
                      }}
                    >
                      {social}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
