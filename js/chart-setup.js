document.addEventListener('DOMContentLoaded', function() {
  if (!window.Chart) {
    const script = document.createElement('script');
  script.src = 'js/chart.umd.min.js';
    script.onload = function() {
      if (window.onChartJsReady) window.onChartJsReady();
    };
    document.head.appendChild(script);
    // Si después de 3 segundos Chart.js no está cargado, mostrar advertencia
    setTimeout(() => {
      if (!window.Chart) {
        const container = document.querySelector('.container');
        if (container && !document.getElementById('chartjs-warning')) {
          const alert = document.createElement('div');
          alert.id = 'chartjs-warning';
          alert.className = 'alert alert-danger mt-3';
          alert.innerHTML = '<b>Error:</b> No se pudo cargar Chart.js. Verifica tu conexión a internet o contacta al administrador.';
          container.prepend(alert);
        }
      }
    }, 3000);
  } else {
    if (window.onChartJsReady) window.onChartJsReady();
  }
});
