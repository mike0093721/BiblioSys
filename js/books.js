function renderBooksTable() {
  const books = JSON.parse(localStorage.getItem('books')) || [];
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  const puedeEditar = activeUser && (activeUser.rol === 'Administrador' || activeUser.rol === 'Bibliotecario');
  // Obtener los selects si existen
  const facultadSelect = document.getElementById('facultadSelect');
  const carreraSelect = document.getElementById('carreraSelect');
  let facultad = '';
  let carrera = '';
  if (facultadSelect) facultad = facultadSelect.value;
  if (carreraSelect) carrera = carreraSelect.value;

  let filteredBooks = books;
  if (facultad) {
    filteredBooks = books.filter(b => b.facultad === facultad);
  }
  if (carrera) {
    filteredBooks = filteredBooks.filter(b => b.categoria === carrera);
  }

  let table = '';
  if (facultad) {
    table += `<div class=\"mb-2\"><b>Facultad seleccionada:</b> ${facultad}</div>`;
  }
  if (carrera) {
    table += `<div class=\"mb-2\"><b>Carrera seleccionada:</b> ${carrera}</div>`;
  }

  // Solo mostrar la tabla si se ha seleccionado facultad Y carrera
  if (facultad && carrera) {
    if (filteredBooks.length === 0) {
      table += `<div class='alert alert-warning'>Por el momento no hay libros disponibles para esta carrera.</div>`;
    } else {
      table += `<table class=\"table table-hover\">\n    <thead>\n      <tr>\n        <th>ISBN</th>\n        <th>Título</th>\n        <th>Autor</th>\n        <th>Categoría</th>\n        <th>Facultad</th>\n        <th>Disponibles</th>`;
      if (puedeEditar) {
        table += '<th>Acciones</th>';
      }
      table += `</tr>\n    </thead>\n    <tbody>`;
      filteredBooks.forEach((b, i) => {
        table += `<tr>\n      <td>${b.isbn}</td>\n      <td>${b.titulo}</td>\n      <td>${b.autor}</td>\n      <td>${b.categoria}</td>\n      <td>${b.facultad}</td>\n      <td>${b.copias_disponibles}/${b.copias_totales}</td>`;
        if (puedeEditar) {
          table += `<td>\n            <button class=\"btn btn-sm btn-accent\" onclick=\"editBook(${i})\">Editar</button>\n            <button class=\"btn btn-sm btn-danger\" onclick=\"deleteBook(${i})\">Eliminar</button>\n          </td>`;
        }
        table += `</tr>`;
      });
      table += `</tbody></table>`;
    }
  }
  document.getElementById('booksTableDiv').innerHTML = table;
}
function showBookForm(index=null){
  const faculties = JSON.parse(localStorage.getItem('faculties')) || [];
  const book = index !== null ? JSON.parse(localStorage.getItem("books"))[index] : {isbn:'',titulo:'',autor:'',categoria:'',facultad:faculties[0]?.facultad||'',copias_totales:1,copias_disponibles:1,disponible:true};
  let options = faculties.map(f=>`<option${book.facultad===f.facultad?' selected':''}>${f.facultad}</option>`).join('');
  const form = `
    <div class="card p-3 mb-3">
      <h5>${index !== null ? 'Editar Libro' : 'Añadir Libro'}</h5>
      <form onsubmit="saveBook(event,${index})">
        <div class="mb-2"><input class="form-control" type="text" id="isbn" placeholder="ISBN" value="${book.isbn||''}" required></div>
        <div class="mb-2"><input class="form-control" type="text" id="titulo" placeholder="Título" value="${book.titulo||''}" required></div>
        <div class="mb-2"><input class="form-control" type="text" id="autor" placeholder="Autor" value="${book.autor||''}" required></div>
        <div class="mb-2 d-flex gap-2 align-items-center">
          <select id="facultad" class="form-select" onchange="actualizarCarrerasForm()">${options}</select>
          <button type="button" class="btn btn-outline-primary btn-sm" onclick="agregarFacultadForm()">+ Nueva Facultad</button>
        </div>
        <div class="mb-2 d-flex gap-2 align-items-center">
          <select id="carrera" class="form-select" disabled></select>
          <button type="button" class="btn btn-outline-primary btn-sm" onclick="agregarCarreraForm()">+ Nueva Carrera</button>
        </div>
        <div class="mb-2"><input class="form-control" type="number" id="copias_totales" placeholder="Copias totales" value="${book.copias_totales||1}" min="1" required></div>
        <button class="btn btn-success" type="submit">Guardar</button>
        <button class="btn btn-secondary" type="button" onclick="hideBookForm()">Cancelar</button>
      </form>
      <div id="extraFormFields"></div>
    </div>`;
  document.getElementById('bookFormDiv').innerHTML = form;
  document.getElementById('bookFormDiv').classList.remove('d-none');
  setTimeout(()=>actualizarCarrerasForm(book.categoria), 0);
}

window.actualizarCarrerasForm = function(selectedCarrera) {
  const facultad = document.getElementById('facultad').value;
  const selectCarrera = document.getElementById('carrera');
  selectCarrera.innerHTML = '';
  selectCarrera.disabled = !facultad;
  if (facultad) {
    getCarrerasPorFacultad(facultad).forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      if (selectedCarrera && selectedCarrera === c) opt.selected = true;
      selectCarrera.appendChild(opt);
    });
  }
}

window.agregarFacultadForm = function() {
  document.getElementById('extraFormFields').innerHTML = `
    <div class='mb-2'><input class='form-control' id='nuevaFacultadInput' placeholder='Nombre de la nueva facultad'></div>
    <button class='btn btn-primary btn-sm mb-2' onclick='guardarNuevaFacultad()'>Guardar Facultad</button>
  `;
}

window.guardarNuevaFacultad = function() {
  const nombre = document.getElementById('nuevaFacultadInput').value.trim();
  if (!nombre) return;
  let faculties = JSON.parse(localStorage.getItem('faculties')) || [];
  if (!faculties.find(f=>f.facultad===nombre)) {
    faculties.push({facultad:nombre});
    localStorage.setItem('faculties', JSON.stringify(faculties));
  }
  showBookForm();
}

window.agregarCarreraForm = function() {
  document.getElementById('extraFormFields').innerHTML = `
    <div class='mb-2'><input class='form-control' id='nuevaCarreraInput' placeholder='Nombre de la nueva carrera'></div>
    <button class='btn btn-primary btn-sm mb-2' onclick='guardarNuevaCarrera()'>Guardar Carrera</button>
  `;
}

window.guardarNuevaCarrera = function() {
  const facultad = document.getElementById('facultad').value;
  const nombre = document.getElementById('nuevaCarreraInput').value.trim();
  if (!facultad || !nombre) return;
  let carreras = JSON.parse(localStorage.getItem('carreras')) || {};
  if (!carreras[facultad]) carreras[facultad] = [];
  if (!carreras[facultad].includes(nombre)) {
    carreras[facultad].push(nombre);
    localStorage.setItem('carreras', JSON.stringify(carreras));
  }
  showBookForm();
}
function hideBookForm(){ document.getElementById('bookFormDiv').classList.add('d-none'); }
function saveBook(e, index){
  e.preventDefault();
  let books = JSON.parse(localStorage.getItem('books')) || [];
  const book = {
    isbn: document.getElementById('isbn').value,
    titulo: document.getElementById('titulo').value,
    autor: document.getElementById('autor').value,
    categoria: document.getElementById('categoria').value,
    facultad: document.getElementById('facultad').value,
    copias_totales: parseInt(document.getElementById('copias_totales').value),
    copias_disponibles: parseInt(document.getElementById('copias_totales').value),
    disponible: true
  };
  if(index !== null){ books[index] = book; }
  else { books.push(book); }
  localStorage.setItem('books', JSON.stringify(books));
  hideBookForm(); renderBooksTable();
}
function editBook(index){ showBookForm(index); }
function deleteBook(index){
  let books = JSON.parse(localStorage.getItem('books')) || [];
  if(confirm('¿Eliminar libro?')){ books.splice(index,1); localStorage.setItem('books', JSON.stringify(books)); renderBooksTable(); }
}
function logout(){ localStorage.removeItem('activeUser'); window.location.href = 'login.html'; }

//LÓGICA DE MENÚS DESPLEGABLES Y FILTRADORES
document.addEventListener('DOMContentLoaded', function() {
  const faculties = JSON.parse(localStorage.getItem('faculties')) || [];
  const selectFac = document.getElementById('facultadSelect');
  if (selectFac) {
    faculties.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.facultad;
      opt.textContent = f.facultad;
      selectFac.appendChild(opt);
    });
  }

  // Solo cargar datos iniciales si no hay libros en localStorage
  if (!localStorage.getItem('books')) {
    fetch('data/initial_books.json')
      .then(r => r.json())
      .then(data => {
        localStorage.setItem('books', JSON.stringify(data));
        renderBooksTable();
      });
  } else {
    renderBooksTable();
  }

  // Ocultar botón de añadir libro si no es admin o bibliotecario
  const puedeEditar = activeUser && (activeUser.rol === 'Administrador' || activeUser.rol === 'Bibliotecario');
  const addBtn = document.querySelector('button.btn.btn-success');
  if (addBtn) {
    addBtn.style.display = puedeEditar ? '' : 'none';
  }
});

function getCarrerasPorFacultad(facultad) {
  const carreras = {
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
  return carreras[facultad] || [];
}

function onFacultadChange() {
  const facultad = document.getElementById('facultadSelect').value;
  const selectCarrera = document.getElementById('carreraSelect');
  selectCarrera.innerHTML = '<option value="">-- Selecciona una carrera --</option>';
  selectCarrera.disabled = !facultad;
  if (facultad) {
    getCarrerasPorFacultad(facultad).forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      selectCarrera.appendChild(opt);
    });
  }
  renderBooksTable();
}

function onCarreraChange() {
  renderBooksTable();
}

