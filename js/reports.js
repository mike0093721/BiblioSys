function renderUsuariosEstudiantes() {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  let estudiantes = users.filter(u=>u.rol==='Estudiante');
  const filtro = document.getElementById('filtroEstudianteInput')?.value.toLowerCase() || '';
  if (filtro) {
    estudiantes = estudiantes.filter(u =>
      (u.nombre && u.nombre.toLowerCase().includes(filtro)) ||
      (u.email && u.email.toLowerCase().includes(filtro)) ||
      (u.facultad && u.facultad.toLowerCase().includes(filtro)) ||
      (u.carrera && u.carrera.toLowerCase().includes(filtro))
    );
  }
  let tabla = `<div class='mb-2 small text-muted'>Mostrando ${estudiantes.length} estudiante(s)</div>`;
  tabla += `<table class="table table-sm"><thead><tr><th>Nombre</th><th>Email</th><th>Facultad</th><th>Carrera</th><th>Acciones</th></tr></thead><tbody>`;
  estudiantes.forEach((u, idx)=>{
    const data = encodeURIComponent(JSON.stringify(u));
    tabla += `<tr><td>${u.nombre}</td><td>${u.email}</td><td>${u.facultad||''}</td><td>${u.carrera||''}</td><td><button class='btn btn-sm btn-outline-danger btn-exportar-estudiante' data-estudiante='${data}'><i class=\"bi bi-file-earmark-pdf\"></i> Exportar</button></td></tr>`;
  });
  tabla += `</tbody></table>`;
  const cont = document.getElementById('usuariosEstudiantesTabla');
  cont.innerHTML = tabla;
  // Delegación de eventos para exportar PDF individual
  cont.querySelectorAll('.btn-exportar-estudiante').forEach(btn => {
    btn.addEventListener('click', function() {
      try {
        const uStr = decodeURIComponent(this.getAttribute('data-estudiante'));
        window.exportarUsuarioPDFDesdeObjeto(uStr);
      } catch (err) {
        alert('Error al preparar exportación: ' + (err.message || err));
      }
    });
  });
}

// Exportar por nombre (para que funcione con filtro)
  // Exportar estudiante individual desde objeto (global)
  window.exportarUsuarioPDFDesdeObjeto = function(uStr) {
    try {
      const u = JSON.parse(uStr);
      const jsPDF = window.jspdf?.jsPDF || window.jsPDF;
      if (!jsPDF) throw new Error('No se pudo cargar jsPDF.');
      const loans = JSON.parse(localStorage.getItem('loans')) || [];
      const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Reporte Individual de Estudiante', 10, 15);
      let y = 25;
      doc.setFontSize(12);
      doc.text(`Nombre: ${u.nombre}`, 10, y); y+=6;
      doc.text(`Email: ${u.email}`, 10, y); y+=6;
      doc.text(`Facultad: ${u.facultad||''}`, 10, y); y+=6;
      doc.text(`Carrera: ${u.carrera||''}`, 10, y); y+=6;
      doc.text(`Dirección: ${u.direccion||''}`, 10, y); y+=6;
      doc.text(`Teléfono: ${u.telefono||''}`, 10, y); y+=6;
      doc.text(`Estado: ${u.activo ? 'Activo' : 'Inactivo'}`, 10, y); y+=6;
  doc.text(`Fecha de registro: ${u.fecha_registro ? new Date(u.fecha_registro).toLocaleString() : 'No disponible'}`, 10, y); y+=6;
      // Cantidad de préstamos y reservas
      const prestamos = loans.filter(l => l.estudiante === u.nombre).length;
      const reservas = reservations.filter(r => r.estudiante === u.nombre).length;
      doc.text(`Cantidad de préstamos: ${prestamos}`, 10, y); y+=6;
      doc.text(`Cantidad de reservas: ${reservas}`, 10, y); y+=6;
      doc.save(`estudiante_${u.nombre.replace(/\s+/g,'_')}.pdf`);
    } catch (err) {
      alert('Error al exportar PDF individual: ' + (err.message || err));
    }
  }

function fillUsuarios() {
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  if (activeUser && activeUser.rol === 'Estudiante') {
    document.querySelector('.container').innerHTML = '<div class="alert alert-danger mt-4">Acceso denegado. Solo el administrador o bibliotecario puede ver esta sección.</div>';
    return;
  }
  // Forzar recarga de datos actuales de localStorage
  localStorage.setItem('users', localStorage.getItem('users'));
  localStorage.setItem('loans', localStorage.getItem('loans'));
  localStorage.setItem('reservations', localStorage.getItem('reservations'));
  localStorage.setItem('books', localStorage.getItem('books'));
  renderReporte();
  renderUsuariosEstudiantes();
}
window.addEventListener('DOMContentLoaded', function() {
  fillUsuarios();
  const input = document.getElementById('reporteSearchInput');
  if (input) input.addEventListener('input', renderReporte);
  // Esperar Chart.js y graficar
  window.onChartJsReady = renderGraficasReportes;
  if (window.Chart) renderGraficasReportes();
  // Botón exportar PDF
  const btnPDF = document.getElementById('btnExportarPDF');
  if (btnPDF) btnPDF.addEventListener('click', exportarReportePDF);
  // Filtro estudiantes
  const filtroEst = document.getElementById('filtroEstudianteInput');
  if (filtroEst) filtroEst.addEventListener('input', renderUsuariosEstudiantes);
  // Filtro reservas por estudiante
  const filtroReserva = document.getElementById('filtroReservaEstudianteInput');
  if (filtroReserva) filtroReserva.addEventListener('input', renderReporte);
});

// Exportar todos los estudiantes a PDF
document.getElementById('btnExportarUsuariosPDF')?.addEventListener('click', function() {
  exportarUsuariosPDF();
});

function exportarUsuariosPDF() {
  const jsPDF = window.jspdf?.jsPDF || window.jsPDF;
  if (!jsPDF) { alert('No se pudo cargar jsPDF.'); return; }
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const estudiantes = users.filter(u=>u.rol==='Estudiante');
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Reporte de Estudiantes', 10, 15);
  let y = 25;
  doc.setFontSize(12);
  doc.text('Nombre | Email | Facultad | Carrera', 10, y);
  y += 6;
  estudiantes.forEach(u=>{
    doc.text(`${u.nombre} | ${u.email} | ${u.facultad||''} | ${u.carrera||''}`, 10, y);
    y += 6;
    if (y > 270) { doc.addPage(); y = 15; }
  });
  doc.save('estudiantes_bibliosys.pdf');
}

// Exportar estudiante individual
function exportarUsuarioPDF(idx) {
  const jsPDF = window.jspdf?.jsPDF || window.jsPDF;
  if (!jsPDF) { alert('No se pudo cargar jsPDF.'); return; }
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const loans = JSON.parse(localStorage.getItem('loans')) || [];
  const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
  const estudiantes = users.filter(u=>u.rol==='Estudiante');
  const u = estudiantes[idx];
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Reporte Individual de Estudiante', 10, 15);
  let y = 25;
  doc.setFontSize(12);
  doc.text(`Nombre: ${u.nombre}`, 10, y); y+=6;
  doc.text(`Email: ${u.email}`, 10, y); y+=6;
  doc.text(`Facultad: ${u.facultad||''}`, 10, y); y+=6;
  doc.text(`Carrera: ${u.carrera||''}`, 10, y); y+=6;
  doc.text(`Dirección: ${u.direccion||''}`, 10, y); y+=6;
  doc.text(`Teléfono: ${u.telefono||''}`, 10, y); y+=6;
  doc.text(`Estado: ${u.activo ? 'Activo' : 'Inactivo'}`, 10, y); y+=6;
  doc.text(`Fecha de registro: ${u.fecha_registro ? new Date(u.fecha_registro).toLocaleString() : ''}`, 10, y); y+=6;
  // Cantidad de préstamos y reservas
  const prestamos = loans.filter(l => l.estudiante === u.nombre).length;
  const reservas = reservations.filter(r => r.estudiante === u.nombre).length;
  doc.text(`Cantidad de préstamos: ${prestamos}`, 10, y); y+=6;
  doc.text(`Cantidad de reservas: ${reservas}`, 10, y); y+=6;
  doc.save(`estudiante_${u.nombre.replace(/\s+/g,'_')}.pdf`);
}
function renderReporte(){
  const users = JSON.parse(localStorage.getItem('users')) || [];
    const loans = JSON.parse(localStorage.getItem('loans')) || [];
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    // KPIs
    document.getElementById('kpiTotalPrestamos').innerText = loans.length;
    document.getElementById('kpiTotalReservas').innerText = reservations.length;
    document.getElementById('kpiTotalUsuarios').innerText = users.length;
    document.getElementById('kpiTotalLibros').innerText = JSON.parse(localStorage.getItem('books')).length;

    // Top 10 libros más prestados
    const librosPrestados = {};
    loans.forEach(l => { librosPrestados[l.libro] = (librosPrestados[l.libro]||0)+1; });
    const topLibros = Object.entries(librosPrestados)
      .sort((a,b)=>b[1]-a[1])
      .slice(0,10);
    const ol = document.getElementById('topLibrosMasPrestados');
    if (ol) {
      ol.innerHTML = topLibros.length
        ? topLibros.map(([titulo, cantidad])=>`<li><b>${titulo}</b> <span class='text-muted'>(${cantidad} préstamos)</span></li>`).join('')
        : '<li class="text-muted">Sin datos</li>';
    }

    // TABLAS DE PRÉSTAMOS Y RESERVAS
    let filtroPrestamo = document.getElementById('reporteSearchInput')?.value.toLowerCase() || '';
    let prestamosFiltrados = loans;
    if (filtroPrestamo) {
      prestamosFiltrados = loans.filter(l => l.estudiante && l.estudiante.toLowerCase().includes(filtroPrestamo));
    }
    let prestamosHtml = `<h5>Préstamos</h5><table class="table table-sm"><thead><tr><th>Estudiante</th><th>Libro</th><th>Fecha Préstamo</th><th>Fecha Devolución</th><th>Días</th><th>Devuelto</th></tr></thead><tbody>`;
    if (prestamosFiltrados.length) {
      prestamosFiltrados.forEach(l => {
        prestamosHtml += `<tr><td>${l.estudiante}</td><td>${l.libro}</td><td>${l.fecha_prestamo||''}</td><td>${l.fecha_devolucion||''}</td><td>${l.dias||''}</td><td>${l.devuelto ? 'Sí' : 'No'}</td></tr>`;
      });
    } else {
      prestamosHtml += `<tr><td colspan="6" class="text-muted">Sin datos</td></tr>`;
    }
    prestamosHtml += `</tbody></table>`;

    // Filtro de reservas por estudiante
    let filtroReserva = document.getElementById('filtroReservaEstudianteInput')?.value.toLowerCase() || '';
    let reservasFiltradas = reservations;
    if (filtroReserva) {
      reservasFiltradas = reservations.filter(r => r.estudiante && r.estudiante.toLowerCase().includes(filtroReserva));
    }
    let reservasHtml = `<div class='mb-2 d-flex flex-wrap gap-2 align-items-center'><input id="filtroReservaEstudianteInput" class="form-control form-control-sm" style="max-width:220px;" type="text" placeholder="Filtrar reservas por estudiante..."> <span class='small text-muted'>Mostrando ${reservasFiltradas.length} reserva(s)</span></div>`;
    reservasHtml += `<h5>Reservas</h5><table class="table table-sm"><thead><tr><th>Estudiante</th><th>Libro</th><th>Fecha Reserva</th><th>Días</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>`;
    if (reservasFiltradas.length) {
      reservasFiltradas.forEach((r, idx) => {
        const data = encodeURIComponent(JSON.stringify(r));
        reservasHtml += `<tr><td>${r.estudiante}</td><td>${r.libro}</td><td>${r.fecha_reserva||''}</td><td>${r.dias||''}</td><td>${r.estado||''}</td><td><button class='btn btn-sm btn-outline-danger btn-exportar-reserva' data-reserva='${data}'><i class=\"bi bi-file-earmark-pdf\"></i> Exportar</button></td></tr>`;
      });
    } else {
      reservasHtml += `<tr><td colspan="6" class="text-muted">Sin datos</td></tr>`;
    }
    reservasHtml += `</tbody></table>`;
// Exportar PDF de reserva individual
// Exportar PDF de reserva individual desde objeto (global)
window.exportarReservaPDFDesdeObjeto = function(rStr) {
  try {
    const r = JSON.parse(rStr);
    const jsPDF = window.jspdf?.jsPDF || window.jsPDF;
    if (!jsPDF) throw new Error('No se pudo cargar jsPDF.');
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Comprobante de Reserva', 10, 15);
    let y = 25;
    doc.setFontSize(12);
    doc.text(`Estudiante: ${r.estudiante}`, 10, y); y+=6;
    doc.text(`Libro: ${r.libro}`, 10, y); y+=6;
    doc.text(`Fecha de reserva: ${r.fecha_reserva||''}`, 10, y); y+=6;
    doc.text(`Días: ${r.dias||''}`, 10, y); y+=6;
    doc.text(`Estado: ${r.estado||''}`, 10, y); y+=6;
    doc.save(`reserva_${r.estudiante.replace(/\s+/g,'_')}_${r.libro.replace(/\s+/g,'_')}.pdf`);
  } catch (err) {
    alert('Error al exportar PDF de reserva: ' + (err.message || err));
  }
}

    const cont = document.getElementById('reporteTabla');
    cont.innerHTML = prestamosHtml + reservasHtml;
    // Delegación de eventos para exportar PDF individual de reservas
    cont.querySelectorAll('.btn-exportar-reserva').forEach(btn => {
      btn.addEventListener('click', function() {
        try {
          const rStr = decodeURIComponent(this.getAttribute('data-reserva'));
          window.exportarReservaPDFDesdeObjeto(rStr);
        } catch (err) {
          alert('Error al preparar exportación: ' + (err.message || err));
        }
      });
    });
}
function logout(){ localStorage.removeItem('activeUser'); window.location.href = 'login.html'; }

window.addEventListener('DOMContentLoaded', function() {
  fillUsuarios();
  const input = document.getElementById('reporteSearchInput');
  if (input) input.addEventListener('input', renderReporte);
  // Botón exportar PDF
  const btnPDF = document.getElementById('btnExportarPDF');
  if (btnPDF) btnPDF.addEventListener('click', exportarReportePDF);
});

function exportarReportePDF() {
  const jsPDF = window.jspdf?.jsPDF || window.jsPDF;
  if (!jsPDF) {
    alert('No se pudo cargar jsPDF. Intenta recargar la página.');
    return;
  }
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Reporte General BiblioSys', 10, 15);
  let y = 25;
  // KPIs
  doc.setFontSize(12);
  doc.text(`Total Préstamos: ${document.getElementById('kpiTotalPrestamos').innerText}`, 10, y); y+=6;
  doc.text(`Total Reservas: ${document.getElementById('kpiTotalReservas').innerText}`, 10, y); y+=6;
  doc.text(`Total Usuarios: ${document.getElementById('kpiTotalUsuarios').innerText}`, 10, y); y+=6;
  doc.text(`Total Libros: ${document.getElementById('kpiTotalLibros').innerText}`, 10, y); y+=10;
  // Top 10 Libros
  doc.setFontSize(13);
  doc.text('Top 10 Libros Más Prestados:', 10, y); y+=6;
  const topLibros = document.querySelectorAll('#topLibrosMasPrestados li');
  if (topLibros.length) {
    topLibros.forEach(li => {
      doc.setFontSize(11);
      doc.text('- ' + li.textContent, 12, y);
      y += 6;
      if (y > 270) { doc.addPage(); y = 15; }
    });
    y += 4;
  }
  // Préstamos y Reservas
  doc.setFontSize(13);
  doc.text('Préstamos', 10, y); y+=6;
  const prestamosTable = document.querySelector('#reporteTabla table');
  if (prestamosTable) {
    const rows = prestamosTable.querySelectorAll('tr');
    rows.forEach((row, i) => {
      let text = Array.from(row.children).map(td => td.textContent).join(' | ');
      doc.setFontSize(i===0?11:10);
      doc.text(text, 10, y);
      y += 6;
      if (y > 270) { doc.addPage(); y = 15; }
    });
  }
  // Reservas
  const reservasTable = document.querySelectorAll('#reporteTabla table')[1];
  if (reservasTable) {
    y += 6;
    doc.setFontSize(13);
    doc.text('Reservas', 10, y); y+=6;
    const rows = reservasTable.querySelectorAll('tr');
    rows.forEach((row, i) => {
      let text = Array.from(row.children).map(td => td.textContent).join(' | ');
      doc.setFontSize(i===0?11:10);
      doc.text(text, 10, y);
      y += 6;
      if (y > 270) { doc.addPage(); y = 15; }
    });
  }
  doc.save('reporte_bibliosys.pdf');
}

function renderGraficasReportes() {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const loans = JSON.parse(localStorage.getItem('loans')) || [];
  const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
  const books = JSON.parse(localStorage.getItem('books')) || [];
  console.log('DEBUG Chart.js:', typeof window.Chart, window.Chart);
  console.log('DEBUG users:', users);
  console.log('DEBUG loans:', loans);
  console.log('DEBUG reservations:', reservations);
  console.log('DEBUG books:', books);
  // Libros más prestados
  const librosPrestados = {};
  loans.forEach(l => { librosPrestados[l.libro] = (librosPrestados[l.libro]||0)+1; });
  const librosLabels = Object.keys(librosPrestados);
  const librosData = librosLabels.map(l=>librosPrestados[l]);
  const ctxLibros = document.getElementById('chartLibrosMasPrestados').getContext('2d');
  if (window.chartLibrosMasPrestados) window.chartLibrosMasPrestados.destroy();
  window.chartLibrosMasPrestados = new Chart(ctxLibros, {
    type: 'bar',
    data: {
      labels: librosLabels,
      datasets: [{
        label: 'Libros más prestados',
        data: librosData,
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      }]
    },
    options: {responsive:true, plugins:{legend:{display:false}}}
  });
  // Categorías más prestadas
  const categoriasPrestadas = {};
  loans.forEach(l => {
    const libro = books.find(b=>b.titulo===l.libro);
    const cat = libro ? libro.categoria : 'Desconocida';
    categoriasPrestadas[cat] = (categoriasPrestadas[cat]||0)+1;
  });
  const catLabels = Object.keys(categoriasPrestadas);
  const catData = catLabels.map(c=>categoriasPrestadas[c]);
  const ctxCat = document.getElementById('chartCategoriasMasPrestadas').getContext('2d');
  if (window.chartCategoriasMasPrestadas) window.chartCategoriasMasPrestadas.destroy();
  window.chartCategoriasMasPrestadas = new Chart(ctxCat, {
    type: 'doughnut',
    data: {
      labels: catLabels,
      datasets: [{
        label: 'Categorías más prestadas',
        data: catData,
        backgroundColor: ['#36a2eb','#ff6384','#ffce56','#4caf50','#8e44ad','#e67e22']
      }]
    },
    options: {responsive:true, plugins:{legend:{position:'bottom'}}}
  });
  // Facultades más utilizadas
  const facultadesPrestadas = {};
  loans.forEach(l => {
    const libro = books.find(b=>b.titulo===l.libro);
    const fac = libro ? libro.facultad : 'Desconocida';
    facultadesPrestadas[fac] = (facultadesPrestadas[fac]||0)+1;
  });
  const facLabels = Object.keys(facultadesPrestadas);
  const facData = facLabels.map(f=>facultadesPrestadas[f]);
  const ctxFac = document.getElementById('chartFacultadesMasUsadas').getContext('2d');
  if (window.chartFacultadesMasUsadas) window.chartFacultadesMasUsadas.destroy();
  window.chartFacultadesMasUsadas = new Chart(ctxFac, {
    type: 'doughnut',
    data: {
      labels: facLabels,
      datasets: [{
        label: 'Facultades más utilizadas',
        data: facData,
        backgroundColor: ['#36a2eb','#ff6384','#ffce56','#4caf50','#8e44ad','#e67e22']
      }]
    },
    options: {responsive:true, plugins:{legend:{position:'bottom'}}}
  });
  // Préstamos por usuario
  const prestamosPorUsuario = {};
  loans.forEach(l => {
    prestamosPorUsuario[l.estudiante] = (prestamosPorUsuario[l.estudiante]||0)+1;
  });
  // Reservas por usuario
  const reservasPorUsuario = {};
  reservations.forEach(r => {
    reservasPorUsuario[r.estudiante] = (reservasPorUsuario[r.estudiante]||0)+1;
  });
  // Datos para gráficas
  const labels = users.map(u=>u.nombre);
  const prestamosData = labels.map(n=>prestamosPorUsuario[n]||0);
  const reservasData = labels.map(n=>reservasPorUsuario[n]||0);
  // Gráfica de préstamos
  const ctx1 = document.getElementById('chartPrestamos').getContext('2d');
  if (window.chartPrestamos) window.chartPrestamos.destroy();
  window.chartPrestamos = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Préstamos por usuario',
        data: prestamosData,
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      }]
    },
    options: {responsive:true, plugins:{legend:{display:false}}}
  });
  // Gráfica de reservas
  const ctx2 = document.getElementById('chartReservas').getContext('2d');
  if (window.chartReservas) window.chartReservas.destroy();
  window.chartReservas = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Reservas por usuario',
        data: reservasData,
        backgroundColor: 'rgba(255, 206, 86, 0.6)'
      }]
    },
    options: {responsive:true, plugins:{legend:{display:false}}}
  });
}
