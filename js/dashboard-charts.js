// Gráficas para dashboard con Chart.js
document.addEventListener('DOMContentLoaded', function() {
  function renderDashboardCharts() {
    if (!window.Chart) return;
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const loans = JSON.parse(localStorage.getItem('loans')) || [];
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const activeUser = JSON.parse(localStorage.getItem('activeUser'));
    let ctxLibros = null;
    let ctxMov = null;
    let ctxFac = null;
    let usersData = users;
    // Detectar rol y usar los ids correctos
    if (activeUser && activeUser.rol === 'Administrador') {
      ctxLibros = document.getElementById('adminChartLibros');
      ctxMov = document.getElementById('adminChartMovimientos');
      ctxFac = document.getElementById('adminChartFacultades');
    } else if (activeUser && activeUser.rol === 'Bibliotecario') {
      ctxLibros = document.getElementById('biblioChartLibros');
      ctxMov = document.getElementById('biblioChartMovimientos');
      ctxFac = document.getElementById('biblioChartFacultades');
    } else if (activeUser && activeUser.rol === 'Estudiante') {
      ctxLibros = document.getElementById('chartStudentCategorias');
      ctxMov = document.getElementById('chartStudentDias');
    }
    // Gráfica de usuarios por facultad (solo admin y biblio)
    if (ctxFac && ctxFac.getContext) {
      ctxFac = ctxFac.getContext('2d');
      if (window.chartFacultades) window.chartFacultades.destroy();
      const facultadLabels = [...new Set(usersData.map(u=>u.facultad).filter(f=>f))];
      const facultadCounts = facultadLabels.map(f=>usersData.filter(u=>u.facultad===f).length);
      if (facultadLabels.length && facultadCounts.some(c=>c>0)) {
        window.chartFacultades = new Chart(ctxFac, {
          type: 'bar',
          data: {
            labels: facultadLabels,
            datasets: [{ label: 'Usuarios', data: facultadCounts, backgroundColor: '#6366f1' }]
          },
          options: {responsive:true, plugins:{legend:{display:false}}}
        });
      } else {
        ctxFac.clearRect(0,0,ctxFac.canvas.width,ctxFac.canvas.height);
        ctxFac.font = '16px sans-serif';
        ctxFac.fillStyle = '#888';
        ctxFac.textAlign = 'center';
        ctxFac.fillText('Sin datos', ctxFac.canvas.width/2, ctxFac.canvas.height/2);
      }
    }
    // Gráfica de libros por estado (prestados vs disponibles)
    if (ctxLibros && ctxLibros.getContext) {
      ctxLibros = ctxLibros.getContext('2d');
      if (window.chartLibros) window.chartLibros.destroy();
      const total = books.reduce((acc, b) => acc + (b.copias_totales || 1), 0);
      const prestados = loans.filter(l => !l.devuelto).length;
      const disponibles = total - prestados;
      window.chartLibros = new Chart(ctxLibros, {
        type: 'doughnut',
        data: {
          labels: ['Prestados', 'Disponibles'],
          datasets: [{
            data: [prestados, disponibles],
            backgroundColor: ['#36a2eb', '#4caf50']
          }]
        },
        options: {responsive:true, plugins:{legend:{position:'bottom'}}}
      });
    }
    // Gráfica de préstamos y reservas por día
    if (ctxMov && ctxMov.getContext) {
      ctxMov = ctxMov.getContext('2d');
      if (window.chartMovimientos) window.chartMovimientos.destroy();
      const dias = Array.from({length: 7}, (_,i)=>{
        const d = new Date(); d.setDate(d.getDate()-i);
        return d.toISOString().slice(0,10);
      }).reverse();
      const prestamosPorDia = dias.map(dia => loans.filter(l=>l.fecha_prestamo===dia).length);
      const reservasPorDia = dias.map(dia => reservations.filter(r=>r.fecha_reserva===dia).length);
      window.chartMovimientos = new Chart(ctxMov, {
        type: 'line',
        data: {
          labels: dias,
          datasets: [
            {label:'Préstamos',data:prestamosPorDia,borderColor:'#36a2eb',backgroundColor:'rgba(54,162,235,0.2)',fill:true},
            {label:'Reservas',data:reservasPorDia,borderColor:'#ffce56',backgroundColor:'rgba(255,206,86,0.2)',fill:true}
          ]
        },
        options: {responsive:true}
      });
    }
  }
  if (!window.Chart) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = renderDashboardCharts;
    document.head.appendChild(script);
  } else {
    renderDashboardCharts();
  }
});
