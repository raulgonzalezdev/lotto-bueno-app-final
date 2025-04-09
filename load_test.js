import http from 'k6/http';
import { check, sleep } from 'k6';
// Eliminar SharedArray ya que no leeremos de un archivo
// import { SharedArray } from 'k6/data';

// --- Opciones de la Prueba ---
export const options = {
  vus: 50,        // Número de usuarios virtuales concurrentes (ajusta según necesites)
  iterations: 1000, // Número total de solicitudes a realizar (ajusta según necesites)
  // duration: '1m', // Alternativa: puedes definir una duración en lugar de iteraciones
  // Añadir umbrales (opcional pero útil)
  thresholds: {
    http_req_failed: ['rate<0.01'], // menos del 1% de las peticiones deben fallar
    http_req_duration: ['p(95)<2000'], // el 95% de las peticiones deben completar en menos de 2000ms (2s)
  },
};

// --- Función Setup (Se ejecuta una vez al inicio) ---
export function setup() {
  console.log('Ejecutando setup para obtener datos de tickets...');
  // Llama a tu API para obtener los tickets. Ajusta el limit si necesitas más/menos datos.
  const apiUrl = 'http://app:8000/api/tickets/?limit=100'; // Pide hasta 100 tickets
  const res = http.get(apiUrl);

  // Verifica si la petición a la API fue exitosa
  if (res.status !== 200) {
    console.error(`Error al obtener tickets desde la API: ${res.status} ${res.body}`);
    // Es crucial abortar la prueba si no se pueden obtener los datos
    throw new Error('No se pudieron obtener los datos de prueba de la API. Abortando prueba.');
  }

  try {
    const data = res.json();
    // Verifica que la respuesta tenga la estructura esperada
    if (!data || !Array.isArray(data.items) || data.items.length === 0) {
      console.error('La respuesta de la API no contiene tickets válidos o está vacía.');
      throw new Error('Datos de prueba inválidos o vacíos desde la API. Abortando prueba.');
    }
    console.log(`Setup completado. ${data.items.length} tickets obtenidos de la API.`);
    // Retorna solo el array 'items' que contiene los tickets
    return data.items;
  } catch (e) {
    console.error(`Error al parsear la respuesta JSON de la API: ${e}`);
    console.error(`Respuesta recibida: ${res.body}`);
    throw new Error('Error procesando datos de la API. Abortando prueba.');
  }
}


// --- Función Principal (ejecutada por cada VU) ---
// El argumento 'tickets' recibe lo que retorna la función setup()
export default function (tickets) {
  // Verifica si hay datos de tickets disponibles (pasados desde setup)
  if (!tickets || tickets.length === 0) {
    console.error("No hay datos de tickets disponibles desde setup. Saltando iteración.");
    // Podrías optar por abortar el VU aquí si lo prefieres: exec.test.abort();
    return;
  }

  // Selecciona una cédula/teléfono al azar de los datos obtenidos de la API
  const randomTicket = tickets[Math.floor(Math.random() * tickets.length)];

  // Verifica que el ticket seleccionado tenga cédula y teléfono
  if (!randomTicket || !randomTicket.cedula || !randomTicket.telefono) {
      console.warn(`Ticket inválido seleccionado: ${JSON.stringify(randomTicket)}. Saltando iteración.`);
      return; // Salta esta iteración si el dato está incompleto
  }

  const url = 'http://app:8000/api/generate_ticket'; // Apunta al servicio 'app'
  const payload = JSON.stringify({
    cedula: randomTicket.cedula,
    telefono: randomTicket.telefono
    // No necesitamos referido_id aquí, ya que la API usa 'system' por defecto
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    // Aumentar timeout si las respuestas tardan bajo carga
    timeout: '120s'
  };

  // Enviar la solicitud POST
  const res = http.post(url, payload, params);

  // --- Verificaciones (Opcional pero recomendado) ---
  check(res, {
    'status es 200': (r) => r.status === 200,
    'respuesta contiene status': (r) => r.body && r.body.includes('"status"'),
    // Verificar la respuesta exacta según lo que retorna la API
    'respuesta es exitosa, ticket existe o sin WhatsApp': (r) => {
      if (r.status !== 200 || !r.body) return false;
      
      // Buscar exactamente los patrones de respuesta que retorna la API
      return (
        r.body.includes('"status":"success"') ||
        r.body.includes('"status":"error","message":"El número no tiene WhatsApp"') ||
        r.body.includes('"status": "error", "message": "El número no tiene WhatsApp"') ||
        r.body.includes('"status":"error","message":"Ya existe un ticket registrado') ||
        r.body.includes('"status": "error", "message": "Ya existe un ticket registrado')
      );
    }
  }, { responseBody: res.body });

  // Pequeña pausa para simular comportamiento de usuario (1 segundo)
  sleep(1);
}