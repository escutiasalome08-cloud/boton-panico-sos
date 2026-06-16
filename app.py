from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

# ========================================================
# CONFIGURACIÓN DE TELEGRAM (REMPLAZA CON TUS DATOS)
# ========================================================
TELEGRAM_TOKEN = "TU_TELEGRAM_BOT_TOKEN_AQUI"
TELEGRAM_CHAT_ID = "TU_CHAT_ID_DE_LOS_DIRECTIVOS_AQUI"
# ========================================================

@app.route('/')
def home():
    # Esta ruta muestra la página web principal
    return render_template('index.html')

@app.route('/enviar-alerta', methods=['POST'])
def enviar_alerta():
    try:
        data = request.json
        
        # Extraemos los datos enviados desde el JavaScript
        incidente = data.get('incidente')
        ubicacion_fisica = data.get('ubicacion_fisica')
        anonimo = data.get('anonimo')
        nombre_usuario = data.get('nombre', 'Anónimo')
        latitud = data.get('latitud')
        longitud = data.get('longitud')
        
        # Formateamos el reporte de identidad
        identidad = "Anónimo" if anonimo else nombre_usuario
        
        # Creamos el enlace de Google Maps con las coordenadas del GPS
        mapa_url = f"https://www.google.com/maps?q={latitud},{longitud}"
        
        # Redactamos el mensaje que llegará a Telegram
        mensaje_telegram = (
            "⚠️ 🚨 *¡ALERTA SOS ESCOLAR!* 🚨 ⚠️\n\n"
            f"🔹 *Tipo de Incidente:* {incidente}\n"
            f"🔹 *Ubicación/Salón:* {ubicacion_fisica}\n"
            f"🔹 *Reportado por:* {identidad}\n\n"
            f"📍 *Ubicación GPS exacta:* [Ver en Google Maps]({mapa_url})\n"
            f"📌 *Coordenadas:* {latitud}, {longitud}"
        )
        
        # Enviamos el mensaje a la API de Telegram
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
