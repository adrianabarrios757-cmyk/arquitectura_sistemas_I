# Capturas para la entrega

Las capturas **01-frontend-funcionando.png** y **02-backend-funcionando.png** se generan con `scripts/crear-capturas.ps1` al ejecutar el kit de publicación en Windows. La herramienta abre realmente los dos proyectos en un navegador en modo headless, mientras la API y el servidor web están encendidos; no se trata de imágenes de ejemplo.

Si tu equipo no tiene Edge/Chrome en la ruta habitual o el script de capturas no funciona, toma manualmente estas dos capturas:

1. Ejecuta `npm install` y `npm run dev` desde la raíz.
2. Abre `http://localhost:3000`: debe mostrar productos, tarjetas y `@barrios/shared activo`. Guarda la captura como `01-frontend-funcionando.png`.
3. Abre `http://localhost:3001`: debe mostrar `API de inventario funcionando`, el resumen y estados calculados con la librería compartida. Guarda como `02-backend-funcionando.png`.
4. Guarda ambas imágenes aquí, ejecuta `git add docs/capturas && git commit -m "docs(evidencias): agregar capturas de ambas aplicaciones" && git push`.

Si publicas con el script incluido en el kit, las capturas se intentan generar **antes** de hacer el commit y subir los archivos.
