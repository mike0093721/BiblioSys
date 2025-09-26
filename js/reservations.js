function renderReservationsTable() {
  const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  let filteredReservations = reservations;
  if (activeUser && activeUser.rol === 'Estudiante') {
    filteredReservations = reservations.filter(r => r.estudiante === activeUser.nombre);
  }
  let searchHtml = '';
  if (!activeUser || activeUser.rol !== 'Estudiante') {
    searchHtml = `<div class="mb-3"><input id="reservationSearchInput" class="form-control" type="text" placeholder="Buscar por estudiante, email o libro..." /></div>`;
  }
  let table = `<table class="table table-hover">
    <thead>
      <tr>
        <th>Estudiante</th>
        <th>Libro</th>
        <th>Fecha Reserva</th>
        <th>Días</th>
        <th>Estado</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody id="reservationsTableBody">`;
  filteredReservations.forEach((r, i) => {
    table += `<tr data-index="${reservations.indexOf(r)}">
      <td>${r.estudiante}</td>
      <td>${r.libro}</td>
      <td>${r.fecha_reserva}</td>
      <td>${r.dias}</td>
      <td>${r.estado}</td>
      <td>
        ${r.estado==='Activa'?`<button class=\"btn btn-sm btn-danger\" onclick=\"cancelarReserva(${reservations.indexOf(r)})\">Cancelar</button>`:""}
        <button class=\"btn btn-sm btn-info\" title=\"Ver QR\" onclick=\"mostrarQRReserva(${reservations.indexOf(r)})\"><span class='bi bi-qr-code'></span> QR</button>
      </td>
    </tr>`;
  });
  table += `</tbody></table>`;
  document.getElementById('reservationsTableDiv').innerHTML = searchHtml + table;
  // Lógica de filtrado solo si no es estudiante
  if (!activeUser || activeUser.rol !== 'Estudiante') {
    document.getElementById('reservationSearchInput').addEventListener('input', function() {
      const val = this.value.trim().toLowerCase();
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const rows = document.querySelectorAll('#reservationsTableBody tr');
      rows.forEach(row => {
        const idx = row.getAttribute('data-index');
        const r = reservations[idx];
        // Buscar por nombre, email o libro
        const user = users.find(u => u.nombre === r.estudiante);
        const email = user ? user.email : '';
        const match = r.estudiante.toLowerCase().includes(val) ||
                      (email && email.toLowerCase().includes(val)) ||
                      r.libro.toLowerCase().includes(val);
        row.style.display = match ? '' : 'none';
      });
    });
  }
}
function showReservationForm(){
  const users = (JSON.parse(localStorage.getItem('users'))||[]).filter(u=>u.rol==="Estudiante"&&u.activo);
  const books = (JSON.parse(localStorage.getItem('books'))||[]).filter(b=>b.copias_disponibles>0);
  let usuarios = users.map(u=>`<option>${u.nombre}</option>`).join('');
  const faculties = [
    "Facultad de Ingeniería y Arquitectura",
    "Facultad de Ciencias Económicas",
    "Facultad de Ciencias y Humanidades",
    "Facultad de Ciencias de la Salud"
  ];
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  let estudianteField = '';
  if (activeUser && activeUser.rol === 'Estudiante') {
    estudianteField = `<div class="mb-2"><input type="text" class="form-control" id="estudiante" value="${activeUser.nombre}" readonly></div>`;
  } else {
    estudianteField = `<div class="mb-2"><select id="estudiante" class="form-select">${usuarios}</select></div>`;
  }
  const form = `
    <div class="card p-3 mb-3">
      <h5>Nueva Reserva</h5>
      <form onsubmit="guardarReserva(event)">
        ${estudianteField}
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
          <select class='form-select' id='libroSelect' required disabled>
            <option value=''>Seleccione libro</option>
          </select>
        </div>
        <div class="mb-2"><input class="form-control" type="number" id="dias" value="3" min="1" max="30" required></div>
        <button class="btn btn-success" type="submit">Reservar</button>
        <button class="btn btn-secondary" type="button" onclick="hideReservationForm()">Cancelar</button>
      </form>
    </div>
  `;
  document.getElementById('reservationFormDiv').innerHTML = form;

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
    libroSelect.innerHTML += libros.map(b=>`<option value="${b.titulo}">${b.titulo} (${b.autor})</option>`).join('');
    libroSelect.disabled = false;
  };

  // Cambiar el id del select de libro en el submit para compatibilidad con guardarReserva
  // (puedes ajustar guardarReserva para usar libroSelect.value si es necesario)
}
function hideReservationForm(){ document.getElementById('reservationFormDiv').innerHTML = ""; }
function guardarReserva(e){
  e.preventDefault();
  let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
  let books = JSON.parse(localStorage.getItem('books')) || [];
  const estudiante = document.getElementById('estudiante').value;
  // Usar libroSelect si existe, si no, usar el id 'libro' (compatibilidad)
  let libro = '';
  const libroSelect = document.getElementById('libroSelect');
  if (libroSelect) {
    libro = libroSelect.value;
  } else {
    const libroInput = document.getElementById('libro');
    libro = libroInput ? libroInput.value : '';
  }
  const dias = parseInt(document.getElementById('dias').value);
  const fecha_reserva = new Date();
  reservations.push({
    estudiante,
    libro,
    fecha_reserva: fecha_reserva.toISOString().slice(0,10),
    dias,
    estado: "Activa"
  });
  // Quitar una copia del libro
  const idxLibro = books.findIndex(b=>b.titulo===libro);
  if(idxLibro>-1){ books[idxLibro].copias_disponibles--; }
  localStorage.setItem('reservations',JSON.stringify(reservations));
  localStorage.setItem('books',JSON.stringify(books));
  hideReservationForm(); renderReservationsTable();
  // Obtener correo del estudiante
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.nombre === estudiante);
  const correo = user ? user.email : '';
  localStorage.setItem('dashboardSuccessMsg', `Reserva realizada correctamente. Se ha enviado un correo electrónico a: <b>${correo}</b>.`);
  window.location.href = 'dashboard.html';
}

// Modal QR reserva
window.mostrarQRReserva = function(idx) {
  const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
  const books = JSON.parse(localStorage.getItem('books')) || [];
  const r = reservations[idx];
  const libro = books.find(b => b.titulo === r.libro);
  let info = `<b>Estudiante:</b> ${r.estudiante}<br><b>Libro:</b> ${r.libro}<br><b>Fecha reserva:</b> ${r.fecha_reserva}<br><b>Días:</b> ${r.dias}`;
  if (libro) {
    info += `<br><b>Autor:</b> ${libro.autor}<br><b>Facultad:</b> ${libro.facultad}<br><b>Categoría:</b> ${libro.categoria}`;
  }
  let modal = document.getElementById('qrReservationModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'qrReservationModal';
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class='modal-dialog'>
        <div class='modal-content'>
          <div class='modal-header'><h5 class='modal-title'>Información de la reserva</h5>
            <button type='button' class='btn-close' data-bs-dismiss='modal'></button>
          </div>
          <div class='modal-body' id='qrReservationModalBody'></div>
          <div class='modal-footer'><div id='qrReservationCode'></div><button class='btn btn-secondary' data-bs-dismiss='modal'>Cerrar</button></div>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }
  document.getElementById('qrReservationModalBody').innerHTML = info;
  // Generar QR
  setTimeout(()=>{
    const qrDiv = document.getElementById('qrReservationCode');
    qrDiv.innerHTML = '';
    const qrData =
      `Estudiante: ${r.estudiante}\n`+
      `Libro: ${r.libro}\n`+
      `Autor: ${libro?.autor || ''}\n`+
      `Facultad: ${libro?.facultad || ''}\n`+
      `Categoría: ${libro?.categoria || ''}\n`+
      `Fecha reserva: ${r.fecha_reserva}\n`+
      `Días: ${r.dias}`;
    // Generar QR visible
    const qrObj = new QRCode(qrDiv, { text: qrData, width: 128, height: 128 });
    // Esperar a que el canvas se genere y mostrar la imagen PNG debajo
    setTimeout(()=>{
      let img = qrDiv.querySelector('img');
      if (!img) {
        // Si no hay img, buscar canvas y convertirlo
        const canvas = qrDiv.querySelector('canvas');
        if (canvas) {
          img = document.createElement('img');
          img.src = canvas.toDataURL('image/png');
          img.alt = 'Código QR como imagen';
          img.className = 'mt-2';
          qrDiv.appendChild(document.createElement('br'));
          qrDiv.appendChild(img);
        }
      } else {
        // Si ya hay img, clonar y mostrar segunda imagen
        const img2 = img.cloneNode(true);
        img2.className = 'mt-2';
        qrDiv.appendChild(document.createElement('br'));
        qrDiv.appendChild(img2);
      }
    }, 300);
  }, 200);
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

function mostrarMensajeReserva(msg) {
  let div = document.createElement('div');
  div.className = 'alert alert-success position-fixed top-0 end-0 m-4 shadow';
  div.style.zIndex = 9999;
  div.innerHTML = msg;
  document.body.appendChild(div);
  setTimeout(()=>{ div.remove(); }, 3500);
}
function cancelarReserva(idx){
  let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
  let books = JSON.parse(localStorage.getItem('books')) || [];
  const libro = reservations[idx].libro;
  reservations[idx].estado = "Cancelada";
  // Sumar una copia al libro
  const idxLibro = books.findIndex(b=>b.titulo===libro);
  if(idxLibro>-1){ books[idxLibro].copias_disponibles++; }
  localStorage.setItem('reservations',JSON.stringify(reservations));
  localStorage.setItem('books',JSON.stringify(books));
  renderReservationsTable();
}
function logout(){ localStorage.removeItem('activeUser'); window.location.href = 'login.html'; }
document.addEventListener('DOMContentLoaded',()=>{ 
  // Siempre mostrar la tabla principal con buscador
  renderReservationsTable();
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  if (!activeUser || activeUser.rol === 'Estudiante' || activeUser.rol === 'Bibliotecario') {
    document.getElementById('reservationFormDiv').innerHTML = `<button class="btn btn-success mb-3" onclick="showReservationForm()">Nueva Reserva</button>`;
  } else {
    document.getElementById('reservationFormDiv').innerHTML = '';
  }
});

function renderAdminReservationsView() {
  const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
  const users = JSON.parse(localStorage.getItem('users')) || [];
  // Obtener usuarios únicos con reservas
  const usuariosConReservas = [...new Set(reservations.map(r => r.estudiante))];
  let html = '<h5>Usuarios con reservas</h5>';
  if (usuariosConReservas.length === 0) {
    html += '<div class="alert alert-info">No hay reservas registradas.</div>';
  } else {
    html += '<ul class="list-group">';
    usuariosConReservas.forEach(nombre => {
      const user = users.find(u => u.nombre === nombre);
      const nombreEsc = encodeURIComponent(nombre);
      html += `<li class=\"list-group-item d-flex justify-content-between align-items-center\">` +
        `<span>${nombre}</span>` +
        `<button class=\"btn btn-primary btn-sm\" onclick=\"verReservasUsuario('${nombreEsc}')\">Ver detalles</button>` +
      `</li>`;
    });
    html += '</ul>';
  }
  document.getElementById('reservationsTableDiv').innerHTML = html;
}


window.verReservasUsuario = function(nombreEsc) {
  const nombre = decodeURIComponent(nombreEsc);
  const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
  const user = (JSON.parse(localStorage.getItem('users')) || []).find(u => u.nombre === nombre);
  let html = `<button class="btn btn-secondary mb-2" onclick="renderAdminReservationsView()">&larr; Volver</button>`;
  html += `<h5>Reservas de ${nombre}</h5>`;
  if (user) {
    html += `<div class=\"mb-2\"><b>Email:</b> ${user.email} <br><b>Rol:</b> ${user.rol}</div>`;
  }
  const reservasUsuario = reservations.filter(r => r.estudiante === nombre);
  if (reservasUsuario.length === 0) {
    html += '<div class="alert alert-warning">Este usuario no tiene reservas.</div>';
  } else {
    html += `<table class=\"table table-hover\"><thead><tr><th>Libro</th><th>Fecha</th><th>Días</th><th>Estado</th></tr></thead><tbody>`;
    reservasUsuario.forEach(r => {
      html += `<tr><td>${r.libro}</td><td>${r.fecha_reserva}</td><td>${r.dias}</td><td>${r.estado}</td></tr>`;
    });
    html += `</tbody></table>`;
    html += `<button class=\"btn btn-outline-success\" onclick=\"generarReporteUsuario('${nombreEsc}')\">Generar reporte PDF</button>`;
  }
  document.getElementById('reservationsTableDiv').innerHTML = html;
}

window.generarReporteUsuario = function(nombre) {
  alert('Funcionalidad de generación de PDF pendiente para ' + nombre);
}