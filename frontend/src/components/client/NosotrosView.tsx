import { ArrowLeft, Sparkles, Heart, Shield, Star } from "lucide-react";

const V = (name: string) => `var(--luxury-${name})`;
const C = {
  bgSoft: V("bg-soft"),
  accent: V("pink-soft"),
  accentDark: V("accent-dark"),
  accentDeep: V("pink"),
  textDark: V("text-dark"),
  textMuted: V("text-muted"),
  shadowSm: V("shadow-sm"),
  shadow: V("shadow"),
  white: "#ffffff",
};

export function NosotrosView({
  onNavigate,
}: {
  onNavigate?: (route: string) => void;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bgSoft,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── HERO HEADER ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${C.textDark} 0%, ${C.accentDeep} 100%)`,
          padding: "80px 0",
          position: "relative",
          overflow: "hidden",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 32px",
            position: "relative",
            zIndex: 2,
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "56px",
              fontWeight: 600,
              color: C.white,
              margin: "0 0 16px 0",
              lineHeight: 1.1,
            }}
          >
            Nuestra Esencia
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: "18px",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            En Glamour ML, creemos que el maquillaje no es solo un producto,
            sino una herramienta para resaltar tu luz propia y empoderar tu día
            a día.
          </p>
        </div>

        {/* Decoración */}
        <div
          style={{
            position: "absolute",
            right: "10%",
            top: "-30%",
            fontSize: "200px",
            opacity: 0.05,
            transform: "rotate(15deg)",
            pointerEvents: "none",
          }}
        >
          ✿
        </div>
        <div
          style={{
            position: "absolute",
            left: "-5%",
            bottom: "-20%",
            fontSize: "150px",
            opacity: 0.05,
            transform: "rotate(-15deg)",
            pointerEvents: "none",
          }}
        >
          ✦
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "0 32px 80px 32px",
        }}
      >
        {/* Back Button */}
        {onNavigate && (
          <button
            onClick={() => onNavigate("inicio")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "14px",
              color: C.accentDeep,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              marginBottom: "32px",
            }}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} />
            Volver al inicio
          </button>
        )}

        {/* Misión y Visión */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "32px",
            marginBottom: "64px",
          }}
        >
          <div
            style={{
              background: C.white,
              borderRadius: "24px",
              padding: "40px",
              border: `1px solid ${C.accent}`,
              boxShadow: `0 8px 30px ${C.shadowSm}`,
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: C.bgSoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <Sparkles
                style={{ width: 24, height: 24, color: C.accentDeep }}
              />
            </div>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "28px",
                fontWeight: 600,
                color: C.textDark,
                marginBottom: "16px",
              }}
            >
              Nuestra Misión
            </h3>
            <p
              style={{ color: C.textMuted, fontSize: "15px", lineHeight: 1.7 }}
            >
              Brindar acceso a productos de belleza de alta calidad que inspiren
              confianza. Nos esforzamos por seleccionar cuidadosamente cada
              artículo de nuestro catálogo, asegurando que cumpla con los
              estándares más altos de excelencia y cuidado personal.
            </p>
          </div>

          <div
            style={{
              background: C.white,
              borderRadius: "24px",
              padding: "40px",
              border: `1px solid ${C.accent}`,
              boxShadow: `0 8px 30px ${C.shadowSm}`,
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: C.bgSoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <Star style={{ width: 24, height: 24, color: C.accentDeep }} />
            </div>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "28px",
                fontWeight: 600,
                color: C.textDark,
                marginBottom: "16px",
              }}
            >
              Nuestra Visión
            </h3>
            <p
              style={{ color: C.textMuted, fontSize: "15px", lineHeight: 1.7 }}
            >
              Convertirnos en el referente líder en distribución de maquillaje a
              nivel nacional, reconocidos por nuestro compromiso con la
              innovación, la sostenibilidad y la satisfacción total de nuestra
              exclusiva comunidad de clientes.
            </p>
          </div>
        </div>

        {/* Valores */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <p
            style={{
              fontSize: "12px",
              color: C.accentDeep,
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontWeight: 700,
              marginBottom: "8px",
            }}
          >
            En qué creemos
          </p>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "36px",
              fontWeight: 600,
              color: C.textDark,
              marginBottom: "40px",
            }}
          >
            Nuestros Valores
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "24px",
            }}
          >
            {[
              {
                icon: Heart,
                title: "Pasión",
                desc: "Amamos lo que hacemos y se refleja en cada entrega.",
              },
              {
                icon: Shield,
                title: "Calidad",
                desc: "Solo marcas 100% originales y garantizadas.",
              },
              {
                icon: Sparkles,
                title: "Innovación",
                desc: "Siempre a la vanguardia de las últimas tendencias.",
              },
            ].map((valor, idx) => (
              <div
                key={idx}
                style={{
                  background: C.bgSoft,
                  borderRadius: "20px",
                  padding: "32px 20px",
                  border: `1px solid ${C.accent}`,
                  transition: "transform 0.3s",
                  cursor: "default",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-5px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: C.white,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px auto",
                    boxShadow: `0 4px 12px ${C.shadowSm}`,
                  }}
                >
                  <valor.icon
                    style={{ width: 20, height: 20, color: C.accentDeep }}
                  />
                </div>
                <h4
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: C.textDark,
                    marginBottom: "8px",
                  }}
                >
                  {valor.title}
                </h4>
                <p
                  style={{
                    fontSize: "13px",
                    color: C.textMuted,
                    lineHeight: 1.5,
                  }}
                >
                  {valor.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
