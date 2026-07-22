// src/lib/menu-config.ts
// Fuente única de verdad para el menú lateral.
// Cada item declara qué permiso(s) necesita para mostrarse.
// Si el usuario tiene AL MENOS UNO de los permisos listados, el item se muestra.

import {
  LayoutDashboard,
  Package,
  ChefHat,
  School,
  Building2,
  FileText,
  ClipboardList,
  Receipt,
  Wallet,
  Banknote,
  BarChart3,
  Users,
  ShieldCheck,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export type MenuItem = {
  label: string
  href: string
  icon: LucideIcon
  permisos: string[] // vacío = visible para cualquier usuario logueado
  hijos?: MenuItem[]
}

export const MENU: MenuItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    permisos: [],
  },
  {
    label: 'Inventario',
    href: '/inventario',
    icon: Package,
    permisos: ['inventario.ver'],
    hijos: [
      { label: 'Insumos', href: '/inventario', icon: Package, permisos: ['inventario.ver'] },
      {
        label: 'Movimientos',
        href: '/inventario/movimientos',
        icon: Package,
        permisos: ['inventario.ver'],
      },
      {
        label: 'Categorías',
        href: '/inventario/categorias',
        icon: Package,
        permisos: ['inventario.ver'],
      },
    ],
  },
  {
    label: 'Recetas',
    href: '/recetas',
    icon: ChefHat,
    permisos: ['receta.ver'],
  },
  {
    label: 'Escuelas',
    href: '/escuelas',
    icon: School,
    permisos: ['escuela.ver'],
  },
  {
    label: 'Instituciones',
    href: '/instituciones',
    icon: Building2,
    permisos: ['institucion.ver'],
  },
  {
    label: 'Pre-despacho',
    href: '/despacho',
    icon: ClipboardList,
    permisos: ['conduce.crear'],
  },
  {
    label: 'Conduces',
    href: '/conduces',
    icon: FileText,
    permisos: ['conduce.ver'],
  },
  {
    label: 'Facturación',
    href: '/facturacion',
    icon: Receipt,
    permisos: ['factura.ver'],
  },
  {
    label: 'Contabilidad',
    href: '/contabilidad',
    icon: Wallet,
    permisos: ['contabilidad.ver'],
    hijos: [
      { label: 'Estado de resultados', href: '/contabilidad', icon: Wallet, permisos: ['contabilidad.ver'] },
      { label: 'Ingresos', href: '/contabilidad/ingresos', icon: Wallet, permisos: ['contabilidad.ver'] },
      { label: 'Gastos', href: '/contabilidad/gastos', icon: Wallet, permisos: ['contabilidad.ver'] },
    ],
  },
  {
    label: 'Caja Chica',
    href: '/caja-chica',
    icon: Banknote,
    permisos: ['contabilidad.ver'],
  },
  {
    label: 'Reportes',
    href: '/reportes',
    icon: BarChart3,
    permisos: ['reporte.ver'],
    hijos: [
      { label: 'Conduces', href: '/reportes/conduces', icon: BarChart3, permisos: ['reporte.ver'] },
      {
        label: 'Conduce global',
        href: '/reportes/conduce-global',
        icon: BarChart3,
        permisos: ['reporte.ver'],
      },
      {
        label: 'Relación general',
        href: '/reportes/relacion-general',
        icon: BarChart3,
        permisos: ['reporte.ver'],
      },
      {
        label: 'Relación por centro',
        href: '/reportes/relacion-por-centro',
        icon: BarChart3,
        permisos: ['reporte.ver'],
      },
      { label: 'Facturas', href: '/reportes/facturas', icon: BarChart3, permisos: ['reporte.ver'] },
    ],
  },
  {
    label: 'Usuarios',
    href: '/usuarios',
    icon: Users,
    permisos: ['usuario.ver'],
  },
  {
    label: 'Roles',
    href: '/roles',
    icon: ShieldCheck,
    permisos: ['rol.administrar'],
  },
  {
    label: 'Configuración',
    href: '/configuracion/empresa',
    icon: Settings,
    permisos: ['empresa.editar'],
  },
]