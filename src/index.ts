import express, { type Express, type Request, type Response } from 'express';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
}

const app: Express = express();
const PORT = 3000;

app.use(express.json());

let productos: Producto[] = [
  { id: 1, nombre: 'Teclado', precio: 150 },
  { id: 2, nombre: 'Mouse', precio: 75 }
];

let siguienteId = 3;

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    mensaje: 'API de productos funcionando correctamente',
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

app.get('/productos', (_req: Request, res: Response) => {
  res.status(200).json(productos);
});

app.get('/productos/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const producto = productos.find((item) => item.id === id);

  if (!producto) {
    res.status(404).json({ mensaje: 'Producto no encontrado' });
    return;
  }

  res.status(200).json(producto);
});

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
});
