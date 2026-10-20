# HW-05 — Monorepo con Turborepo

**Curso:** Arquitectura de Sistemas I  
**Proyecto:** Control de inventario para Ferretería Barrios  
**Rama de entrega:** `hw-05` (creada desde `main`)  
**Repositorio del curso:** https://github.com/adrianabarrios757-cmyk/arquitectura_sistemas_I

## ¿De qué trata el proyecto?

Para esta actividad hice un sistema sencillo de inventario de una ferretería. La idea fue colocar el frontend, el backend y las funciones que ambos necesitan dentro de un mismo repositorio. La aplicación web muestra los productos y permite agregar nuevos productos o cambiar existencias. El backend expone una API REST y valida la información recibida.

Decidí usar **Turborepo** porque permite organizar y ejecutar las tareas de varios proyectos desde una carpeta principal. También aprovecha las dependencias entre paquetes y evita repetir tareas de compilación cuando no hubo cambios. Para los workspaces utilicé **npm**, que ya viene con Node.js, así que no es necesario instalar otro gestor.

No utilicé base de datos en esta práctica porque el objetivo principal es demostrar el uso del monorepo. Los datos de ejemplo se almacenan en memoria y se reinician cuando se detiene la API.

## Estructura

```text
hw-05-monorepo/
├── apps/
│   ├── api/                 # Backend Node.js / API REST, puerto 3001
│   │   ├── src/
│   │   │   ├── server.js
│   │   │   └── store.js
│   │   ├── scripts/
│   │   ├── test/
│   │   └── package.json
│   └── web/                 # Frontend HTML, CSS y JS, puerto 3000
│       ├── src/
│       │   ├── app.js
│       │   ├── view-model.js
│       │   └── styles.css
│       ├── scripts/
│       ├── test/
│       ├── index.html
│       └── package.json
├── packages/
│   └── shared/              # Funciones comunes a ambas aplicaciones
│       ├── src/index.js
│       ├── scripts/
│       ├── test/
│       └── package.json
├── docs/
│   └── capturas/            # Evidencias y vistas del proyecto
├── package.json            # Workspaces y scripts generales
├── turbo.json              # Tareas y dependencias de Turborepo
└── README.md
```

## Tecnologías utilizadas

- **Turborepo 2:** coordina `dev`, `build` y `test` para los tres workspaces.
- **npm workspaces:** enlaza los paquetes internos en una sola instalación.
- **Node.js 22:** API HTTP sin frameworks externos y servidor local para el frontend.
- **HTML, CSS y JavaScript:** interfaz web del inventario.
- **Node Test Runner:** pruebas automáticas sin instalar otra biblioteca.

## Cómo ejecutarlo desde cero

Se necesita **Node.js 22 o superior**, **npm** y **Git**. Los ejemplos se ejecutan desde la raíz del monorepo.

1. Clonar el repositorio y cambiar a la rama de la actividad:

   ```bash
   git clone https://github.com/adrianabarrios757-cmyk/arquitectura_sistemas_I.git
   cd arquitectura_sistemas_I
   git switch hw-05
   ```

2. Instalar las dependencias (enlaza también la librería compartida):

   ```bash
   npm install
   ```

3. Iniciar las dos aplicaciones desde la raíz:

   ```bash
   npm run dev
   ```

4. Abrir estas direcciones en un navegador:

   - **Frontend:** http://localhost:3000
   - **Backend (página de estado):** http://localhost:3001
   - **Listado JSON:** http://localhost:3001/api/products
   - **Resumen JSON:** http://localhost:3001/api/summary

   Al iniciar `npm run dev` ambas aplicaciones permanecen en ejecución. Se pueden detener con `Ctrl+C`.

5. Para verificar la compilación y ejecutar las pruebas:

   ```bash
   npm run build
   npm run test
   ```

   En la prueba local se ejecutaron **10 pruebas y las 10 terminaron correctamente**.

> **Nota:** La primera instalación necesita acceso a Internet para descargar Turborepo. Después de instalar, los comandos se pueden ejecutar desde la raíz. No hay cuentas, claves ni variables de entorno obligatorias.

## Comandos disponibles

| Comando desde la raíz | ¿Qué hace? |
| --- | --- |
| `npm install` | Instala dependencias y conecta los workspaces. |
| `npm run dev` | Inicia frontend y backend al mismo tiempo. |
| `npm run dev:web` | Inicia solamente el frontend (puerto 3000). |
| `npm run dev:api` | Inicia solamente el backend (puerto 3001). |
| `npm run build` | Compila/prepara todos los paquetes en su carpeta `dist/`. |
| `npm run build:web` | Prepara solo el frontend y las dependencias necesarias. |
| `npm run build:api` | Prepara solo el backend y las dependencias necesarias. |
| `npm run test` | Ejecuta todas las pruebas del monorepo. |
| `npm run test:web` | Ejecuta pruebas del frontend. |
| `npm run test:api` | Ejecuta pruebas del backend. |
| `npm run start:web` | Sirve el frontend desde sus archivos fuente. |
| `npm run start:api` | Inicia el backend sin modo de vigilancia. |

**Ejecutar cada aplicación por separado:** usar dos terminales, una con `npm run dev:api` y otra con `npm run dev:web`. El frontend necesita que el backend esté ejecutándose para consultar los productos.

## Librería compartida: `@barrios/shared`

La librería se encuentra en `packages/shared/src/index.js` y está declarada como dependencia de los dos workspaces (`apps/api/package.json` y `apps/web/package.json`). No se duplicaron esas funciones.

| Función / dato | Para qué se utiliza |
| --- | --- |
| `formatGTQ()` | Formatea los precios en quetzales en ambas aplicaciones. |
| `stockStatus()` | Clasifica productos como Disponible, Stock bajo o Agotado. |
| `inventorySummary()` | Calcula productos, unidades, alertas y valor total. |
| `validateProduct()` | Revisa los datos antes de crear productos. |
| `CATEGORIES` | Mantiene las mismas categorías en la API y el formulario. |

**Demostración de uso real:**

- **Frontend:** `apps/web/src/view-model.js` importa las funciones de resumen, moneda y estado de `@barrios/shared`; `apps/web/src/app.js` importa categorías y validación.
- **Backend:** `apps/api/src/server.js` importa las mismas funciones de `@barrios/shared` para validar entradas, devolver un resumen JSON y mostrar su propia pantalla de estado.

Por ejemplo, un producto con **4 unidades** aparece como **Stock bajo** en ambas aplicaciones. El precio **Q 85.00** se representa con el mismo formato en las dos. Si modificamos la regla en la librería, los dos proyectos usan ese cambio.

## Funcionalidades y rutas de la API

| Método | Endpoint | Descripción |
| --- | --- | --- |
| `GET` | `/` | Página visual del backend. |
| `GET` | `/api/health` | Comprueba que la API está activa. |
| `GET` | `/api/categories` | Obtiene las categorías compartidas. |
| `GET` | `/api/products` | Lista todos los productos. |
| `GET` | `/api/summary` | Muestra los valores calculados por `inventorySummary()`. |
| `POST` | `/api/products` | Registra un producto válido. |
| `PATCH` | `/api/products/:id` | Suma o resta una unidad (`{ "delta": 1 }` o `{ "delta": -1 }`). |
| `DELETE` | `/api/products/:id` | Elimina un producto. |

Ejemplo para agregar un producto:

```json
{
  "name": "Cinta métrica",
  "category": "Herramientas",
  "price": 35,
  "stock": 8
}
```

La API impide números negativos de existencias y muestra mensajes cuando la información es incorrecta.

## Capturas y evidencias

El kit incluye `scripts/crear-capturas.ps1`, que toma capturas reales desde Edge/Chrome en Windows **antes de publicar la rama**. Los archivos se guardan en `docs/capturas/` con los nombres `01-frontend-funcionando.png` y `02-backend-funcionando.png`. Si el navegador de tu equipo no está disponible, consulta `docs/capturas/INSTRUCCIONES.md`. Para comprobar las aplicaciones manualmente, iniciar `npm run dev` y visitar el frontend y el backend en las direcciones indicadas. El frontend enseña las tarjetas del resumen, la tabla y el rótulo de la librería; el backend enseña el estado del servicio y los valores calculados con esas mismas funciones.

## Conventional Commits

Los cambios realizados para esta actividad deben registrarse siguiendo la especificación **Conventional Commits**. El commit de esta entrega se hace en `hw-05` y se crea después de partir de `main`:

```bash
git switch main
git switch -c hw-05
# Copiar o crear los archivos del monorepo
git add .
git commit -m "feat(monorepo): crear aplicaciones y paquete compartido"
git push -u origin hw-05
```

Otros ejemplos válidos para futuras modificaciones:

```text
docs(readme): explicar comandos y estructura
fix(api): corregir validacion del stock
test(shared): agregar casos para calcular inventario
```

---

**Conclusión:** Con esta práctica comprendí cómo tener varios proyectos en un solo repositorio, reutilizar funciones sin copiarlas y ejecutar las tareas desde la raíz. La parte más útil de Turborepo es que los proyectos quedan organizados y es más fácil mantenerlos cuando hay cambios.
