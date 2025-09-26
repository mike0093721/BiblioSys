// Notificación flotante universal para dashboard
function mostrarNotificacionDashboard(msg) {
  let div = document.createElement('div');
  div.className = 'alert alert-success position-fixed top-0 end-0 m-4 shadow fade-in-notif';
  div.style.zIndex = 9999;
  div.style.minWidth = '340px';
  div.style.fontSize = '1.1rem';
  div.style.display = 'flex';
  div.style.alignItems = 'center';
  div.innerHTML = `
    <span style="font-size:1.7em;margin-right:10px;color:#10B981;">✔️</span>
    <span>${msg}</span>
  `;
  document.body.appendChild(div);
  setTimeout(()=>{ div.classList.add('fade-out-notif'); }, 3200);
  setTimeout(()=>{ div.remove(); }, 3700);
}


// Mostrar notificación si viene de préstamo o reserva
document.addEventListener('DOMContentLoaded', () => {
  const notifMsg = localStorage.getItem('dashboardSuccessMsg');
  if (notifMsg) {
    mostrarNotificacionDashboard(notifMsg);
    localStorage.removeItem('dashboardSuccessMsg');
  }
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  // Mostrar botón 'Registrar préstamo' solo a estudiantes
  const btnPrestamo = document.getElementById('btnRegistrarPrestamo');
  if (btnPrestamo) {
    if (activeUser && activeUser.rol === 'Estudiante') {
      btnPrestamo.style.display = '';
    } else {
      btnPrestamo.style.display = 'none';
    }
  }
  if (activeUser && (activeUser.rol === 'Administrador' || activeUser.rol === 'Bibliotecario')) {
    if (activeUser.rol === 'Administrador') {
      document.getElementById('adminDashboard').style.display = '';
      document.getElementById('bibliotecarioDashboard').style.display = 'none';
      renderAdminDashboard();
    } else {
      document.getElementById('adminDashboard').style.display = 'none';
      document.getElementById('bibliotecarioDashboard').style.display = '';
      renderBibliotecarioDashboard();
    }
    // Ocultar widgets de estudiante
    const elems = [
      'studentWelcome','fraseMotivacional','studentProgress','studentMonthlyChallenge',
      'studentRecommendations','studentRanking','studentNotifications','studentStatsRow','studentBadges'];
    elems.forEach(id=>{ const el=document.getElementById(id); if(el) el.style.display='none'; });
    // Campanita de notificaciones para admin/biblio
    const btnNotif = document.getElementById('btnNotificaciones');
    if(btnNotif) btnNotif.style.display = '';
    // Lógica de notificaciones de soporte
    window.renderNotificacionesSoporte = function() {
      const notifSoporte = JSON.parse(localStorage.getItem('notificacionesSoporte')||'[]');
      const badge = document.getElementById('badgeNotificaciones');
      const user = JSON.parse(localStorage.getItem('activeUser'));
      // Filtrar por destino
      const mias = notifSoporte.filter(n=>n.destino === (user.rol==='Administrador'?'admin':'biblioteca'));
      const noLeidas = mias.filter(n=>!n.leida);
      if (badge) {
        badge.style.display = '';
        badge.textContent = noLeidas.length;
      }
      window.abrirModalNotificaciones = function() {
        const lista = document.getElementById('listaModalNotificaciones');
        if (lista) {
          lista.innerHTML = mias.length ?
            mias.map((n,i)=>
              `<li class='list-group-item d-flex flex-column ${n.leida?'':'fw-bold'}'>
                <div><b>${n.origen}</b> <span class='text-muted small'>${n.email}</span></div>
                <div class='mb-2'>${n.mensaje}</div>
                <div class='d-flex gap-2'>
                  <button class='btn btn-sm btn-outline-secondary' onclick='marcarNotifSoporteLeida(${i})'>Marcar como leído</button>
                  <button class='btn btn-sm btn-outline-primary' onclick='responderNotifSoporte(${i})'>Responder</button>
                </div>
              </li>`
            ).join('') : '<li class="text-success">Sin notificaciones</li>';
        }
        const modal = new bootstrap.Modal(document.getElementById('modalNotificaciones'));
        modal.show();
      }
      window.marcarNotifSoporteLeida = function(idx) {
        let notifSoporte = JSON.parse(localStorage.getItem('notificacionesSoporte')||'[]');
        const user = JSON.parse(localStorage.getItem('activeUser'));
        const mias = notifSoporte.filter(n=>n.destino === (user.rol==='Administrador'?'admin':'biblioteca'));
        const realIdx = notifSoporte.findIndex(n=>n===mias[idx]);
        if(realIdx>-1) notifSoporte[realIdx].leida = true;
        localStorage.setItem('notificacionesSoporte', JSON.stringify(notifSoporte));
        renderNotificacionesSoporte();
        window.abrirModalNotificaciones();
      }
      window.responderNotifSoporte = function(idx) {
        const notifSoporte = JSON.parse(localStorage.getItem('notificacionesSoporte')||'[]');
        const user = JSON.parse(localStorage.getItem('activeUser'));
        const mias = notifSoporte.filter(n=>n.destino === (user.rol==='Administrador'?'admin':'biblioteca'));
        const n = mias[idx];
        const respuesta = prompt('Responder a '+n.origen+':', '');
        if(respuesta && respuesta.trim()) {
          let notifs = JSON.parse(localStorage.getItem('notificacionesManual')||'[]');
          const user = JSON.parse(localStorage.getItem('activeUser'));
          let titulo = 'Mensaje de biblioteca';
          if (user.rol === 'Administrador') titulo = 'Mensaje de administración';
          notifs.push({ destino: n.origen, email: n.email, mensaje: respuesta.trim(), titulo, fecha: new Date().toISOString() });
          localStorage.setItem('notificacionesManual', JSON.stringify(notifs));
          alert('Respuesta enviada a '+n.origen);
        }
      }
    };
    renderNotificacionesSoporte();
  } else if (activeUser && activeUser.rol === 'Estudiante') {
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('bibliotecarioDashboard').style.display = 'none';
    document.getElementById('studentDashboard').style.display = '';
    renderStudentDashboard();
  } else {
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('bibliotecarioDashboard').style.display = 'none';
    document.getElementById('studentDashboard').style.display = 'none';
  }
});

// Dashboard para estudiantes
function renderStudentDashboard() {
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  // Bienvenida y frase motivacional (única lógica)
  const welcomeDiv = document.getElementById('studentWelcome');
  if (welcomeDiv && activeUser) {
    welcomeDiv.textContent = `¡Bienvenido/a, ${activeUser.nombre}!`;
  }
  const fraseDiv = document.getElementById('fraseMotivacional');
  if (fraseDiv) {
    const frases = [
      '¡Hoy es un gran día para aprender algo nuevo!',
      'La lectura es la llave del conocimiento.',
      'Un libro es un amigo que nunca falla.',
      '¡Sigue adelante, el saber te espera!',
      'Cada página leída es un paso hacia tus sueños.',
      'Leer te hace libre. ¡Ánimo!'
    ];
    fraseDiv.textContent = frases[Math.floor(Math.random()*frases.length)];
  }
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const loans = JSON.parse(localStorage.getItem('loans')) || [];
  const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
  const books = JSON.parse(localStorage.getItem('books')) || [];
  if (!activeUser || activeUser.rol !== 'Estudiante') return;
  // KPIs
  document.getElementById('studentLoansCount').innerText = loans.filter(l => !l.devuelto && l.estudiante === activeUser.nombre).length;
  document.getElementById('studentReservationsCount').innerText = reservations.filter(r => r.estado === 'Activa' && r.estudiante === activeUser.nombre).length;
  document.getElementById('studentHistoryCount').innerText = loans.filter(l => l.devuelto && l.estudiante === activeUser.nombre).length;
  // Calcular multas activas (préstamos vencidos y no devueltos)
  let hoyMulta = new Date();
  const multasActivas = loans.filter(l => {
    if (l.devuelto) return false;
    if (l.estudiante !== activeUser.nombre) return false;
    const fechaDev = new Date(l.fecha_devolucion);
    return hoyMulta > fechaDev;
  });
  document.getElementById('studentFinesCount').innerText = multasActivas.length;
  // Progreso de lectura
  const leidos = loans.filter(l => l.devuelto && l.estudiante === activeUser.nombre).length;
  const meta = 5;
  const progreso = Math.min(100, Math.round((leidos/meta)*100));
  document.getElementById('studentProgress').innerHTML = `
    <div class="mb-2">
      <div class="progress" style="height: 2rem;">
        <div class="progress-bar bg-success" role="progressbar" style="width: ${progreso}%" aria-valuenow="${progreso}" aria-valuemin="0" aria-valuemax="100">
          ${leidos} leídos de ${meta} (${progreso}%)
        </div>
      </div>
      <div class="small text-muted mt-1">Meta: leer ${meta} libros. ¡Tú puedes!</div>
    </div>`;
  // Reto mensual
  const mesActual = new Date().getMonth() + 1;
  const retos = [
    {mes: 1, texto: 'Lee al menos 2 libros en enero'},
    {mes: 2, texto: 'Lee 1 libro en febrero'},
    {mes: 3, texto: 'Lee 2 libros de diferentes autores en marzo'},
    {mes: 4, texto: 'Lee 1 libro recomendado en abril'},
    {mes: 5, texto: 'Lee 2 libros en mayo'},
    {mes: 6, texto: 'Lee 1 libro de otra carrera en junio'},
    {mes: 7, texto: 'Lee 2 libros en julio'},
    {mes: 8, texto: 'Lee 1 libro clásico en agosto'},
    {mes: 9, texto: 'Lee 2 libros en septiembre'},
    {mes: 10, texto: 'Lee 1 libro de tu autor favorito en octubre'},
    {mes: 11, texto: 'Lee 2 libros en noviembre'},
    {mes: 12, texto: 'Lee 1 libro navideño en diciembre'}
  ];
  const reto = retos.find(r => r.mes === mesActual) || {texto:'¡Sigue leyendo este mes!'};
  const loansEsteMes = loans.filter(l => l.devuelto && l.estudiante === activeUser.nombre && l.fecha_devolucion && l.fecha_devolucion.startsWith(new Date().getFullYear() + '-' + String(mesActual).padStart(2,'0')));
  let metaReto = reto.texto.includes('1 libro') ? 1 : 2;
  const progresoReto = Math.min(100, Math.round((loansEsteMes.length/metaReto)*100));
  document.getElementById('studentMonthlyChallenge').innerHTML = `
    <div class="mb-2">
      <div class="alert alert-warning mb-2">${reto.texto}</div>
      <div class="progress" style="height: 1.5rem;">
        <div class="progress-bar bg-info" role="progressbar" style="width: ${progresoReto}%" aria-valuenow="${progresoReto}" aria-valuemin="0" aria-valuemax="100">
          ${loansEsteMes.length} / ${metaReto} (${progresoReto}%)
        </div>
      </div>
      <div class="small text-muted mt-1">¡Participa y supera el reto mensual!</div>
    </div>`;
  // Recomendaciones (simples)
  const recDiv = document.getElementById('studentRecommendations');
  if (recDiv) {
    const sugeridos = books.slice(0,3).map(b=>`<li>${b.titulo} <span class='text-muted small'>(${b.autor})</span></li>`);
    recDiv.innerHTML = sugeridos.length ? sugeridos.join('') : '<li class="text-muted">Sin recomendaciones</li>';
  }
  // Notificaciones inteligentes
  const notifDiv = document.getElementById('studentNotifications');
  // --- NOTIFICACIONES PERSISTENTES Y LEÍDAS ---
  // Cargar notificaciones guardadas
  let notificacionesGuardadas = JSON.parse(localStorage.getItem('notificacionesEstudiante')||'{}');
  if (!notificacionesGuardadas[activeUser.nombre]) notificacionesGuardadas[activeUser.nombre] = [];
  // Generar notificaciones automáticas (préstamos)
  const hoy = new Date();
  let nuevas = [];
  loans.filter(l => !l.devuelto && l.estudiante === activeUser.nombre).forEach(l => {
    const fechaDev = new Date(l.fecha_devolucion);
    const diff = Math.ceil((fechaDev - hoy)/(1000*60*60*24));
    let tipo = '', texto = '';
    if (diff === 1) { tipo = 'warning'; texto = `El libro <b>${l.libro}</b> vence <b>mañana</b>.`; }
    else if (diff === 0) { tipo = 'warning'; texto = `El libro <b>${l.libro}</b> vence <b>hoy</b>.`; }
    else if (diff < 0) { tipo = 'danger'; texto = `El libro <b>${l.libro}</b> está <b>vencido</b>.`; }
    if (tipo && !notificacionesGuardadas[activeUser.nombre].some(n=>n.texto===texto)) {
      nuevas.push({texto, tipo, leida: false, fecha: new Date().toISOString()});
    }
  });
  // Notificaciones manuales
  const notifManual = JSON.parse(localStorage.getItem('notificacionesManual')||'[]').filter(n=>n.destino===activeUser.nombre);
  notifManual.forEach(n=>{
    const texto = `<b>${n.titulo||'Mensaje de la biblioteca'}:</b> ${n.mensaje}`;
    if (!notificacionesGuardadas[activeUser.nombre].some(x=>x.texto===texto)) {
      nuevas.push({texto, tipo:'primary', leida:false, fecha:n.fecha||new Date().toISOString()});
    }
  });
  // Agregar nuevas
  notificacionesGuardadas[activeUser.nombre].push(...nuevas);
  // Guardar
  localStorage.setItem('notificacionesEstudiante', JSON.stringify(notificacionesGuardadas));
  // Calcular badge (no leídas)
  const noLeidas = notificacionesGuardadas[activeUser.nombre].filter(n=>!n.leida);
  const badge = document.getElementById('badgeNotificaciones');
  if (badge) {
    badge.style.display = '';
    badge.textContent = noLeidas.length;
  }
  // Widget: solo 2 más recientes
  if (notifDiv) {
    const ultimas = notificacionesGuardadas[activeUser.nombre].slice(-2).reverse();
    notifDiv.innerHTML = ultimas.length ? ultimas.map(n=>`<li class='text-${n.tipo}'>${n.texto}</li>`).join('') : '<li class="text-success">Sin notificaciones</li>';
  }
  // Modal: mostrar todas y marcar como leído
  window.abrirModalNotificaciones = function() {
    const lista = document.getElementById('listaModalNotificaciones');
    if (lista) {
      lista.innerHTML = notificacionesGuardadas[activeUser.nombre].length ?
        notificacionesGuardadas[activeUser.nombre].map((n,i)=> {
          let responderBtn = '';
          // Solo permitir responder a mensajes de soporte o respuestas de admin/biblio
          // Solo permitir responder si es mensaje de soporte (no automáticos ni de préstamos)
          if ((n.titulo === 'Respuesta de soporte' || (n.tipo === 'primary' && n.texto.includes('Mensaje de la biblioteca'))) && !n.texto.includes('vence') && !n.texto.includes('vencido')) {
            responderBtn = `<button class='btn btn-sm btn-outline-primary ms-2' onclick='responderNotifEstudiante(${i})'>Responder</button>`;
          }
          return `<li class='list-group-item d-flex justify-content-between align-items-center ${n.leida?'':'fw-bold'}'>
            <span class='text-${n.tipo}'>${n.texto}</span>
            <div>
              <button class='btn btn-sm btn-outline-secondary ms-2' onclick='marcarNotifLeida(${i})'>Marcar como leído</button>
              ${responderBtn}
            </div>
          </li>`;
        }).join('') : '<li class="text-success">Sin notificaciones</li>';
    }
    const modal = new bootstrap.Modal(document.getElementById('modalNotificaciones'));
    modal.show();
  }
  window.responderNotifEstudiante = function(idx) {
    const notificacionesGuardadas = JSON.parse(localStorage.getItem('notificacionesEstudiante')||'{}');
    const activeUser = JSON.parse(localStorage.getItem('activeUser'));
    const notif = notificacionesGuardadas[activeUser.nombre][idx];
    const respuesta = prompt('Responder a biblioteca/administrador:', '');
    if(respuesta && respuesta.trim()) {
      let notifs = JSON.parse(localStorage.getItem('notificacionesSoporte')||'[]');
      // Determinar destino según origen de la notificación
      let destino = 'biblioteca';
      if (notif.titulo === 'Respuesta de soporte') destino = 'admin';
      notifs.push({
        origen: activeUser.nombre,
        email: activeUser.email,
        destino,
        mensaje: respuesta.trim(),
        fecha: new Date().toISOString(),
        leida: false
      });
      localStorage.setItem('notificacionesSoporte', JSON.stringify(notifs));
      alert('Respuesta enviada.');
    }
  }
  }
  window.marcarNotifLeida = function(idx) {
    const activeUser = JSON.parse(localStorage.getItem('activeUser'));
    let notificacionesGuardadas = JSON.parse(localStorage.getItem('notificacionesEstudiante')||'{}');
    if (!notificacionesGuardadas[activeUser.nombre]) return;
    notificacionesGuardadas[activeUser.nombre][idx].leida = true;
    localStorage.setItem('notificacionesEstudiante', JSON.stringify(notificacionesGuardadas));
    renderStudentDashboard();
    window.abrirModalNotificaciones();
  }
  // Acciones rápidas
  const quickDiv = document.getElementById('studentQuickActions');
  if (quickDiv) {
    quickDiv.innerHTML = `
      <button class='btn btn-primary' onclick=\"window.location='books.html'\">Reservar libro</button>
      <button class='btn btn-info' onclick=\"window.location='loans.html'\">Ver préstamos</button>
      <button class='btn btn-success' onclick=\"window.location='reservations.html'\">Ver reservas</button>
      <button class='btn btn-dark' onclick=\"generarComprobanteEstudiante()\">Descargar comprobante</button>
    `;
  }
  // Insignias
  document.getElementById('studentBadges').innerHTML = `<span class='badge bg-primary me-2'>Lector</span>`;
  // Ranking real
  // Calcular ranking por libros leídos (devueltos)
  const estudiantes = users.filter(u => u.rol === 'Estudiante');
  const ranking = estudiantes.map(est => {
    const leidos = loans.filter(l => l.estudiante === est.nombre && l.devuelto).length;
    return { nombre: est.nombre, leidos };
  }).sort((a, b) => b.leidos - a.leidos);
  const miPos = ranking.findIndex(r => r.nombre === activeUser.nombre) + 1;
  const miLeidos = ranking.find(r => r.nombre === activeUser.nombre)?.leidos || 0;
  let rankingHtml = '';
  if (miLeidos === 0) {
    rankingHtml = `<span class='text-muted'>¡Aún no has leído ningún libro! Empieza a leer para aparecer en el ranking 📚</span>`;
  } else {
    rankingHtml = `<span class='fw-bold'>Tu posición en el ranking: #${miPos} de ${ranking.length}</span><br>`;
    rankingHtml += `<span class='text-success'>Has leído ${miLeidos} libro${miLeidos===1?'':'s'}.</span>`;
    if (miPos > 5) rankingHtml += `<br><span class='text-muted'>¡Sigue leyendo para entrar al Top 5!</span>`;
  }
  document.getElementById('studentRanking').innerHTML = rankingHtml;
function renderAdminDashboard() {
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  const users = JSON.parse(localStorage.getItem('users')) || [];
  // Bienvenida personalizada
  const welcomeDiv = document.getElementById('adminWelcome');
  if (welcomeDiv && activeUser) {
    welcomeDiv.textContent = `¡Bienvenido/a, ${activeUser.nombre}!`;
  }
  const recomendacionesDiv = document.getElementById('adminRecomendaciones');
  if (recomendacionesDiv) {
    recomendacionesDiv.textContent = 'Recuerda revisar los reportes, gestionar usuarios y mantener actualizada la base de libros. ¡Tu gestión es clave para el éxito del sistema!';
  }
  const loans = JSON.parse(localStorage.getItem('loans')) || [];
  const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
  const books = JSON.parse(localStorage.getItem('books')) || [];
  // KPIs
  document.getElementById('adminBooksCount').innerText = books.length;
  document.getElementById('adminLoansCount').innerText = loans.filter(l=>!l.devuelto).length;
  document.getElementById('adminReservationsCount').innerText = reservations.filter(r=>r.estado==='Activa').length;
  document.getElementById('adminUsersCount').innerText = users.length;
  document.getElementById('adminEstudiantesCount').innerText = users.filter(u=>u.rol==='Estudiante').length;
  document.getElementById('adminBibliotecariosCount').innerText = users.filter(u=>u.rol==='Bibliotecario').length;
  document.getElementById('adminAdminsCount').innerText = users.filter(u=>u.rol==='Administrador').length;
  // Ranking Top 5 estudiantes lectores
  const estudiantes = users.filter(u => u.rol === 'Estudiante');
  const ranking = estudiantes.map(est => {
    const leidos = loans.filter(l => l.estudiante === est.nombre && l.devuelto).length;
    return { nombre: est.nombre, leidos };
  }).sort((a, b) => b.leidos - a.leidos).slice(0,5);
  let rankingHtml = '<ol class="mb-0">';
  ranking.forEach((r, i) => {
    rankingHtml += `<li><b>${r.nombre}</b> <span class='text-success'>(${r.leidos} libro${r.leidos===1?'':'s'})</span></li>`;
  });
  rankingHtml += '</ol>';
  const rankingDiv = document.getElementById('adminStudentRanking');
  if (rankingDiv) rankingDiv.innerHTML = rankingHtml;
  // Alertas
  let alertsGeneral = [];
  let pocosLibrosGeneral = books.filter(b=>b.copias_disponibles!==undefined && b.copias_disponibles<=2);
  if(pocosLibrosGeneral.length) alertsGeneral.push(`<li>Libros con pocas copias: <b>${pocosLibrosGeneral.map(b=>b.titulo).join(', ')}</b></li>`);
  let vencidosGeneral = loans.filter(l=>!l.devuelto && new Date(l.fecha_devolucion)<new Date());
  if(vencidosGeneral.length) alertsGeneral.push(`<li>Préstamos vencidos: <b>${vencidosGeneral.length}</b></li>`);
  if(!alertsGeneral.length) alertsGeneral.push('<li class="text-success">Sin alertas críticas</li>');
  document.getElementById('adminAlertsList').innerHTML = alertsGeneral.join('');
  // Filtros rápidos por facultad
  const facultades = [...new Set(users.map(u=>u.facultad).filter(f=>f))];
  document.getElementById('adminFilters').innerHTML = facultades.length ?
    `<select class='form-select' id='adminFilterFacultad'><option value=''>Todas las facultades</option>${facultades.map(f=>`<option>${f}</option>`).join('')}</select>` :
    '<span class="text-muted">Sin facultades registradas</span>';
  document.getElementById('adminFilterFacultad')?.addEventListener('change', function() {
    renderAdminDashboard(this.value);
  });
  // Filtrado por facultad si aplica
  let facultadSel = '';
  if (typeof arguments[0] === 'string') facultadSel = arguments[0];
  let usersFiltrados = facultadSel ? users.filter(u=>u.facultad===facultadSel) : users;
  let loansFiltrados = facultadSel ? loans.filter(l=>{
    const u = users.find(u=>u.nombre===l.estudiante);
    return u && u.facultad===facultadSel;
  }) : loans;
  let reservationsFiltradas = facultadSel ? reservations.filter(r=>{
    const u = users.find(u=>u.nombre===r.estudiante);
    return u && u.facultad===facultadSel;
  }) : reservations;
  let booksFiltrados = facultadSel ? books.filter(b=>b.facultad===facultadSel) : books;
  // KPIs filtrados
  document.getElementById('adminBooksCount').innerText = booksFiltrados.length;
  document.getElementById('adminLoansCount').innerText = loansFiltrados.filter(l=>!l.devuelto).length;
  document.getElementById('adminReservationsCount').innerText = reservationsFiltradas.filter(r=>r.estado==='Activa').length;
  document.getElementById('adminUsersCount').innerText = usersFiltrados.length;
  document.getElementById('adminEstudiantesCount').innerText = usersFiltrados.filter(u=>u.rol==='Estudiante').length;
  document.getElementById('adminBibliotecariosCount').innerText = usersFiltrados.filter(u=>u.rol==='Bibliotecario').length;
  document.getElementById('adminAdminsCount').innerText = usersFiltrados.filter(u=>u.rol==='Administrador').length;
  // Alertas filtradas
  let alertsFiltrado = [];
  let pocosLibrosFiltrado = booksFiltrados.filter(b=>b.copias_disponibles!==undefined && b.copias_disponibles<=2);
  if(pocosLibrosFiltrado.length) alertsFiltrado.push(`<li>Libros con pocas copias: <b>${pocosLibrosFiltrado.map(b=>b.titulo).join(', ')}</b></li>`);
  let vencidosFiltrado = loansFiltrados.filter(l=>!l.devuelto && new Date(l.fecha_devolucion)<new Date());
  if(vencidosFiltrado.length) alertsFiltrado.push(`<li>Préstamos vencidos: <b>${vencidosFiltrado.length}</b></li>`);
  if(!alertsFiltrado.length) alertsFiltrado.push('<li class="text-success">Sin alertas críticas</li>');
  document.getElementById('adminAlertsList').innerHTML = alertsFiltrado.join('');
  // Últimas actividades filtradas
  let acts = [];
  loansFiltrados.slice(-5).reverse().forEach(l=>acts.push(`<li>Préstamo: <b>${l.estudiante}</b> - ${l.libro} (${l.fecha_prestamo})</li>`));
  reservationsFiltradas.slice(-5).reverse().forEach(r=>acts.push(`<li>Reserva: <b>${r.estudiante}</b> - ${r.libro} (${r.fecha_reserva})</li>`));
  usersFiltrados.slice(-5).reverse().forEach(u=>acts.push(`<li>Usuario: <b>${u.nombre}</b> (${u.rol})</li>`));
  if(!acts.length) acts.push('<li class="text-muted">Sin actividades recientes</li>');
  document.getElementById('adminActivityList').innerHTML = acts.slice(0,5).join('');
  // Gráficas filtradas
  if(window.Chart) renderAdminCharts(booksFiltrados, loansFiltrados, reservationsFiltradas);
  // Al final de la función, llenar la tabla de usuarios recientes de forma robusta
  setTimeout(() => {
    const adminRecentUsers = users.slice(-5).reverse();
    const adminRecentUsersTbody = document.getElementById('adminRecentUsers');
    if (adminRecentUsersTbody) {
      adminRecentUsersTbody.innerHTML = adminRecentUsers.length ? adminRecentUsers.map(u=>`<tr><td>${u.nombre}</td><td>${u.email||''}</td><td>${u.rol}</td><td>${u.facultad||''}</td></tr>`).join('') : '<tr><td colspan="4" class="text-muted">Sin usuarios recientes</td></tr>';
    }
  }, 0);
}
// Gráficas admin filtradas
function renderAdminCharts(books, loans, reservations) {
  // Libros prestados vs disponibles
  const total = books.reduce((acc, b) => acc + (b.copias_totales || 1), 0);
  const prestados = loans.filter(l => !l.devuelto).length;
  const disponibles = total - prestados;
  const ctxLibros = document.getElementById('adminChartLibros').getContext('2d');
  if (window.adminChartLibros) window.adminChartLibros.destroy();
  window.adminChartLibros = new Chart(ctxLibros, {
    type: 'doughnut',
    data: {
      labels: ['Prestados', 'Disponibles'],
      datasets: [{ data: [prestados, disponibles], backgroundColor: ['#36a2eb', '#4caf50'] }]
    },
    options: {responsive:true, plugins:{legend:{position:'bottom'}}}
  });
  // Préstamos y reservas por día
  const dias = Array.from({length: 7}, (_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-i);
    return d.toISOString().slice(0,10);
  }).reverse();
  const prestamosPorDia = dias.map(dia => loans.filter(l=>l.fecha_prestamo===dia).length);
  const reservasPorDia = dias.map(dia => reservations.filter(r=>r.fecha_reserva===dia).length);
  const ctxMov = document.getElementById('adminChartMovimientos').getContext('2d');
  if (window.adminChartMovimientos) window.adminChartMovimientos.destroy();
  window.adminChartMovimientos = new Chart(ctxMov, {
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

// Dashboardpara bibliotecario
function renderBibliotecarioDashboard() {
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  const users = JSON.parse(localStorage.getItem('users')) || [];
  // Bienvenida personalizada
  const welcomeDiv = document.getElementById('biblioWelcome');
  if (welcomeDiv && activeUser) {
    welcomeDiv.textContent = `¡Bienvenido/a, ${activeUser.nombre}!`;
  }
  const recomendacionesDiv = document.getElementById('biblioRecomendaciones');
  if (recomendacionesDiv) {
    recomendacionesDiv.textContent = 'Gestiona los préstamos y devoluciones, apoya a los estudiantes y mantén la biblioteca en óptimas condiciones. ¡Gracias por tu dedicación!';
  }
  const loans = JSON.parse(localStorage.getItem('loans')) || [];
  const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
  const books = JSON.parse(localStorage.getItem('books')) || [];
  // KPIs principales
  document.getElementById('biblioBooksCount').innerText = books.length;
  document.getElementById('biblioLoansCount').innerText = loans.filter(l=>!l.devuelto).length;
  document.getElementById('biblioReservationsCount').innerText = reservations.filter(r=>r.estado==='Activa').length;
  // Alertas
  let alerts = [];
  const stockBajo = books.filter(b=>b.copias_disponibles!==undefined && b.copias_disponibles<=2);
  const vencidos = loans.filter(l=>!l.devuelto && new Date(l.fecha_devolucion)<new Date());
  if(stockBajo.length) alerts.push(`<li>Libros con pocas copias: <b>${stockBajo.map(b=>b.titulo).join(', ')}</b></li>`);
  if(vencidos.length) alerts.push(`<li>Préstamos vencidos: <b>${vencidos.length}</b></li>`);
  if(!alerts.length) alerts.push('<li class="text-success">Sin alertas críticas</li>');
  document.getElementById('biblioAlertsList').innerHTML = alerts.join('');
  // Filtros rápidos por facultad
  const facultades = [...new Set(users.map(u=>u.facultad).filter(f=>f))];
  document.getElementById('biblioFilters').innerHTML = facultades.length ?
    `<select class='form-select' id='biblioFilterFacultad'><option value=''>Todas las facultades</option>${facultades.map(f=>`<option>${f}</option>`).join('')}</select>` :
    '<span class="text-muted">Sin facultades registradas</span>';
  document.getElementById('biblioFilterFacultad')?.addEventListener('change', function() {
    renderBibliotecarioDashboard(this.value);
  });
  // Filtrado por facultad si aplica
  let facultadSel = '';
  if (typeof arguments[0] === 'string') facultadSel = arguments[0];
  let usersFiltrados = facultadSel ? users.filter(u=>u.facultad===facultadSel) : users;
  let loansFiltrados = facultadSel ? loans.filter(l=>{
    const u = users.find(u=>u.nombre===l.estudiante);
    return u && u.facultad===facultadSel;
  }) : loans;
  let reservationsFiltradas = facultadSel ? reservations.filter(r=>{
    const u = users.find(u=>u.nombre===r.estudiante);
    return u && u.facultad===facultadSel;
  }) : reservations;
  let booksFiltrados = facultadSel ? books.filter(b=>b.facultad===facultadSel) : books;
  // KPIs filtrados
  document.getElementById('biblioBooksCount').innerText = booksFiltrados.length;
  document.getElementById('biblioLoansCount').innerText = loansFiltrados.filter(l=>!l.devuelto).length;
  document.getElementById('biblioReservationsCount').innerText = reservationsFiltradas.filter(r=>r.estado==='Activa').length;
  // Alertas filtradas
  let alertsFiltrado = [];
  let pocosLibrosFiltrado = booksFiltrados.filter(b=>b.copias_disponibles!==undefined && b.copias_disponibles<=2);
  let vencidosFiltrado = loansFiltrados.filter(l=>!l.devuelto && new Date(l.fecha_devolucion)<new Date());
  if(pocosLibrosFiltrado.length) alertsFiltrado.push(`<li>Libros con pocas copias: <b>${pocosLibrosFiltrado.map(b=>b.titulo).join(', ')}</b></li>`);
  if(vencidosFiltrado.length) alertsFiltrado.push(`<li>Préstamos vencidos: <b>${vencidosFiltrado.length}</b></li>`);
  if(!alertsFiltrado.length) alertsFiltrado.push('<li class="text-success">Sin alertas críticas</li>');
  document.getElementById('biblioAlertsList').innerHTML = alertsFiltrado.join('');
  // Últimas actividades filtradas
  let acts = [];
  loansFiltrados.slice(-5).reverse().forEach(l=>acts.push(`<li>Préstamo: <b>${l.estudiante}</b> - ${l.libro} (${l.fecha_prestamo})</li>`));
  reservationsFiltradas.slice(-5).reverse().forEach(r=>acts.push(`<li>Reserva: <b>${r.estudiante}</b> - ${r.libro} (${r.fecha_reserva})</li>`));
  // No mostrar actividades de usuarios en bibliotecario
  if(!acts.length) acts.push('<li class="text-muted">Sin actividades recientes</li>');
  document.getElementById('biblioActivityList').innerHTML = acts.slice(0,5).join('');
  // Tabla de usuarios recientes (igual que admin: últimos 5 del sistema, sin importar filtro ni rol)
  const recentUsers = users.slice(-5).reverse();
  const recentUsersTbody = document.getElementById('biblioRecentUsers');
  if (recentUsersTbody) {
    recentUsersTbody.innerHTML = recentUsers.length ? recentUsers.map(u=>`<tr><td>${u.nombre}</td><td>${u.email||''}</td><td>${u.rol}</td><td>${u.facultad||''}</td></tr>`).join('') : '<tr><td colspan="4" class="text-muted">Sin usuarios recientes</td></tr>';
  }
  // Gráficas
  if(window.Chart) renderBibliotecarioCharts(booksFiltrados, loansFiltrados, reservationsFiltradas, usersFiltrados);
}

function renderBibliotecarioCharts(books, loans, reservations) {
  // Usuarios por facultad
  const users = arguments[3] || JSON.parse(localStorage.getItem('users')) || [];
  const facultadLabels = [...new Set(users.map(u=>u.facultad).filter(f=>f))];
  const facultadCounts = facultadLabels.map(f=>users.filter(u=>u.facultad===f).length);
  const ctxFac = document.getElementById('biblioChartFacultades').getContext('2d');
  if (window.biblioChartFacultades) window.biblioChartFacultades.destroy();
  if (facultadLabels.length && facultadCounts.some(c=>c>0)) {
    window.biblioChartFacultades = new Chart(ctxFac, {
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
  // Libros prestados vs disponibles
  const total = books.reduce((acc, b) => acc + (b.copias_totales || 1), 0);
  const prestados = loans.filter(l => !l.devuelto).length;
  const disponibles = total - prestados;
  const ctxLibros = document.getElementById('biblioChartLibros').getContext('2d');
  if (window.biblioChartLibros) window.biblioChartLibros.destroy();
  if (total > 0) {
    window.biblioChartLibros = new Chart(ctxLibros, {
      type: 'doughnut',
      data: {
        labels: ['Prestados', 'Disponibles'],
        datasets: [{ data: [prestados, disponibles], backgroundColor: ['#36a2eb', '#4caf50'] }]
      },
      options: {responsive:true, plugins:{legend:{position:'bottom'}}}
    });
  } else {
    ctxLibros.clearRect(0,0,ctxLibros.canvas.width,ctxLibros.canvas.height);
    ctxLibros.font = '16px sans-serif';
    ctxLibros.fillStyle = '#888';
    ctxLibros.textAlign = 'center';
    ctxLibros.fillText('Sin datos', ctxLibros.canvas.width/2, ctxLibros.canvas.height/2);
  }
  // Préstamos y reservas por día
  const dias = Array.from({length: 7}, (_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-i);
    return d.toISOString().slice(0,10);
  }).reverse();
  const prestamosPorDia = dias.map(dia => loans.filter(l=>l.fecha_prestamo===dia).length);
  const reservasPorDia = dias.map(dia => reservations.filter(r=>r.fecha_reserva===dia).length);
  const ctxMov = document.getElementById('biblioChartMovimientos').getContext('2d');
  if (window.biblioChartMovimientos) window.biblioChartMovimientos.destroy();
  if (prestamosPorDia.some(v=>v>0) || reservasPorDia.some(v=>v>0)) {
    window.biblioChartMovimientos = new Chart(ctxMov, {
      type: 'line',
      data: {
        labels: dias,
        datasets: [
          { label: 'Préstamos', data: prestamosPorDia, borderColor: '#36a2eb', backgroundColor: 'rgba(54,162,235,0.2)', tension:0.3 },
          { label: 'Reservas', data: reservasPorDia, borderColor: '#f59e42', backgroundColor: 'rgba(245,158,66,0.2)', tension:0.3 }
        ]
      },
      options: {responsive:true, plugins:{legend:{position:'bottom'}}}
    });
  } else {
    ctxMov.clearRect(0,0,ctxMov.canvas.width,ctxMov.canvas.height);
    ctxMov.font = '16px sans-serif';
    ctxMov.fillStyle = '#888';
    ctxMov.textAlign = 'center';
    ctxMov.fillText('Sin datos', ctxMov.canvas.width/2, ctxMov.canvas.height/2);
  }
}

function renderDashboardWidgets() {
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const loans = JSON.parse(localStorage.getItem('loans')) || [];
  const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
  const books = JSON.parse(localStorage.getItem('books')) || [];
  // Bienvenida
  if (activeUser && activeUser.rol === 'Estudiante') {
  }
  // Flujo clásico de actualización de foto de perfil (sin Cropper.js)
  const fotoInput = document.getElementById('fotoPerfilInput');
  const preview = document.getElementById('previewFotoPerfil');
  if (fotoInput) {
    fotoInput.onchange = function(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(ev) {
        preview.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
  const form = document.getElementById('updatePhotoForm');
  if (form) {
    form.onsubmit = function(e) {
      e.preventDefault();
      let user = JSON.parse(localStorage.getItem('activeUser'));
      if (!user) return;
      user.fotoPerfil = preview.src;
      // Actualizar en users
      let users = JSON.parse(localStorage.getItem('users')) || [];
      const idx = users.findIndex(u => u.email === user.email || u.nombre === user.nombre);
      if (idx !== -1) users[idx] = user;
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('activeUser', JSON.stringify(user));
      document.getElementById('avatarImg').src = user.fotoPerfil;
      bootstrap.Modal.getInstance(document.getElementById('updatePhotoModal')).hide();
      alert('Foto de perfil actualizada.');
    }
  }
  // ...resto del código...
    if (window.adminChartFacultades) window.adminChartFacultades.destroy();
    if (facultadLabels.length && facultadCounts.some(c=>c>0)) {
      window.adminChartFacultades = new Chart(ctxFac, {
        type: 'bar',
        data: {
          labels: facultadLabels,
          datasets: [{
            label: 'Usuarios',
            data: facultadCounts,
            backgroundColor: '#6366f1'
          }]
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
    // Libros prestados vs disponibles
    const total = booksFiltrados.reduce((acc, b) => acc + (b.copias_totales || 1), 0);
    const prestados = loansFiltrados.filter(l => !l.devuelto).length;
    const disponibles = total - prestados;
    const ctxLibros = document.getElementById('adminChartLibros').getContext('2d');
    if (window.adminChartLibros) window.adminChartLibros.destroy();
    if (total > 0) {
      window.adminChartLibros = new Chart(ctxLibros, {
        type: 'doughnut',
        data: {
          labels: ['Prestados', 'Disponibles'],
          datasets: [{ data: [prestados, disponibles], backgroundColor: ['#36a2eb', '#4caf50'] }]
        },
        options: {responsive:true, plugins:{legend:{position:'bottom'}}}
      });
    } else {
      ctxLibros.clearRect(0,0,ctxLibros.canvas.width,ctxLibros.canvas.height);
      ctxLibros.font = '16px sans-serif';
      ctxLibros.fillStyle = '#888';
      ctxLibros.textAlign = 'center';
      ctxLibros.fillText('Sin datos', ctxLibros.canvas.width/2, ctxLibros.canvas.height/2);
    }
    // Préstamos y reservas por día
    const dias = Array.from({length: 7}, (_,i)=>{
      const d = new Date(); d.setDate(d.getDate()-i);
      return d.toISOString().slice(0,10);
    }).reverse();
    const prestamosPorDia = dias.map(dia => loansFiltrados.filter(l=>l.fecha_prestamo===dia).length);
    const reservasPorDia = dias.map(dia => reservationsFiltrados.filter(r=>r.fecha_reserva===dia).length);
    const ctxMov = document.getElementById('adminChartMovimientos').getContext('2d');
    if (window.adminChartMovimientos) window.adminChartMovimientos.destroy();
    if (prestamosPorDia.some(v=>v>0) || reservasPorDia.some(v=>v>0)) {
      window.adminChartMovimientos = new Chart(ctxMov, {
        type: 'line',
        data: {
          labels: dias,
          datasets: [
            { label: 'Préstamos', data: prestamosPorDia, borderColor: '#36a2eb', backgroundColor: 'rgba(54,162,235,0.2)', tension:0.3 },
            { label: 'Reservas', data: reservasPorDia, borderColor: '#f59e42', backgroundColor: 'rgba(245,158,66,0.2)', tension:0.3 }
          ]
        },
        options: {responsive:true, plugins:{legend:{position:'bottom'}}}
      });
    } else {
      ctxMov.clearRect(0,0,ctxMov.canvas.width,ctxMov.canvas.height);
      ctxMov.font = '16px sans-serif';
      ctxMov.fillStyle = '#888';
      ctxMov.textAlign = 'center';
      ctxMov.fillText('Sin datos', ctxMov.canvas.width/2, ctxMov.canvas.height/2);
    }
  }
  if (!window.Chart) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = drawAdminCharts;
    document.head.appendChild(script);
    // Si después de 4 segundos Chart.js no está cargado, mostrar advertencia
    setTimeout(() => {
      if (!window.Chart) {
        const container = document.querySelector('#adminDashboard');
        if (container && !document.getElementById('chartjs-warning')) {
          const alert = document.createElement('div');
          alert.id = 'chartjs-warning';
          alert.className = 'alert alert-danger mt-3';
          alert.innerHTML = '<b>Error:</b> No se pudo cargar Chart.js. Verifica tu conexión a internet o contacta al administrador.';
          container.prepend(alert);
        }
      }
    }, 4000);
  } else {
    drawAdminCharts();
  }
      if (welcomeDiv) {
        welcomeDiv.innerHTML = `<div class="text-center mb-4">
          <h1 class="display-4 fw-bold mb-2">¡Bienvenido/a, ${activeUser.nombre}!</h1>
          <div class="lead text-secondary">Tu espacio personal de lectura y progreso académico</div>
        </div>`;
      }
      const frases = [
        '¡Hoy es un gran día para aprender algo nuevo!',
        'La lectura es la llave del conocimiento.',
        'Un libro es un amigo que nunca falla.',
        '¡Sigue adelante, el saber te espera!',
        'Cada página leída es un paso hacia tus sueños.',
        'Leer te hace libre. ¡Ánimo!'
      ];
      const fraseElem = document.getElementById('fraseMotivacional');
      if (fraseElem) {
        fraseElem.textContent = frases[Math.floor(Math.random()*frases.length)];
      }
  // Barra de progreso
  const studentLoans = activeUser ? loans.filter(l => l.estudiante === activeUser.nombre) : [];
  const leidos = studentLoans.filter(l => l.devuelto).length;
  const meta = 5;
  const progreso = Math.min(100, Math.round((leidos/meta)*100));
  const progressDiv = document.getElementById('studentProgress');
  if (progressDiv) {
    progressDiv.innerHTML = `
      <div class="mb-3">
        <label class="form-label">Progreso de lectura personal</label>
        <div class="progress" style="height: 2rem;">
          <div class="progress-bar bg-success" role="progressbar" style="width: ${progreso}%" aria-valuenow="${progreso}" aria-valuemin="0" aria-valuemax="100">
            ${leidos} leídos de ${meta} (${progreso}%)
          </div>
        </div>
        <div class="small text-muted mt-1">Meta: leer ${meta} libros. ¡Tú puedes!</div>
      </div>`;
  }
  // Reto mensual
  const carreraReto = activeUser && activeUser.carrera ? activeUser.carrera : null;
  const facultadReto = activeUser && activeUser.facultad ? activeUser.facultad : null;
  const retos = [
    {mes: 1, texto: carreraReto ? `Lee al menos 2 libros de la carrera ${carreraReto} en enero` : 'Lee al menos 2 libros en enero'},
    {mes: 2, texto: facultadReto ? `Lee 1 libro de la facultad ${facultadReto} en febrero` : 'Lee 1 libro de tu facultad en febrero'},
    {mes: 3, texto: carreraReto ? `Lee 2 libros de diferentes autores de ${carreraReto} en marzo` : 'Lee 2 libros de diferentes autores en marzo'},
    {mes: 4, texto: carreraReto ? `Lee 1 libro recomendado de ${carreraReto} en abril` : 'Lee 1 libro recomendado en abril'},
    {mes: 5, texto: carreraReto ? `Lee 2 libros de ${carreraReto} en mayo` : 'Lee 2 libros en mayo'},
    {mes: 6, texto: facultadReto ? `Lee 1 libro de otra carrera de la facultad ${facultadReto} en junio` : 'Lee 1 libro de otra carrera en junio'},
    {mes: 7, texto: carreraReto ? `Lee 2 libros de ${carreraReto} en julio` : 'Lee 2 libros en julio'},
    {mes: 8, texto: 'Lee 1 libro clásico en agosto'},
    {mes: 9, texto: carreraReto ? `Lee 2 libros de ${carreraReto} en septiembre` : 'Lee 2 libros en septiembre'},
    {mes: 10, texto: 'Lee 1 libro de tu autor favorito en octubre'},
    {mes: 11, texto: carreraReto ? `Lee 2 libros de ${carreraReto} en noviembre` : 'Lee 2 libros en noviembre'},
    {mes: 12, texto: 'Lee 1 libro navideño en diciembre'}
  ];
  const mesActual = new Date().getMonth() + 1;
  const reto = retos.find(r => r.mes === mesActual) || {texto:'¡Sigue leyendo este mes!'};
  const loansEsteMes = studentLoans.filter(l => l.devuelto && l.fecha_devolucion && l.fecha_devolucion.startsWith(new Date().getFullYear() + '-' + String(mesActual).padStart(2,'0')));
  let metaReto = 2;
  if (reto.texto.includes('1 libro')) metaReto = 1;
  const progresoReto = Math.min(100, Math.round((loansEsteMes.length/metaReto)*100));
  const retoDiv = document.getElementById('studentMonthlyChallenge');
  if (retoDiv) {
    retoDiv.innerHTML = `
      <div class="mb-3">
        <label class="form-label"><b>Reto de lectura del mes</b></label>
        <div class="alert alert-warning mb-2">${reto.texto}</div>
        <div class="progress" style="height: 1.5rem;">
          <div class="progress-bar bg-info" role="progressbar" style="width: ${progresoReto}%" aria-valuenow="${progresoReto}" aria-valuemin="0" aria-valuemax="100">
            ${loansEsteMes.length} / ${metaReto} (${progresoReto}%)
          </div>
        </div>
        <div class="small text-muted mt-1">¡Participa y supera el reto mensual!</div>
      </div>`;
  }
  // Widgets
  document.getElementById('booksCount').innerText = books.length;
  if (activeUser && activeUser.rol === 'Estudiante') {
    document.getElementById('loansCount').innerText = loans.filter(l => !l.devuelto && l.estudiante === activeUser.nombre).length;
    document.getElementById('reservationsCount').innerText = reservations.filter(r => r.estado === 'Activa' && r.estudiante === activeUser.nombre).length;
  } else {
    document.getElementById('loansCount').innerText = loans.filter(l => !l.devuelto).length;
    document.getElementById('reservationsCount').innerText = reservations.filter(r => r.estado === 'Activa').length;
  }
window.addEventListener('storage', function(e) {
  if (e.key === 'loans' || e.key === 'reservations' || e.key === 'loansCountUpdate') {
    renderDashboardWidgets();
  }
});