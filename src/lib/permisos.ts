// src/lib/permisos.ts

/**
 * Mapa de prefijos de ruta -> permiso(s) requerido(s) para acceder.
 * El middleware recorre este mapa y exige que el usuario tenga
 * AL MENOS UNO de los permisos listados para esa ruta.
 *
 * Para agregar una ruta nueva protegida, solo agrega una línea aquí.
 */
export const RUTAS_PROTEGIDAS: { prefijo: string; permisos: string[] }[] = [
  { prefijo: '/inventario', permisos: ['inventario.ver'] },
  { prefijo: '/recetas', permisos: ['receta.ver'] },
  { prefijo: '/despacho', permisos: ['conduce.crear'] },
  { prefijo: '/escuelas', permisos: ['escuela.ver'] },
  { prefijo: '/instituciones', permisos: ['institucion.ver'] },
  { prefijo: '/conduces', permisos: ['conduce.ver'] },
  { prefijo: '/facturacion', permisos: ['factura.ver'] },
  { prefijo: '/contabilidad', permisos: ['contabilidad.ver'] },
  { prefijo: '/reportes', permisos: ['reporte.ver'] },
  { prefijo: '/usuarios', permisos: ['usuario.ver'] },
  { prefijo: '/roles', permisos: ['rol.administrar'] },
  { prefijo: '/configuracion', permisos: ['empresa.editar'] },
]

/** true si el usuario tiene al menos uno de los permisos requeridos */
export function tieneAlgunPermiso(permisosUsuario: string[], permisosRequeridos: string[]) {
  return permisosRequeridos.some((p) => permisosUsuario.includes(p))
}

/** true si el usuario tiene TODOS los permisos requeridos */
export function tieneTodosLosPermisos(permisosUsuario: string[], permisosRequeridos: string[]) {
  return permisosRequeridos.every((p) => permisosUsuario.includes(p))
}

/**
 * Busca si una ruta (pathname) está protegida y devuelve los permisos que exige.
 * Devuelve null si la ruta no está en el mapa (no requiere permiso especial,
 * solo estar logueado).
 */
export function permisosRequeridosPara(pathname: string): string[] | null {
  const match = RUTAS_PROTEGIDAS.find((r) => pathname.startsWith(r.prefijo))
  return match ? match.permisos : null
}