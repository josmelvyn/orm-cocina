// src/lib/pdf/factura-pdf.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 9, fontFamily: 'Helvetica', color: '#1e293b' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  empresaNombre: { fontSize: 12, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
  empresaLinea: { fontSize: 8, color: '#475569', marginTop: 2 },
  empresaBold: { fontSize: 8, fontFamily: 'Helvetica-Bold', marginTop: 2 },
  facturaTitulo: { fontSize: 11, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', textAlign: 'right' },
  facturaLinea: { fontSize: 8, textAlign: 'right', marginTop: 2 },
  lineaGruesa: { borderTop: 2, borderColor: '#1e293b', marginVertical: 8 },
  campoFila: { flexDirection: 'row', fontSize: 8, marginBottom: 4 },
  campoLabel: { width: 110, fontFamily: 'Helvetica-Bold' },
  campoValor: { flex: 1, borderBottom: 1, borderColor: '#cbd5e1', paddingBottom: 2 },
  condFila: { flexDirection: 'row', alignItems: 'center', fontSize: 8, marginBottom: 8, gap: 4 },
  tablaHeader: { flexDirection: 'row', justifyContent: 'space-between', borderTop: 1, borderColor: '#cbd5e1', paddingTop: 4, marginTop: 6, fontSize: 7, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', color: '#64748b' },
  tablaFila: { flexDirection: 'row', justifyContent: 'space-between', borderTop: 1, borderBottom: 1, borderColor: '#94a3b8', borderStyle: 'dashed', paddingVertical: 8, marginBottom: 8, fontSize: 8 },
  colProducto: { width: '40%', fontFamily: 'Helvetica-Bold' },
  colDato: { width: '20%', textAlign: 'right' },
  totales: { alignItems: 'flex-end', marginTop: 8 },
  totalFila: { flexDirection: 'row', width: 200, justifyContent: 'space-between', marginBottom: 3, fontSize: 8 },
  totalLabel: { fontFamily: 'Helvetica-Bold' },
  totalGrande: { fontSize: 10, fontFamily: 'Helvetica-Bold' },
  firma: { marginTop: 50, textAlign: 'right', fontSize: 8, fontFamily: 'Helvetica-Bold' },
})

function formatoRD(valor: number) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(valor)
}
function formatoNumero(valor: number) {
  return new Intl.NumberFormat('es-DO').format(valor)
}

type FacturaPdfProps = {
  numeroFactura: string
  ncf: string
  ncfValidoHasta: string | null
  fechaEmision: string
  periodoInicio: string
  periodoFin: string
  periodoLabel: string
  institucion: { nombre: string; rnc: string }
  empresa: { nombre: string; direccion: string; telefono: string; email: string | null; rnc: string }
  cantidadConduces: number
  primerConduce: string
  ultimoConduce: string
  totalRaciones: number
  precioUnitario: number
  subtotal: number
  itbis: number
  total: number
}

export function FacturaPdf({
  ncf,
  ncfValidoHasta,
  fechaEmision,
  periodoLabel,
  institucion,
  empresa,
  cantidadConduces,
  primerConduce,
  ultimoConduce,
  totalRaciones,
  precioUnitario,
  subtotal,
  itbis,
  total,
}: FacturaPdfProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={{ width: '60%' }}>
            <Text style={styles.empresaNombre}>{empresa.nombre}</Text>
            <Text style={styles.empresaLinea}>{empresa.direccion}</Text>
            <Text style={styles.empresaLinea}>
              Tel.: {empresa.telefono}{empresa.email ? ` / E-Mail: ${empresa.email}` : ''}
            </Text>
            <Text style={styles.empresaBold}>RNC: {empresa.rnc}</Text>
            <Text style={styles.empresaBold}>FECHA: {fechaEmision}</Text>
          </View>
          <View style={{ width: '38%' }}>
            <Text style={styles.facturaTitulo}>Factura gubernamental</Text>
            <Text style={styles.facturaLinea}>NCF: {ncf}</Text>
            {ncfValidoHasta && <Text style={styles.facturaLinea}>Válido hasta: {ncfValidoHasta}</Text>}
          </View>
        </View>

        <View style={styles.lineaGruesa} />

        <View style={styles.campoFila}>
          <Text style={styles.campoLabel}>RNC CLIENTE:</Text>
          <Text style={styles.campoValor}>{institucion.rnc}</Text>
        </View>
        <View style={styles.campoFila}>
          <Text style={styles.campoLabel}>NOMBRE O RAZÓN SOCIAL:</Text>
          <Text style={styles.campoValor}>{institucion.nombre}</Text>
        </View>
        <View style={styles.campoFila}>
          <Text style={styles.campoLabel}>Período de factura:</Text>
          <Text style={styles.campoValor}>{periodoLabel}</Text>
        </View>
        <View style={styles.condFila}>
          <Text style={{ width: 110, fontFamily: 'Helvetica-Bold' }}>Cantidad de Conduces:</Text>
          <Text>{cantidadConduces}</Text>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>del No.</Text>
          <Text>{primerConduce}</Text>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>al</Text>
          <Text>{ultimoConduce}</Text>
        </View>

        <View style={styles.tablaHeader}>
          <Text style={{ width: '40%' }}>Producto</Text>
          <Text style={styles.colDato}>Cantidad</Text>
          <Text style={styles.colDato}>Precio S/ITBIS</Text>
          <Text style={styles.colDato}>Valor RD$</Text>
        </View>
        <View style={styles.tablaFila}>
          <Text style={styles.colProducto}>RACIONES ALIMENTICIA CON POSTRE</Text>
          <Text style={styles.colDato}>{formatoNumero(totalRaciones)}</Text>
          <Text style={styles.colDato}>{precioUnitario.toFixed(2)}</Text>
          <Text style={styles.colDato}>{formatoRD(subtotal)}</Text>
        </View>

        <View style={styles.totales}>
          <View style={styles.totalFila}>
            <Text style={styles.totalLabel}>SUB-TOTAL:</Text>
            <Text>{formatoRD(subtotal)}</Text>
          </View>
          <View style={styles.totalFila}>
            <Text style={styles.totalLabel}>ITBIS:</Text>
            <Text>{formatoRD(itbis)}</Text>
          </View>
          <View style={[styles.totalFila, { borderTop: 1, borderColor: '#1e293b', paddingTop: 3 }]}>
            <Text style={styles.totalGrande}>TOTAL:</Text>
            <Text style={styles.totalGrande}>{formatoRD(total)}</Text>
          </View>
        </View>

        <Text style={styles.firma}>FIRMA Y SELLO DE LA EMPRESA</Text>
      </Page>
    </Document>
  )
}