# EcoBite — Análisis de reglas de negocio

## Usuario

- Cada usuario tiene un identificador único.
- El email debe ser único.
- Un usuario puede realizar múltiples pedidos.
- Cada pedido debe quedar asociado al usuario que lo realizó.

## Restaurante

- Cada restaurante tiene un identificador único.
- Un restaurante puede ofrecer múltiples productos.
- Un restaurante puede recibir múltiples pedidos.
- Solo los restaurantes activos deben aparecer en el catálogo.

## Producto

- Cada producto pertenece a un restaurante.
- Cada producto tiene nombre y precio.
- Cada producto puede definir un tipo de envase.
- El tipo de envase debe conservarse en el pedido para poder calcular métricas ambientales.

## Pedido

- Cada pedido pertenece a un usuario.
- Cada pedido pertenece a un restaurante.
- Un pedido contiene uno o más productos.
- El checkout del MVP es simulado y no procesa pagos reales.
- El pedido debe almacenar su monto total.
- Los estados propuestos inicialmente son:
  - pending
  - completed
  - cancelled

## Cancelación de pedidos

El brief no define todavía una política concreta de cancelación.

Por lo tanto:

- El modelo contemplará el estado `cancelled`.
- La lógica de cancelación no se implementará hasta que Producto/PM defina las reglas.
- Un pedido cancelado no se considera un pedido completado.
- Queda pendiente definir quién puede cancelar y hasta qué momento.

## Cálculo de CO2 ahorrado

Según la matriz entregada por Data, para calcular el impacto ambiental cada pedido debe almacenar:

- `distancia_km`
- `tipo_transporte`

Y los ítems del pedido deben conservar:

- `tipo_envase`

La fórmula propuesta para el MVP es:

CO2_ahorrado_kg =
distancia_km ×
(factor_combustion_g_per_km - factor_ecobite_g_per_km)
÷ 1000

Factores provisionales:

- Vehículo a combustión: 180 g CO2/km
- Bicicleta: 0 g CO2/km
- Vehículo eléctrico: 50 g CO2/km

El sistema debe conservar los datos utilizados en el cálculo para poder auditar las métricas posteriormente.

## Datos mínimos del pedido para métricas

Al completar el checkout simulado deben persistirse al menos:

- usuario
- restaurante
- monto total
- distancia estimada
- tipo de transporte
- productos y cantidades
- tipo de envase
- estado del pedido
- fecha de creación