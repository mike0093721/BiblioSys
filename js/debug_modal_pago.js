// Prueba rápida para depuración de Bootstrap y función de pago
(function(){
  console.log('--- DEPURACIÓN MODAL PAGO ---');
  console.log('Bootstrap cargado:', typeof bootstrap !== "undefined" && typeof bootstrap.Modal === "function");
  console.log('Función pagarMultaConTarjeta:', typeof window.pagarMultaConTarjeta);
  window.testModalPago = function() {
    if (typeof window.pagarMultaConTarjeta === 'function') {
      window.pagarMultaConTarjeta(0, 10); // Prueba con índice 0 y multa $10
    } else {
      alert('La función pagarMultaConTarjeta no está disponible.');
    }
  };
  console.log('Para probar el modal manualmente, ejecuta: testModalPago()');
})();
