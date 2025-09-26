function renderUsersTable() {
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  if (!activeUser || activeUser.rol !== 'Administrador') {
    document.getElementById('usersTableDiv').innerHTML = '<div class="alert alert-danger">Acceso denegado. Solo el administrador puede ver esta sección.</div>';
    return;
  }
  let users = JSON.parse(localStorage.getItem('users')) || [];
  // Asignar fecha_registro a usuarios antiguos que no la tengan
  let actualizo = false;
  users.forEach(u => {
    if (!u.fecha_registro) {
      u.fecha_registro = new Date().toISOString();
      actualizo = true;
    }
  });
  if (actualizo) localStorage.setItem('users', JSON.stringify(users));
  let table = `<table class="table table-hover">
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Email</th>
        <th>Rol</th>
        <th>Fecha registro</th>
        <th>Activo</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>`;
  users.forEach((u, i) => {
    table += `<tr>
      <td>${u.nombre}</td>
      <td>${u.email}</td>
      <td>${u.rol}</td>
      <td>${u.fecha_registro ? new Date(u.fecha_registro).toLocaleString() : ''}</td>
      <td>${u.activo ? 'Sí' : 'No'}</td>
      <td>
        <button class=\"btn btn-sm btn-accent\" onclick=\"editUser(${i})\">Editar</button>
        <button class=\"btn btn-sm btn-warning\" onclick=\"toggleActive(${i})\">${u.activo ? 'Desactivar' : 'Activar'}</button>
        <button class=\"btn btn-sm btn-danger\" onclick=\"deleteUser(${i})\">Eliminar</button>
        <button class=\"btn btn-sm btn-info\" onclick=\"abrirModalMensajeUsuario(${i})\"><i class='bi bi-envelope'></i> Enviar mensaje</button>
      </td>
    </tr>`;
  });
  // Modal para enviar mensaje
  if (!document.getElementById('modalMensajeUsuario')) {
    const modal = document.createElement('div');
    modal.id = 'modalMensajeUsuario';
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class='modal-dialog'>
        <div class='modal-content'>
          <div class='modal-header'><h5 class='modal-title'>Enviar mensaje a usuario</h5>
            <button type='button' class='btn-close' data-bs-dismiss='modal'></button>
          </div>
          <div class='modal-body'>
            <div class='mb-2'><b id='destinoMensajeNombre'></b> <span class='text-muted' id='destinoMensajeEmail'></span></div>
            <div class='mb-2'>
              <label class='form-label'>Mensaje predeterminado:</label>
              <select class='form-select mb-2' id='selectMensajePred'>
                <option value=''>-- Selecciona un mensaje --</option>
                <option value='Tu libro está próximo a vencer. Por favor, devuélvelo a tiempo para evitar multas.'>Tu libro está próximo a vencer. Por favor, devuélvelo a tiempo para evitar multas.</option>
                <option value='Tu libro se ha vencido. Por favor, devuélvelo lo antes posible.'>Tu libro se ha vencido. Por favor, devuélvelo lo antes posible.</option>
                <option value='Tienes una reserva activa. No olvides pasar por la biblioteca a recoger tu libro.'>Tienes una reserva activa. No olvides pasar por la biblioteca a recoger tu libro.</option>
              </select>
            </div>
            <div class='mb-2'>
              <label class='form-label'>Mensaje personalizado:</label>
              <textarea class='form-control' id='mensajePersonalizado' rows='2' placeholder='Escribe tu mensaje aquí...'></textarea>
            </div>
          </div>
          <div class='modal-footer'>
            <button class='btn btn-secondary' data-bs-dismiss='modal'>Cancelar</button>
            <button class='btn btn-primary' id='btnEnviarMensajeUsuario'>Enviar</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }
  window.abrirModalMensajeUsuario = function(idx) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const u = users[idx];
    document.getElementById('destinoMensajeNombre').textContent = u.nombre;
    document.getElementById('destinoMensajeEmail').textContent = u.email;
    document.getElementById('selectMensajePred').value = '';
    document.getElementById('mensajePersonalizado').value = '';
    const modal = new bootstrap.Modal(document.getElementById('modalMensajeUsuario'));
    modal.show();
    document.getElementById('btnEnviarMensajeUsuario').onclick = function() {
      const pred = document.getElementById('selectMensajePred').value;
      const pers = document.getElementById('mensajePersonalizado').value.trim();
      const mensaje = pers || pred;
      if (!mensaje) { alert('Selecciona o escribe un mensaje.'); return; }
      // Guardar notificación manual en localStorage
      let notifs = JSON.parse(localStorage.getItem('notificacionesManual')||'[]');
      notifs.push({ destino: u.nombre, email: u.email, mensaje, titulo: 'Mensaje de la biblioteca', fecha: new Date().toISOString() });
      localStorage.setItem('notificacionesManual', JSON.stringify(notifs));
      modal.hide();
      // Notificación visual
      let div = document.createElement('div');
      div.className = 'alert alert-success position-fixed top-0 end-0 m-4 shadow';
      div.style.zIndex = 9999;
      div.innerHTML = `Notificación enviada a <b>${u.nombre}</b> (${u.email})`;
      document.body.appendChild(div);
      setTimeout(()=>{ div.remove(); }, 3500);
    };
  }
  table += `</tbody></table>`;
  document.getElementById('usersTableDiv').innerHTML = table;
}
function showUserForm(index=null){
  const user = index !== null ? JSON.parse(localStorage.getItem("users"))[index] : {nombre:'',email:'',password:'',rol:'Estudiante',activo:true, facultad:'', carrera:'', direccion:'', telefono:'', fecha_registro: new Date().toISOString()};
  // Facultades y carreras
  const facultades = [
    'Facultad de Ingeniería y Arquitectura',
    'Facultad de Ciencias Económicas',
    'Facultad de Ciencias y Humanidades',
    'Facultad de Ciencias de la Salud'
  ];
  const carrerasPorFacultad = {
    'Facultad de Ingeniería y Arquitectura': [
      'Ingeniería en Sistemas Informáticos',
      'Ingeniería Civil',
      'Arquitectura',
      'Ingeniería Industrial',
      'Ingeniería Eléctrica'
    ],
    'Facultad de Ciencias Económicas': [
      'Administración de Empresas',
      'Contaduría Pública',
      'Economía',
      'Mercadeo',
      'Negocios Internacionales'
    ],
    'Facultad de Ciencias y Humanidades': [
      'Psicología',
      'Trabajo Social',
      'Comunicación Social',
      'Educación Inicial',
      'Educación Básica'
    ],
    'Facultad de Ciencias de la Salud': [
      'Medicina',
      'Enfermería',
      'Odontología',
      'Laboratorio Clínico',
      'Nutrición'
    ]
  };

  // Opciones de facultad
  let facultadOptions = '<option value="">-- Selecciona facultad --</option>';
  facultades.forEach(f => {
    facultadOptions += `<option value="${f}"${user.facultad===f?' selected':''}>${f}</option>`;
  });
  // Opciones de carrera (según facultad seleccionada)
  let carreraOptions = '<option value="">-- Selecciona carrera --</option>';
  if(user.facultad && carrerasPorFacultad[user.facultad]) {
    carrerasPorFacultad[user.facultad].forEach(c => {
      carreraOptions += `<option value="${c}"${user.carrera===c?' selected':''}>${c}</option>`;
    });
  }
  const form = `
    <div class="card p-3 mb-3">
      <h5>${index !== null ? 'Editar Usuario' : 'Añadir Usuario'}</h5>
      <form onsubmit="saveUser(event,${index})">
        <div class="mb-2"><input class="form-control" type="text" id="nombre" placeholder="Nombre" value="${user.nombre||''}" required></div>
        <div class="mb-2"><input class="form-control" type="email" id="email" placeholder="Email" value="${user.email||''}" required></div>
        <div class="mb-2"><input class="form-control" type="password" id="password" placeholder="Contraseña" value="${user.password||''}" required></div>
        <div class="mb-2"><input class="form-control" type="text" id="direccion" placeholder="Dirección" value="${user.direccion||''}"></div>
        <div class="mb-2"><input class="form-control" type="text" id="telefono" placeholder="Teléfono" value="${user.telefono||''}"></div>
        <div class="mb-2">
          <select id="rol" class="form-select">
            <option${user.rol==='Estudiante'?' selected':''}>Estudiante</option>
            <option${user.rol==='Bibliotecario'?' selected':''}>Bibliotecario</option>
            <option${user.rol==='Administrador'?' selected':''}>Administrador</option>
          </select>
        </div>
        <div class="mb-2">
          <select id="facultadSelectUser" class="form-select" onchange="actualizarCarrerasUserForm()">
            ${facultadOptions}
          </select>
        </div>
        <div class="mb-2">
          <select id="carreraSelectUser" class="form-select" ${user.facultad ? '' : 'disabled'}>
            ${carreraOptions}
          </select>
        </div>
        <button class="btn btn-success" type="submit">Guardar</button>
        <button class="btn btn-secondary" type="button" onclick="hideUserForm()">Cancelar</button>
      </form>
    </div>`;
  document.getElementById('userFormDiv').innerHTML = form;
  document.getElementById('userFormDiv').classList.remove('d-none');
  // Script para actualizar carreras según facultad seleccionada
  window.actualizarCarrerasUserForm = function() {
    const facultad = document.getElementById('facultadSelectUser').value;
    const carreraSelect = document.getElementById('carreraSelectUser');
    carreraSelect.innerHTML = '<option value="">-- Selecciona carrera --</option>';
    carreraSelect.disabled = !facultad;
    if(facultad && carrerasPorFacultad[facultad]) {
      carrerasPorFacultad[facultad].forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        carreraSelect.appendChild(opt);
      });
    }
  }
}
function hideUserForm(){ document.getElementById('userFormDiv').classList.add('d-none'); }
function saveUser(e, index){
  e.preventDefault();
  let users = JSON.parse(localStorage.getItem('users')) || [];
  const user = {
    nombre: document.getElementById('nombre').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    direccion: document.getElementById('direccion').value,
    telefono: document.getElementById('telefono').value,
    rol: document.getElementById('rol').value,
    facultad: document.getElementById('facultadSelectUser').value,
    carrera: document.getElementById('carreraSelectUser').value,
    activo: true,
    fecha_registro: index !== null && users[index].fecha_registro ? users[index].fecha_registro : new Date().toISOString()
  };
  if(index !== null){
    users[index] = user;
    mostrarMensaje('Usuario editado correctamente.');
  } else {
    users.push(user);
    mostrarMensaje('Usuario creado correctamente.');
  }
  localStorage.setItem('users', JSON.stringify(users));
  hideUserForm();
  renderUsersTable();

  function mostrarMensaje(msg) {
    let div = document.createElement('div');
    div.className = 'alert alert-success position-fixed top-0 end-0 m-4 shadow';
    div.style.zIndex = 9999;
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(()=>{ div.remove(); }, 3500);
  }
}
function editUser(index){ showUserForm(index); }
function toggleActive(index){
  let users = JSON.parse(localStorage.getItem('users')) || [];
  users[index].activo = !users[index].activo;
  localStorage.setItem('users', JSON.stringify(users));
  renderUsersTable();
  mostrarMensaje(users[index].activo ? 'Usuario activado.' : 'Usuario desactivado.');

  function mostrarMensaje(msg) {
    let div = document.createElement('div');
    div.className = 'alert alert-success position-fixed top-0 end-0 m-4 shadow';
    div.style.zIndex = 9999;
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(()=>{ div.remove(); }, 3500);
  }
}
function deleteUser(index){
  let users = JSON.parse(localStorage.getItem('users')) || [];
  if(confirm('¿Eliminar usuario?')){
    users.splice(index,1);
    localStorage.setItem('users', JSON.stringify(users));
    renderUsersTable();
    mostrarMensaje('Usuario eliminado correctamente.');
  }

  function mostrarMensaje(msg) {
    let div = document.createElement('div');
    div.className = 'alert alert-success position-fixed top-0 end-0 m-4 shadow';
    div.style.zIndex = 9999;
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(()=>{ div.remove(); }, 3500);
  }
}
function logout(){ localStorage.removeItem('activeUser'); window.location.href = 'login.html'; }
document.addEventListener('DOMContentLoaded',renderUsersTable);