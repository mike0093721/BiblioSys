document.addEventListener('DOMContentLoaded', function() {
  const btnShowRegister = document.getElementById('btnShowRegister');
  if (btnShowRegister) {
    btnShowRegister.onclick = function() {
      const modal = new bootstrap.Modal(document.getElementById('registerModal'));
      modal.show();
    };
  }
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.onsubmit = function(e) {
      e.preventDefault();
      const nombre = document.getElementById('regNombre').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value.trim();
      const direccion = document.getElementById('regDireccion') ? document.getElementById('regDireccion').value.trim() : '';
      const telefono = document.getElementById('regTelefono') ? document.getElementById('regTelefono').value.trim() : '';
      let users = JSON.parse(localStorage.getItem('users')) || [];
      if (users.some(u => u.email === email)) {
        alert('Ya existe un usuario con ese correo.');
        return;
      }
      users.push({
        nombre,
        email,
        password,
        direccion,
        telefono,
        rol: 'Estudiante',
        activo: true,
        fecha_registro: new Date().toISOString()
      });
      localStorage.setItem('users', JSON.stringify(users));
      alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
      bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
      document.getElementById('registerForm').reset();
    };
  }
});

function registrarLoginHandler() {
  document.getElementById("loginForm").addEventListener("submit", function(e){
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const users = JSON.parse(localStorage.getItem("users")) || [];
    if (window.mostrarDebugInfo) window.mostrarDebugInfo(email, password);
    console.log('[auth.js] Usuarios cargados:', users);
    const user = users.find(u => u.email === email && u.password === password && u.activo);
    if (user) {
      console.log('[auth.js] Login exitoso para:', user.email);
      localStorage.setItem("activeUser", JSON.stringify(user));
      window.location.href = "dashboard.html";
    } else {
      console.log('[auth.js] Login fallido para:', email);
      document.getElementById("loginError").classList.remove("d-none");
      document.getElementById("loginError").innerText = "Credenciales incorrectas o usuario inactivo";
    }
  });
}

// Solo registrar el handler cuando los usuarios estén listos
if (localStorage.getItem('users')) {
  registrarLoginHandler();
} else {
  const interval = setInterval(() => {
    if (localStorage.getItem('users')) {
      registrarLoginHandler();
      clearInterval(interval);
    }
  }, 100);
}