// Formatea RUT chileno: puntos cada 3 y guión antes del dígito verificador.
// Acepta números y K/k, limita a 9 caracteres (8 dígitos + DV).
export function formatRut(input) {
  if (!input) return '';
  // Eliminar cualquier carácter no permitido
  let rut = String(input).replace(/[^\dkK]/g, '');
  // Convertir k minúscula a K
  rut = rut.replace(/k/g, 'K');
  // Limitar largo a 9 (8 + DV)
  if (rut.length > 9) rut = rut.slice(0, 9);

  if (rut.length <= 1) return rut; // Solo DV o vacio

  const cuerpo = rut.slice(0, -1);
  const dv = rut.slice(-1);

  // Agregar puntos cada 3 desde atrás
  let formateado = '';
  let i = cuerpo.length;
  let contador = 0;
  while (i > 0) {
    if (contador === 3) {
      formateado = '.' + formateado;
      contador = 0;
    }
    formateado = cuerpo.charAt(i - 1) + formateado;
    i--;
    contador++;
  }

  return `${formateado}-${dv}`;
}

// Limpia el RUT dejando solo números y DV (K mayúscula), limitado a 9.
export function cleanRut(input) {
  if (!input) return '';
  let rut = String(input).replace(/[^\dkK]/g, '');
  rut = rut.replace(/k/g, 'K');
  if (rut.length > 9) rut = rut.slice(0, 9);
  return rut;
}