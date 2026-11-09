# Impacto de transporte (transport-170g-v1)

Destino confirmado por GPS a pedido del usuario o elegido explícitamente entre resultados de Geoapify. El backend consulta OSRM desde las coordenadas del restaurante hasta el destino. Es un recorrido de referencia por calles para automóvil; no es una ruta ciclista, cobertura confirmada ni tiempo de entrega.

Se redondea primero la distancia a dos decimales (km), luego se multiplica por 0,17 kg/km y se redondea a dos decimales (kg). 2,50 km → 0,43 kg. Distancia cero → impacto cero. Comparación provisional de emisiones directas de automóvil frente a bicicleta (0 kg/km); no es una medición certificada ni la huella de los alimentos.

Cada pedido corresponde a una entrega de un restaurante: agregar platos no aumenta el ahorro. Cotización, mapa y pedido usan el mismo servicio. La cotización incluye `deliveryToken`, una prueba firmada con `JWT_SECRET`, audiencia exclusiva y vencimiento de 15 minutos, vinculada al restaurante, destino, distancia e impacto. Al confirmar se reutiliza ese recorrido sin depender otra vez de OSRM; una prueba inválida o vencida devuelve 409 y exige recotizar. Clientes anteriores sin prueba siguen consultando el proveedor. Precios y disponibilidad se verifican otra vez dentro de una transacción serializable; pedido, detalles y métrica se guardan juntos. No se reenvían automáticamente confirmaciones inciertas.

El pedido conserva la distancia y el CO₂ calculados en los campos existentes. El destino y la versión del método solo se usan durante la cotización; no se guardan en la base. Confirmación y Mi impacto usan los valores guardados. No se recalculan registros históricos. Los campos por plato se mantienen por compatibilidad; nuevos detalles usan CO₂ cero. La zona de nuevos pedidos es `ruta`.

## Configuración y despliegue

Configurar `GEOAPIFY_API_KEY` solo en el backend (parámetro SAM `GeoapifyApiKey`). Ver [Geoapify](https://apidocs.geoapify.com/docs/geocoding/forward-geocoding/). No se envía la clave al navegador. Búsqueda por botón, máximo cinco resultados, atribución visible. Límite de 30 peticiones/minuto por IP y proceso para endpoints públicos de entrega. En Lambda/múltiples procesos, agregar un límite global en API Gateway/WAF antes de exposición pública; el contador en memoria no comparte cuotas entre instancias. Configurar también cuota diaria en Geoapify.

No se requieren columnas ni migraciones nuevas. Se conservan las restricciones existentes: CO₂ de un pedido completado en bici = round(distancia_km × 0,17, 2), y distancia_km > 0. El mapa puede mostrar un recorrido de cero kilómetros, pero el checkout lo rechaza con 422 antes de escribir. Sin ubicación del restaurante, recorrido o proveedor disponible se ofrece reintentar, sin distancias promedio.

Las búsquedas reales requieren la clave y acceso de red.
