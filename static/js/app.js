// Variables globales para almacenar las coordenadas GPS
let latitudGlobal = null;
let longitudGlobal = null;

// Ejecutar inmediatamente al abrir la aplicación
document.addEventListener("DOMContentLoaded", () => {
    solicitarGPS();
    cargarContactos();
});

// FUNCIÓN ESTRICTA DE GEOLOCALIZACIÓN
function solicitarGPS() {
    const statusDiv = document.getElementById('gpsStatus');
    const btnSos = document.getElementById('btnSos');

    if (!navigator.geolocation) {
        statusDiv.innerText = "❌ Tu navegador no soporta geolocalización. App bloqueada.";
        statusDiv.style.backgroundColor = "#f8d7da";
        statusDiv.style.color = "#721c24";
        return;
    }

    // Intentamos obtener la ubicación con alta precisión
    navigator.geolocation.watchPosition(
        (position) => {
            latitudGlobal = position.coords.latitude;
            longitudGlobal = position.coords.longitude;

            // Si se consiguen con éxito, actualizamos la interfaz y habilitamos el botón
            statusDiv.innerText = "✅ GPS Conectado de forma segura y obligatoria";
            statusDiv.className = "gps-status gps-success";
            btnSos.disabled = false;
        },
        (error) => {
            console.error(error);
            statusDiv.innerText = "❌ Acceso a GPS denegado. Es obligatorio activarlo para reportar.";
            statusDiv.style.backgroundColor = "#f8d7da";
            statusDiv.style.color = "#721c24";
            btnSos.disabled = true; // El botón permanece bloqueado si no hay GPS
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

// MANEJO DE CONTACTOS CON LOCALSTORAGE (Mecanismo del navegador)
function guardarContactos() {
    const c1 = document.getElementById('contacto1').value;
    const c2 = document.getElementById('contacto2').value;
    const c3 = document.getElementById('contacto3').value;

    const contactos = { contacto1: c1, contacto2: c2, contacto3: c3 };
    
    // Almacenamos el objeto convertido a texto en la memoria del navegador
    localStorage.setItem('sos_contactos', JSON.stringify(contactos));
    alert("Contactos de emergencia guardados localmente.");
}

function cargarContactos() {
    const guardados = localStorage.getItem('sos_contactos');
    if (guardados) {
        const contactos = JSON.parse(guardados);
        document.getElementById('contacto1').value = contactos.contacto1 || '';
        document.getElementById('contacto2').value = contactos.contacto2 || '';
        document.getElementById('contacto3').value = contactos.contacto3 || '';
    }
}

// ENVÍO DE DATOS AL BACKEND DE PYTHON
function enviarAlertaServidor() {
    // Validación de seguridad de último momento
    if (!latitudGlobal || !longitudGlobal) {
        alert("Error: No se puede enviar el reporte sin coordenadas GPS.");
        return;
    }

    const btnSos = document.getElementById('btnSos');
    btnSos.disabled = true; // Evita que se presione muchas veces por pánico
    btnSos.innerText = "...";

    // Recolectamos la información del formulario
    const payload = {
        incidente: document.getElementById('incidente').value,
        ubicacion_fisica: document.getElementById('ubicacionFisica').value || "No especificado",
        anonimo: document.getElementById('anonimo').checked,
        nombre: document.getElementById('nombreUsuario').value,
        latitud: latitudGlobal,
        longitud: longitudGlobal
    };

    // Petición HTTP POST al servidor local o en la nube
    fetch('/enviar-alerta', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            alert("🚨 ¡ALERTA ENVIADA EXITOSAMENTE! Los directivos han recibido tu ubicación.");
        } else {
            alert("Error del servidor: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Hubo un fallo en la conexión de red al enviar la alerta.");
    })
    .finally(() => {
        btnSos.disabled = false;
        btnSos.innerText = "SOS";
    });
}
