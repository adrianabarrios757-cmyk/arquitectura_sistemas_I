# API de productos con documentación Swagger

API sencilla desarrollada en TypeScript y Express. Permite utilizar los métodos HTTP GET, POST, PUT, PATCH y DELETE. La información se guarda temporalmente en memoria, por lo que no utiliza una base de datos.

## Requisitos

- Node.js 22.18.0 o una versión superior.
- npm.

## Instalación

Abrir una terminal dentro de la carpeta del proyecto y ejecutar:

```bash
npm install
```

## Revisar el código TypeScript

```bash
npm run check
```

## Ejecutar el proyecto

Para ejecutar la API en modo desarrollo:

```bash
npm run dev
```

También se puede ejecutar con:

```bash
npm start
```

La API estará disponible en:

```text
http://localhost:3000
```

## Documentación automática

La documentación de Swagger estará disponible en:

```text
http://localhost:3000/docs
```

La especificación OpenAPI en formato JSON estará disponible en:

```text
http://localhost:3000/docs.json
```

Desde la página `/docs` se pueden visualizar y probar los métodos de la API.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Comprueba que la API funciona |
| GET | `/productos` | Obtiene todos los productos |
| GET | `/productos/:id` | Obtiene un producto por su identificador |
| POST | `/productos` | Crea un producto |
| PUT | `/productos/:id` | Reemplaza completamente un producto |
| PATCH | `/productos/:id` | Actualiza parcialmente un producto |
| DELETE | `/productos/:id` | Elimina un producto |
| GET | `/docs` | Muestra la documentación automática |
| GET | `/docs.json` | Muestra la especificación OpenAPI |

## Ejemplo para crear un producto

```json
{
  "nombre": "Monitor",
  "precio": 1200
}
```

## Códigos de respuesta

| Código | Significado |
|---|---|
| 200 | Solicitud realizada correctamente |
| 201 | Producto creado correctamente |
| 204 | Producto eliminado correctamente |
| 400 | Datos enviados incorrectamente |
| 404 | Producto o ruta no encontrada |

## Nota

Los productos se guardan en un arreglo mientras el servidor está encendido. Al detener o reiniciar la API, la información vuelve a su estado inicial.
