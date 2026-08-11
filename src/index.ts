import express, { type Express, type Request, type Response } from 'express';

interface Libro {
    id: number;
    titulo: string;
    autor: string;
    prestado: boolean;
}

const app: Express = express();
const PORT = 3000;

app.use(express.json());

let libros: Libro[] = [
    { id: 1, titulo: 'El Principito', autor: 'Antoine de Saint-Exupery', prestado: false },
    { id: 2, titulo: 'Don Quijote de la Mancha', autor: 'Miguel de Cervantes', prestado: true }
];

let siguienteId = 3;

app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
        mensaje: 'API de Biblioteca Digital funcionando correctamente',
        endpoints: {
            listarLibros: 'GET /books',
            agregarLibro: 'POST /books',
            fitness: 'GET /health/fitness'
        }
    });
});

app.get('/books', (_req: Request, res: Response) => {
    res.status(200).json(libros);
});

app.post('/books', (req: Request, res: Response) => {

    if (!req.is('application/json')) {
        res.status(400).json({
            mensaje: 'El cuerpo de la solicitud debe ser JSON'
        });
        return;
    }

    const { titulo, autor, prestado } = req.body;

    if (
        typeof titulo !== 'string' ||
        titulo.trim() === '' ||
        typeof autor !== 'string' ||
        autor.trim() === '' ||
        typeof prestado !== 'boolean'
    ) {
        res.status(400).json({
            mensaje: 'Debe enviar titulo, autor y prestado correctamente'
        });
        return;
    }

    const nuevoLibro: Libro = {
        id: siguienteId,
        titulo: titulo.trim(),
        autor: autor.trim(),
        prestado
    };

    siguienteId++;
    libros.push(nuevoLibro);

    res.status(201).json({
        mensaje: 'Libro agregado correctamente',
        libro: nuevoLibro
    });
});

app.get('/health/fitness', (_req: Request, res: Response) => {

    const totalLibros = libros.length;

    const librosPrestados = libros.filter(
        (libro) => libro.prestado === true
    ).length;

    const ratioPrestados =
        totalLibros === 0 ? 0 : librosPrestados / totalLibros;

    const capacidadCorrecta = totalLibros <= 100;
    const ratioCorrecto = ratioPrestados < 0.80;

    const reporte = {
        estado:
            capacidadCorrecta && ratioCorrecto
                ? 'Healthy'
                : 'Degradacion de Calidad',

        metricas: {
            librosTotales: totalLibros,
            librosPrestados: librosPrestados,
            porcentajePrestados: `${(ratioPrestados * 100).toFixed(2)}%`,
            capacidadMaxima: 100,
            porcentajeMaximoPrestados: '80%'
        }
    };

    if (!capacidadCorrecta || !ratioCorrecto) {
        res.status(503).json(reporte);
        return;
    }

    res.status(200).json(reporte);
});

app.use((_req: Request, res: Response) => {
    res.status(404).json({
        mensaje: 'Ruta no encontrada'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});