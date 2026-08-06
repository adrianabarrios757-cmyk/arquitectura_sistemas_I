# API sencilla en TypeScript

API REST creada con TypeScript, Node.js y Express. Permite utilizar los métodos HTTP GET, POST, PUT, PATCH y DELETE. La información se guarda temporalmente en memoria, por lo que se reinicia cuando el servidor se detiene.

## Requisitos

- Node.js 22.18.0 o superior
- npm
- Git

## Instalación y ejecución

1. Clonar el repositorio:

```bash
git clone URL_DEL_REPOSITORIO
```

2. Entrar a la carpeta:

```bash
cd NOMBRE_DEL_REPOSITORIO
```

3. Cambiar a la rama de la tarea:

```bash
git switch hw-01
```

4. Instalar las dependencias:

```bash
npm install
```

5. Comprobar el código TypeScript:

```bash
npm run check
```

6. Ejecutar la API:

```bash
npm run dev
```

La API estará disponible en:

```text
http://localhost:3000
```

## Endpoints

| Método | Ruta | Descripción | Respuesta exitosa |
|---|---|---|---|
| GET | `/` | Comprueba que la API funciona | 200 |
| GET | `/productos` | Obtiene todos los productos | 200 |
| GET | `/productos/:id` | Obtiene un producto por ID | 200 |
| POST | `/productos` | Crea un producto | 201 |
| PUT | `/productos/:id` | Reemplaza completamente un producto | 200 |
| PATCH | `/productos/:id` | Actualiza una parte del producto | 200 |
| DELETE | `/productos/:id` | Elimina un producto | 204 |

La API también devuelve `400` cuando los datos son inválidos y `404` cuando el producto o la ruta no existen.

## Ejemplos de datos JSON

### POST /productos

```json
{
  "nombre": "Monitor",
  "precio": 1200
}
```

### PUT /productos/1

```json
{
  "nombre": "Teclado mecánico",
  "precio": 350
}
```

### PATCH /productos/1

```json
{
  "precio": 400
}
```
