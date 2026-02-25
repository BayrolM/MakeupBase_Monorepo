import { useStore } from '../lib/store';
import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from './ui/sidebar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
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
} from 'lucide-react';

interface AppSidebarProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
  onLogout?: () => void;
}

export function AppSidebar({ onNavigate, currentRoute, onLogout }: AppSidebarProps) {
  const { currentUser, userType } = useStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Admin menu - visible for admin, vendedor, bodeguero roles
  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', route: 'dashboard' },
    { icon: Users, label: 'Usuarios', route: 'usuarios' },
    { icon: UserCircle, label: 'Clientes', route: 'clientes-view' },
    { icon: Package, label: 'Productos', route: 'productos' },
    { icon: FolderKanban, label: 'Categorías', route: 'categorias' },
    { icon: ShoppingCart, label: 'Ventas', route: 'ventas' },
    { icon: Truck, label: 'Pedidos', route: 'pedidos' },
    { icon: RotateCcw, label: 'Devoluciones', route: 'devoluciones' },
    { icon: Building, label: 'Proveedores', route: 'proveedores' },
    { icon: ShoppingBag, label: 'Compras', route: 'compras' },
    { icon: Shield, label: 'Roles y Permisos', route: 'roles' },
    { icon: Settings, label: 'Configuración', route: 'configuracion' },
  ];

  // Client menu - visible for cliente role
  const clienteMenuItems = [
    { icon: Home, label: 'Inicio', route: 'inicio' },
    { icon: Store, label: 'Catálogo', route: 'catalogo' },
    { icon: Heart, label: 'Favoritos', route: 'favoritos' },
    { icon: Truck, label: 'Mis Pedidos', route: 'mis-pedidos' },
    { icon: Bell, label: 'Historial', route: 'historial' },
    { icon: UserCircle, label: 'Mi Perfil', route: 'perfil' },
  ];

  // Determine menu items based on userType (which is set automatically based on user role)
  const menuItems = userType === 'admin' ? adminMenuItems : clienteMenuItems;

  return (
    <Sidebar className="border-r border-sidebar-border" style={{ width: '280px' }}>
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <div className="text-primary-foreground flex flex-col items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mb-0.5">
                <path d="M12 3L4 9V21H20V9L12 3Z" fill="currentColor" opacity="0.3"/>
                <path d="M12 3L4 9M12 3L20 9M12 3V21M4 9V21H20V9M4 9H20" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-foreground" style={{ fontSize: '18px', fontWeight: 600, lineHeight: 1 }}>
              GLAMOUR ML
            </span>
            <span className="text-foreground-secondary" style={{ fontSize: '11px', opacity: 0.7 }}>
              {userType === 'admin' ? 'Panel Administrativo' : 'Portal Cliente'}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.route}>
                  <SidebarMenuButton
                    onClick={() => onNavigate(item.route)}
                    isActive={currentRoute === item.route}
                    className={`
                      h-11 px-3 gap-3 rounded-lg transition-all relative
                      ${currentRoute === item.route 
                        ? 'bg-primary/20 text-foreground hover:bg-primary/25' 
                        : 'text-foreground-secondary hover:bg-sidebar-accent hover:text-foreground'
                      }
                    `}
                    style={currentRoute === item.route ? {
                      borderLeft: '3px solid #C87A88',
                      paddingLeft: 'calc(0.75rem - 3px)',
                    } : {}}
                  >
                    <item.icon className={`w-5 h-5 ${currentRoute === item.route ? 'text-primary' : ''}`} />
                    <span style={{ fontSize: '14px' }}>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <UserCircle className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-foreground truncate" style={{ fontSize: '14px', fontWeight: 500 }}>
              {currentUser?.nombre || 'Usuario'}
            </p>
            <p className="text-foreground-secondary truncate" style={{ fontSize: '12px' }}>
              {currentUser?.rol === 'admin' ? 'Administrador' : 
               currentUser?.rol === 'vendedor' ? 'Vendedor' : 
               currentUser?.rol === 'bodeguero' ? 'Bodeguero' : 
               currentUser?.rol === 'cliente' ? 'Cliente' : 'Sin rol'}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowLogoutDialog(true)}
          className="w-full h-10 px-3 flex items-center justify-center gap-2 rounded-lg text-danger hover:bg-danger/10 transition-colors"
          style={{ fontSize: '14px', fontWeight: 500 }}
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </SidebarFooter>

      {/* Logout Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Cerrar Sesión</DialogTitle>
            <DialogDescription className="sr-only">
              Confirmación para cerrar sesión del sistema
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-foreground text-center">
              ¿Estás seguro de que quieres cerrar sesión?
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              className="border-border text-foreground hover:bg-surface flex-1"
            >
              ❌ Cancelar
            </Button>
            <Button
              onClick={() => {
                setShowLogoutDialog(false);
                onLogout?.();
              }}
              className="bg-danger hover:bg-danger/90 text-foreground flex-1"
            >
              ✅ Sí, cerrar sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}