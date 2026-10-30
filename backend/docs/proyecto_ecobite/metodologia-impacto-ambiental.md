# Metodología de impacto ambiental — EcoBite

**Versión:** 1.0  
**Alcance:** MVP educativo  
**Fecha:** 29-10-2026

## 1. Propósito

Definir una regla única, sencilla y trazable para calcular el impacto ambiental mostrado por EcoBite en los pedidos.

## 2. Naturaleza de la estimación

El campo `platillos.co2_ahorrado_unit` se utilizará como una estimación educativa interna de CO₂ por porción.

No se ha encontrado documentación que permita verificar su origen, fórmula o validación científica.

Por tanto:
- No representa una medición directa.
- No constituye una huella de carbono certificada.
- No debe presentarse como un resultado científicamente validado.

## 3. Regla de cálculo

Para cada detalle:

CO₂ del detalle = CO₂ estimado por porción × cantidad.

El impacto total del pedido corresponde a la suma del impacto de todos sus detalles.

Los resultados se almacenarán con dos decimales.

## 4. Elementos incluidos y excluidos

Incluidos:
- Valor `co2_ahorrado_unit` del platillo.
- Cantidad de porciones.
- Suma de los impactos de los detalles.

Excluidos por falta de metodología y datos verificables:
- Beneficios atribuidos al transporte.
- Beneficios atribuidos al tipo de envase.
- Factores adicionales sin fuente y regla de cálculo documentadas.

## 5. Validaciones

- El valor ambiental unitario debe ser numérico, finito y no negativo.
- La cantidad debe ser un entero positivo.
- Los cálculos deben respetar la precisión de almacenamiento de dos decimales.

## 6. Estados y persistencia

- `pending`: pedido pendiente, sin impacto contabilizado.
- `completed`: pedido con impacto calculado y registrado.
- `cancelled`: pedido que no genera impacto contabilizado.

Cada pedido completado tendrá un único registro asociado en `metricas_impacto`.

Los subtotales, el total del pedido, el registro de impacto y el cambio de estado deben persistirse dentro de una misma transacción. Si alguna operación falla, la transacción debe revertirse.

## 7. Fuentes y limitaciones

Referencias para futuras mejoras:
- Our World in Data: https://ourworldindata.org/environmental-impacts-of-food
- ISO 14067:2018: https://www.iso.org/standard/71206.html
- GHG Protocol Product Standard: https://ghgprotocol.org/product-standard

Estas referencias no validan los valores actualmente almacenados en EcoBite.

## 8. Mejoras futuras

Para evolucionar hacia un cálculo ambiental fundamentado será necesario documentar el origen de los valores, disponer de datos de ingredientes y cantidades, definir límites del análisis y establecer factores de emisión verificables.
