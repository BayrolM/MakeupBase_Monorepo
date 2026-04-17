import { useStore } from '../lib/store';
import React, { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from './ui/sidebar';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import {
  LayoutDashboard,
  Users,
  Package,
  FolderKanban,
  ShoppingCart,
  Truck,
  RotateCcw,
  UserCircle,
  Building,
  ShoppingBag,
  Shield,
  Settings,
  Home,
  Store,
  Heart,
  Bell,
  LogOut,
  X,
} from 'lucide-react';

interface AppSidebarProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
  onLogout?: () => void;
}

export function AppSidebar({ onNavigate, currentRoute, onLogout }: AppSidebarProps) {
  const { currentUser, userType } = useStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const adminGroups = [
    {
      label: 'GENERAL',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', route: 'dashboard' },
        { icon: Users, label: 'Usuarios', route: 'usuarios' },
        { icon: UserCircle, label: 'Clientes', route: 'clientes-view' },
      ]
    },
    {
      label: 'CATÁLOGO',
      items: [
        { icon: Package, label: 'Productos', route: 'productos' },
        { icon: FolderKanban, label: 'Categorías', route: 'categorias' },
      ]
    },
    {
      label: 'OPERACIONES',
      items: [
        { icon: ShoppingCart, label: 'Ventas', route: 'ventas' },
        { icon: Truck, label: 'Pedidos', route: 'pedidos' },
        { icon: RotateCcw, label: 'Devoluciones', route: 'devoluciones' },
        { icon: Building, label: 'Proveedores', route: 'proveedores' },
        { icon: ShoppingBag, label: 'Compras', route: 'compras' },
        { icon: Shield, label: 'Roles y Permisos', route: 'roles' },
        { icon: Settings, label: 'Configuración', route: 'configuracion' },
      ]
    }
  ];

  const clienteItems = [
    { icon: Home, label: 'Inicio', route: 'inicio' },
    { icon: Store, label: 'Catálogo', route: 'catalogo' },
    { icon: Heart, label: 'Favoritos', route: 'favoritos' },
    { icon: Truck, label: 'Mis Pedidos', route: 'mis-pedidos' },
    { icon: Bell, label: 'Historial', route: 'historial' },
    { icon: UserCircle, label: 'Mi Perfil', route: 'perfil' },
  ];

  const renderItems = (items: {icon: any, label: string, route: string}[]) => (
    <SidebarMenu>
      {items.map((item) => {
        const active = currentRoute === item.route;

        return (
          <SidebarMenuItem key={item.route}>
            <SidebarMenuButton
              onClick={() => onNavigate(item.route)}
              className="relative flex items-center gap-3 px-6 py-2 transition-all group"
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(160,80,110,0.12)';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              {active && (
                <div
                  className="absolute inset-0"
                  style={{ background: 'rgba(160,80,110,0.18)' }}
                />
              )}

              {active && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#e0a0be] to-[#b06080]" />
              )}

              <item.icon
                className="w-[14px] h-[14px] relative z-10 transition-all"
                style={{
                  color: active
                    ? '#e0a8c0'
                    : 'rgba(215,150,175,0.4)',
                }}
              />

              <span
                className="relative z-10"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: active ? 500 : 400,
                  fontSize: '12px',
                  letterSpacing: '0.3px',
                  color: active
                    ? '#ffffff'
                    : 'rgba(240,205,220,0.48)',
                  textShadow: active
                    ? `
                      0 0 9px rgba(225,155,178,0.88),
                      0 0 18px rgba(160,80,110,0.45),
                      1px 1px 0 rgba(20,0,8,0.98),
                      -1px -1px 0 rgba(20,0,8,0.98),
                      1px -1px 0 rgba(20,0,8,0.85),
                      -1px 1px 0 rgba(20,0,8,0.85)
                    `
                    : 'none',
                }}
              >
                {item.label}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar 
      className="border-none overflow-hidden"
      style={{ '--sidebar-width': '280px' } as React.CSSProperties}
    >

      {/* Fondo */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 80% 8%, rgba(140,70,90,0.5) 0%, transparent 50%),
            radial-gradient(ellipse at 12% 65%, rgba(80,25,40,0.55) 0%, transparent 50%),
            radial-gradient(ellipse at 55% 92%, rgba(110,45,65,0.35) 0%, transparent 45%),
            linear-gradient(158deg, #2e1020 0%, #3d1828 38%, #4a2035 62%, #2e1020 100%)
          `
        }}
      />

      <div className="relative z-10 flex flex-col h-full">

        <SidebarHeader className="p-6 flex flex-col items-center border-none">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle at 40% 35%, #3a1525, #160810)',
              border: '1.5px solid rgba(210,140,165,0.5)',
              boxShadow: '0 0 16px rgba(140,60,90,0.4)',
            }}
          >
            <img src="/logo.png" className="w-14 h-14 object-contain" />
          </div>

          <div className="text-center mt-2">
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '2.5px',
                color: '#fff',
                textTransform: 'uppercase',
                textShadow: `
                  0 0 10px rgba(225,155,178,0.9),
                  0 0 22px rgba(160,80,110,0.6),
                  1px 1px 0 rgba(20,0,8,0.95),
                  -1px -1px 0 rgba(20,0,8,0.95),
                  1px -1px 0 rgba(20,0,8,0.85),
                  -1px 1px 0 rgba(20,0,8,0.85)
                `,
              }}
            >
              GLAMOUR ML
            </h2>

            <p style={{
              fontSize: '9px',
              color: 'rgba(220,160,180,0.58)',
              letterSpacing: '1.5px',
              textTransform: 'uppercase'
            }}>
              {userType === 'admin' ? 'Panel Admin' : 'Cliente'}
            </p>
          </div>
        </SidebarHeader>

        {/* 🔥 AQUÍ ESTÁ EL CAMBIO */}
        <SidebarContent className="flex-1 bg-transparent overflow-y-auto no-scrollbar">
          {userType === 'admin' ? (
            adminGroups.map((group) => (
              <div key={group.label}>
                <h3
                  style={{
                    fontSize: '8px',
                    letterSpacing: '1.8px',
                    color: 'rgba(200,130,155,0.45)',
                    padding: '8px 18px',
                    textTransform: 'uppercase'
                  }}
                >
                  {group.label}
                </h3>
                {renderItems(group.items)}
              </div>
            ))
          ) : (
            renderItems(clienteItems)
          )}
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#6a2840] flex items-center justify-center text-white text-xs">
              {currentUser?.nombres?.charAt(0) || 'U'}
            </div>

            <div>
              <p style={{
                fontSize: '11px',
                color: '#fff',
                textShadow: '0 0 7px rgba(220,150,175,0.5)'
              }}>
                {currentUser?.nombres || 'Usuario'}
              </p>
              <p style={{
                fontSize: '9px',
                color: 'rgba(215,150,175,0.5)'
              }}>
                {currentUser?.rol || 'Admin'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowLogoutDialog(true)}
            className="mt-3 flex items-center gap-2 text-[11px]"
            style={{ color: 'rgba(215,150,175,0.45)' }}
          >
            <LogOut className="w-3 h-3" />
            Cerrar sesión
          </button>
        </SidebarFooter>
      </div>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="bg-white border-0 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0 luxury-icon-gradient" style={{ width: 44, height: 44, borderRadius: 12 }}>
                <LogOut className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                  Cerrar Sesión
                </DialogTitle>
                <p className="text-xs text-gray-400 mt-0.5">¿Estás segura de que deseas salir?</p>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutDialog(false)}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <div className="bg-[#fff0f5] rounded-xl p-4 border border-[#fce8f0]">
              <p className="text-sm text-gray-600 leading-relaxed text-center">
                Tu sesión se cerrará y tendrás que volver a iniciar sesión para acceder a tu cuenta.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-5 h-10 text-sm"
            >
              Cancelar
            </Button>
            <button
              onClick={() => { setShowLogoutDialog(false); onLogout?.(); }}
              className="rounded-lg font-semibold px-6 h-10 text-sm border-0 luxury-button-modal"
            >
              Cerrar Sesión
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}