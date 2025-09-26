// Generar comprobante PDF del historial de préstamos del estudiante
function generarComprobanteEstudiante() {
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  const loans = JSON.parse(localStorage.getItem('loans')) || [];
  const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
  if (!activeUser || activeUser.rol !== 'Estudiante') return;
  const prestamosEst = loans.filter(l => l.estudiante === activeUser.nombre);
  const reservasEst = reservations.filter(r => r.estudiante === activeUser.nombre);
  if (prestamosEst.length === 0 && reservasEst.length === 0) {
    alert('No tienes préstamos ni reservas para generar comprobante.');
    return;
  }
  const doc = new window.jspdf.jsPDF();
  doc.setFontSize(16);
  doc.text('Comprobante de Estado de Biblioteca', 14, 18);
  doc.setFontSize(12);
  doc.text(`Estudiante: ${activeUser.nombre}`, 14, 28);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 36);
  let y = 46;
  // KPIs
  const activos = prestamosEst.filter(l => !l.devuelto && new Date(l.fecha_devolucion) >= new Date());
  const vencidos = prestamosEst.filter(l => !l.devuelto && new Date(l.fecha_devolucion) < new Date());
  const devueltos = prestamosEst.filter(l => l.devuelto);
  const reservasActivas = reservasEst.filter(r => r.estado === 'Activa');
  const reservasCanceladas = reservasEst.filter(r => r.estado === 'Cancelada');
  doc.setFontSize(12);
  doc.text(`Préstamos activos: ${activos.length}`, 14, y); y+=6;
  doc.text(`Préstamos vencidos: ${vencidos.length}`, 14, y); y+=6;
  doc.text(`Préstamos devueltos: ${devueltos.length}`, 14, y); y+=6;
  doc.text(`Reservas activas: ${reservasActivas.length}`, 14, y); y+=6;
  doc.text(`Reservas canceladas: ${reservasCanceladas.length}`, 14, y); y+=10;
  // Tabla de préstamos activos
  if (activos.length) {
    doc.setFontSize(13); doc.text('Préstamos activos:', 14, y); y+=6;
    doc.setFontSize(11);
    doc.text('Libro', 14, y); doc.text('Fecha Préstamo', 80, y); doc.text('Fecha Devolución', 130, y); y+=6;
    activos.forEach(l => {
      doc.text(l.libro, 14, y);
      doc.text(l.fecha_prestamo, 80, y);
  doc.text(l.fecha_devolucion_real ? l.fecha_devolucion_real : l.fecha_devolucion, 130, y);
      y += 6;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    y+=4;
  }
  // Tabla de préstamos vencidos
  if (vencidos.length) {
    doc.setFontSize(13); doc.text('Préstamos vencidos:', 14, y); y+=6;
    doc.setFontSize(11);
    doc.text('Libro', 14, y); doc.text('Fecha Préstamo', 80, y); doc.text('Fecha Devolución', 130, y); y+=6;
    vencidos.forEach(l => {
      doc.text(l.libro, 14, y);
      doc.text(l.fecha_prestamo, 80, y);
  doc.text(l.fecha_devolucion_real ? l.fecha_devolucion_real : l.fecha_devolucion, 130, y);
      y += 6;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    y+=4;
  }
  // Tabla de préstamos devueltos
  if (devueltos.length) {
    doc.setFontSize(13); doc.text('Préstamos devueltos:', 14, y); y+=6;
    doc.setFontSize(11);
    doc.text('Libro', 14, y); doc.text('Fecha Préstamo', 80, y); doc.text('Fecha Devolución', 130, y); y+=6;
    devueltos.forEach(l => {
      doc.text(l.libro, 14, y);
      doc.text(l.fecha_prestamo, 80, y);
  doc.text(l.fecha_devolucion_real ? l.fecha_devolucion_real : l.fecha_devolucion, 130, y);
      y += 6;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    y+=4;
  }
  // Tabla de reservas activas
  if (reservasActivas.length) {
    doc.setFontSize(13); doc.text('Reservas activas:', 14, y); y+=6;
    doc.setFontSize(11);
    doc.text('Libro', 14, y); doc.text('Fecha Reserva', 80, y); doc.text('Días', 130, y); y+=6;
    reservasActivas.forEach(r => {
      doc.text(r.libro, 14, y);
      doc.text(r.fecha_reserva, 80, y);
      doc.text(String(r.dias), 130, y);
      y += 6;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    y+=4;
  }
  // Tabla de reservas canceladas
  if (reservasCanceladas.length) {
    doc.setFontSize(13); doc.text('Reservas canceladas:', 14, y); y+=6;
    doc.setFontSize(11);
    doc.text('Libro', 14, y); doc.text('Fecha Reserva', 80, y); doc.text('Días', 130, y); y+=6;
    reservasCanceladas.forEach(r => {
      doc.text(r.libro, 14, y);
      doc.text(r.fecha_reserva, 80, y);
      doc.text(String(r.dias), 130, y);
      y += 6;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    y+=4;
  }
  doc.save('comprobante_biblioteca.pdf');
}
