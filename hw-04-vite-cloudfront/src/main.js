import './style.css';

const app = document.querySelector('#app');
app.innerHTML = `
  <main class="page">
    <div class="light"></div>
    <section class="hero" aria-labelledby="titulo">
      <span class="eyebrow"><span class="dot"></span> DESPLIEGUE WEB · HW-04</span>
      <div class="symbol" aria-hidden="true">&lt;/&gt;</div>
      <h1 id="titulo">¡Mi primer <span>deployment</span>!</h1>
      <p class="intro">Esta página fue creada con <strong>Vite</strong>, compilada con <strong>GitHub Actions</strong>, almacenada en <strong>Amazon S3</strong> y distribuida globalmente con <strong>CloudFront</strong>.</p>
      <div class="tech"><span>Vite</span><span>GitHub Actions</span><span>Amazon S3</span><span>CloudFront</span></div>
      <div class="status"><span class="check">✓</span><div><strong>Página preparada para su publicación</strong><small>GitHub Actions publicará los cambios cuando AWS esté configurado.</small></div></div>
    </section>
    <footer>Ingeniería en Sistemas · Tarea HW-04 · 2026</footer>
  </main>`;
