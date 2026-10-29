# Imágenes del catálogo EcoBite

Contrato de las fotos que devuelven `GET /api/restaurantes` y `GET /api/restaurantes/:id`. La API devuelve una URL. No retransmite el archivo. La web de React carga la imagen directo desde esa URL.

Supabase no cambia. `restaurantes` y `platillos` no tienen columna de imagen.

## 1. Bucket y región

| Dato | Valor |
| --- | --- |
| Bucket | `ecobite-images-265751834002` |
| Región | `us-west-2` (Oregon) |
| Stack | `ecobite-images` |
| Template | `backend/template-images.yaml` |

La región es la misma de la API y del proyecto de Supabase. El bucket es privado: las ACL públicas están bloqueadas, no se puede listar el contenido y los objetos se cifran con SSE-S3.

## 2. Cómo se ven las fotos

CloudFront las sirve por HTTPS. El bucket sigue privado. CloudFront lo lee con un origin access control, y la política del bucket solo permite `s3:GetObject` desde esa distribución, y solo en los prefijos de abajo.

Quien tenga la URL de CloudFront puede abrir la imagen sin estar autenticado. La URL directa de S3 responde `403`.

La API arma cada `imageUrl` con la variable `IMAGES_BASE_URL`, sin barra al final. En la Lambda publicada el valor es:

```text
IMAGES_BASE_URL=https://dmcut9fuk1tgy.cloudfront.net
```

El id de la distribución es `E1Q0KZTYT6EOF6`. El template de la API, `backend/template.yaml`, pasa esa variable a la función. No hace falta commitear el valor: está como default del parámetro `ImagesBaseUrl`.

Una petición del navegador queda así:

```text
https://dmcut9fuk1tgy.cloudfront.net/dishes/1.jpg
```

El endpoint de sitio web de S3 y el bucket `ecobite-sam-artifacts-265751834002` no forman parte de este contrato. Ese segundo bucket guarda los artefactos del deploy de SAM.

## 3. Carga y asociación

No hay endpoint de carga. Quien tenga permiso de escritura en el bucket sube el archivo con la AWS CLI. La clave del objeto es la asociación. No hace falta una columna en la base.

| Objeto | Clave | `imageUrl` |
| --- | --- | --- |
| Restaurante | `restaurants/{id_restaurante}.jpg` | `{IMAGES_BASE_URL}/restaurants/{id}.jpg` |
| Plato | `dishes/{id_platillo}.jpg` | `{IMAGES_BASE_URL}/dishes/{id}.jpg` |
| Banner | `banners/{slug}.jpg` | Ningún endpoint lo devuelve |

`id` es la clave primaria que ya devuelve el catálogo. El archivo es JPEG (`.jpg`, `Content-Type: image/jpeg`). Una foto por restaurante y una por plato. Reemplazar un archivo mantiene la misma clave.

`GET /api/restaurantes` pone `imageUrl` en cada restaurante. `GET /api/restaurantes/:id` lo pone en el restaurante y en cada plato. Lo arma `backend/src/services/catalog.service.ts` con `process.env.IMAGES_BASE_URL`. Si la variable no está definida, esos campos vuelven `null`.

`GET /api/home` incluye el campo `imageUrl` en restaurantes y platos destacados, pero hoy lo deja en `null`. Este contrato no cubre Home.

La API devuelve la URL convencional para cada restaurante activo y cada plato disponible. No consulta S3 para ver si el archivo existe. Si todavía no se subió, CloudFront responde `403` y el frontend muestra un reemplazo.

Subida desde la máquina que tiene las credenciales de AWS:

```bash
aws s3 cp ./foto.jpg s3://ecobite-images-265751834002/dishes/12.jpg --content-type image/jpeg --region us-west-2
aws s3 cp ./local.jpg s3://ecobite-images-265751834002/restaurants/3.jpg --content-type image/jpeg --region us-west-2
```

Si el archivo local es `.jpeg` y la API pide `.jpg`, la clave de destino igual termina en `.jpg`.

CloudFront cachea un archivo reemplazado. Después de pisar un objeto que ya se había pedido, hay que invalidar esa ruta:

```bash
aws cloudfront create-invalidation --distribution-id E1Q0KZTYT6EOF6 --paths "/dishes/12.jpg"
```

## 4. Fotos de muestra ya cargadas

El 29 de octubre de 2026 se subieron fotos de muestra. No son fotos reales de cada local.

| Claves | Contenido |
| --- | --- |
| `restaurants/1.jpg` … `restaurants/7.jpg` | Una foto distinta por restaurante activo: Verde Bowl, Huerta Norte, Raiz Caballito, Puerto Verde, Bici Nunez, Almagro Clasico y Palermo Verde |
| `dishes/1.jpg`, `4`, `7`, `10`, `13`, `16`, `19` | La misma foto de bowl de quinoa |
| `dishes/2.jpg`, `5`, `8`, `11`, `14`, `17`, `20` | La misma foto de wrap de lentejas |
| `dishes/3.jpg`, `6`, `9`, `12`, `15`, `18`, `21` | La misma foto de ensalada |

## Deploy del bucket

Quien despliega también necesita `backend/iam/ecobite-images-deploy.json` (`EcoBiteImagesDeploy`). `EcoBiteSamDeploy` solo permite el stack `ecobite-api` y no permite CloudFront.

`sam validate --lint` acepta el template. El deploy es idempotente:

```bash
aws cloudformation deploy \
  --template-file backend/template-images.yaml \
  --stack-name ecobite-images \
  --region us-west-2 \
  --no-fail-on-empty-changeset
```

## Comprobación

El 25 de octubre de 2026 un JPEG en `banners/_healthcheck.jpg` respondió `200` por CloudFront y `403` por la URL directa de S3. Ese objeto de prueba se borró. Las fotos de muestra de la sección 4 son las que quedaron en el bucket.
