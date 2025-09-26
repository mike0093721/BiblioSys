// MODAL GENÉRICO PARA USO REUTILIZABLE
function mostrarModal(titulo, contenidoHtml) {
  let modal = document.getElementById('modalGenerico');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modalGenerico';
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class='modal-dialog'>
        <div class='modal-content'>
          <div class='modal-header'><h5 class='modal-title'></h5>
            <button type='button' class='btn-close' data-bs-dismiss='modal'></button>
          </div>
          <div class='modal-body'></div>
          <div class='modal-footer'><button class='btn btn-secondary' data-bs-dismiss='modal'>Cerrar</button></div>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }
  modal.querySelector('.modal-title').innerHTML = titulo;
  modal.querySelector('.modal-body').innerHTML = contenidoHtml;
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

// FORMULARIO NUEVO PRÉSTAMO
window.showLoanForm = function() {
  let books = JSON.parse(localStorage.getItem('books')) || [];
  let faculties = [
    "Facultad de Ingeniería y Arquitectura",
    "Facultad de Ciencias Económicas",
    "Facultad de Ciencias y Humanidades",
    "Facultad de Ciencias de la Salud"
  ];
  let activeUser = JSON.parse(localStorage.getItem('activeUser'));
  let loans = JSON.parse(localStorage.getItem('loans')) || [];
  // Validar si el estudiante tiene 2 o más libros sin devolver
  if (activeUser && activeUser.rol === 'Estudiante') {
    const sinDevolver = loans.filter(l => l.estudiante === activeUser.nombre && !l.devuelto);
    if (sinDevolver.length >= 2) {
      mostrarModal('Préstamo bloqueado', `<div class='text-danger fw-bold mb-2'><i class='bi bi-exclamation-triangle'></i> No puedes registrar un nuevo préstamo.</div><div>Debes devolver o cancelar las multas de tus préstamos pendientes antes de solicitar otro libro.</div>`);
      return;
    }
  }
  let formHtml = `
    <form id='formNuevoPrestamo'>
      <div class='mb-2'><label>Facultad</label>
        <select class='form-select' id='facultadSelect' required>
          <option value=''>Seleccione facultad</option>
          ${faculties.map(f=>`<option value="${f}">${f}</option>`).join('')}
        </select>
      </div>
      <div class='mb-2'><label>Carrera</label>
        <select class='form-select' id='carreraSelect' required disabled>
          <option value=''>Seleccione carrera</option>
        </select>
      </div>
      <div class='mb-2'><label>Libro</label>
        <select class='form-select' id='libroSelect' name='libro' required disabled>
          <option value=''>Seleccione libro</option>
        </select>
      </div>
      <div class='mb-2'><label>Días</label><input class='form-control' name='dias' type='number' min='1' max='30' value='7' required></div>
      <button class='btn btn-success' type='submit'>Guardar</button>
    </form>`;
  mostrarModal('Nuevo Préstamo', formHtml);

  const facultadSelect = document.getElementById('facultadSelect');
  const carreraSelect = document.getElementById('carreraSelect');
  const libroSelect = document.getElementById('libroSelect');

  facultadSelect.onchange = function() {
    const facultad = this.value;
    carreraSelect.innerHTML = `<option value=''>Seleccione carrera</option>`;
    libroSelect.innerHTML = `<option value=''>Seleccione libro</option>`;
    libroSelect.disabled = true;
    if (!facultad) {
      carreraSelect.disabled = true;
      return;
    }
    // Obtener carreras únicas de esa facultad
    const carreras = [...new Set(books.filter(b=>b.facultad===facultad).map(b=>b.categoria))];
    carreraSelect.innerHTML += carreras.map(c=>`<option value="${c}">${c}</option>`).join('');
    carreraSelect.disabled = false;
  };

  carreraSelect.onchange = function() {
    const facultad = facultadSelect.value;
    const carrera = this.value;
    libroSelect.innerHTML = `<option value=''>Seleccione libro</option>`;
    if (!carrera) {
      libroSelect.disabled = true;
      return;
    }
    // Filtrar libros por facultad y carrera
    const libros = books.filter(b=>b.facultad===facultad && b.categoria===carrera && b.copias_disponibles>0);
    libroSelect.innerHTML += libros.map(b=>`<option value="${b.titulo}">${b.titulo}</option>`).join('');
    libroSelect.disabled = false;
  };

  document.getElementById('formNuevoPrestamo').onsubmit = function(e) {
    e.preventDefault();
    let libro = libroSelect.value;
    let dias = parseInt(this.dias.value);
    let fecha_prestamo = new Date();
    let fecha_devolucion = new Date(fecha_prestamo.getTime() + dias*24*60*60*1000);
    let loans = JSON.parse(localStorage.getItem('loans')) || [];
    loans.push({
      estudiante: activeUser.nombre,
      libro,
      fecha_prestamo: fecha_prestamo.toLocaleDateString(),
      fecha_devolucion: fecha_devolucion.toLocaleDateString(),
      dias,
      devuelto: false,
      estado: 'Activo'
    });
    // Actualizar copias
    let idxLibro = books.findIndex(b=>b.titulo===libro);
    if(idxLibro>-1){ books[idxLibro].copias_disponibles--; }
    localStorage.setItem('loans',JSON.stringify(loans));
    localStorage.setItem('books',JSON.stringify(books));
    renderLoansTable();
    bootstrap.Modal.getInstance(document.getElementById('modalGenerico')).hide();
    alert('Préstamo registrado.');
  };
}
function renderLoansTable() {
  const loans = JSON.parse(localStorage.getItem('loans')) || [];
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  let filteredLoans = loans;
  if (activeUser && activeUser.rol === 'Estudiante') {
    filteredLoans = loans.filter(l => l.estudiante === activeUser.nombre);
  }
  // Filtro de multas activas (solo admin/bibliotecario)
  let showOnlyMultas = false;
  if (activeUser && activeUser.rol !== 'Estudiante') {
    const filtroDiv = document.getElementById('filtroMultasDiv') || document.createElement('div');
    filtroDiv.id = 'filtroMultasDiv';
    filtroDiv.className = 'mb-2';
    filtroDiv.innerHTML = `<label class='form-check-label me-2'><input type='checkbox' id='filtroMultasCheck' class='form-check-input'/> Mostrar solo usuarios con multas activas</label>`;
    const container = document.getElementById('loansTableDiv');
    if (container && !document.getElementById('filtroMultasDiv')) {
      container.parentNode.insertBefore(filtroDiv, container);
    }
    const check = filtroDiv.querySelector('#filtroMultasCheck');
    if (check) {
      check.onchange = function() {
        renderLoansTable();
      };
      showOnlyMultas = check.checked;
    }
    if (showOnlyMultas) {
      filteredLoans = filteredLoans.filter(l => {
        const now = new Date();
        const fechaDev = new Date(l.fecha_devolucion);
        let multa = 0;
        if(!l.devuelto && now > fechaDev) {
          const diff = Math.ceil((now-fechaDev)/(1000*60*60*24));
          multa = diff > 0 ? diff : 0;
        }
        return multa > 0 && !l.devuelto;
      });
    }
  }
  // Mostrar botón 'Nuevo Préstamo' solo a estudiantes
  const btnNuevoPrestamo = document.getElementById('btnNuevoPrestamo');
  if (btnNuevoPrestamo) {
    if (activeUser && activeUser.rol === 'Estudiante') {
      btnNuevoPrestamo.style.display = '';
    } else {
      btnNuevoPrestamo.style.display = 'none';
    }
  }
  let searchHtml = '';
  if (!activeUser || activeUser.rol !== 'Estudiante') {
    searchHtml = `<div class="mb-3"><input id="loanSearchInput" class="form-control" type="text" placeholder="Buscar por estudiante, email o libro..."></div>`;
  }
  let table = `<table class="table table-hover"><thead><tr><th>Estudiante</th><th>Libro</th><th>Fecha préstamo</th><th>Fecha devolución</th><th>Días</th><th>Estado</th><th>Multa ($)</th><th>Pago</th><th>Acciones</th></tr></thead><tbody id="loansTableBody">`;
  filteredLoans.forEach((l, i) => {
    const now = new Date();
    const fechaDev = new Date(l.fecha_devolucion);
    let multa = 0;
    if(!l.devuelto && now > fechaDev) {
      const diff = Math.ceil((now-fechaDev)/(1000*60*60*24));
      multa = diff > 0 ? diff : 0;
    }
    // Badge visual si tiene multa activa
    let estudianteHtml = l.estudiante;
    if (multa > 0 && !l.devuelto) {
      estudianteHtml += ' <span class="badge bg-danger ms-1">Multa</span>';
    }
    const estado = l.devuelto ? 'Devuelto' : (l.estado || 'Activo');
    const multaHtml = multa > 0 ? `<span style='color:#DC2626;font-weight:bold'><i class='bi bi-cash-coin'></i> $${multa}</span>` : '$0';
    // Estado de pago y comprobante
    let pagoHtml = '';
    if (l.pagoFisico || l.multaPagada) {
      pagoHtml = `<span class='badge bg-success'>Pagado</span> <button class='btn btn-sm btn-outline-primary' onclick='generarComprobantePagoIdx(${loans.indexOf(l)})'><i class='bi bi-receipt'></i> Comprobante</button>`;
    } else if (multa > 0 && !l.devuelto) {
      pagoHtml = `<span class='badge bg-danger'>Pendiente</span>`;
    } else {
      pagoHtml = '-';
    }
    let acciones = '';
    if (activeUser && activeUser.rol === 'Estudiante' && !l.devuelto) {
      acciones += `<button class="btn btn-sm btn-success" onclick="devolverPrestamo(${loans.indexOf(l)})">Devolver</button> `;
    }
    acciones += `<button class="btn btn-sm btn-info" title="Ver QR" onclick="mostrarQRPrestamo(${loans.indexOf(l)})"><span class='bi bi-qr-code'></span> QR</button> `;
    acciones += `<button class="btn btn-sm btn-secondary" title="Ver Reporte" onclick="verReportePrestamo(${loans.indexOf(l)})"><i class='bi bi-file-earmark-text'></i> Reporte</button> `;
    if (activeUser && activeUser.rol !== 'Estudiante') {
      acciones += `<button class="btn btn-sm btn-danger" title="Exportar PDF" onclick="exportarPrestamoPDF(${loans.indexOf(l)})"><i class='bi bi-file-earmark-pdf'></i> PDF</button> `;
      acciones += `<button class="btn btn-sm btn-danger" onclick="eliminarPrestamo(${loans.indexOf(l)})">Eliminar</button> `;
      // Botón registrar pago físico si hay multa pendiente y no está devuelto
      if (multa > 0 && !l.devuelto) {
        acciones += `<button class="btn btn-sm btn-warning" onclick="registrarPagoFisico(${loans.indexOf(l)},${multa})"><i class='bi bi-cash'></i> Registrar pago físico</button>`;
      }
    }
    table += `<tr data-index="${loans.indexOf(l)}">
      <td>${estudianteHtml}</td>
      <td>${l.libro}</td>
      <td>${l.fecha_prestamo}</td>
      <td>${l.fecha_devolucion}</td>
      <td>${l.dias}</td>
      <td>${estado}</td>
      <td>${multaHtml}</td>
      <td>${pagoHtml}</td>
      <td>${acciones}</td>
    </tr>`;
  });
  table += `</tbody></table>`;
  document.getElementById('loansTableDiv').innerHTML = searchHtml + table;
  // Lógica de filtrado solo si no es estudiante
  if (!activeUser || activeUser.rol !== 'Estudiante') {
    document.getElementById('loanSearchInput').addEventListener('input', function() {
      const val = this.value.trim().toLowerCase();
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const rows = document.querySelectorAll('#loansTableBody tr');
      rows.forEach(row => {
        const idx = row.getAttribute('data-index');
        const l = loans[idx];
        // Buscar por nombre, email o libro
        const user = users.find(u => u.nombre === l.estudiante);
        const email = user ? user.email : '';
        const match = l.estudiante.toLowerCase().includes(val) ||
                      (email && email.toLowerCase().includes(val)) ||
                      l.libro.toLowerCase().includes(val);
        row.style.display = match ? '' : 'none';
      });
    });
  }
}

// Funciones globales para los botones de la tabla de préstamos
window.devolverPrestamo = function(idx){
  let loans = JSON.parse(localStorage.getItem('loans')) || [];
  let books = JSON.parse(localStorage.getItem('books')) || [];
  const estudiante = loans[idx].estudiante;
  const libro = loans[idx].libro;
  const now = new Date();
  const fechaDev = new Date(loans[idx].fecha_devolucion);
  let multa = 0;
  if(!loans[idx].devuelto && now > fechaDev) {
    const diff = Math.ceil((now-fechaDev)/(1000*60*60*24));
    multa = diff > 0 ? diff : 0;
  }
  if (multa > 0) {
    // Cambiar estado a "En proceso" y mostrar opciones
    loans[idx].estado = 'En proceso';
    localStorage.setItem('loans',JSON.stringify(loans));
    renderLoansTable();
    let modal = document.getElementById('modalPagoMulta');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modalPagoMulta';
      modal.className = 'modal fade';
      modal.innerHTML = `
        <div class='modal-dialog'>
          <div class='modal-content'>
            <div class='modal-header'><h5 class='modal-title'>Multa pendiente</h5>
              <button type='button' class='btn-close' data-bs-dismiss='modal'></button>
            </div>
            <div class='modal-body'>
              <p>Debes cancelar la multa de <b style='color:#DC2626'><i class='bi bi-cash-coin'></i> $${multa}</b> para completar la devolución.</p>
              <p>Puedes acercarte a biblioteca o pagar con tarjeta:</p>
              <button class='btn btn-primary mb-2' onclick='pagarMultaConTarjeta(${idx},${multa})'>Pagar con tarjeta</button>
              <div class='text-muted small'>El libro quedará en estado <b>En proceso</b> hasta que se cancele la multa.</div>
            </div>
            <div class='modal-footer'><button class='btn btn-secondary' data-bs-dismiss='modal'>Cerrar</button></div>
          </div>
        </div>`;
      document.body.appendChild(modal);
    }
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    return;
  }
  loans[idx].devuelto = true;
  loans[idx].estado = 'Devuelto';
  // Sumar una copia al libro
  const idxLibro = books.findIndex(b=>b.titulo===libro);
  if(idxLibro>-1){ books[idxLibro].copias_disponibles++; }
  localStorage.setItem('loans',JSON.stringify(loans));
  localStorage.setItem('books',JSON.stringify(books));
  renderLoansTable();
  alert('Préstamo marcado como devuelto.');
};

// Notificación automática al pagar multa (físico o en línea)
function notificarPagoMulta(estudiante, libro, monto, metodo) {
  // Puedes personalizar esto para usar un sistema de notificaciones real
  alert(`Se ha registrado el pago de multa de $${monto} (${metodo}) para el libro "${libro}" del estudiante ${estudiante}.`);
}

window.pagarMultaConTarjeta = function(idx, multa) {
  // Eliminar cualquier modalTarjeta previo para evitar conflictos
  let modalTarjeta = document.getElementById('modalTarjeta');
  if (modalTarjeta) {
    modalTarjeta.parentNode.removeChild(modalTarjeta);
  }
  // Crear y agregar el modal al DOM
  modalTarjeta = document.createElement('div');
  modalTarjeta.id = 'modalTarjeta';
  modalTarjeta.className = 'modal fade';
  modalTarjeta.innerHTML = `
    <div class='modal-dialog'>
      <div class='modal-content'>
        <div class='modal-header'><h5 class='modal-title'>Pago con tarjeta</h5>
          <button type='button' class='btn-close' data-bs-dismiss='modal'></button>
        </div>
        <form id='formPagoTarjeta' autocomplete='off'>
        <div class='modal-body'>
          <div class='mb-2'><label class='form-label'>Número de tarjeta</label><input class='form-control' name='numero' required maxlength='19' pattern='[0-9 ]+'></div>
          <div class='mb-2'><label class='form-label'>Nombre en la tarjeta</label><input class='form-control' name='nombre' required></div>
          <div class='mb-2 row'>
            <div class='col'><label class='form-label'>Vencimiento</label><input class='form-control' name='vencimiento' required maxlength='5' placeholder='MM/AA'></div>
            <div class='col'><label class='form-label'>CVV</label><input class='form-control' name='cvv' required maxlength='4' pattern='[0-9]+'></div>
          </div>
          <div class='mb-2'><b>Total a pagar:</b> <span style='color:#DC2626'><i class='bi bi-cash-coin'></i> $${multa}</span></div>
        </div>
        <div class='modal-footer'>
          <button type='submit' class='btn btn-success'>Pagar</button>
          <button type='button' class='btn btn-secondary' data-bs-dismiss='modal'>Cancelar</button>
        </div>
        </form>
      </div>
    </div>`;
  document.body.appendChild(modalTarjeta);
  // Cerrar modal anterior si existe
  const modal = bootstrap.Modal.getInstance(document.getElementById('modalPagoMulta'));
  if (modal) modal.hide();
  // Mostrar modal de tarjeta
  setTimeout(() => {
    const bsModalTarjeta = new bootstrap.Modal(modalTarjeta);
    bsModalTarjeta.show();
    // Manejar submit (siempre reasignar)
    modalTarjeta.querySelector('#formPagoTarjeta').onsubmit = function(e) {
      e.preventDefault();
      // Mensaje de procesando
      const body = modalTarjeta.querySelector('.modal-body');
      body.innerHTML = `<div class='text-center'><div class='spinner-border text-success mb-2'></div><div>Procesando pago...</div></div>`;
      setTimeout(()=>{
        body.innerHTML = `<div class='text-center text-success'><i class='bi bi-check-circle' style='font-size:2em;'></i><div class='mt-2'>Pago aprobado</div></div>`;
        setTimeout(()=>{
          let loans = JSON.parse(localStorage.getItem('loans')) || [];
          let books = JSON.parse(localStorage.getItem('books')) || [];
          loans[idx].devuelto = true;
          loans[idx].estado = 'Devuelto';
          loans[idx].multaPagada = {
            monto: multa,
            fecha: new Date().toLocaleString(),
            metodo: 'En línea',
            id: 'PL-' + Date.now() + '-' + Math.floor(Math.random()*10000)
          };
          const libro = loans[idx].libro;
          const estudiante = loans[idx].estudiante;
          const idxLibro = books.findIndex(b=>b.titulo===libro);
          if(idxLibro>-1){ books[idxLibro].copias_disponibles++; }
          localStorage.setItem('loans',JSON.stringify(loans));
          localStorage.setItem('books',JSON.stringify(books));
          renderLoansTable();
          const modal2 = bootstrap.Modal.getInstance(modalTarjeta);
          if (modal2) modal2.hide();
          generarComprobantePago(loans[idx]);
          notificarPagoMulta(estudiante, libro, multa, 'En línea');
          alert('Pago realizado y devolución completada. ¡Gracias!');
        }, 1200);
      }, 1200);
    };
  }, 50);
};

window.mostrarQRPrestamo = function(idx) {
  const loans = JSON.parse(localStorage.getItem('loans')) || [];
  const l = loans[idx];
  if (!l) return alert('Préstamo no encontrado');
  let qrDiv = `<div class='text-center'><div id='qrCodeDiv'></div><div class='mt-2'><b>${l.libro}</b><br>${l.estudiante}<br>Devolver: ${l.fecha_devolucion}</div></div>`;
  mostrarModal('Código QR del Préstamo', qrDiv);
  // Usar MutationObserver para asegurar que el div esté en el DOM
  const observer = new MutationObserver(()=>{
    const qrEl = document.getElementById('qrCodeDiv');
    if (qrEl) {
      observer.disconnect();
      if (!window.QRCode) {
        qrEl.innerHTML = '<div style="color:#b91c1c;font-weight:bold">Error: No se pudo cargar la librería QRCode. Revisa el archivo js/qrcode.min.js o recarga la página.</div>';
        return;
      }
      // Forzar modo table para máxima compatibilidad visual
      // Usar texto simple para depuración
      new QRCode(qrEl, {
        text: `Prestamo: ${l.libro} - ${l.estudiante} - ${l.fecha_devolucion}`,
        width: 180,
        height: 180,
        colorDark: "#000000",
        colorLight: "#ffffff",
        render: "table"
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
};

window.verReportePrestamo = function(idx) {
  const loans = JSON.parse(localStorage.getItem('loans')) || [];
  const l = loans[idx];
  if (!l) return alert('Préstamo no encontrado');
  let multa = (!l.devuelto && (new Date() > new Date(l.fecha_devolucion))) ? Math.ceil((new Date()-new Date(l.fecha_devolucion))/(1000*60*60*24)) : 0;
  let html = `<div><b>Estudiante:</b> ${l.estudiante}</div>
    <div><b>Libro:</b> ${l.libro}</div>
    <div><b>Fecha préstamo:</b> ${l.fecha_prestamo}</div>
    <div><b>Fecha devolución:</b> ${l.fecha_devolucion}</div>
    <div><b>Días:</b> ${l.dias}</div>
    <div><b>Devuelto:</b> ${l.devuelto ? 'Sí' : 'No'}</div>
    <div><b>Multa:</b> <span style='color:#DC2626;font-weight:bold'><i class='bi bi-cash-coin'></i> $${multa}</span></div>`;
  mostrarModal('Reporte de Préstamo', html);
};

window.exportarPrestamoPDF = function(idx) {
  alert('Funcionalidad de exportar PDF próximamente.');
};

window.eliminarPrestamo = function(idx){
  let loans = JSON.parse(localStorage.getItem('loans')) || [];
  if(confirm('¿Eliminar préstamo?')){ loans.splice(idx,1); localStorage.setItem('loans',JSON.stringify(loans)); renderLoansTable(); }
};

document.addEventListener('DOMContentLoaded',()=>{
  renderLoansTable();
});

// Modal y flujo de registrar pago físico
window.registrarPagoFisico = function(idx, multa) {
  let modalFisico = document.getElementById('modalPagoFisico');
  if (modalFisico) modalFisico.remove();
  modalFisico = document.createElement('div');
  modalFisico.id = 'modalPagoFisico';
  modalFisico.className = 'modal fade';
  modalFisico.innerHTML = `
    <div class='modal-dialog'>
      <div class='modal-content'>
        <div class='modal-header'><h5 class='modal-title'>Registrar pago físico</h5>
          <button type='button' class='btn-close' data-bs-dismiss='modal'></button>
        </div>
        <form id='formPagoFisico' autocomplete='off'>
        <div class='modal-body'>
          <div class='mb-2'><label class='form-label'>Número de recibo/manual (opcional)</label><input class='form-control' name='recibo'></div>
          <div class='mb-2'><label class='form-label'>Comentario</label><input class='form-control' name='comentario'></div>
          <div class='mb-2'><b>Total pagado:</b> <span style='color:#DC2626'><i class='bi bi-cash-coin'></i> $${multa}</span></div>
        </div>
        <div class='modal-footer'>
          <button type='submit' class='btn btn-success'>Registrar y generar comprobante</button>
          <button type='button' class='btn btn-secondary' data-bs-dismiss='modal'>Cancelar</button>
        </div>
        </form>
      </div>
    </div>`;
  document.body.appendChild(modalFisico);
  const bsModalFisico = new bootstrap.Modal(modalFisico);
  bsModalFisico.show();
  modalFisico.querySelector('#formPagoFisico').onsubmit = function(e) {
    e.preventDefault();
    // Marcar como devuelto, sumar copia, guardar pago
    let loans = JSON.parse(localStorage.getItem('loans')) || [];
    let books = JSON.parse(localStorage.getItem('books')) || [];
    loans[idx].devuelto = true;
    loans[idx].estado = 'Devuelto';
    loans[idx].pagoFisico = {
      monto: multa,
      fecha: new Date().toLocaleString(),
      recibo: modalFisico.querySelector('[name=recibo]').value,
      comentario: modalFisico.querySelector('[name=comentario]').value,
      metodo: 'Físico',
      id: 'PF-' + Date.now() + '-' + Math.floor(Math.random()*10000)
    };
    // Sumar una copia al libro
    const libro = loans[idx].libro;
    const idxLibro = books.findIndex(b=>b.titulo===libro);
    if(idxLibro>-1){ books[idxLibro].copias_disponibles++; }
    localStorage.setItem('loans',JSON.stringify(loans));
    localStorage.setItem('books',JSON.stringify(books));
    renderLoansTable();
    bsModalFisico.hide();
    generarComprobantePago(loans[idx]);
    notificarPagoMulta(estudiante, libro, multa, 'Físico');
    alert('Pago físico registrado y préstamo devuelto.');
  };
};

// Mejorar generación de comprobante para pago físico y en línea
window.generarComprobantePago = function(pagoLoan) {
  const jsPDF = window.jspdf?.jsPDF || window.jspdf;
  if (!jsPDF) { alert('No se pudo cargar jsPDF.'); return; }
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Comprobante de Pago de Multa', 10, 15);
  let y = 25;
  doc.setFontSize(12);
  doc.text(`Estudiante: ${pagoLoan.estudiante}`, 10, y); y+=6;
  doc.text(`Libro: ${pagoLoan.libro}`, 10, y); y+=6;
  doc.text(`Fecha préstamo: ${pagoLoan.fecha_prestamo}`, 10, y); y+=6;
  doc.text(`Fecha devolución: ${pagoLoan.fecha_devolucion}`, 10, y); y+=6;
  let monto = pagoLoan.pagoFisico ? pagoLoan.pagoFisico.monto : (pagoLoan.multaPagada?.monto || '');
  let fechaPago = pagoLoan.pagoFisico ? pagoLoan.pagoFisico.fecha : (pagoLoan.multaPagada?.fecha || '');
  let metodo = pagoLoan.pagoFisico ? 'Físico' : (pagoLoan.multaPagada ? 'En línea' : '');
  let idPago = pagoLoan.pagoFisico ? pagoLoan.pagoFisico.id : (pagoLoan.multaPagada?.id || '');
  doc.text(`Monto pagado: $${monto}`, 10, y); y+=6;
  doc.text(`Fecha de pago: ${fechaPago}`, 10, y); y+=6;
  doc.text(`Método: ${metodo}`, 10, y); y+=6;
  if (pagoLoan.pagoFisico && pagoLoan.pagoFisico.recibo) { doc.text(`Recibo: ${pagoLoan.pagoFisico.recibo}`, 10, y); y+=6; }
  if (pagoLoan.pagoFisico && pagoLoan.pagoFisico.comentario) { doc.text(`Comentario: ${pagoLoan.pagoFisico.comentario}`, 10, y); y+=6; }
  doc.text(`ID de pago: ${idPago}`, 10, y); y+=10;
  doc.text('Gracias por regularizar su situación en la biblioteca.', 10, y);
  doc.save(`comprobante_pago_${pagoLoan.estudiante.replace(/\s+/g,'_')}_${pagoLoan.libro.replace(/\s+/g,'_')}.pdf`);
};

window.generarComprobantePagoIdx = function(idx) {
  const loans = JSON.parse(localStorage.getItem('loans')) || [];
  if (!loans[idx]) return alert('No se encontró el préstamo.');
  window.generarComprobantePago(loans[idx]);
};