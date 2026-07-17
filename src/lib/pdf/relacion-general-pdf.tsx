// src/lib/pdf/relacion-general-pdf.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 8, fontFamily: 'Helvetica', color: '#1e293b' },
  headerCentro: { textAlign: 'center', marginBottom: 4 },
  empresaNombre: { fontSize: 13, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
  empresaLinea: { fontSize: 7, color: '#475569', marginTop: 2 },
  empresaRnc: { fontSize: 7, fontFamily: 'Helvetica-Bold', marginTop: 2 },
  tituloCentro: { textAlign: 'center', marginVertical: 8 },
  titulo: { fontSize: 11, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
  subtitulo: { fontSize: 8, color: '#475569', marginTop: 3 },
  pagina: { fontSize: 7, color: '#64748b', marginTop: 4, marginBottom: 6 },
  tablaHeader: {
    flexDirection: 'row',
    borderTop: 1,
    borderBottom: 1,
    borderColor: '#475569',
    paddingVertical: 5,
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
  },
  fila: {
    flexDirection: 'row',
    borderBottom: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 4,
    fontSize: 8,
  },
  colFecha: { width: '14%' },
  colNumero: { width: '16%' },
  colCentro: { width: '50%' },
  colRaciones: { width: '20%', textAlign: 'right' },
  totalFila: {
    flexDirection: 'row',
    borderTop: 2,
    borderColor: '#475569',
    paddingTop: 6,
    marginTop: 2,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
})

type Conduce = {
  fecha: string
  numero: string
  escuelaCodigo: string
  escuelaNombre: string
  totalRaciones: number
}

type Props = {
  empresa: { nombre: string; direccion: string; telefono: string; email: string | null; rnc: string }
  desde: string
  hasta: string
  conduces: Conduce[]
  totalRaciones: number
}

export function RelacionGeneralPdf({ empresa, desde, hasta, conduces, totalRaciones }: Props) {
  // Dividir en páginas de ~40 filas para que no se corten
  const FILAS_POR_PAGINA = 40
  const paginas: Conduce[][] = []
  for (let i = 0; i < conduces.length; i += FILAS_POR_PAGINA) {
    paginas.push(conduces.slice(i, i + FILAS_POR_PAGINA))
  }
  const totalPaginas = paginas.length || 1

  return (
    <Document>
      {paginas.map((filas, paginaIdx) => (
        <Page key={paginaIdx} size="LETTER" style={styles.page}>
          {/* Encabezado en cada página */}
          <View style={styles.headerCentro}>
            <Text style={styles.empresaNombre}>{empresa.nombre}</Text>
            <Text style={styles.empresaLinea}>{empresa.direccion}</Text>
            <Text style={styles.empresaLinea}>
              Tel.: {empresa.telefono}{empresa.email ? ` / E-Mail: ${empresa.email}` : ''}
            </Text>
            <Text style={styles.empresaRnc}>RNC: {empresa.rnc}</Text>
          </View>

          <View style={styles.tituloCentro}>
            <Text style={styles.titulo}>Relación de conduces general</Text>
            <Text style={styles.subtitulo}>
              MES: Desde: {desde}  Hasta: {hasta}
            </Text>
          </View>

          <Text style={styles.pagina}>
            Página: {paginaIdx + 1} de {totalPaginas}
          </Text>

          {/* Encabezado de tabla */}
          <View style={styles.tablaHeader}>
            <Text style={styles.colFecha}>Fecha</Text>
            <Text style={styles.colNumero}>No. de Conduce</Text>
            <Text style={styles.colCentro}>Código y Nombre del Centro Educativo</Text>
            <Text style={styles.colRaciones}>Cantidad de Raciones de Almuerzo Escolar con Postre</Text>
          </View>

          {/* Filas de datos */}
          {filas.map((c, i) => (
            <View key={i} style={styles.fila}>
              <Text style={styles.colFecha}>{c.fecha}</Text>
              <Text style={styles.colNumero}>{c.numero}</Text>
              <Text style={styles.colCentro}>{c.escuelaCodigo} - {c.escuelaNombre}</Text>
              <Text style={styles.colRaciones}>{c.totalRaciones}</Text>
            </View>
          ))}

          {/* Total solo en la última página */}
          {paginaIdx === totalPaginas - 1 && (
            <View style={styles.totalFila}>
              <Text style={[styles.colFecha, { width: '80%' }, { textAlign: 'right' }]}>TOTAL</Text>
              <Text style={styles.colRaciones}>{totalRaciones}</Text>
            </View>
          )}
        </Page>
      ))}
    </Document>
  )
}