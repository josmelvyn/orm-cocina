// src/lib/pdf/conduce-pdf.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 9, fontFamily: 'Helvetica', color: '#1e293b' },
  headerCentro: { textAlign: 'center', marginBottom: 8 },
  empresaNombre: { fontSize: 14, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
  empresaLinea: { fontSize: 8, color: '#475569', marginTop: 2 },
  empresaRnc: { fontSize: 8, fontFamily: 'Helvetica-Bold', marginTop: 2 },
  lineaGruesa: { borderTop: 2, borderColor: '#1e293b', marginVertical: 10 },
  lineaPunteada: { borderTop: 1, borderColor: '#94a3b8', borderStyle: 'dashed', marginVertical: 8 },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoCol: { width: '48%' },
  infoLinea: { fontSize: 8, marginBottom: 3 },
  infoLabel: { fontFamily: 'Helvetica-Bold' },
  tablaHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', borderBottom: 1, borderColor: '#cbd5e1', paddingBottom: 4 },
  tablaFila: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  tablaDescCol: { width: '85%' },
  tablaCantCol: { width: '15%', textAlign: 'right', fontSize: 11, fontFamily: 'Helvetica-Bold' },
  raccionesLabel: { fontSize: 7, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 3 },
  observacionesBox: { marginTop: 4, marginBottom: 40 },
  observacionesLinea: { borderBottom: 1, borderColor: '#cbd5e1', minHeight: 14, marginTop: 4 },
  firmasRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  firmaCol: { width: '46%' },
  firmaSuplidorBox: { marginTop: 70, borderTop: 1, borderColor: '#94a3b8', paddingTop: 3, textAlign: 'center', fontSize: 7, color: '#64748b' },
  recibidoLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 6 },
  recibidoLinea: { borderBottom: 1, borderColor: '#cbd5e1', fontSize: 8, paddingBottom: 3, marginBottom: 8 },
})

type ConducePdfProps = {
  numero: string
  fecha: string
  estado: string
  empresa: { nombre: string; direccion: string; telefono: string; email: string | null; rnc: string }
  escuela: {
    nombre: string
    direccion: string | null
    director: string | null
    provincia: string | null
    ruta: string | null
    codigo: string
    telefono: string | null
    regionalDistrito: string | null
  }
  descripcionProductos: string
  postre: string | null
  totalRaciones: number
  observaciones: string | null
  nombreRecibe: string | null
  fechaRecepcion: string | null
  horaRecepcion: string | null
}

export function ConducePdf({
  numero,
  fecha,
  empresa,
  escuela,
  descripcionProductos,
  postre,
  totalRaciones,
  observaciones,
  nombreRecibe,
  fechaRecepcion,
  horaRecepcion,
}: ConducePdfProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.headerCentro}>
          <Text style={styles.empresaNombre}>{empresa.nombre}</Text>
          <Text style={styles.empresaLinea}>{empresa.direccion}</Text>
          <Text style={styles.empresaLinea}>
            Tel.: {empresa.telefono}{empresa.email ? ` / E-Mail: ${empresa.email}` : ''}
          </Text>
          <Text style={styles.empresaRnc}>RNC: {empresa.rnc}</Text>
        </View>

        <View style={styles.lineaGruesa} />

        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLinea}><Text style={styles.infoLabel}>NOMBRE CENTRO EDUCATIVO: </Text>{escuela.nombre}</Text>
            <Text style={styles.infoLinea}><Text style={styles.infoLabel}>DIRECTOR DEL CENTRO: </Text>{escuela.director ?? '—'}</Text>
            <Text style={styles.infoLinea}><Text style={styles.infoLabel}>DIRECCIÓN: </Text>{escuela.direccion ?? '—'}</Text>
            <Text style={styles.infoLinea}><Text style={styles.infoLabel}>PROVINCIA O MUNICIPIO: </Text>{escuela.provincia ?? '—'}</Text>
            <Text style={styles.infoLinea}><Text style={styles.infoLabel}>RUTA: </Text>{escuela.ruta ?? '—'}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLinea}><Text style={styles.infoLabel}>CONDUCE NO.: </Text>{numero}</Text>
            <Text style={styles.infoLinea}><Text style={styles.infoLabel}>FECHA: </Text>{fecha}</Text>
            <Text style={styles.infoLinea}><Text style={styles.infoLabel}>CÓDIGO CENTRO: </Text>{escuela.codigo}</Text>
            <Text style={styles.infoLinea}><Text style={styles.infoLabel}>TELÉFONO: </Text>{escuela.telefono ?? '—'}</Text>
            <Text style={styles.infoLinea}><Text style={styles.infoLabel}>REGIONAL/DISTRITO: </Text>{escuela.regionalDistrito ?? '—'}</Text>
          </View>
        </View>

        <View style={styles.lineaPunteada} />

        <View style={styles.tablaHeaderRow}>
          <Text>Descripción del producto</Text>
          <Text>Cantidad</Text>
        </View>
        <View style={styles.tablaFila}>
          <View style={styles.tablaDescCol}>
            <Text style={styles.raccionesLabel}>Raciones alimenticias {postre ? 'con postre' : ''}</Text>
            <Text>{descripcionProductos}.</Text>
            {postre && <Text>Postre: {postre}.</Text>}
          </View>
          <Text style={styles.tablaCantCol}>{totalRaciones}</Text>
        </View>

        <View style={styles.lineaPunteada} />

        <View style={styles.observacionesBox}>
          <Text style={{ fontSize: 8 }}>
            <Text style={styles.infoLabel}>OBSERVACIONES: </Text>
            {observaciones ?? ''}
          </Text>
          <View style={styles.observacionesLinea} />
        </View>

        <View style={styles.firmasRow}>
          <View style={styles.firmaCol}>
            <Text style={styles.firmaSuplidorBox}>FIRMA Y SELLO DEL SUPLIDOR</Text>
          </View>
          <View style={styles.firmaCol}>
            <Text style={styles.recibidoLabel}>RECIBIDO POR:</Text>
            <Text style={styles.recibidoLinea}>NOMBRE: {nombreRecibe ?? ''}</Text>
            <Text style={styles.recibidoLinea}>FIRMA: </Text>
            <Text style={styles.recibidoLinea}>FECHA RECEPCIÓN: {fechaRecepcion ?? ''}</Text>
            <Text style={styles.recibidoLinea}>HORA DE RECEPCIÓN: {horaRecepcion ?? ''}</Text>
            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold' }}>SELLO DEL CENTRO</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}