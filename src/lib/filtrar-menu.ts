// src/lib/filtrar-menu.ts

import { MENU, type MenuItem } from '@/lib/menu-config'
import { tieneAlgunPermiso } from '@/lib/permisos'

/**
 * Devuelve solo los items (y sub-items) del menú que el usuario
 * tiene permiso para ver. Un item padre se muestra si:
 *  - no requiere permisos, o
 *  - el usuario tiene alguno de sus permisos, o
 *  - al menos uno de sus hijos es visible para el usuario
 */
export function filtrarMenu(permisosUsuario: string[]): MenuItem[] {
  function filtrarItem(item: MenuItem): MenuItem | null {
    const puedeVerPadre = item.permisos.length === 0 || tieneAlgunPermiso(permisosUsuario, item.permisos)

    const hijosVisibles = item.hijos
      ?.map(filtrarItem)
      .filter((h): h is MenuItem => h !== null)

    if (!puedeVerPadre && (!hijosVisibles || hijosVisibles.length === 0)) {
      return null
    }

    return { ...item, hijos: hijosVisibles }
  }

  return MENU.map(filtrarItem).filter((item): item is MenuItem => item !== null)
}