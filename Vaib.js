// VAIB - Funciones de la app del repartidor
// Para ejecutarlo: node vaib.jsd

// ===== CONFIGURACIÓN =====
const CAPACIDAD = 6
const MINUTOS_POR_PARADA = 8
const MARGEN_LISTO = 15
const MAXIMO_FRIO = 60

// ===== DATOS =====
const franjas = ['12:00', '13:00', '18:00', '19:00']

const horasDeSalida = ['11:17', '12:45', '17:29', '18:50']

const comercios = [
  { letra: 'A', nombre: 'Frutería A', refrigerado: false },
  { letra: 'C', nombre: 'Herbolario C', refrigerado: false },
  { letra: 'E', nombre: 'Panadería E', refrigerado: false },
  { letra: 'B', nombre: 'Carnicería B', refrigerado: true },
  { letra: 'D', nombre: 'Charcutería D', refrigerado: true }
]

const pedidos = [
  { numero: 1, comercios: ['A', 'B'], destino: 'C/ Bilbao 200', franja: '12:00' },
  { numero: 2, comercios: ['C'], destino: 'Punto de recogida', franja: '13:00' },
  { numero: 3, comercios: ['B', 'D', 'E'], destino: 'C/ Concili de Trento 40', franja: '12:00' },
  { numero: 4, comercios: ['A'], destino: 'C/ Meridiana 300', franja: '18:00' },
  { numero: 5, comercios: ['D'], destino: 'Punto de recogida', franja: '12:00' },
  { numero: 6, comercios: ['A', 'C', 'E'], destino: 'C/ Aragó 580', franja: '13:00' },
  { numero: 7, comercios: ['B'], destino: 'C/ Rogent 80', franja: '19:00' },
  { numero: 8, comercios: ['A', 'B', 'C', 'D'], destino: 'C/ Guipúscoa 50', franja: '12:00' },
  { numero: 9, comercios: ['E'], destino: 'Punto de recogida', franja: '18:00' },
  { numero: 10, comercios: ['B', 'C'], destino: 'C/ Navas de Tolosa 250', franja: '13:00' },
  { numero: 11, comercios: ['A', 'D'], destino: 'C/ Clot 120', franja: '12:00' },
  { numero: 12, comercios: ['C', 'E'], destino: 'C/ Bilbao 150', franja: '18:00' }
]

const ordenDeEntrega = [
  'Punto de recogida',
  'C/ Clot 120',
  'C/ Guipúscoa 50',
  'C/ Concili de Trento 40',
  'C/ Bilbao 200',
  'C/ Aragó 580',
  'C/ Navas de Tolosa 250',
  'C/ Meridiana 300',
  'C/ Bilbao 150',
  'C/ Rogent 80'
]

// ============================================================ FUNCIONES PARA LAS HORAS ============================================================

// Convierte "11:20" en 680 (minutos desde las 00:00)
function horaAMinutos(hora) {
  const partes = hora.split(':')
  const horas = Number(partes[0])
  const minutos = Number(partes[1])
  return horas * 60 + minutos
}

// Convierte 680 en "11:20"
function minutosAHora(totalMinutos) {
  const horas = Math.floor(totalMinutos / 60)
  const minutos = totalMinutos % 60
  let textoHoras = String(horas)
  let textoMinutos = String(minutos)
  if (horas < 10) {
    textoHoras = '0' + textoHoras
  }
  if (minutos < 10) {
    textoMinutos = '0' + textoMinutos
  }
  return textoHoras + ':' + textoMinutos
}

// ============================================================ 1. PLANIFICAR EL DÍA ============================================================

// Reparte los pedidos en salidas: una por franja, como máximo 6 pedidos
function crearSalidas() {
  const salidas = []
  for (let i = 0; i < franjas.length; i++) {
    let salidaActual = { franja: franjas[i], horaDeSalida: horasDeSalida[i], pedidos: [] }
    for (let j = 0; j < pedidos.length; j++) {
      if (pedidos[j].franja === franjas[i]) {
        if (salidaActual.pedidos.length === CAPACIDAD) {
          salidas.push(salidaActual)
          salidaActual = { franja: franjas[i], horaDeSalida: horasDeSalida[i], pedidos: [] }
        }
        salidaActual.pedidos.push(pedidos[j])
      }
    }
    salidas.push(salidaActual)
  }
  return salidas
}

// Crea la lista de paradas de una salida: primero recoger y después entregar
function crearParadas(salida) {
  const paradas = []

  // Recogidas, en el orden de la lista de comercios (los refrigerados van al final)
  for (let i = 0; i < comercios.length; i++) {
    const pedidosDeEsteComercio = []
    for (let j = 0; j < salida.pedidos.length; j++) {
      if (salida.pedidos[j].comercios.includes(comercios[i].letra)) {
        pedidosDeEsteComercio.push(salida.pedidos[j].numero)
      }
    }
    if (pedidosDeEsteComercio.length > 0) {
      paradas.push({
        tipo: 'Recoger',
        lugar: comercios[i].nombre,
        refrigerado: comercios[i].refrigerado,
        pedidos: pedidosDeEsteComercio,
        estado: 'pendiente' // los botones lo cambian a  recogido, entregado o incidencia
      })
    }
  }

  // Entregas, en el orden de la lista ordenDeEntrega
  for (let i = 0; i < ordenDeEntrega.length; i++) {
    for (let j = 0; j < salida.pedidos.length; j++) {
      const pedido = salida.pedidos[j]
      if (pedido.destino === ordenDeEntrega[i]) {
        paradas.push({
          tipo: 'Entregar',
          lugar: pedido.destino,
          refrigerado: esRefrigerado(pedido),
          pedidos: [pedido.numero],
          estado: 'pendiente'
        })
      }
    }
  }

  return paradas
}

// Devuelve true si el pedido lleva algo de un comercio refrigerado
function esRefrigerado(pedido) {
  for (let i = 0; i < comercios.length; i++) {
    if (comercios[i].refrigerado && pedido.comercios.includes(comercios[i].letra)) {
      return true
    }
  }
  return false
}

// Pone la hora a cada parada y la hora a la que el pedido debe estar "Listo"
function calcularHoras(salida) {
  let reloj = horaAMinutos(salida.horaDeSalida)
  for (let i = 0; i < salida.paradas.length; i++) {
    const parada = salida.paradas[i]
    parada.hora = minutosAHora(reloj)
    if (parada.tipo === 'Recoger') {
      parada.listoAntesDe = minutosAHora(reloj - MARGEN_LISTO)
    }
    reloj = reloj + MINUTOS_POR_PARADA
  }
}

// ============================================================ 2. APP DEL REPARTIDOR ============================================================

// Botón "He llegado": devuelve la primera parada que sigue pendiente
function siguienteParada(paradas) {
  for (let i = 0; i < paradas.length; i++) {
    if (paradas[i].estado === 'pendiente') {
      return paradas[i]
    }
  }
  return null
}

// Botón "Recogido": guarda la hora para poder medir el frío
function marcarRecogido(parada, hora) {
  parada.estado = 'recogido'
  parada.horaReal = hora  // horaReal nueva variable que registraria la hora en ese momento con un "onclick"
}

// Botón "Entregado": comprueba si llega a tiempo y cuánto frío ha aguantado
function marcarEntregado(paradas, parada, hora) {
  parada.estado = 'entregado'
  parada.horaReal = hora

  // Buscar el pedido para saber su franja
  let pedido = null
  for (let i = 0; i < pedidos.length; i++) {
    if (pedidos[i].numero === parada.pedidos[0]) {
      pedido = pedidos[i]
    }
  }

  // ¿Ha llegado dentro de la franja? (cada franja dura 60 minutos)
  const finDeFranja = horaAMinutos(pedido.franja) + 60
  let aTiempo = false
  if (horaAMinutos(hora) <= finDeFranja) {
    aTiempo = true
  }
  console.log('Pedido ' + pedido.numero + ' entregado a las ' + hora + '. ¿A tiempo? ' + aTiempo)

  // Si es refrigerado, ¿cuántos minutos ha ido en la caja?
  if (parada.refrigerado) {
    for (let i = 0; i < paradas.length; i++) {
      const otra = paradas[i]
      if (otra.tipo === 'Recoger' && otra.refrigerado && otra.pedidos.includes(pedido.numero)) {
        const minutosEnCaja = horaAMinutos(hora) - horaAMinutos(otra.horaReal)
        console.log('Refrigerado: ' + minutosEnCaja + ' min en la caja (máximo ' + MAXIMO_FRIO + ')')
        return
      }
    }
  }
}

// Botón "Incidencia": dice al repartidor qué hacer
function reportarIncidencia(parada, tipo) {
  parada.estado = 'incidencia'
  if (tipo === 'no listo') {
    return 'Espera 5 min. Si no está, sigue la ruta y vuelve al final.'
  } else if (tipo === 'falta producto') {
    return 'Recoge lo que haya. El comercio llama al cliente.'
  } else if (tipo === 'cliente no está') {
    return 'Llama y espera 5 min. Si no contesta, llévalo al punto de recogida.'
  } else if (tipo === 'retraso frío') {
    return 'Entrega primero el refrigerado. Si pasa de ' + MAXIMO_FRIO + ' min, devuélvelo al comercio.'
  } else {
    return 'Describe el problema a coordinación.'
  }
}

// =============================================================== 3. PRUEBA ==================================================================

// Planificar el día
const salidas = crearSalidas()
for (let i = 0; i < salidas.length; i++) {
  salidas[i].paradas = crearParadas(salidas[i])
  calcularHoras(salidas[i])
}

// Mostrar el plan
for (let i = 0; i < salidas.length; i++) {
  console.log('')
  console.log('SALIDA ' + (i + 1) + ' - franja de las ' + salidas[i].franja)
  for (let j = 0; j < salidas[i].paradas.length; j++) {
    const p = salidas[i].paradas[j]
    let texto = p.hora + ' ' + p.tipo + ' en ' + p.lugar + ' (pedidos ' + p.pedidos.join(', ') + ')'
    if (p.tipo === 'Recoger') {
      texto = texto + ' - listo antes de las ' + p.listoAntesDe
    }
    console.log(texto)
  }
}

// Simular la salida 1
console.log('')
console.log('SIMULACIÓN DE LA SALIDA 1')
const ruta = salidas[0].paradas
marcarRecogido(ruta[0], '11:17')
marcarRecogido(ruta[1], '11:23')
console.log('Incidencia en ' + ruta[2].lugar + ': ' + reportarIncidencia(ruta[2], 'no listo'))
marcarRecogido(ruta[3], '11:37')
marcarRecogido(ruta[4], '11:44')
console.log('Siguiente parada: ' + siguienteParada(ruta).lugar)
marcarEntregado(ruta, ruta[9], '12:32')
