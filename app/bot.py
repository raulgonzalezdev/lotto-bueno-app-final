import os
import sys
from pathlib import Path
import random
import base64
import json
import asyncio
import time
import re
from io import BytesIO
import requests

# Añadir el directorio donde se encuentra whatsapp_chatbot_python al PYTHONPATH
sys.path.append(str(Path(__file__).resolve().parent.parent))

from whatsapp_chatbot_python import GreenAPIBot, Notification
from fastapi import HTTPException
from app.schemas import CedulaRequest
from app.main import get_db, send_message, send_qr_code, obtener_numero_contacto, enviar_contacto, verificar_cedula

API_INSTANCE = os.getenv("API_INSTANCE", "7103942544")
API_TOKEN = os.getenv("API_TOKEN", "1b64dc5c3ccc4d9aa01265ce553b874784d414aa81d64777a0")
NEXT_PUBLIC_API_URL = os.getenv("NEXT_PUBLIC_API_URL", "https://applottobueno.com")
WEBSITE_URL = os.getenv("WEBSITE_URL", "https://applottobueno.com")
TELEGRAM_CHANNEL = os.getenv("TELEGRAM_CHANNEL", "https://t.me/applottobueno")
# Definir la URL interna para la comunicación entre servicios Docker
INTERNAL_API_URL = "http://app:8000"

# Constante para el tiempo máximo de inactividad (5 minutos)
MAX_INACTIVITY_TIME_SECONDS = 300

# Diccionario para almacenar el último tiempo de interacción de cada usuario
user_last_interaction = {}

bot = GreenAPIBot(API_INSTANCE, API_TOKEN)

def extract_cedula(text):
    """
    Extrae el número de cédula de un texto.
    Busca un número que tenga entre 6 y 10 dígitos.
    """
    if not text:
        print("Texto vacío recibido en extract_cedula")
        return None
        
    # Eliminar /start si está presente
    text = text.replace("/start", "")
    print(f"Texto a procesar para cédula: '{text}'")
    
    # Buscar patrones de cédula (números de 6-10 dígitos)
    cedula_matches = re.findall(r'\b\d{6,10}\b', text)
    
    if cedula_matches:
        # Tomar el primer número que parece una cédula
        cedula = cedula_matches[0]
        print(f"Cédula encontrada con regex: '{cedula}'")
        return cedula
    
    print(f"No se encontró cédula con regex, intentando extraer solo dígitos")
    # Si no encuentra números que parezcan cédula, intentar limpiar y extraer solo dígitos
    digits_only = ''.join(filter(str.isdigit, text))
    print(f"Dígitos extraídos: '{digits_only}', longitud: {len(digits_only)}")
    
    if len(digits_only) >= 6:
        cedula = digits_only[:10]  # Limitar a 10 dígitos máximo
        print(f"Cédula extraída de dígitos: '{cedula}'")
        return cedula
        
    print(f"No se pudo extraer una cédula válida del texto")
    return None

def extract_phone_number(text):
    """
    Extrae un número de teléfono de un texto y lo formatea para la API.
    El formato final debe ser 584XXXXXXXXX (12 dígitos).
    """
    if not text:
        print(f"Texto vacío recibido en extract_phone_number")
        return None
    
    print(f"Procesando número de teléfono: '{text}'")
    
    # Eliminar espacios, guiones y paréntesis
    text = re.sub(r'[\s\-\(\)]', '', text)
    print(f"Texto limpio sin espacios/guiones: '{text}'")
    
    # Extraer solo los dígitos
    digits_only = ''.join(filter(str.isdigit, text))
    print(f"Solo dígitos: '{digits_only}', longitud: {len(digits_only)}")
    
    # Manejar diferentes formatos comunes en Venezuela
    if len(digits_only) >= 10:
        # Si comienza con 58, verificar que tenga un código de operadora válido
        if digits_only.startswith('58'):
            print(f"Detectado número que comienza con 58: '{digits_only}'")
            # Verificar que después del 58 tenga un código de operadora válido
            if re.match(r'^58(412|414|416|424|426)', digits_only):
                result = digits_only[:12]  # Tomar solo los primeros 12 dígitos
                print(f"Número con prefijo internacional 58 válido: '{result}'")
                return result
            else:
                print(f"Prefijo de operadora inválido después del 58: '{digits_only[2:5] if len(digits_only) > 4 else digits_only[2:]}'")
                return None
        
        # Si comienza con 0, quitar el 0 y agregar 58
        elif digits_only.startswith('0'):
            print(f"Detectado número que comienza con 0: '{digits_only}'")
            # Verificar que sea una operadora venezolana válida
            if re.match(r'^0(412|414|416|424|426)', digits_only):
                result = '58' + digits_only[1:11]  # Formato: 58 + 10 dígitos sin el 0
                print(f"Número con prefijo 0 convertido a: '{result}'")
                return result
            else:
                print(f"Prefijo de operadora inválido después del 0: '{digits_only[1:4] if len(digits_only) > 3 else digits_only[1:]}'")
                return None
        
        # Si comienza directamente con el código de operadora (sin 0)
        elif re.match(r'^(412|414|416|424|426)', digits_only):
            print(f"Detectado número que comienza con código de operadora: '{digits_only}'")
            if len(digits_only) >= 10:
                result = '58' + digits_only[:10]  # Formato: 58 + 10 dígitos
                print(f"Número sin prefijo convertido a: '{result}'")
                return result
            else:
                print(f"Número de operadora sin prefijo demasiado corto: '{digits_only}', longitud: {len(digits_only)}")
                return None
        
        # Intento adicional: si tiene 10 dígitos y no coincide con los patrones anteriores
        elif len(digits_only) == 10:
            # Asumir que los primeros 3 dígitos son el código de operadora
            operator_code = digits_only[:3]
            print(f"Intentando procesar número de 10 dígitos con código de operadora: '{operator_code}'")
            if operator_code in ['412', '414', '416', '424', '426']:
                result = '58' + digits_only
                print(f"Número de 10 dígitos convertido a: '{result}'")
                return result
            else:
                print(f"Código de operadora no reconocido: '{operator_code}' (debe ser uno de: 412, 414, 416, 424, 426)")
                return None
        
        # Otros casos no válidos
        else:
            print(f"Formato no reconocido: '{digits_only}', longitud: {len(digits_only)}")
            print("El número debe comenzar con: 58, 0 o directamente el código de operadora (412, 414, 416, 424, 426)")
            return None
    
    print(f"Número demasiado corto: '{digits_only}', longitud: {len(digits_only)} (se requieren al menos 10 dígitos)")
    return None

@bot.router.message()
def obtener_cedula(notification: Notification) -> None:
    sender = notification.sender
    message_data = notification.event.get("messageData", {})
    
    # Actualizar tiempo de la última interacción
    user_last_interaction[sender] = time.time()
    
    # Obtener el nombre del remitente
    sender_data = notification.event["senderData"]
    sender_name = sender_data["senderName"]
    
    # Verificar si hay datos de estado para este usuario
    user_state = get_user_state(notification, sender)
    print(f"Estado actual al recibir mensaje: {user_state}")
    
    # Verificar el estado del usuario y dirigir a la función correspondiente
    if user_state:
        state_value = user_state.get("state")
        print(f"Estado del usuario: {state_value}")
        
        if state_value == "esperando_telefono":
            print("Procesando número de teléfono...")
            handle_registro_telefono(notification, sender, message_data)
            return
        elif state_value == "menu_post_registro":
            print("Procesando selección del menú post-registro...")
            handle_post_registro_menu(notification, sender, message_data)
            return
        elif state_value == "menu_principal":
            print("Procesando selección del menú principal...")
            handle_menu_principal(notification, sender, message_data)
            return
    
    # Si no hay estado o no coincide con ninguno de los anteriores, 
    # procesar como entrada de cédula (comportamiento predeterminado)
    
    # Obtener el texto del mensaje
    message_text = None
    
    # Intentar obtener el texto de diferentes estructuras de mensaje
    extended_text_message_data = message_data.get("extendedTextMessageData", {})
    if extended_text_message_data:
        message_text = extended_text_message_data.get("textMessage") or extended_text_message_data.get("text")
    
    if not message_text:
        text_message_data = message_data.get("textMessageData", {})
        if text_message_data:
            message_text = text_message_data.get("textMessage")

    print(f"message_data: {message_data}")
    print(f"Mensaje recibido: {message_text}")

    # Si no hay texto o es solo /start, enviar mensaje de bienvenida
    if not message_text or message_text.strip() == "/start":
        notification.answer(
            f"👋 Hola, {sender_name}. Para validar tu registro, por favor envíame tu número de cédula."
        )
        return

    # Extraer la cédula del mensaje
    cedula = extract_cedula(message_text)
    
    if not cedula:
        notification.answer(
            f"No he podido identificar un número de cédula válido en tu mensaje. Por favor, envía solo tu número de cédula (entre 6 y 10 dígitos)."
        )
        notification.answer(
            f"Ejemplo de formato correcto: 12345678"
        )
        # Mostrar el menú principal como alternativa
        show_menu_principal(notification, sender_name)
        notification.state_manager.set_state(sender, {"state": "menu_principal", "nombre": sender_name})
        return

    print(f"Procesando cédula: {cedula}")
    db = next(get_db())
    
    try:
        # 1. Primero verificamos si la cédula existe en la base de datos de electores
        print(f"Enviando cédula {cedula} para verificación")
        elector_response = asyncio.run(verificar_cedula(CedulaRequest(numero_cedula=cedula), db))
        print(f"Respuesta de verificación de elector: {elector_response}")

        if elector_response.get("elector"):
            elector_data = elector_response.get("elector")
            nombre_completo = f"{elector_data['p_nombre']} {elector_data['s_nombre']} {elector_data['p_apellido']} {elector_data['s_apellido']}"
            print(f"Elector encontrado: {nombre_completo}")
            
            # 2. Luego verificamos si la cédula ya tiene un ticket registrado
            try:
                # Usar URL interna para la comunicación entre servicios
                ticket_url = f"{INTERNAL_API_URL}/api/tickets/cedula/{cedula}"
                print(f"Verificando ticket para cédula {cedula} en URL interna: {ticket_url}")
                response = requests.get(ticket_url)
                print(f"Respuesta al verificar ticket: Status {response.status_code}, Contenido: {response.text[:200]}...")
                
                # Si la respuesta es exitosa, la cédula ya tiene un ticket
                if response.status_code == 200:
                    existing_ticket = response.json()
                    print(f"Ticket encontrado: {existing_ticket}")
                    chat_id = existing_ticket["telefono"]

                    qr_code_base64 = existing_ticket["qr_ticket"]
                    qr_buf = BytesIO(base64.b64decode(qr_code_base64))

                    message = f"{nombre_completo}, hoy es tu día de suerte!\n\n" \
                            f"Desde este momento estás participando en el Lotto Bueno y este es tu número de ticket {existing_ticket['id']} ¡El número ganador!\n\n" \
                            f"Es importante que guardes nuestro contacto, así podremos anunciarte que tú eres el afortunado ganador.\n" \
                            f"No pierdas tu número de ticket y guarda nuestro contacto, ¡prepárate para celebrar!\n\n" \
                            f"¡Mucha suerte!\n" \
                            f"Lotto Bueno: ¡Tu mejor oportunidad de ganar!"

                    notification.answer(message)
                    print(f"Enviando QR code para ticket #{existing_ticket['id']}")
                    send_qr_code(sender, qr_buf)

                    phone_contact = obtener_numero_contacto(db)
                    print(f"phone_contact obtenido: {phone_contact}")
                    if phone_contact:
                        enviar_contacto(sender, phone_contact.split('@')[0], "Lotto", "Bueno", "Lotto Bueno Inc")
                    
                    # Mostrar el menú después del registro
                    show_post_registro_menu(notification, nombre_completo)
                    
                    # Guardar el estado del usuario como "en menú post-registro"
                    notification.state_manager.set_state(sender, {"state": "menu_post_registro", "nombre": nombre_completo})
                
                # Si la respuesta es 404, la cédula no tiene ticket, debemos registrarla
                elif response.status_code == 404:
                    print(f"Cédula {cedula} está registrada en el sistema pero no tiene ticket")
                    notification.answer(f"La cédula {cedula} está registrada en el sistema pero aún no tiene un ticket de Lotto Bueno.")
                    notification.answer(f"Para completar tu registro, por favor envíame tu número de teléfono (con formato 04XX-XXXXXXX):")
                    
                    # Guardar información para el registro
                    user_state_data = {
                        "state": "esperando_telefono", 
                        "nombre": nombre_completo,
                        "cedula": cedula
                    }
                    print(f"Guardando estado del usuario: {user_state_data}")
                    notification.state_manager.set_state(sender, user_state_data)
                    
                else:
                    # Otros errores en la API
                    error_message = f"Error al verificar ticket: {response.status_code}"
                    try:
                        error_response = response.json()
                        error_message += f" - Detalle: {error_response.get('detail', response.text)}"
                    except Exception:
                        error_message += f" - Respuesta: {response.text}"
                    
                    print(error_message)
                    raise Exception(error_message)
                    
            except requests.HTTPError as http_err:
                print(f"HTTP error al verificar ticket: {http_err}")
                # Si la API no responde, asumimos que necesitamos registrar al usuario
                notification.answer(f"No pudimos verificar si ya tienes un ticket. Para continuar con el registro, por favor envíame tu número de teléfono (con formato 04XX-XXXXXXX):")
                
                # Guardar información para el registro
                user_state_data = {
                    "state": "esperando_telefono", 
                    "nombre": nombre_completo,
                    "cedula": cedula
                }
                print(f"Guardando estado del usuario: {user_state_data}")
                notification.state_manager.set_state(sender, user_state_data)
                
            except Exception as err:
                print(f"Error inesperado al verificar ticket: {err}")
                notification.answer(f"Ha ocurrido un error inesperado: {str(err)}")
                notification.answer(f"Por favor, intenta nuevamente más tarde.")
                # Mostrar menú principal como fallback
                show_menu_principal(notification, sender_name)
                notification.state_manager.set_state(sender, {"state": "menu_principal", "nombre": sender_name})
        else:
            print(f"Cédula {cedula} no registrada en el sistema electoral.")
            notification.answer(f"El número de cédula {cedula} no está registrado en nuestra base de datos.")
            notification.answer("¿Te gustaría registrarte con esta cédula para participar en Lotto Bueno?")
            
            # Iniciar proceso de registro
            user_state_data = {
                "state": "esperando_telefono", 
                "nombre": sender_name,
                "cedula": cedula
            }
            print(f"Guardando estado para cédula no registrada: {user_state_data}")
            notification.state_manager.set_state(sender, user_state_data)
            notification.answer("Por favor, envíame tu número de teléfono (con formato 04XX-XXXXXXX):")
    except Exception as e:
        print(f"Error al verificar cédula: {e}")
        notification.answer(f"Ha ocurrido un error al procesar tu solicitud: {str(e)}")
        notification.answer("Por favor intenta nuevamente con solo tu número de cédula.")
        # Mostrar menú principal como fallback
        show_menu_principal(notification, sender_name)
        notification.state_manager.set_state(sender, {"state": "menu_principal", "nombre": sender_name})

def handle_registro_telefono(notification: Notification, sender: str, message_data: dict):
    """Maneja la entrada del teléfono durante el proceso de registro"""
    # Obtener el texto del mensaje
    message_text = None
    
    # Intentar obtener el texto de diferentes estructuras de mensaje
    extended_text_message_data = message_data.get("extendedTextMessageData", {})
    if extended_text_message_data:
        message_text = extended_text_message_data.get("textMessage") or extended_text_message_data.get("text")
    
    if not message_text:
        text_message_data = message_data.get("textMessageData", {})
        if text_message_data:
            message_text = text_message_data.get("textMessage")
    
    print(f"Mensaje de teléfono recibido: {message_text}")
    
    # Obtener el estado del usuario
    user_state = get_user_state(notification, sender)
    print(f"Estado del usuario recuperado en handle_registro_telefono: {user_state}")
    
    # Obtener datos del estado
    cedula = user_state.get("cedula")
    nombre = user_state.get("nombre", "Usuario")
    
    if not cedula:
        print(f"No se encontró cédula en el estado: {user_state}")
        notification.answer("No he podido recuperar tus datos de registro. Por favor intenta nuevamente.")
        show_menu_principal(notification, nombre)
        set_user_state(notification, sender, {"state": "menu_principal", "nombre": nombre})
        return
    
    if not message_text:
        notification.answer("No he podido obtener tu mensaje. Por favor, envía tu número de teléfono (ejemplo: 0414-1234567):")
        # Mantener el estado actual
        set_user_state(notification, sender, {"state": "esperando_telefono", "nombre": nombre, "cedula": cedula})
        return
    
    print(f"Procesando número de teléfono: '{message_text}' para cédula: {cedula}")
    
    # Extraer el número de teléfono
    telefono = extract_phone_number(message_text)
    print(f"Número extraído: {telefono} del texto original: {message_text}")
    
    if not telefono:
        # Intentar extraer de forma más directa para ver si falla el formateo
        digits_only = ''.join(filter(str.isdigit, message_text))
        print(f"Texto después de filtrar solo dígitos: {digits_only}")
        
        notification.answer("No he podido identificar un número de teléfono válido. Por favor, envía tu número con formato 04XX-XXXXXXX:")
        # Mantener el estado actual
        set_user_state(notification, sender, {"state": "esperando_telefono", "nombre": nombre, "cedula": cedula})
        return
    
    # Llamar a la API para registrar al usuario
    try:
        notification.answer(f"Estoy procesando tu registro con la cédula {cedula} y el teléfono {telefono}...")
        
        # Preparar la solicitud a la API
        payload = {
            "cedula": cedula,
            "telefono": telefono,
            "referido_id": 1  # Valor por defecto para registros desde el bot
        }
        
        print(f"Enviando solicitud a la API para generar ticket: {payload}")
        
        try:
            # Usar URL interna para la comunicación entre servicios
            response = requests.post(
                f"{INTERNAL_API_URL}/api/generate_tickets",
                json=payload
            )
            print(f"Respuesta de la API: Status: {response.status_code}, Texto: {response.text[:200]}")
            
            # Verificar si hay errores en la respuesta
            if response.status_code != 200:
                error_message = f"Error durante el registro (HTTP {response.status_code})."
                try:
                    error_details = response.json()
                    error_detail = error_details.get("detail", "")
                    error_message += f" Detalle del error: {error_detail}"
                except Exception:
                    error_message += f" Respuesta de la API: {response.text}"
                
                print(f"Error detallado: {error_message}")
                notification.answer(f"Ha ocurrido un error durante el registro. ❌\n\n{error_message}")
                notification.answer("Por favor, intenta nuevamente o contacta a soporte con este mensaje de error.")
                show_menu_principal(notification, nombre)
                set_user_state(notification, sender, {"state": "menu_principal", "nombre": nombre})
                return
                
            # Continuar solo si la respuesta es exitosa
            response.raise_for_status()
            data = response.json()
            print(f"Registro exitoso: {data}")
            
            # Si el registro fue exitoso
            notification.answer(f"¡Felicidades! Tu registro ha sido completado exitosamente.")
            
            if data.get("qr_code"):
                qr_buf = BytesIO(base64.b64decode(data["qr_code"]))
                send_qr_code(sender, qr_buf)
                print(f"QR Code enviado al usuario")
            else:
                print(f"No se encontró QR code en la respuesta")
            
            message = f"¡Bienvenido a Lotto Bueno! Tu ticket ha sido generado.\n\n" \
                    f"Es importante que guardes nuestro contacto, así podremos anunciarte si eres el afortunado ganador.\n" \
                    f"No pierdas tu ticket y guarda nuestro contacto, ¡prepárate para celebrar!\n\n" \
                    f"¡Mucha suerte!\n" \
                    f"Lotto Bueno: ¡Tu mejor oportunidad de ganar!"
                    
            notification.answer(message)
            
            # Obtener un contacto aleatorio para compartir
            db = next(get_db())
            phone_contact = obtener_numero_contacto(db)
            if phone_contact:
                print(f"Enviando contacto: {phone_contact}")
                enviar_contacto(sender, phone_contact.split('@')[0], "Lotto", "Bueno", "Lotto Bueno Inc")
            
            # Mostrar el menú después del registro
            show_post_registro_menu(notification, nombre)
            
            # Actualizar el estado del usuario
            set_user_state(notification, sender, {"state": "menu_post_registro", "nombre": nombre})
            print(f"Estado actualizado a menu_post_registro después del registro exitoso")
            
        except requests.exceptions.RequestException as req_err:
            print(f"Error en la solicitud HTTP: {req_err}")
            error_message = f"❌ Error al contactar el servidor: {str(req_err)}"
            notification.answer(error_message)
            notification.answer("Por favor, verifica tu conexión e intenta nuevamente.")
            show_menu_principal(notification, nombre)
            set_user_state(notification, sender, {"state": "menu_principal", "nombre": nombre})
        
    except requests.exceptions.HTTPError as e:
        print(f"Error HTTP al registrar: {e}")
        error_message = f"❌ Error durante el registro: {str(e)}"
        try:
            response_text = e.response.text
            error_message += f"\n\nRespuesta del servidor: {response_text}"
        except Exception:
            pass
        notification.answer(error_message)
        show_menu_principal(notification, nombre)
        set_user_state(notification, sender, {"state": "menu_principal", "nombre": nombre})
    except Exception as e:
        print(f"Error inesperado al registrar: {e}")
        error_message = f"❌ Error inesperado: {str(e)}"
        notification.answer(error_message)
        notification.answer("Por favor, intenta nuevamente más tarde o contacta a soporte con este mensaje de error.")
        show_menu_principal(notification, nombre)
        set_user_state(notification, sender, {"state": "menu_principal", "nombre": nombre})

def show_menu_principal(notification: Notification, nombre: str):
    """Muestra el menú principal para usuarios sin cédula registrada"""
    menu_message = f"Hola {nombre}, estamos aquí para ayudarte. ¿Qué te gustaría hacer?\n\n" \
                  f"*1.* Registrarme en Lotto Bueno 📝\n" \
                  f"*2.* Visitar nuestro sitio web 🌐\n" \
                  f"*3.* Unirme al canal de Telegram 📣\n" \
                  f"*4.* Verificar otra cédula 🔢\n" \
                  f"*5.* Finalizar conversación 👋\n\n" \
                  f"Responde con el *número* de la opción deseada."
    
    # Enviar con formato de WhatsApp
    notification.answer(menu_message)
    print(f"Menú principal enviado a {notification.sender}")

def handle_menu_principal(notification: Notification, sender: str, message_data: dict):
    """Maneja las opciones del menú principal"""
    # Obtener el texto del mensaje
    message_text = None
    
    extended_text_message_data = message_data.get("extendedTextMessageData", {})
    if extended_text_message_data:
        message_text = extended_text_message_data.get("textMessage") or extended_text_message_data.get("text")
    
    if not message_text:
        text_message_data = message_data.get("textMessageData", {})
        if text_message_data:
            message_text = text_message_data.get("textMessage")
    
    print(f"Mensaje recibido en menú principal: {message_text}")
    
    # Extraer opción del mensaje - más robusto
    option = None
    if message_text:
        # Intentar encontrar un número al principio del mensaje
        match = re.match(r'^[^\d]*(\d+)', message_text)
        if match:
            option = match.group(1)
        # Si no, buscar números en cualquier parte
        else:
            for char in message_text:
                if char.isdigit():
                    option = char
                    break
    
    # Obtener el estado y nombre del usuario
    user_state = get_user_state(notification, sender)
    nombre = user_state.get("nombre", "Usuario")
    
    print(f"Opción seleccionada: {option}")
    
    if option == "1":
        # Opción 1: Registrarse en Lotto Bueno
        notification.answer("¡Excelente! Para registrarte en Lotto Bueno, por favor envíame tu número de cédula:")
        notification.state_manager.delete_state(sender)  # Reiniciar el estado para iniciar el proceso de registro
    elif option == "2":
        # Opción 2: Visitar sitio web
        notification.answer(f"¡Excelente! Puedes visitar nuestro sitio web en:\n{WEBSITE_URL}")
        # Mantener el estado actual
        set_user_state(notification, sender, {"state": "menu_principal", "nombre": nombre})
        # Volver a mostrar el menú para permitir al usuario elegir otra opción
        show_menu_principal(notification, nombre)
    elif option == "3":
        # Opción 3: Unirse al canal de Telegram
        notification.answer(f"¡Genial! Únete a nuestro canal de Telegram para recibir noticias y actualizaciones:\n{TELEGRAM_CHANNEL}")
        # Mantener el estado actual
        set_user_state(notification, sender, {"state": "menu_principal", "nombre": nombre})
        # Volver a mostrar el menú para permitir al usuario elegir otra opción
        show_menu_principal(notification, nombre)
    elif option == "4":
        # Opción 4: Verificar otra cédula
        notification.answer("Por favor, envíame el número de cédula que deseas verificar:")
        notification.state_manager.delete_state(sender)  # Reiniciar el estado para procesar la nueva cédula
    elif option == "5":
        # Opción 5: Finalizar conversación
        notification.answer(f"¡Gracias por contactarnos, {nombre}! Esperamos verte pronto en Lotto Bueno. ¡Que tengas un excelente día! 🍀")
        notification.state_manager.delete_state(sender)
    else:
        # Opción no válida
        notification.answer("No he podido entender tu selección. Por favor, responde con el número de la opción deseada (1, 2, 3, 4 o 5):")
        # Mantener el estado actual
        set_user_state(notification, sender, {"state": "menu_principal", "nombre": nombre})
        show_menu_principal(notification, nombre)

def show_post_registro_menu(notification: Notification, nombre: str):
    """Muestra el menú de opciones después del registro"""
    menu_message = f"¿Qué te gustaría hacer ahora?\n\n" \
                  f"*1.* Visitar nuestro sitio web 🌐\n" \
                  f"*2.* Unirte a nuestro canal de Telegram 📣\n" \
                  f"*3.* Regresar al menú principal 🔄\n" \
                  f"*4.* Finalizar conversación 👋\n\n" \
                  f"Responde con el *número* de la opción deseada."
    
    # Enviar con formato de WhatsApp
    notification.answer(menu_message)
    print(f"Menú post-registro enviado a {notification.sender}")

def handle_post_registro_menu(notification: Notification, sender: str, message_data: dict):
    """Maneja las opciones del menú post-registro"""
    # Obtener el texto del mensaje
    message_text = None
    
    extended_text_message_data = message_data.get("extendedTextMessageData", {})
    if extended_text_message_data:
        message_text = extended_text_message_data.get("textMessage") or extended_text_message_data.get("text")
    
    if not message_text:
        text_message_data = message_data.get("textMessageData", {})
        if text_message_data:
            message_text = text_message_data.get("textMessage")
    
    print(f"Mensaje recibido en menú post-registro: {message_text}")
    
    # Extraer opción del mensaje - más robusto
    option = None
    if message_text:
        # Intentar encontrar un número al principio del mensaje
        match = re.match(r'^[^\d]*(\d+)', message_text)
        if match:
            option = match.group(1)
        # Si no, buscar números en cualquier parte
        else:
            for char in message_text:
                if char.isdigit():
                    option = char
                    break
    
    # Obtener el estado y nombre del usuario
    user_state = get_user_state(notification, sender)
    nombre = user_state.get("nombre", "Usuario")
    
    print(f"Opción seleccionada post-registro: {option}")
    
    if option == "1":
        # Opción 1: Visitar sitio web
        notification.answer(f"¡Excelente! Puedes visitar nuestro sitio web en:\n{WEBSITE_URL}")
        # Mantener el estado actual
        set_user_state(notification, sender, {"state": "menu_post_registro", "nombre": nombre})
        # Volver a mostrar el menú para que el usuario pueda elegir otra opción
        show_post_registro_menu(notification, nombre)
    elif option == "2":
        # Opción 2: Unirse al canal de Telegram
        notification.answer(f"¡Genial! Únete a nuestro canal de Telegram para recibir noticias y actualizaciones:\n{TELEGRAM_CHANNEL}")
        # Mantener el estado actual
        set_user_state(notification, sender, {"state": "menu_post_registro", "nombre": nombre})
        # Volver a mostrar el menú para que el usuario pueda elegir otra opción
        show_post_registro_menu(notification, nombre)
    elif option == "3":
        # Opción 3: Regresar al menú principal
        notification.answer("Regresando al menú principal...")
        show_menu_principal(notification, nombre)
        set_user_state(notification, sender, {"state": "menu_principal", "nombre": nombre})
    elif option == "4":
        # Opción 4: Finalizar conversación
        notification.answer(f"¡Gracias por registrarte, {nombre}! Estamos emocionados de tenerte como participante en Lotto Bueno. Te notificaremos si eres el ganador. ¡Buena suerte! 🍀")
        notification.state_manager.delete_state(sender)
    else:
        # Opción no válida
        notification.answer("No he podido entender tu selección. Por favor, responde con el número de la opción deseada (1, 2, 3 o 4):")
        # Mantener el estado actual
        set_user_state(notification, sender, {"state": "menu_post_registro", "nombre": nombre})
        show_post_registro_menu(notification, nombre)

def check_inactive_users():
    """Verifica y cierra las sesiones inactivas"""
    current_time = time.time()
    inactive_users = []
    
    for sender, last_time in user_last_interaction.items():
        if current_time - last_time > MAX_INACTIVITY_TIME_SECONDS:
            inactive_users.append(sender)
    
    for sender in inactive_users:
        print(f"Usuario inactivo detectado: {sender}")
        try:
            # Eliminar el estado del usuario si existe
            try:
                if hasattr(bot, 'state_manager'):
                    bot.state_manager.delete_state(sender)
                elif hasattr(bot.router, 'state_manager'):
                    bot.router.state_manager.delete_state(sender)
                else:
                    print("No se encontró state_manager para eliminar el estado")
            except Exception as e:
                print(f"Error al eliminar estado para usuario inactivo {sender}: {e}")
                
            # Eliminar el registro de tiempo de interacción
            del user_last_interaction[sender]
            
            # Opcional: enviar un mensaje de cierre de sesión
            try:
                send_message(sender, "Tu sesión ha finalizado debido a inactividad. Envía cualquier mensaje para comenzar de nuevo.")
                print(f"Mensaje de inactividad enviado a {sender}")
            except Exception as e:
                print(f"Error enviando mensaje de inactividad a {sender}: {e}")
        except Exception as e:
            print(f"Error general manejando usuario inactivo {sender}: {e}")

def inactivity_checker():
    """Función para verificar usuarios inactivos periódicamente"""
    while True:
        try:
            check_inactive_users()
        except Exception as e:
            print(f"Error en verificador de inactividad: {e}")
        time.sleep(60)  # Verificar cada minuto

# Agregar una función para serializar y deserializar el estado
def set_user_state(notification, sender, state_dict):
    """Guarda el estado del usuario de forma compatible con la biblioteca"""
    try:
        # Intenta guardar directamente como diccionario (forma preferida)
        notification.state_manager.set_state(sender, state_dict)
        print(f"Estado guardado exitosamente como diccionario: {state_dict}")
    except Exception as e:
        print(f"Error al guardar estado como diccionario: {e}")
        # Intentar otras formas de guardar estado si la primera falla
        try:
            serialized_state = json.dumps(state_dict)
            notification.state_manager.set_state(sender, serialized_state)
            print(f"Estado guardado como JSON string: {serialized_state}")
        except Exception as e2:
            print(f"Error al guardar estado serializado: {e2}")
            # Último intento: crear un objeto simple
            try:
                class SimpleState:
                    pass
                
                state_obj = SimpleState()
                for key, value in state_dict.items():
                    setattr(state_obj, key, value)
                
                notification.state_manager.set_state(sender, state_obj)
                print(f"Estado guardado como objeto con atributos: {state_obj.__dict__}")
            except Exception as e3:
                print(f"Error al guardar estado como objeto: {e3}")

def get_user_state(notification, sender):
    """Obtiene el estado del usuario manejando diferentes formatos posibles"""
    try:
        state = notification.state_manager.get_state(sender)
        
        # Si es None, retornar un diccionario vacío
        if state is None:
            print("No se encontró estado para el usuario")
            return {}
        
        print(f"Estado raw recibido: {state}")
            
        # Si es un objeto con atributo name (caso detectado en logs)
        if hasattr(state, "name") and isinstance(state.name, dict):
            result = state.name
            print(f"Estado obtenido con estructura name: {result}")
            return result
            
        # Si es un objeto, intentar convertirlo a diccionario
        if hasattr(state, "__dict__"):
            result = state.__dict__
            print(f"Estado obtenido como objeto y convertido a diccionario: {result}")
            return result
            
        # Si es un string, intentar parsearlo como JSON
        if isinstance(state, str):
            try:
                result = json.loads(state)
                print(f"Estado obtenido como string JSON y parseado: {result}")
                return result
            except json.JSONDecodeError as e:
                print(f"Error al parsear estado JSON: {e}")
                return {"raw_state": state}
                
        # Si es un diccionario, retornarlo directamente
        if isinstance(state, dict):
            print(f"Estado obtenido como diccionario: {state}")
            return state
            
        # Último recurso: crear un diccionario con los atributos del objeto
        result = {}
        for attr in dir(state):
            if not attr.startswith('_') and not callable(getattr(state, attr)):
                result[attr] = getattr(state, attr)
        print(f"Estado obtenido como objeto desconocido y convertido a: {result}")
        return result
    except Exception as e:
        print(f"Error al obtener estado del usuario: {e}")
        return {}

if __name__ == "__main__":
    # Iniciar un hilo que verifique los usuarios inactivos cada minuto
    import threading
    
    threading.Thread(target=inactivity_checker, daemon=True).start()
    
    # Iniciar el bot
    bot.run_forever()
