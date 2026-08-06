import express, { type Express, type Request, type Response } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
}

const app: Express = express();
const PORT = 3000;

app.use(express.json());

const opcionesSwagger: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de productos',
      version: '1.0.0',
      description: 'API creada en TypeScript para administrar productos sin utilizar una base de datos.'
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor local'
      }
    ],
    components: {
      schemas: {
        Producto: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            nombre: {
              type: 'string',
              example: 'Teclado'
            },
            precio: {
              type: 'number',
              example: 150
            }
          }
        },
        DatosProducto: {
          type: 'object',
          required: ['nombre', 'precio'],
          properties: {
            nombre: {
              type: 'string',
              example: 'Monitor'
            },
            precio: {
              type: 'number',
              minimum: 0,
              example: 1200
            }
          }
        },
        ActualizacionProducto: {
          type: 'object',
          properties: {
            nombre: {
              type: 'string',
              example: 'Monitor gamer'
            },
            precio: {
              type: 'number',
              minimum: 0,
              example: 1500
            }
          }
        },
        MensajeError: {
          type: 'object',
          properties: {
            mensaje: {
              type: 'string',
              example: 'Producto no encontrado'
            }
          }
        }
      }
    }
  },
  apis: ['./src/index.ts']
};

const documentoSwagger = swaggerJsdoc(opcionesSwagger);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(documentoSwagger, {
  customSiteTitle: 'Documentación de la API'
}));

app.get('/docs.json', (_req: Request, res: Response) => {
  res.status(200).json(documentoSwagger);
});

let productos: Producto[] = [
  { id: 1, nombre: 'Teclado', precio: 150 },
  { id: 2, nombre: 'Mouse', precio: 75 }
];

let siguienteId = 3;

/**
 * @openapi
 * /:
 *   get:
 *     summary: Verifica que la API esté funcionando
 *     tags:
 *       - Estado
 *     responses:
 *       200:
 *         description: La API está funcionando correctamente
 */
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    mensaje: 'API de productos funcionando correctamente',
    documentacion: '/docs',
    endpoints: {
      obtenerTodos: 'GET /productos',
      obtenerUno: 'GET /productos/:id',
      crear: 'POST /productos',
      reemplazar: 'PUT /productos/:id',
      actualizar: 'PATCH /productos/:id',
      eliminar: 'DELETE /productos/:id'
    }
  });
});

/**
 * @openapi
 * /productos:
 *   get:
 *     summary: Obtiene todos los productos
 *     tags:
 *       - Productos
 *     responses:
 *       200:
 *         description: Lista de productos obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Producto'
 */
app.get('/productos', (_req: Request, res: Response) => {
  res.status(200).json(productos);
});

/**
 * @openapi
 * /productos/{id}:
 *   get:
 *     summary: Obtiene un producto por su identificador
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MensajeError'
 */
app.get('/productos/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const producto = productos.find((item) => item.id === id);

  if (!producto) {
    res.status(404).json({ mensaje: 'Producto no encontrado' });
    return;
  }

  res.status(200).json(producto);
});

/**
 * @openapi
 * /productos:
 *   post:
 *     summary: Crea un producto nuevo
 *     tags:
 *       - Productos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DatosProducto'
 *     responses:
 *       201:
 *         description: Producto creado correctamente
 *       400:
 *         description: Los datos enviados no son válidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MensajeError'
 */
app.post('/productos', (req: Request, res: Response) => {
  const { nombre, precio } = req.body;

  if (typeof nombre !== 'string' || nombre.trim() === '' || typeof precio !== 'number' || precio < 0) {
    res.status(400).json({
      mensaje: 'Datos inválidos. Debe enviar un nombre y un precio mayor o igual a 0'
    });
    return;
  }

  const nuevoProducto: Producto = {
    id: siguienteId,
    nombre: nombre.trim(),
    precio
  };

  siguienteId++;
  productos.push(nuevoProducto);

  res.status(201).json({
    mensaje: 'Producto creado correctamente',
    producto: nuevoProducto
  });
});

/**
 * @openapi
 * /productos/{id}:
 *   put:
 *     summary: Reemplaza completamente un producto
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DatosProducto'
 *     responses:
 *       200:
 *         description: Producto reemplazado correctamente
 *       400:
 *         description: Los datos enviados no son válidos
 *       404:
 *         description: Producto no encontrado
 */
app.put('/productos/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const indice = productos.findIndex((item) => item.id === id);

  if (indice === -1) {
    res.status(404).json({ mensaje: 'Producto no encontrado' });
    return;
  }

  const { nombre, precio } = req.body;

  if (typeof nombre !== 'string' || nombre.trim() === '' || typeof precio !== 'number' || precio < 0) {
    res.status(400).json({
      mensaje: 'Para usar PUT debe enviar nombre y precio válidos'
    });
    return;
  }

  const productoActualizado: Producto = {
    id,
    nombre: nombre.trim(),
    precio
  };

  productos[indice] = productoActualizado;

  res.status(200).json({
    mensaje: 'Producto reemplazado correctamente',
    producto: productoActualizado
  });
});

/**
 * @openapi
 * /productos/{id}:
 *   patch:
 *     summary: Actualiza uno o más datos de un producto
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActualizacionProducto'
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente
 *       400:
 *         description: Los datos enviados no son válidos
 *       404:
 *         description: Producto no encontrado
 */
app.patch('/productos/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const producto = productos.find((item) => item.id === id);

  if (!producto) {
    res.status(404).json({ mensaje: 'Producto no encontrado' });
    return;
  }

  const { nombre, precio } = req.body;

  if (nombre === undefined && precio === undefined) {
    res.status(400).json({
      mensaje: 'Debe enviar al menos el nombre o el precio'
    });
    return;
  }

  if (nombre !== undefined && (typeof nombre !== 'string' || nombre.trim() === '')) {
    res.status(400).json({ mensaje: 'El nombre no es válido' });
    return;
  }

  if (precio !== undefined && (typeof precio !== 'number' || precio < 0)) {
    res.status(400).json({ mensaje: 'El precio no es válido' });
    return;
  }

  if (nombre !== undefined) {
    producto.nombre = nombre.trim();
  }

  if (precio !== undefined) {
    producto.precio = precio;
  }

  res.status(200).json({
    mensaje: 'Producto actualizado parcialmente',
    producto
  });
});

/**
 * @openapi
 * /productos/{id}:
 *   delete:
 *     summary: Elimina un producto
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Producto eliminado correctamente
 *       404:
 *         description: Producto no encontrado
 */
app.delete('/productos/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const indice = productos.findIndex((item) => item.id === id);

  if (indice === -1) {
    res.status(404).json({ mensaje: 'Producto no encontrado' });
    return;
  }

  productos.splice(indice, 1);
  res.status(204).send();
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`Documentación disponible en http://localhost:${PORT}/docs`);
});
