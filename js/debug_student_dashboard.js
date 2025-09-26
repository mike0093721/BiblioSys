// Script de depuración para dashboard del estudiante
(function(){
  try {
    const users = JSON.parse(localStorage.getItem('users'));
    const loans = JSON.parse(localStorage.getItem('loans'));
    const activeUser = JSON.parse(localStorage.getItem('activeUser'));
    const rankingDiv = document.getElementById('studentRanking');
    console.log('--- DEPURACIÓN DASHBOARD ESTUDIANTE ---');
    console.log('activeUser:', activeUser);
    console.log('users:', users);
    console.log('loans:', loans);
    console.log('studentRanking div:', rankingDiv);
    if (!activeUser) {
      console.warn('No hay usuario activo.');
      return;
    }
    if (!users || !Array.isArray(users)) {
      console.warn('No hay usuarios cargados.');
      return;
    }
    if (!loans || !Array.isArray(loans)) {
      console.warn('No hay préstamos cargados.');
      return;
    }
    if (!rankingDiv) {
      console.warn('No existe el div studentRanking en el HTML.');
      return;
    }
    const estudiantes = users.filter(u => u.rol === 'Estudiante');
    const ranking = estudiantes.map(est => {
      const leidos = loans.filter(l => l.estudiante === est.nombre && l.devuelto === true).length;
      return { nombre: est.nombre, leidos };
    }).sort((a, b) => b.leidos - a.leidos);
    const miPos = ranking.findIndex(r => r.nombre === activeUser.nombre) + 1;
    const miLeidos = ranking.find(r => r.nombre === activeUser.nombre)?.leidos || 0;
    console.log('Ranking generado:', ranking);
    console.log('Mi posición:', miPos, 'Libros leídos:', miLeidos);
    if (miLeidos === 0) {
      console.warn('No has leído ningún libro (según los datos actuales).');
    } else {
      console.info('Tu posición en el ranking:', miPos, 'de', ranking.length);
    }
    rankingDiv.innerHTML = 'Depuración completada. Revisa la consola.';
  } catch(e) {
    console.error('Error en depuración:', e);
  }
})();
