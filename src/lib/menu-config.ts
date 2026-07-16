import {
  LayoutDashboard,
  Package,
  ChefHat,
  School,
  Building2,
  FileText,
  Receipt,
  BarChart3,
  Users,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'

export type MenuItem = {
  label: string
  href: string
  icon: string
  permisos: string[]
  hijos?: MenuItem[]
}

export const MENU: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    permisos: [],
  },
  {
    label: "Inventario",
    href: "/inventario",
    icon: "package",
    permisos: ["inventario.ver"],
  },
  {
    label: "Recetas",
    href: "/recetas",
    icon: "chef",
    permisos: ["receta.ver"],
  },
  {
    label: "Escuelas",
    href: "/escuelas",
    icon: "school",
    permisos: ["escuela.ver"],
  },
  {
    label: "Instituciones",
    href: "/instituciones",
    icon: "building",
    permisos: ["institucion.ver"],
  },
  {
    label: "Conduces",
    href: "/conduces",
    icon: "file",
    permisos: ["conduce.ver"],
  },
  {
    label: "Facturación",
    href: "/facturacion",
    icon: "receipt",
    permisos: ["factura.ver"],
  },
  {
    label: "Reportes",
    href: "/reportes",
    icon: "report",
    permisos: ["reporte.ver"],
  },
  {
    label: "Usuarios",
    href: "/usuarios",
    icon: "users",
    permisos: ["usuario.ver"],
  },
  {
    label: "Roles",
    href: "/roles",
    icon: "shield",
    permisos: ["rol.administrar"],
  },
]