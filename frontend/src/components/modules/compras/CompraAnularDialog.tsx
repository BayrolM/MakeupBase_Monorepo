import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../../ui/dialog";

interface CompraAnularDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  compra: any;
  isSaving: boolean;
  onConfirm: () => void;
}

export function CompraAnularDialog({
  open,
  onOpenChange,
  compra,
  isSaving,
  onConfirm,
}: CompraAnularDialogProps) {
  if (!compra) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-0 rounded-2xl shadow-2xl p-0"
        style={{
          backgroundColor: "#fff",
          maxWidth: 420,
          overflow: "hidden",
        }}
      >
        {/* Icon + Content */}
        <div style={{ padding: "32px 28px 20px 28px", textAlign: "center" }}>
          {/* Warning icon */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: "#fef2f2",
              border: "2px solid #fecaca",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px auto",
            }}
          >
            <AlertTriangle style={{ width: 26, height: 26, color: "#ef4444" }} />
          </div>

          <DialogTitle
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "#1a1a2e",
              marginBottom: 8,
            }}
          >
            Anular Compra #{compra.id}
          </DialogTitle>

          <p
            style={{
              fontSize: 14,
              color: "#6b7280",
              lineHeight: 1.6,
              margin: "0 auto",
              maxWidth: 320,
            }}
          >
            ¿Estás seguro de que deseas anular esta compra? Esta acción es{" "}
            <strong style={{ color: "#ef4444" }}>irreversible</strong> y todos
            los productos ingresados serán descontados del inventario.
          </p>

          {/* Info box */}
          <div
            style={{
              marginTop: 20,
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 12,
              padding: "12px 16px",
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              textAlign: "left",
            }}
          >
            <AlertTriangle
              style={{
                width: 16,
                height: 16,
                color: "#ef4444",
                flexShrink: 0,
                marginTop: 2,
              }}
            />
            <span style={{ fontSize: 12, color: "#991b1b", lineHeight: 1.5 }}>
              El stock de cada producto se restará automáticamente al confirmar
              la anulación.
            </span>
          </div>
        </div>

        {/* Footer buttons */}
        <div
          style={{
            padding: "16px 28px",
            borderTop: "1px solid #f3f4f6",
            backgroundColor: "#fafafa",
            display: "flex",
            gap: 12,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            style={{
              height: 42,
              padding: "0 20px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              border: "1px solid #e5e7eb",
              backgroundColor: "white",
              color: "#374151",
              cursor: isSaving ? "not-allowed" : "pointer",
              opacity: isSaving ? 0.5 : 1,
              transition: "background 0.15s",
            }}
            onMouseOver={(e) => {
              if (!isSaving)
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "#f3f4f6";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "white";
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isSaving}
            style={{
              height: 42,
              padding: "0 22px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              border: "none",
              backgroundColor: isSaving ? "#fca5a5" : "#ef4444",
              color: "white",
              cursor: isSaving ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              minWidth: 160,
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => {
              if (!isSaving)
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "#dc2626";
            }}
            onMouseOut={(e) => {
              if (!isSaving)
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "#ef4444";
            }}
          >
            {isSaving ? (
              <>
                <svg
                  style={{ width: 16, height: 16 }}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    opacity="0.3"
                  />
                  <path
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    fill="currentColor"
                    opacity="0.8"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 12 12"
                      to="360 12 12"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </path>
                </svg>
                Procesando...
              </>
            ) : (
              "Sí, Anular Compra"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
