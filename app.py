from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

# ========================================================
# CONFIGURACIÓN DE TELEGRAM
# ========================================================
TELEGRAM_TOKEN = "8854308504:AAEDa5MhMynOv8I6tkAkCYiWuHYjcFGRTfU"
TELEGRAM_CHAT_ID = "6028715446"
# ========================================================

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/enviar-alerta', methods=['POST'])
def enviar_alerta():
    try:
        data = request.json
        
        incidente = data.get('incidente', 'No especificado')
        ubicacion_fisica = data.get('detalles_ubicacion', 'No especificada')
        matricula = data.get('matricula', 'No registrada')
        
        contacto1 = data.get('contacto1', 'No asignado')
        contacto2 = data.get('contacto2', 'No asignado')
        contacto3 = data.get('contacto3', 'No asignado')
        
        latitud = data.get('latitud')
        longitud = data.get('longitud')
        
        mapa_url = f"https://www.google.com/maps?q={latitud},{longitud}"
        
        # MENSAJE FORMATEADO CORREGIDO: SIN EMOJIS
        mensaje_telegram = (
            "*ALERTA SOS ESCOLAR*\n\n"
            f"Tipo de Incidente: {incidente}\n"
            f"Ubicacion interna: {ubicacion_fisica}\n"
            f"Reportado por (Matricula): `{matricula}`\n\n"
            "Contactos de Emergencia del Alumno:\n"
            f"Tel 1: {contacto1}\n"
            f"Tel 2: {contacto2}\n"
            f"Tel 3: {contacto3}\n\n"
            f"Ubicacion GPS exacta: [Ver en Google Maps]({mapa_url})\n"
            f"Coordenadas: `{latitud}, {longitud}`"
        )
        
        url_api = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
        payload = {
            "chat_id": TELEGRAM_CHAT_ID,
            "text": mensaje_telegram,
            "parse_mode": "Markdown"
        }
        
        response = requests.post(url_api, json=payload)
        
        if response.status_code == 200:
            return jsonify({"status": "success", "message": "Alerta enviada con éxito a los directivos."}), 200
        else:
            return jsonify({"status": "error", "message": "Error al conectar con Telegram."}), 500
            
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
