(function(){
  const facultades = [
    'Facultad de Ingeniería y Arquitectura',
    'Facultad de Ciencias Económicas',
    'Facultad de Ciencias y Humanidades',
    'Facultad de Ciencias de la Salud'
  ];
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
  const librosBase = [
    {titulo:'Libro 1', autor:'Autor 1'},
    {titulo:'Libro 2', autor:'Autor 2'},
    {titulo:'Libro 3', autor:'Autor 3'},
    {titulo:'Libro 4', autor:'Autor 4'},
    {titulo:'Libro 5', autor:'Autor 5'}
  ];
  let books = [];
  let isbnCount = 1;
  facultades.forEach(fac=>{
    carreras[fac].forEach(carr=>{
      librosBase.forEach((libro,idx)=>{
        books.push({
          isbn: fac.substring(0,2).toUpperCase()+'-'+carr.substring(0,2).toUpperCase()+'-'+('00'+isbnCount).slice(-3),
          titulo: libro.titulo + ' de ' + carr,
          autor: libro.autor,
          categoria: carr,
          facultad: fac,
          copias_totales: 15,
          copias_disponibles: 15,
          disponible: true
        });
        isbnCount++;
      });
    });
  });
  localStorage.setItem('books', JSON.stringify(books));
  alert('Libros generados para todas las carreras.');
})();
