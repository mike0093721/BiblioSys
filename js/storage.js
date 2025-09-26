function inicializarDatos() {
  console.log('[storage.js] Inicializando datos solo si localStorage está vacío...');
  if (!localStorage.getItem('faculties')) {
    fetch('data/initial_faculties.json')
      .then(r => r.json())
      .then(data => localStorage.setItem('faculties', JSON.stringify(data)));
  }
  if (!localStorage.getItem('users')) {
    fetch('data/initial_users.json')
      .then(r => r.json())
      .then(data => {
        localStorage.setItem('users', JSON.stringify(data));
        console.log('[storage.js] Usuarios inicializados (solo si vacío):', data);
      });
  }
  if (!localStorage.getItem('books')) {
    fetch('data/initial_books.json')
      .then(r => r.json())
      .then(data => {
        localStorage.setItem('books', JSON.stringify(data));
        console.log('[storage.js] Libros inicializados (solo si vacío):', data);
      });
  }
}
document.addEventListener('DOMContentLoaded', inicializarDatos);