# EcoBite catalog images

Contract for the photos returned by `GET /api/restaurantes` and `GET /api/restaurantes/:id`. The API returns a URL. It does not stream the file. The React app loads the image directly from that URL.

Supabase is unchanged. `restaurantes` and `platillos` have no image column.

## 1. Bucket and region

| Item | Value |
| --- | --- |
| Bucket | `ecobite-images-265751834002` |
| Region | `us-west-2` (Oregon) |
| Stack | `ecobite-images` |
| Template | `backend/template-images.yaml` |

The region is the same one used by the API and by the Supabase project. The bucket is private: public ACLs are blocked, listing is blocked, and objects are encrypted with SSE-S3.

## 2. How images are served

CloudFront serves the objects over HTTPS. The bucket stays private. CloudFront reads it through an origin access control, and the bucket policy allows `s3:GetObject` only from that distribution, only under the prefixes below.

The API builds each `imageUrl` from the base URL in `IMAGES_BASE_URL`. The value has no trailing slash. Do not commit it. The deployed stack output is:

```text
IMAGES_BASE_URL=https://dmcut9fuk1tgy.cloudfront.net
```

Distribution id: `E1Q0KZTYT6EOF6`.

A browser request looks like this:

```text
{IMAGES_BASE_URL}/dishes/12.jpg
```

The S3 website endpoint and the SAM artifacts bucket are not part of this contract.

## 3. Upload and association

There is no upload endpoint. Someone with permission to write to the bucket uploads the file with the AWS CLI. The object key is the association. No database column is required.

| Object | Key | `imageUrl` |
| --- | --- | --- |
| Restaurant | `restaurants/{id_restaurante}.jpg` | `{IMAGES_BASE_URL}/restaurants/{id}.jpg` |
| Dish | `dishes/{id_platillo}.jpg` | `{IMAGES_BASE_URL}/dishes/{id}.jpg` |
| Banner | `banners/{slug}.jpg` | Not returned by the current API |

`id` is the integer primary key already returned by the catalog. The file is JPEG (`.jpg`, `Content-Type: image/jpeg`). One photo per restaurant and one photo per dish. Replacing a file keeps the same key.

`GET /api/restaurantes` sets `imageUrl` on each restaurant. `GET /api/restaurantes/:id` sets it on the restaurant and on each dish. `GET /api/home` does not include `imageUrl` in this contract.

The API returns the conventional URL for every active restaurant and every available dish. It does not call S3 to check that the object exists. If the file has not been uploaded yet, CloudFront responds with `403` and the frontend shows a placeholder.

Upload from the machine that holds AWS credentials:

```bash
aws s3 cp ./foto.jpg s3://ecobite-images-265751834002/dishes/12.jpg --content-type image/jpeg --region us-west-2
aws s3 cp ./local.jpg s3://ecobite-images-265751834002/restaurants/3.jpg --content-type image/jpeg --region us-west-2
```

CloudFront caches a replaced file. After overwriting an object that was already requested, invalidate that path:

```bash
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/dishes/12.jpg"
```

`DISTRIBUTION_ID` for this deployment is `E1Q0KZTYT6EOF6`.

## 4. Buckets that already exist

Do not reuse `ecobite-sam-artifacts-265751834002`. That bucket stores SAM deployment artifacts for the API. Catalog images use `ecobite-images-265751834002` only.

## What the backend changes

`backend/src/services/catalog.service.ts` currently returns `imageUrl: null`. Replace those two assignments with the URLs in the table above, using `process.env.IMAGES_BASE_URL`. Leave the Prisma schema and Supabase as they are.

`IMAGES_BASE_URL` is listed empty in `backend/.env.example`. The running Lambda does not need it until the catalog code reads it. Adding it to the API stack is a separate deploy, after that code is on the branch that gets published.

## Deploy

The deploy user also needs `backend/iam/ecobite-images-deploy.json` (`EcoBiteImagesDeploy`). `EcoBiteSamDeploy` only allows the `ecobite-api` stack and does not allow CloudFront.

`sam validate --lint` accepts the template. Deploy is idempotent:

```bash
aws cloudformation deploy \
  --template-file backend/template-images.yaml \
  --stack-name ecobite-images \
  --region us-west-2 \
  --no-fail-on-empty-changeset
```

## Smoke test

On 25 October 2026 a JPEG uploaded to `banners/_healthcheck.jpg` returned `200` from `https://dmcut9fuk1tgy.cloudfront.net/banners/_healthcheck.jpg` with `Content-Type: image/jpeg`. The same key on the S3 website URL returned `403`. The object was deleted and that path was invalidated. The bucket is empty.
