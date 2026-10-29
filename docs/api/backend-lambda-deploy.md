# Despliegue de la API en Lambda

La API Express de `backend/` corre como una función Lambda detrás de una API Gateway REST. El template está en `backend/template.yaml`. El handler es `dist/lambda.handler`, compilado desde `backend/src/lambda.ts`.

## Qué quedó desplegado

| Dato | Valor |
| --- | --- |
| Stack | `ecobite-api` |
| Región | `us-west-2` (Oregon) |
| Runtime | `nodejs24.x` |
| Stage | `prod` |
| URL | `https://dq31vqhgc3.execute-api.us-west-2.amazonaws.com/prod/` |

Oregon es la región del proyecto de Supabase. La función y la base quedan juntas. Un llamado desde Argentina, con la función ya caliente, tarda unos 200 a 400 ms. El arranque en frío puede sumar 1 a 3 segundos.

CloudFormation creó estos recursos:

- `EcoBiteFunction`: la función Lambda.
- `EcoBiteFunctionRole`: el rol de ejecución, con `AWSLambdaBasicExecutionRole`.
- `EcoBiteApi`: la API Gateway REST.
- `EcoBiteApiprodStage`: el stage `prod`.
- Permisos para que API Gateway invoque la función en `/` y `/{proxy+}`.

`GET /` responde `{"message":"EcoBite API funcionando"}`. `GET /api/health` responde `{"status":"ok","service":"ecobite-api"}`. Esas dos rutas no consultan Supabase. Registro y login sí lo hacen.

## Qué no se sube al repositorio

Los secretos viven en `backend/.env`. Git ignora ese archivo y también `backend/.aws-sam/`. No commitear `samconfig.toml` si guarda parámetros del deploy: ahí pueden quedar la URL de la base y el `JWT_SECRET`.

## Cómo repetir el deploy

Hace falta AWS CLI, SAM CLI y Node.js. En Git Bash el comando es `sam.cmd`, porque la instalación de Windows es `sam.cmd`.

Desde `backend/`:

```bash
set -a
source .env
set +a

npm ci
npm run build
sam.cmd validate
sam.cmd build
```

`npm run build` ejecuta `prisma generate` y `tsc`. Después de `sam.cmd build`, el paquete tiene que incluir `dist/lambda.js` y el motor `libquery_engine-rhel-openssl-3.0.x.so.node`.

```bash
region=us-west-2
account=$(aws sts get-caller-identity --query Account --output text)
bucket="ecobite-sam-artifacts-${account}"

sam.cmd deploy \
  --stack-name ecobite-api \
  --s3-bucket "$bucket" \
  --capabilities CAPABILITY_IAM \
  --region "$region" \
  --parameter-overrides \
    DatabaseUrl="$DATABASE_URL" \
    DirectUrl="$DIRECT_URL" \
    JwtSecret="$JWT_SECRET" \
    JwtExpiresIn="$JWT_EXPIRES_IN" \
    CorsOrigin="$CORS_ORIGIN"
```

`CAPABILITY_IAM` hace falta porque el template crea el rol de la función. El bucket de artefactos tiene que existir en `us-west-2`.

Variables que el deploy pide:

- `DATABASE_URL`: pooler de Supabase, puerto `6543`, con `?pgbouncer=true`.
- `DIRECT_URL`: conexión directa, puerto `5432`. El template la exige. Las migraciones no se corren desde Lambda.
- `JWT_SECRET`: al menos 32 bytes. Este primer despliegue usa un secreto nuevo. Los tokens firmados por otro proceso dejan de servir hasta que el usuario vuelve a entrar.
- `JWT_EXPIRES_IN`: en este despliegue, `7d`.
- `CORS_ORIGIN`: origen exacto del frontend. En este despliegue, `http://localhost:5173`.

## Comprobación

```bash
curl "https://dq31vqhgc3.execute-api.us-west-2.amazonaws.com/prod/"
curl "https://dq31vqhgc3.execute-api.us-west-2.amazonaws.com/prod/api/health"
```

Ambas respondieron HTTP 200 después del deploy del 15 de octubre de 2026.

## Límites de este despliegue

El límite de 10 intentos de registro o login cada 15 minutos vive en la memoria del proceso. No se comparte entre instancias en frío de Lambda.

La función no está en una VPC. Sale a internet y llega al pooler de Supabase.
