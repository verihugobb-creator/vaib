# VAIB · Logística del piloto del Clot

Ejercicio de la segunda entrevista para las prácticas en **VAIB**. Planifico el reparto de un día del piloto en el barrio del Clot (Barcelona): 12 pedidos de 5 comercios, un solo repartidor en bicicleta con una caja de unos 6 pedidos, y entregas a domicilio o en un punto de recogida.

El ejercicio tenía cinco partes y todas están resueltas en este proyecto:

| Parte del ejercicio | Dónde está |
|---|---|
| 1. Plan del día (rutas, orden y horas) | [Plan del día](#1-plan-del-día) · `VAIB_plan_salidas.xlsx` |
| 2. Regla general (método repetible) | [Regla general](#2-regla-general) · `Vaib.js` |
| 3. Página del repartidor (boceto) | [Página del repartidor](#3-página-del-repartidor-figma) · Figma |
| 4. Incidencias | [Incidencias](#4-incidencias) |
| 5. Indicadores | [Indicadores](#5-indicadores) |

---

## Contenido del proyecto

```
vaib/
├── README.md     ← este documento
└── Vaib.js       ← funciones de la app (planificar + botones del repartidor)
```

Archivos de apoyo entregados junto a este repositorio:

- `VAIB_plan_salidas.xlsx`: el plan del día con fórmulas.
- Diseño en **Figma** de la página del repartidor (4 pantallas), también exportado como SVG: `01-Inicio.svg`, `02-Recogida.svg`, `03-Entrega.svg` y `04-Incidencia.svg`.

---

## Datos de partida

**Comercios**

| Comercio | Dirección | Horario | Refrigerado |
|---|---|---|---|
| Frutería A | C/ del Clot, 30 | 9–14 / 17–20 | No |
| Carnicería B | C/ del Clot, 50 | 9–14 / 17–20 | Sí |
| Herbolario C | C/ de Rogent, 40 | 10–14 / 17–20:30 | No |
| Charcutería D | C/ de València, 600 | 9–14:30 | Sí |
| Panadería E | C/ de Sant Joan de Malta, 10 | 7–14 / 17–20 | No |

**Pedidos**

| Pedido | Comercios | Destino | Franja |
|---|---|---|---|
| 1 | A, B | C/ Bilbao 200 | 12:00–13:00 |
| 2 | C | Punto de recogida | 13:00–14:00 |
| 3 | B, D, E | C/ Concili de Trento 40 | 12:00–13:00 |
| 4 | A | C/ Meridiana 300 | 18:00–19:00 |
| 5 | D | Punto de recogida | 12:00–13:00 |
| 6 | A, C, E | C/ Aragó 580 | 13:00–14:00 |
| 7 | B | C/ Rogent 80 | 19:00–20:00 |
| 8 | A, B, C, D | C/ Guipúscoa 50 | 12:00–13:00 |
| 9 | E | Punto de recogida | 18:00–19:00 |
| 10 | B, C | C/ Navas de Tolosa 250 | 13:00–14:00 |
| 11 | A, D | C/ Clot 120 | 12:00–13:00 |
| 12 | C, E | C/ Bilbao 150 | 18:00–19:00 |

El punto de recogida es la Plaça de Valentí Almirall. Un pedido de varios comercios se recoge en varias paradas (una bolsa por comercio) y se entrega junto en una sola.

---

## 1. Plan del día

### Cómo agrupé los pedidos

1. **Por franja horaria.** Es lo que fija el cliente, así que es lo primero. Salen 4 grupos: 12–13 (5 pedidos), 13–14 (3), 18–19 (3) y 19–20 (1).
2. **Por capacidad.** En la caja caben 6 pedidos. Las dos franjas de mediodía suman 8, así que van en salidas separadas.
3. **Recojo y luego reparto.** Los comercios están a pocos minutos entre sí, así que primero recojo todo y después entrego por cercanía. El punto de recogida va el primero, porque ahí se puede dejar el pedido antes de la franja.
4. **Los refrigerados, lo último.** La carne (B) y la charcutería (D) no pasan más de 60 min en la caja. Por eso se recogen al final de cada salida, y el pedido 7 va en una salida corta aparte en lugar de juntarse con la franja de 18–19.
5. **Respeto los horarios de los comercios.** La Charcutería D cierra a las 14:30 y no abre por la tarde; todos sus pedidos son de mediodía.

### Las 4 salidas

Tiempos usados: 3 min en cada parada y 5 min de trayecto entre paradas (los mismos que el código).

**Salida 1 · franja 12–13 · 5 pedidos (caja 5/6)**

| Llegada | Acción | Parada | Pedidos | Listo antes de |
|---|---|---|---|---|
| 11:17 | Recoger | Frutería A | 1, 8, 11 | 11:02 |
| 11:25 | Recoger | Herbolario C | 8 | 11:10 |
| 11:33 | Recoger | Panadería E | 3 | 11:18 |
| 11:41 | Recoger | Carnicería B * | 1, 3, 8 | 11:26 |
| 11:49 | Recoger | Charcutería D * | 3, 5, 8, 11 | 11:34 |
| 11:57 | Entregar | Punto de recogida | 5 | |
| 12:05 | Entregar | C/ Clot 120 | 11 | |
| 12:13 | Entregar | C/ Guipúscoa 50 | 8 | |
| 12:21 | Entregar | C/ Concili de Trento 40 | 3 | |
| 12:29 | Entregar | C/ Bilbao 200 | 1 | |

**Salida 2 · franja 13–14 · 3 pedidos (caja 3/6)**

| Llegada | Acción | Parada | Pedidos | Listo antes de |
|---|---|---|---|---|
| 12:45 | Recoger | Frutería A | 6 | 12:30 |
| 12:53 | Recoger | Herbolario C | 2, 6, 10 | 12:38 |
| 13:01 | Recoger | Panadería E | 6 | 12:46 |
| 13:09 | Recoger | Carnicería B * | 10 | 12:54 |
| 13:17 | Entregar | Punto de recogida | 2 | |
| 13:25 | Entregar | C/ Aragó 580 | 6 | |
| 13:33 | Entregar | C/ Navas de Tolosa 250 | 10 | |

**Salida 3 · franja 18–19 · 3 pedidos (caja 3/6)**

| Llegada | Acción | Parada | Pedidos | Listo antes de |
|---|---|---|---|---|
| 17:29 | Recoger | Frutería A | 4 | 17:14 |
| 17:37 | Recoger | Herbolario C | 12 | 17:22 |
| 17:45 | Recoger | Panadería E | 9, 12 | 17:30 |
| 17:53 | Entregar | Punto de recogida | 9 | |
| 18:01 | Entregar | C/ Meridiana 300 | 4 | |
| 18:09 | Entregar | C/ Bilbao 150 | 12 | |

**Salida 4 · franja 19–20 · 1 pedido (caja 1/6)**

| Llegada | Acción | Parada | Pedidos | Listo antes de |
|---|---|---|---|---|
| 18:50 | Recoger | Carnicería B * | 7 | 18:35 |
| 18:58 | Entregar | C/ Rogent 80 | 7 | |

`*` = producto refrigerado.

### Control de frío

| Pedido | Recogida refrigerada | Entrega | Minutos en la caja |
|---|---|---|---|
| 1 | 11:41 | 12:29 | 48 |
| 3 | 11:41 | 12:21 | 40 |
| 8 | 11:41 | 12:13 | 32 |
| 10 | 13:09 | 13:33 | 24 |
| 11 | 11:49 | 12:05 | 16 |
| 5 | 11:49 | 11:57 | 8 |
| 7 | 18:50 | 18:58 | 8 |

Ningún refrigerado supera el máximo de 60 minutos.

### Resultado

- 4 salidas y 12 pedidos entregados.
- El repartidor trabaja unas 3 horas en total (180 min de ruta).
- La caja va de media al 50 %: hay margen para más pedidos con el mismo repartidor.

### La hoja de cálculo (`VAIB_plan_salidas.xlsx`)

Todo el plan está en Excel con fórmulas, así que si cambia un supuesto, las horas se recalculan solas.

| Pestaña | Qué contiene |
|---|---|
| **Salidas** | Las 25 paradas con llegada, hora de "Listo", hora de salida y si la entrega cae dentro de su franja |
| **Supuestos** | Los valores editables: 3 min por parada, 5 de trayecto, 15 de margen, caja de 6 y 60 min de frío |
| **Control de frío** | Los 7 pedidos refrigerados y sus minutos en la caja |
| **Resumen** | Una fila por salida: horario, duración, ocupación de la caja y entregas a tiempo |

Las celdas amarillas con texto azul son las que se pueden cambiar (horas de salida y supuestos).

---

## 2. Regla general

### Método diario

Lo repito igual tenga más o menos pedidos:

1. Agrupo los pedidos por franja.
2. Si una franja tiene más de 6 pedidos, la divido en varias salidas por zona. Si dos franjas seguidas suman 6 o menos y no llevan refrigerados, las junto en una sola salida.
3. En cada salida, primero recojo (dejando los refrigerados para el final) y después entrego por cercanía.
4. Compruebo tres cosas: que los comercios estén abiertos, que cada entrega caiga dentro de su franja y que ningún refrigerado pase más de 60 min en la caja. Si algo falla, creo otra salida.

### Cierre de pedidos

Cada franja cierra **24 h antes de que empiece**. Por ejemplo, la franja de 12–13 del martes cierra el lunes a las 12:00. Así, a las 19:00 del día anterior ya tengo todos los pedidos.

### Aviso a comercios

- **El lunes:** previsión de la semana, para que puedan pedir stock.
- **El día anterior a las 19:30**, antes de que cierren: la lista de pedidos con la hora límite de "Listo" de cada uno (15 min antes de que llegue el repartidor).
- **El mismo día:** un recordatorio al abrir, y una alerta si a 30 min de la hora límite el pedido todavía no está marcado como Listo.

### Pseudocódigo

```
para cada franja de mañana:
    grupos = dividir(pedidosDeLaFranja, máximo 6)
    para cada grupo:
        ruta = recogidas (refrigerados al final) + entregas por cercanía
        si no cumple horarios, franja o frío → nueva salida
        avisar a cada comercio: horaListo = llegada - 15 min
```

### El código (`Vaib.js`)

Un solo archivo de JavaScript, sin librerías ni interfaz, con las funciones que haría la app. Está escrito a propósito con lo más básico (`for`, `if`/`else`, funciones normales) para que se entienda línea a línea.

```bash
node Vaib.js
```

**Funciones para planificar el día**

| Función | Qué hace |
|---|---|
| `crearSalidas()` | Agrupa los pedidos por franja, con un máximo de 6 por salida |
| `crearParadas(salida)` | Crea la lista de paradas: recogidas (refrigerados al final) y entregas en el orden del barrio |
| `esRefrigerado(pedido)` | Dice si un pedido lleva algo de un comercio refrigerado |
| `calcularHoras(salida)` | Pone la hora a cada parada y la hora de "Listo" a cada recogida |

**Funciones de la app del repartidor** (una por botón del boceto)

| Función | Botón | Qué hace |
|---|---|---|
| `siguienteParada(paradas)` | He llegado | Devuelve la primera parada pendiente |
| `marcarRecogido(parada, hora)` | Recogido | Cambia el estado y guarda la hora real para medir el frío |
| `marcarEntregado(paradas, parada, hora)` | Entregado | Comprueba si llega dentro de la franja y cuántos minutos ha ido el refrigerado en la caja |
| `reportarIncidencia(parada, tipo)` | Incidencia | Marca la parada para seguir la ruta y devuelve qué hacer según el tipo de problema |

Al final del archivo hay una prueba que planifica el día, escribe el plan en la terminal y simula la salida 1: recoge, reporta una incidencia ("pedido no listo" en la Panadería E), sigue la ruta y entrega el pedido 1.

**Simplificaciones del código**

- Todos los trayectos cuentan 5 min (en la realidad cada tramo dura distinto).
- Las entregas siguen un orden fijo por el barrio, en lugar de calcular la más cercana en cada paso.
- No junta franjas ni comprueba el horario de los comercios: eso se revisa en la hoja de cálculo.
- No espera al inicio de la franja. Por eso el pedido 7 llega a las 18:58, 2 minutos antes de su franja (19:00). La hoja de cálculo lo marca como "Antes de la franja".

---

## 3. Página del repartidor (Figma)

Diseñé en **Figma** las pantallas que vería el repartidor en el móvil durante la ruta, en tamaño de móvil (390 × 844). Hice la primera pantalla a mano y las demás las monté a partir de SVG importados en Figma, que se convierten en capas editables. Los SVG se entregan junto al repositorio.

### Estilo

- Fondo crema, títulos grandes en verde oscuro.
- Botones en forma de pastilla con sombra: **verde menta** para la acción principal y **rojo coral** para "Incidencia".
- Barra de progreso en dos tramos (paradas hechas y pendientes).
- Filas en verde claro con un círculo verde a la izquierda.
- **Asterisco rojo** para marcar lo refrigerado, con su leyenda.
- En los botones menta, el texto va en verde oscuro y no en blanco, porque el blanco sobre menta clara se lee mal en la calle con sol.

### Las 4 pantallas

**1. Inicio (ruta de la salida)**
- Cabecera con el logo y el acceso al área personal.
- Progreso de la salida ("3 de 10 paradas").
- **Siguiente parada** en una tarjeta grande: comercio, hora, pedidos que se recogen y si el pedido está "Listo".
- Botones **He llegado** e **Incidencia**, y enlace **Abrir en Maps**.
- Lista de **paradas pendientes** con hora, lugar y pedidos.

**2. Recogida en comercio**
- Nombre y dirección del comercio, y si el pedido está marcado como Listo.
- Botones **Llamar** y **Abrir en Maps**.
- Lista para **comprobar las bolsas**, una por pedido, con su destino.
- Aviso de refrigerado: bolsa isotérmica y máximo de 60 min.
- Botones **Recogido** e **Incidencia**.

**3. Entrega al cliente**
- Pedido, dirección, franja y si llega a tiempo.
- Cliente e indicaciones (piso, puerta, timbre), con **Llamar** y **Abrir en Maps**.
- **Qué entregas**: una bolsa por comercio.
- **Barra de tiempo del refrigerado** (minutos en la caja sobre el máximo de 60).
- Botones **Entregado**, **No está en casa** e **Incidencia**.

**4. Incidencia**
- Cinco motivos para elegir: pedido no listo, falta un producto, el cliente no está, retraso con refrigerado u otro problema.
- **Qué hacer** según el motivo elegido.
- Comentario opcional y **Añadir foto**.
- Botón **Enviar y avisar**.

### Por qué está ordenado así

- Cada pantalla sigue lo que necesita el repartidor en cada momento: primero **adónde voy**, luego **qué hago aquí** y al final **qué botón pulso**.
- Los botones principales son grandes y están abajo, para usarlos con una mano y con guantes.
- La pantalla de incidencias le dice qué hacer en cada caso, así no tiene que llamar para preguntar.
- Los datos que aparecen son de ejemplo, de la salida 1. Los textos entre corchetes ([Nombre del cliente], [Logo VAIB]) son huecos para datos reales.

---

## 4. Incidencias

Para cada caso tengo pensadas tres cosas: qué hace el repartidor en ese momento, a quién avisamos y cómo evitamos que se repita. Todo se registra desde el botón "Incidencia" de la app, así queda guardado para los indicadores.

| Incidencia | Qué hace el repartidor | A quién avisamos | Cómo lo evitamos |
|---|---|---|---|
| **El comercio no tiene el pedido listo** | Espera como máximo 5 min. Si no está, sigue la ruta y vuelve al final de las recogidas, si la franja lo permite | Al comercio al momento; al cliente si la entrega va a salir de su franja | Alerta al comercio 30 min antes de su hora de "Listo" si no lo ha marcado |
| **Falta un producto** | Recoge lo que haya y sigue. No espera | El comercio llama al cliente para sustituir el producto o devolverle esa parte | El comercio recibe la lista el día anterior a las 19:30 para revisar el stock |
| **El cliente no está en casa** | Llama y espera 5 min. Si no contesta, lleva el pedido al punto de recogida | Al cliente por SMS: dónde recogerlo y hasta qué hora | Aviso al cliente 15 min antes de que llegue el repartidor |
| **Refrigerado y la ruta se retrasa** | Bolsa isotérmica siempre. Si se acerca a 60 min, lo entrega el primero. Si no llega a tiempo, lo devuelve al comercio y se reprograma sin coste | Al cliente y al comercio | Los refrigerados se recogen siempre los últimos de cada salida |

**Regla general:** el repartidor nunca se queda parado más de 5 min. Si algo falla, sigue la ruta y la app avisa a quien corresponda. Así una incidencia no retrasa al resto de clientes.

---

## 5. Indicadores

Se miden con los datos que ya genera la app: cada vez que el repartidor pulsa "Recogido", "Entregado" o "Incidencia" queda guardada la hora. No hace falta apuntar nada a mano.

| Indicador | Qué mide | Cálculo | Objetivo |
|---|---|---|---|
| **Entregas a tiempo** | % de pedidos entregados dentro de su franja | Entregas en franja ÷ entregas totales | 95 % o más |
| **Pedidos listos a su hora** | % de pedidos marcados como "Listo" antes de su hora límite, por comercio | Listos a tiempo ÷ pedidos totales | 95 % o más |
| **Incidencias por cada 100 pedidos** | Cuántas veces falla algo, separado por tipo | Incidencias ÷ pedidos × 100 | Menos de 5 |
| **Pedidos por hora de ruta** | Eficiencia y coste del reparto, junto con la ocupación media de la caja | Pedidos ÷ horas de ruta | Hoy: unos 4 por hora, caja al 50 % |
| **Cadena de frío** | % de refrigerados que llegan en 60 min o menos | Refrigerados ≤ 60 min ÷ refrigerados | 100 % |

Los revisaría cada semana en una hoja de cálculo. El de pedidos por hora es el que indica cuándo hace falta un segundo repartidor.

---

## Cómo escalaría

- **Más pedidos:** el método es el mismo; las franjas de más de 6 pedidos se dividen en varias salidas por zona.
- **Señal para un segundo repartidor:** cuando las entregas empiezan a salir de su franja o la duración de las salidas se solapa.
- **Varios repartidores:** uno por zona del barrio o uno por franja.
- **Juntar franjas:** si dos franjas seguidas suman 6 pedidos o menos y no llevan refrigerados, se hace una sola salida y se ahorra tiempo.
- **Mejora propuesta:** ofrecer al cliente del pedido 7 pasar a la franja de 18–19 (por ejemplo, con un pequeño descuento) para ahorrar la salida 4.

---

## Herramientas y coste

Todo lo usado es gratuito, que encaja con no añadir gastos en un piloto.

| Herramienta | Para qué | Coste |
|---|---|---|
| Google Sheets / Excel | Plan del día con fórmulas | 0 € |
| Figma (plan gratuito) | Boceto de la página del repartidor | 0 € |
| Node.js | Ejecutar `Vaib.js` | 0 € |
| GitHub | Repositorio del proyecto | 0 € |
| Google Maps | Comprobar los tiempos de trayecto | 0 € (uso manual) |
| Asistente de IA (Claude Pro, que ya tenía) | Apoyo para redactar, revisar y programar | 0 € adicional |

No uso la API de Google Maps porque cobra por consulta: en el piloto basta con tiempos estimados y comprobarlos a mano.

---

## Limitaciones y siguientes pasos

- Los tiempos de trayecto son estimados (5 min fijos). El siguiente paso es medirlos con los datos reales del piloto.
- El código es una versión mínima para enseñar la lógica. Le faltaría comprobar horarios de comercios, esperar al inicio de la franja y dividir por zonas.
- También hice una versión con interfaz en Vue 3, pero la descarté para centrarme en la lógica y que el código fuera más fácil de explicar.
