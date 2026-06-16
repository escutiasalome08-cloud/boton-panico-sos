document.addEventListener('DOMContentLoaded', () => {
    const sosButton = document.getElementById('sosButton');
    const saveButton = document.getElementById('saveContacts');
    const statusDiv = document.getElementById('status');

    // Cargar contactos guardados previamente
    document.getElementById('contact1').value = localStorage.getItem('contact1') || '';
    document.getElementById('contact2').value = localStorage.getItem('contact2') || '';
    document.getElementById('contact3').value = localStorage.getItem('contact3') || '';

    // Guardar contactos en el navegador del usuario
    saveButton.addEventListener('click', () => {
        localStorage.setItem('contact1', document.getElementById('contact1').value);
        localStorage.setItem('contact2', document.getElementById('contact2').value);
        localStorage.setItem('contact3', document.getElementById('contact3').value);
        
        statusDiv.style.color = "green";
        statusDiv.textContent = "Contactos guardados de forma segura.";
    });

    // Acción del Botón SOS
    sosButton.addEventListener('click', () => {
        if (!navigator.geolocation) {
            statusDiv.style.color = "red";
            statusDiv.textContent = "La geolocalización no es compatible con tu navegador.";
            return;
        }

        statusDiv.style.color = "#6b1c37";
        statusDiv.textContent = "Obteniendo ubicación exacta...";

        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            // Enviar coordenadas a nuestro servidor en Render
            fetch('/enviar-alerta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    latitud: lat,
                    longitud: lon,
                    contacto1: localStorage.getItem('contact1') || 'No asignado',
                    contacto2: localStorage.getItem('contact2') || 'No asignado',
                    contacto3: localStorage.getItem('contact3') || 'No asignado'
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    statusDiv.style.color = "green";
                    statusDiv.textContent = "¡Alerta enviada con éxito a las autoridades!";
                } else {
                    statusDiv.style.color = "red";
                    statusDiv.textContent = "Error al enviar la alerta.";
                }
            })
            .catch(error => {
                statusDiv.style.color = "red";
                statusDiv.textContent = "Error de conexión con el servidor.";
                console.error(error);
            });

        }, () => {
            statusDiv.style.color = "red";
            statusDiv.textContent = "No se pudo acceder a tu ubicación. Por favor, activa el GPS.";
        });
    });
});
