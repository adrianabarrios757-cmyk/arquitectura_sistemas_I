# HW-04 — Primer deployment con Vite, GitHub Actions y CloudFront

Proyecto de página web estática para desplegar automáticamente a Amazon S3 y distribuirla públicamente a través del CDN de Amazon CloudFront.

## URL pública del CDN

**Pendiente de completar después de crear CloudFront:** `https://TU-DOMINIO.cloudfront.net`

> Sustituir por el **Distribution domain name** real. No inventar una URL.

## Tecnologías

- Vite + JavaScript + CSS
- GitHub Actions (pipeline automático)
- Amazon S3 (almacenamiento de archivos estáticos)
- Amazon CloudFront (CDN con HTTPS)

## Ejecución local

```bash
npm install
npm run dev
npm run build
npm run preview
```

Ejecuta `npm install` en tu equipo para generar `package-lock.json` y agrégalo al repositorio. El pipeline también utiliza `npm install` para no depender de ese archivo. `npm run build` crea la carpeta `dist/` que publica el pipeline.

## Flujo CI/CD

1. Al realizar `push` a `hw-04` se ejecuta `.github/workflows/deploy.yml`.
2. **Build:** instala dependencias y compila `dist/` mediante Vite.
3. **Upload:** sube `dist/` a S3 con `aws s3 sync`.
4. **Invalidate:** invalida `/*` para que CloudFront recargue el contenido.

## Capturas de evidencia

Agregar las capturas reales tomadas durante la configuración y ejecución:

### 1. CloudFront creado y configurado

<!-- Insertar después: ![CloudFront](./evidencias/cloudfront.png) -->

### 2. Bucket S3 con archivos publicados

<!-- Insertar después: ![S3](./evidencias/s3.png) -->

### 3. Última ejecución exitosa de GitHub Actions

<!-- Insertar después: ![Actions](./evidencias/actions.png) -->

### 4. Sitio web público por el CDN

<!-- Insertar después: ![Sitio](./evidencias/sitio.png) -->

## Configuración requerida en GitHub

Ruta: **Settings → Secrets and variables → Actions**

| Tipo | Nombre | Valor |
| --- | --- | --- |
| Secret | `AWS_ACCESS_KEY_ID` | Access key del usuario IAM con permisos mínimos |
| Secret | `AWS_SECRET_ACCESS_KEY` | Secret key del mismo usuario IAM |
| Variable | `AWS_REGION` | `us-east-2` (o región real del bucket) |
| Variable | `S3_BUCKET` | Nombre real del bucket, sin `s3://` |
| Variable | `CLOUDFRONT_DISTRIBUTION_ID` | ID real de la distribución, por ejemplo `E...` |

**Nunca guardar claves reales en el repositorio.** El archivo `aws/iam-permissions.json` contiene una plantilla de política IAM: reemplazar sus marcadores antes de usarla.

## Rama de entrega

`hw-04` creada a partir de `main`, con varios commits verificables. El enlace de entrega debe apuntar a la rama o al repositorio correspondiente.


## Configuración de AWS (pasos que requieren tu cuenta)

1. En AWS S3, región `us-east-2`, crea un bucket privado con **Block all public access** activado. No habilites S3 Static Website Hosting.
2. En CloudFront crea una distribución con origen **S3 bucket (endpoint REST)**, no el endpoint de sitio web. Elige **Origin Access Control (OAC)** y permite que CloudFront acceda al bucket.
3. En **S3 → Bucket → Permissions → Bucket policy**, agrega una política de lectura para CloudFront, partiendo de `aws/cloudfront-oac-bucket-policy.json`; sustituye los tres marcadores por tus identificadores reales. Si el asistente de CloudFront ofrece copiar la política, también sirve.
4. En CloudFront configura **Default root object = index.html**, redirección HTTP a HTTPS y espera el estado **Deployed**.
5. En IAM, crea una identidad para GitHub Actions con los permisos de `aws/iam-permissions.json`, sustituyendo sus marcadores. Crea las claves de acceso y guárdalas **solamente** como secretos en GitHub. Para producción real, prefiere OIDC con credenciales temporales.
6. En GitHub crea los secrets y variables de la tabla anterior. Ejecuta el workflow en la rama `hw-04` y confirma que los tres pasos finalicen sin errores.
7. Abre `https://TU-DOMINIO.cloudfront.net` usando el dominio verdadero que muestra CloudFront. Sustituye la URL ficticia en este README.
8. Toma capturas **reales**, guárdalas en `evidencias/` como `cloudfront.png`, `s3.png`, `actions.png`, `sitio.png` y cambia los comentarios HTML de arriba por las etiquetas Markdown de imagen indicadas.

## Commits para la entrega

Desde tu repositorio, con `main` actualizado, crea `hw-04` con `git switch -c hw-04` y realiza varios commits reales, por ejemplo uno para Vite y sitio, otro para workflow y AWS y otro para README y capturas. Después ejecuta `git push -u origin hw-04`. Si `hw-04` ya existe, utilízala y no la recrees.

## Comprobación

- `npm run build` genera `dist/`.
- El workflow se ejecuta con push a `hw-04` y tiene una última ejecución exitosa.
- En el bucket están `index.html` y los archivos compilados en `assets/`.
- La URL pública de CloudFront responde con la página actualizada tras invalidación.
- El README incluye dominio real y capturas, y el historial muestra múltiples commits.

**Aviso:** este repositorio es una plantilla completa de código, no un despliegue ya ejecutado. Las credenciales, los identificadores de AWS, los screenshots y la URL pública solo pueden obtenerse desde tus propias cuentas.
