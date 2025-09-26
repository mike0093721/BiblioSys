// Notificaciones universales para todas las secciones
(function(){
  // Mostrar notificación flotante
  window.mostrarNotificacionDashboard = function(msg) {
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
  };

  // Render notificaciones soporte (campanita y modal)
  window.renderNotificacionesSoporte = function() {
    const notifSoporte = JSON.parse(localStorage.getItem('notificacionesSoporte')||'[]');
    const badge = document.getElementById('badgeNotificaciones');
    const user = JSON.parse(localStorage.getItem('activeUser'));
    if (!user) return;
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

  // Mostrar notificación si viene de otra sección
  document.addEventListener('DOMContentLoaded', () => {
    const notifMsg = localStorage.getItem('dashboardSuccessMsg');
    if (notifMsg) {
      window.mostrarNotificacionDashboard(notifMsg);
      localStorage.removeItem('dashboardSuccessMsg');
    }
    renderNotificacionesSoporte();
  });
})();
