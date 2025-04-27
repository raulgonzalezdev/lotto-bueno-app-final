import os
import sys
import logging
import asyncio
import base64
import re
import time
import qrcode
from io import BytesIO
import requests
from pathlib import Path

# Configurar logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Añadir el directorio raíz al PYTHONPATH
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import (
    Updater, CommandHandler, MessageHandler, Filters, 
    CallbackContext, CallbackQueryHandler, ConversationHandler
)
from app.main import get_db, send_qr_code, obtener_numero_contacto, verificar_cedula
from app.schemas import CedulaRequest

# Estados para el ConversationHandler
ESPERANDO_CEDULA, ESPERANDO_TELEFONO, MENU_POST_REGISTRO, MENU_PRINCIPAL = range(4)

# Configuración
TELEGRAM_TOKEN = os.getenv("API_TELEGRAM_TOKEN", "8187061957:AAEKVKWfBKuECSC7G63qFYzKbZJiFx4N18Q")
NEXT_PUBLIC_API_URL = os.getenv("NEXT_PUBLIC_API_URL", "https://applottobueno.com")
WEBSITE_URL = os.getenv("WEBSITE_URL", "https://applottobueno.com")
TELEGRAM_CHANNEL = os.getenv("TELEGRAM_CHANNEL", "https://t.me/applottobueno")
WHATSAPP_URL = os.getenv("WHATSAPP_URL", "https://wa.me/584262831867")

# Tiempo de inactividad en segundos (1 minuto)
INACTIVITY_TIMEOUT = 60
# Tiempo adicional para esperar respuesta después del mensaje de verificación (30 segundos)
RESPONSE_WAIT_TIME = 30

# Diccionario para almacenar la última actividad de cada usuario
user_last_activity = {}
# Diccionario para saber a qué usuarios ya se les envió advertencia
verification_sent = {}

# Opciones del menú post-registro
VISITAR_WEB = 'web'
UNIRSE_WHATSAPP = 'whatsapp'
VOLVER_MENU_PRINCIPAL = 'volver_menu'
FINALIZAR = 'finalizar'

# Opciones del menú principal
REGISTRARSE = 'register'
VISITAR_WEB_PRINCIPAL = 'web_principal'
UNIRSE_WHATSAPP_PRINCIPAL = 'whatsapp_principal'
INTENTAR_CEDULA = 'cedula'
FINALIZAR_PRINCIPAL = 'finalizar_principal'

def extract_cedula(text):
    """
    Extrae el número de cédula de un texto.
    Busca un número que tenga entre 6 y 10 dígitos.
    """
    if not text:
        logger.warning("Texto vacío recibido en extract_cedula")
        return None
        
    # Eliminar /start si está presente
    if text.startswith('/start'):
        text = text[6:].strip()
    
    logger.info(f"Procesando texto para extraer cédula: '{text}'")
    
    # Buscar patrones de cédula (números de 6-10 dígitos)
    cedula_matches = re.findall(r'\b\d{6,10}\b', text)
    
    if cedula_matches:
        # Tomar el primer número que parece una cédula
        cedula = cedula_matches[0]
        logger.info(f"Cédula encontrada con regex: '{cedula}'")
        return cedula
    
    logger.info("No se encontró cédula con regex, intentando extraer solo dígitos")
    # Si no encuentra números que parezcan cédula, intentar limpiar y extraer solo dígitos
    digits_only = ''.join(filter(str.isdigit, text))
    logger.info(f"Dígitos extraídos: '{digits_only}', longitud: {len(digits_only)}")
    
    if len(digits_only) >= 6:
        cedula = digits_only[:10]  # Limitar a 10 dígitos máximo
        logger.info(f"Cédula extraída de dígitos: '{cedula}'")
        return cedula
        
    logger.warning(f"No se pudo extraer una cédula válida del texto")
    return None

def extract_phone_number(text):
    """
    Extrae un número de teléfono de un texto y lo formatea para la API.
    El formato final debe ser 584XXXXXXXXX (12 dígitos).
    """
    if not text:
        logger.warning("Texto vacío recibido en extract_phone_number")
        return None
    
    logger.info(f"Procesando número de teléfono: '{text}'")
    
    # Eliminar espacios, guiones y paréntesis
    text = re.sub(r'[\s\-\(\)]', '', text)
    logger.info(f"Texto limpio sin espacios/guiones: '{text}'")
    
    # Extraer solo los dígitos
    digits_only = ''.join(filter(str.isdigit, text))
    logger.info(f"Solo dígitos: '{digits_only}', longitud: {len(digits_only)}")
    
    # Manejar diferentes formatos comunes en Venezuela
    if len(digits_only) >= 10:
        # Si comienza con 58, verificar que tenga un código de operadora válido
        if digits_only.startswith('58'):
            logger.info(f"Detectado número que comienza con 58: '{digits_only}'")
            # Verificar que después del 58 tenga un código de operadora válido
            if re.match(r'^58(412|414|416|424|426)', digits_only):
                result = digits_only[:12]  # Tomar solo los primeros 12 dígitos
                logger.info(f"Número con prefijo internacional 58 válido: '{result}'")
                return result
            else:
                logger.warning(f"Prefijo de operadora inválido después del 58: '{digits_only[2:5] if len(digits_only) > 4 else digits_only[2:]}'")
                return None
        
        # Si comienza con 0, quitar el 0 y agregar 58
        elif digits_only.startswith('0'):
            logger.info(f"Detectado número que comienza con 0: '{digits_only}'")
            # Verificar que sea una operadora venezolana válida
            if re.match(r'^0(412|414|416|424|426)', digits_only):
                result = '58' + digits_only[1:11]  # Formato: 58 + 10 dígitos sin el 0
                logger.info(f"Número con prefijo 0 convertido a: '{result}'")
                return result
            else:
                logger.warning(f"Prefijo de operadora inválido después del 0: '{digits_only[1:4] if len(digits_only) > 3 else digits_only[1:]}'")
                return None
        
        # Si comienza directamente con el código de operadora (sin 0)
        elif re.match(r'^(412|414|416|424|426)', digits_only):
            logger.info(f"Detectado número que comienza con código de operadora: '{digits_only}'")
            if len(digits_only) >= 10:
                result = '58' + digits_only[:10]  # Formato: 58 + 10 dígitos
                logger.info(f"Número sin prefijo convertido a: '{result}'")
                return result
            else:
                logger.warning(f"Número de operadora sin prefijo demasiado corto: '{digits_only}', longitud: {len(digits_only)}")
                return None
        
        # Intento adicional: si tiene 10 dígitos y no coincide con los patrones anteriores
        elif len(digits_only) == 10:
            # Asumir que los primeros 3 dígitos son el código de operadora
            operator_code = digits_only[:3]
            logger.info(f"Intentando procesar número de 10 dígitos con código de operadora: '{operator_code}'")
            if operator_code in ['412', '414', '416', '424', '426']:
                result = '58' + digits_only
                logger.info(f"Número de 10 dígitos convertido a: '{result}'")
                return result
            else:
                logger.warning(f"Código de operadora no reconocido: '{operator_code}' (debe ser uno de: 412, 414, 416, 424, 426)")
                return None
        
        # Otros casos no válidos
        else:
            logger.warning(f"Formato no reconocido: '{digits_only}', longitud: {len(digits_only)}")
            logger.warning("El número debe comenzar con: 58, 0 o directamente el código de operadora (412, 414, 416, 424, 426)")
            return None
    
    logger.warning(f"Número demasiado corto: '{digits_only}', longitud: {len(digits_only)} (se requieren al menos 10 dígitos)")
    return None

def check_inactive_users(context: CallbackContext):
    """Verificar usuarios inactivos y enviar advertencia o cerrar sesión"""
    current_time = time.time()
    
    # Lista para usuarios que necesitan mensaje de verificación
    users_to_verify = []
    # Lista para usuarios cuyas sesiones deben cerrarse
    users_to_close = []
    
    # Verificar todos los usuarios activos
    for user_id, last_activity in user_last_activity.items():
        inactive_time = current_time - last_activity
        
        # Si ha pasado el tiempo de inactividad pero no se ha enviado verificación
        if inactive_time > INACTIVITY_TIMEOUT and not verification_sent.get(user_id, False):
            users_to_verify.append(user_id)
        
        # Si ya se envió verificación y también pasó el tiempo de espera para respuesta
        # o si ha estado inactivo por más del doble del tiempo de inactividad
        elif (verification_sent.get(user_id, False) and inactive_time > INACTIVITY_TIMEOUT + RESPONSE_WAIT_TIME) or (inactive_time > 2 * INACTIVITY_TIMEOUT):
            users_to_close.append(user_id)
    
    # Enviar mensajes de verificación
    for user_id in users_to_verify:
        try:
            logger.info(f"Enviando mensaje de verificación a usuario inactivo: {user_id}")
            context.bot.send_message(
                chat_id=user_id,
                text="¿Sigues ahí? Esta sesión se cerrará automáticamente por inactividad en 30 segundos si no hay respuesta."
            )
            verification_sent[user_id] = True
        except Exception as e:
            logger.error(f"Error al enviar mensaje de verificación a {user_id}: {e}")
    
    # Cerrar sesiones inactivas
    for user_id in users_to_close:
        try:
            logger.info(f"Cerrando sesión por inactividad para usuario: {user_id}")
            context.bot.send_message(
                chat_id=user_id,
                text="Tu sesión ha sido cerrada por inactividad. Envía cualquier mensaje para comenzar una nueva conversación."
            )
            
            # Eliminar usuario de los diccionarios de seguimiento
            if user_id in user_last_activity:
                del user_last_activity[user_id]
            if user_id in verification_sent:
                del verification_sent[user_id]
            
            # Limpiar cualquier dato de contexto que pueda existir
            try:
                if user_id in context.user_data:
                    context.user_data[user_id].clear()
            except Exception as e:
                logger.error(f"Error al limpiar datos de contexto para {user_id}: {e}")
                
        except Exception as e:
            logger.error(f"Error al cerrar sesión para usuario inactivo {user_id}: {e}")

def update_user_activity(update: Update, context: CallbackContext):
    """Actualizar el tiempo de actividad del usuario"""
    user_id = update.effective_user.id
    user_last_activity[user_id] = time.time()
    
    # Si ya tenía una verificación enviada, resetearla
    if user_id in verification_sent:
        verification_sent[user_id] = False
    
    logger.debug(f"Actividad actualizada para usuario {user_id}")
    
    # Continuar con el flujo normal del mensaje
    return None

def start(update: Update, context: CallbackContext) -> int:
    """Iniciar conversación y solicitar cédula"""
    # Registrar actividad del usuario
    update_user_activity(update, context)
    
    user = update.effective_user
    logger.info(f"Comando /start recibido de {user.first_name}")
    
    # Verificar si hay una cédula en el comando /start
    message_text = update.message.text
    cedula = extract_cedula(message_text)
    
    if cedula:
        # Si encontramos una cédula en el mensaje, procesarla directamente
        logger.info(f"Cédula encontrada en comando /start: {cedula}")
        context.user_data['cedula'] = cedula
        return asyncio.run(procesar_cedula(update, context))
    
    # Si no hay cédula, mostrar menú principal directamente
    logger.info(f"Mostrando menú principal para {user.first_name}")
    return mostrar_menu_principal(update, context)

async def procesar_cedula(update: Update, context: CallbackContext) -> int:
    """Procesar la cédula ingresada por el usuario"""
    # Obtener la cédula del mensaje o del contexto si viene de /start
    cedula = context.user_data.get('cedula')
    if not cedula:
        cedula = update.message.text.strip()
        cedula = extract_cedula(cedula)
    
    # Limpiar la cédula del contexto para futuras interacciones
    if 'cedula' in context.user_data:
        del context.user_data['cedula']
    
    user_id = update.effective_user.id
    chat_id = update.effective_chat.id
    user_name = update.effective_user.first_name
    
    # Logging para depuración
    logger.info(f"Procesando cédula: {cedula}")
    
    # Si no se pudo extraer una cédula válida
    if not cedula:
        update.message.reply_text(
            f"No he podido identificar un número de cédula válido en tu mensaje. Por favor, envía solo tu número de cédula (entre 6 y 10 dígitos)."
        )
        update.message.reply_text("Ejemplo de formato correcto: 12345678")
        # Mostrar menú principal como alternativa
        return mostrar_menu_principal(update, context)
    
    # Obtener conexión a la base de datos
    db = next(get_db())
    
    try:
        # 1. Primero verificamos si la cédula existe en la base de datos de electores
        logger.info(f"Verificando cédula {cedula} en la base de datos")
        elector_response = await verificar_cedula(CedulaRequest(numero_cedula=cedula), db)
        logger.info(f"Respuesta verificación elector: {elector_response}")
        
        if not elector_response.get("elector"):
            logger.info(f"Cédula {cedula} no registrada en el sistema electoral")
            update.message.reply_text(
                f"El número de cédula {cedula} no está registrado en nuestra base de datos."
            )
            update.message.reply_text(
                "¿Te gustaría registrarte con esta cédula para participar en Lotto Bueno?"
            )
            
            # Guardar la cédula en el contexto para usarla durante el registro
            try:
                context.user_data['cedula_registro'] = cedula
                logger.info(f"Cédula {cedula} guardada en el contexto para registro")
            except Exception as e:
                logger.error(f"Error al guardar cédula en contexto: {e}")
                # Alternativa si falla guardar en el contexto
                update.message.reply_text(
                    "Por favor envía tu número de cédula nuevamente junto con tu teléfono en este formato: CEDULA:TELEFONO"
                )
                return ESPERANDO_CEDULA
            
            # Solicitar el número de teléfono
            update.message.reply_text(
                "Por favor, envíame tu número de teléfono (con formato 04XX-XXXXXXX):"
            )
            return ESPERANDO_TELEFONO
        
        # Obtener datos del elector
        elector_data = elector_response.get("elector")
        nombre_completo = f"{elector_data['p_nombre']} {elector_data['s_nombre']} {elector_data['p_apellido']} {elector_data['s_apellido']}"
        logger.info(f"Elector encontrado: {nombre_completo}")
        
        # Guardar información del usuario en el contexto
        try:
            context.user_data['nombre'] = nombre_completo
            logger.info(f"Nombre guardado en contexto: {nombre_completo}")
        except Exception as e:
            logger.error(f"Error al guardar nombre en contexto: {e}")
            # No es crítico, continuamos sin guardar el nombre
        
        # 2. Verificar si ya tiene un ticket registrado con esta cédula
        try:
            # Llamada a la API para obtener el ticket por cédula
            logger.info(f"Verificando ticket para cédula {cedula}")
            ticket_url = f"{NEXT_PUBLIC_API_URL}/api/tickets/cedula/{cedula}"
            logger.info(f"URL de verificación ticket: {ticket_url}")
            
            response = requests.get(ticket_url)
            logger.info(f"Respuesta de verificación ticket: Status {response.status_code}")
            
            # Si la respuesta es exitosa, la cédula ya tiene un ticket
            if response.status_code == 200:
                existing_ticket = response.json()
                logger.info(f"Ticket encontrado: ID: {existing_ticket.get('id')}")
                
                # Extraer el QR del ticket
                qr_code_base64 = existing_ticket["qr_ticket"]
                qr_bytes = base64.b64decode(qr_code_base64)
                
                # Mensaje de bienvenida
                message = f"{nombre_completo}, hoy es tu día de suerte!\n\n" \
                        f"Desde este momento estás participando en el Lotto Bueno y este es tu número de ticket {existing_ticket['id']} ¡El número ganador!\n\n" \
                        f"Es importante que guardes nuestro contacto, así podremos anunciarte que tú eres el afortunado ganador.\n" \
                        f"No pierdas tu número de ticket y guarda nuestro contacto, ¡prepárate para celebrar!\n\n" \
                        f"¡Mucha suerte!\n" \
                        f"Lotto Bueno: ¡Tu mejor oportunidad de ganar!"
                
                # Enviar mensaje
                update.message.reply_text(message)
                
                # Enviar el QR como imagen
                with BytesIO(qr_bytes) as bio:
                    update.message.reply_photo(bio, caption=f"Ticket #{existing_ticket['id']}")
                
                # Mostrar menú post-registro
                return mostrar_menu_post_registro(update, context)
            
            # Si la respuesta es 404, la cédula no tiene ticket, debemos registrarla
            elif response.status_code == 404:
                logger.info(f"Cédula {cedula} registrada pero sin ticket")
                update.message.reply_text(
                    f"La cédula {cedula} está registrada en el sistema pero aún no tiene un ticket de Lotto Bueno."
                )
                update.message.reply_text(
                    "Para completar tu registro, necesito tu número de teléfono."
                )
                
                # Guardar la cédula en el contexto para el registro
                try:
                    context.user_data['cedula_registro'] = cedula
                    logger.info(f"Cédula {cedula} guardada para registro")
                except Exception as e:
                    logger.error(f"Error al guardar cédula para registro: {e}")
                    update.message.reply_text(
                        "Por favor envía tu número de cédula nuevamente junto con tu teléfono en este formato: CEDULA:TELEFONO"
                    )
                    return ESPERANDO_CEDULA
                
                # Solicitar el número de teléfono
                update.message.reply_text(
                    "Por favor, envíame tu número de teléfono (con formato 04XX-XXXXXXX):"
                )
                return ESPERANDO_TELEFONO
            
            else:
                # Otros errores en la API
                error_msg = f"Error al verificar ticket: {response.status_code} - {response.text[:200]}"
                logger.error(error_msg)
                raise Exception(error_msg)
        
        except requests.RequestException as e:
            logger.error(f"Error en la solicitud HTTP: {e}")
            update.message.reply_text(
                f"No pudimos verificar si ya tienes un ticket. Para continuar con el registro, necesito tu número de teléfono."
            )
            
            # Guardar la cédula para el registro
            context.user_data['cedula_registro'] = cedula
            
            # Solicitar el número de teléfono
            update.message.reply_text(
                "Por favor, envíame tu número de teléfono (con formato 04XX-XXXXXXX):"
            )
            return ESPERANDO_TELEFONO
            
        except Exception as e:
            logger.error(f"Error al procesar ticket: {str(e)}")
            update.message.reply_text(
                f"Ha ocurrido un error al procesar tu ticket. Por favor intenta de nuevo más tarde."
            )
            # Mostrar menú principal como fallback
            return mostrar_menu_principal(update, context)
        
    except Exception as e:
        logger.error(f"Error al procesar cédula: {str(e)}")
        update.message.reply_text(
            f"Ha ocurrido un error al procesar tu solicitud. Por favor intenta de nuevo más tarde."
        )
        # Mostrar menú principal como fallback
        return mostrar_menu_principal(update, context)

def registrar_usuario(update: Update, context: CallbackContext) -> int:
    """Procesar el teléfono y registrar al usuario"""
    # Registrar actividad del usuario
    update_user_activity(update, context)
    
    user_name = update.effective_user.first_name
    chat_id = update.effective_chat.id
    logger.info(f"Procesando registro para usuario: {user_name}")
    
    # Obtener la cédula guardada anteriormente
    cedula = None
    try:
        cedula = context.user_data.get('cedula_registro')
        logger.info(f"Cédula recuperada del contexto: {cedula}")
    except Exception as e:
        logger.error(f"Error al obtener cédula de registro del contexto: {e}")
    
    # Si no se encuentra la cédula, verificar si el usuario la envió junto con el teléfono
    if not cedula:
        message_text = update.message.text
        logger.info(f"Mensaje recibido para procesar teléfono: {message_text}")
        
        if ":" in message_text:
            parts = message_text.split(":")
            if len(parts) >= 2:
                cedula_part = parts[0].strip()
                cedula = extract_cedula(cedula_part)
                phone_text = parts[1].strip()
                logger.info(f"Cédula extraída del mensaje: {cedula}, teléfono: {phone_text}")
            else:
                phone_text = message_text
                logger.warning("Formato incorrecto CEDULA:TELEFONO")
        else:
            phone_text = message_text
            update.message.reply_text("No se encontró la cédula para el registro. Por favor inicia el proceso nuevamente.")
            logger.warning(f"No se encontró cédula para el usuario {user_name}")
            return mostrar_menu_principal(update, context)
    else:
        phone_text = update.message.text
        logger.info(f"Procesando número de teléfono: {phone_text} para cédula: {cedula}")
    
    # Extraer el número de teléfono del mensaje
    telefono = extract_phone_number(phone_text)
    logger.info(f"Número de teléfono extraído: {telefono}")
    
    if not telefono:
        logger.warning(f"No se pudo extraer un número de teléfono válido de: {phone_text}")
        update.message.reply_text(
            "No he podido identificar un número de teléfono válido. Por favor, envía tu número con formato 04XX-XXXXXXX:"
        )
        return ESPERANDO_TELEFONO
    
    # Mostrar mensaje de procesamiento
    update.message.reply_text(f"Estoy procesando tu registro con la cédula {cedula} y el teléfono {telefono}...")
    
    try:
        # Preparar la solicitud a la API
        payload = {
            "cedula": cedula,
            "telefono": telefono,
            "referido_id": 1  # Valor por defecto para registros desde el bot
        }
        
        # Llamar a la API para registrar al usuario
        logger.info(f"Enviando solicitud a la API para registrar ticket: {payload}")
        api_url = f"{NEXT_PUBLIC_API_URL}/api/generate_tickets"
        logger.info(f"URL de registro: {api_url}")
        
        response = requests.post(
            api_url, 
            json=payload
        )
        
        # Verificar si hay errores en la respuesta
        if response.status_code != 200:
            error_message = f"Error durante el registro (HTTP {response.status_code})."
            try:
                error_details = response.json()
                error_detail = error_details.get("detail", "")
                error_message += f" Detalle del error: {error_detail}"
            except Exception:
                error_message += f" Respuesta de la API: {response.text[:200]}"
            
            logger.error(f"Error en registro: {error_message}")
            update.message.reply_text(f"Ha ocurrido un error durante el registro. ❌\n\n{error_message}")
            update.message.reply_text("Por favor, intenta nuevamente o contacta a soporte con este mensaje de error.")
            return mostrar_menu_principal(update, context)
        
        # Continuar solo si la respuesta es exitosa
        response.raise_for_status()
        data = response.json()
        logger.info(f"Registro exitoso: {data.get('id', 'ID no disponible')}")
        
        # Mensaje de éxito
        update.message.reply_text("¡Felicidades! Tu registro ha sido completado exitosamente.")
        
        # Si hay un QR code, mostrarlo
        if data.get("qr_code"):
            logger.info("QR Code recibido de la API")
            qr_bytes = base64.b64decode(data["qr_code"])
            with BytesIO(qr_bytes) as bio:
                update.message.reply_photo(bio, caption=f"Ticket #{data.get('id', 'generado')}")
            logger.info("QR Code enviado al usuario")
        else:
            logger.warning("No se recibió QR Code de la API")
        
        # Mensaje informativo
        message = f"¡Bienvenido a Lotto Bueno! Tu ticket ha sido generado.\n\n" \
                  f"Es importante que guardes nuestro contacto, así podremos anunciarte si eres el afortunado ganador.\n" \
                  f"No pierdas tu ticket y guarda nuestro contacto, ¡prepárate para celebrar!\n\n" \
                  f"¡Mucha suerte!\n" \
                  f"Lotto Bueno: ¡Tu mejor oportunidad de ganar!"
        
        update.message.reply_text(message)
        
        # MODIFICADO: Enfatizar primero la invitación a WhatsApp y generar QR
        try:
            # Preparar el mensaje para la invitación a WhatsApp
            welcome_message = f"¡Hola! Has sido registrado en Lotto Bueno con el número de cédula {cedula}. " \
                            f"Tu ticket ha sido generado exitosamente. " \
                            f"Para más información, guarda este contacto y comunícate con nosotros. " \
                            f"Puedes unirte a nuestro canal de Telegram: {TELEGRAM_CHANNEL}"
            
            # Formatear el número para el enlace de WhatsApp
            company_whatsapp_number = WHATSAPP_URL.replace("https://wa.me/", "")
            
            # Destacar la invitación a WhatsApp
            update.message.reply_text(
                f"🔴 *IMPORTANTE* 🔴\n\n"
                f"Para evitar perder comunicación, por favor únete a nuestro WhatsApp haciendo clic en el siguiente enlace:"
            )
            
            # Crear el enlace de WhatsApp con el número de la empresa
            whatsapp_link = f"https://wa.me/{company_whatsapp_number}?text={requests.utils.quote('Hola! Me acabo de registrar en Lotto Bueno a través de Telegram con la cédula ' + cedula)}"
            
            # Generar código QR con el enlace de WhatsApp
            logger.info(f"Generando QR para enlace de WhatsApp: {whatsapp_link}")
            try:
                # Crear código QR
                qr = qrcode.QRCode(
                    version=1,
                    error_correction=qrcode.constants.ERROR_CORRECT_L,
                    box_size=10,
                    border=4,
                )
                qr.add_data(whatsapp_link)
                qr.make(fit=True)
                
                img = qr.make_image(fill_color="black", back_color="white")
                
                # Guardar la imagen en un buffer
                qr_buffer = BytesIO()
                img.save(qr_buffer, format="PNG")
                qr_buffer.seek(0)
                
                # Enviar QR como imagen usando directamente la API de Telegram
                update.message.reply_photo(
                    photo=qr_buffer, 
                    caption="📱 *CÓDIGO QR PARA CONTACTO VÍA WHATSAPP*\n\nEscanea este código QR para contactarnos directamente vía WhatsApp. Si estás ayudando a alguien a registrarse, puedes mostrarle este código para que lo escanee."
                )
                logger.info("QR de WhatsApp enviado al usuario")
            except Exception as qr_error:
                logger.error(f"Error al generar QR de WhatsApp: {qr_error}")
                # Si falla, asegurarse de enviar el enlace como texto
                update.message.reply_text(
                    f"No se pudo generar el código QR. Puedes hacer clic en este enlace para contactarnos por WhatsApp: {whatsapp_link}"
                )
                # No interrumpir el flujo si falla la generación del QR
            
            # Enviar también el enlace textual
            update.message.reply_text(
                f"👉 También puedes hacer clic aquí para contactarnos por WhatsApp: {whatsapp_link}\n\n"
                f"Es muy importante que guardes nuestro contacto para evitar perder comunicación."
            )
            
            # Ahora los enlaces secundarios
            logger.info(f"Enlace de WhatsApp generado con el número de la compañía: {whatsapp_link}")
            
            # Si el usuario también registró un número, ofrecer enlace para ese número
            if telefono:
                # Formatear el número para el enlace de WhatsApp
                whatsapp_number = telefono
                if whatsapp_number.startswith('58'):
                    whatsapp_number = whatsapp_number.lstrip('58')
                
                # Crear el enlace para el número registrado
                user_whatsapp_link = f"https://wa.me/58{whatsapp_number}?text={requests.utils.quote(welcome_message)}"
                logger.info(f"Enlace de WhatsApp generado para el número registrado: {user_whatsapp_link}")
                
                update.message.reply_text(
                    f"También puedes compartir esta invitación con el número que acabas de registrar: {user_whatsapp_link}"
                )
            
            # Información sobre el sitio web
            update.message.reply_text(
                f"🌐 Visita nuestra página web para más información: {WEBSITE_URL}\n\n"
                f"Próximamente tendremos una aplicación móvil donde podrás revisar tus tickets y recibir notificaciones al instante."
            )
            
            # Crear el enlace de Telegram (secundario)
            telegram_bot_username = TELEGRAM_TOKEN.split(':')[0]
            telegram_link = f"https://t.me/{telegram_bot_username}?start={cedula}"
            logger.info(f"Enlace de Telegram generado: {telegram_link}")
            
            update.message.reply_text(
                f"📣 Enlace para Telegram: {telegram_link}"
            )
            
        except Exception as e:
            logger.error(f"Error al generar enlaces: {e}")
            # No interrumpimos el flujo si falla la generación de enlaces
        
        # Limpiar datos del contexto que ya no necesitamos
        try:
            if 'cedula_registro' in context.user_data:
                del context.user_data['cedula_registro']
                logger.info("Cédula de registro eliminada del contexto")
            
            # Guardar el nombre del usuario para usarlo en los menús
            context.user_data['nombre'] = user_name
            logger.info(f"Nombre guardado en el contexto: {user_name}")
        except Exception as e:
            logger.error(f"Error al manipular datos del contexto: {e}")
        
        # Mostrar menú post-registro
        logger.info("Mostrando menú post-registro después de registro exitoso")
        return mostrar_menu_post_registro(update, context)
        
    except requests.exceptions.HTTPError as e:
        logger.error(f"Error HTTP al registrar: {e}")
        update.message.reply_text(f"Ha ocurrido un error durante el registro: {str(e)}")
        return mostrar_menu_principal(update, context)
    except Exception as e:
        logger.error(f"Error inesperado al registrar: {e}")
        update.message.reply_text("Ha ocurrido un error inesperado. Por favor, intenta nuevamente más tarde.")
        return mostrar_menu_principal(update, context)

def handle_menu_principal_callback(update: Update, context: CallbackContext) -> int:
    """Manejar los callbacks del menú principal"""
    # Registrar actividad del usuario
    update_user_activity(update, context)
    
    query = update.callback_query
    query.answer()
    user_name = update.effective_user.first_name
    
    # Logging para depuración
    logger.info(f"Callback recibido: {query.data} de usuario: {user_name}")
    
    # Obtener la opción seleccionada
    opcion = query.data
    
    if opcion == REGISTRARSE:
        logger.info(f"Usuario {user_name} seleccionó registrarse")
        query.edit_message_text(
            f"👍 ¡Excelente elección {user_name}!\n\n"
            f"Para registrarte en Lotto Bueno, por favor envía tu número de cédula:"
        )
        return ESPERANDO_CEDULA
    
    elif opcion == VISITAR_WEB_PRINCIPAL:
        logger.info(f"Usuario {user_name} seleccionó visitar web")
        query.edit_message_text(
            f"🌐 ¡Perfecto! Puedes visitar nuestro sitio web en:\n{WEBSITE_URL}"
        )
        # Volver a mostrar el menú para continuar interactuando
        context.bot.send_message(
            chat_id=update.effective_chat.id,
            text="¿Deseas realizar alguna otra acción?",
        )
        return mostrar_menu_principal(update, context)
    
    elif opcion == UNIRSE_WHATSAPP_PRINCIPAL:
        logger.info(f"Usuario {user_name} seleccionó contacto WhatsApp")
        query.edit_message_text(
            f"📱 ¡Excelente! Puedes contactarnos por WhatsApp en el siguiente enlace:\n{WHATSAPP_URL}"
        )
        # Volver a mostrar el menú para continuar interactuando
        context.bot.send_message(
            chat_id=update.effective_chat.id,
            text="¿Deseas realizar alguna otra acción?",
        )
        return mostrar_menu_principal(update, context)
    
    elif opcion == INTENTAR_CEDULA:
        logger.info(f"Usuario {user_name} seleccionó verificar cédula")
        query.edit_message_text(
            f"🔢 Por favor, envíame tu número de cédula para verificar tu registro:"
        )
        return ESPERANDO_CEDULA
    
    elif opcion == FINALIZAR_PRINCIPAL:
        logger.info(f"Usuario {user_name} seleccionó finalizar conversación")
        query.edit_message_text(
            f"👋 ¡Gracias por contactarnos, {user_name}! Esperamos verte pronto en Lotto Bueno. "
            "¡Que tengas un excelente día! 🍀"
        )
        # Limpiar cualquier dato de contexto pendiente
        try:
            context.user_data.clear()
            logger.info(f"Contexto limpiado para usuario {user_name}")
        except Exception as e:
            logger.error(f"Error al limpiar contexto: {e}")
        return ConversationHandler.END
    
    logger.warning(f"Opción desconocida recibida: {opcion}")
    query.edit_message_text("No pude entender tu selección. Por favor, intenta nuevamente.")
    return mostrar_menu_principal(update, context)

def button_callback(update: Update, context: CallbackContext) -> int:
    """Manejar los callbacks de los botones del menú post-registro"""
    # Registrar actividad del usuario
    update_user_activity(update, context)
    
    query = update.callback_query
    query.answer()
    user_name = update.effective_user.first_name
    
    # Logging para depuración
    logger.info(f"Callback post-registro recibido: {query.data} de usuario: {user_name}")
    
    # Obtener la opción seleccionada
    opcion = query.data
    
    if opcion == VISITAR_WEB:
        logger.info(f"Usuario {user_name} seleccionó visitar web desde menú post-registro")
        query.edit_message_text(
            f"🌐 ¡Perfecto! Puedes visitar nuestro sitio web en:\n{WEBSITE_URL}"
        )
        # Volver a mostrar el menú para continuar interactuando
        context.bot.send_message(
            chat_id=update.effective_chat.id,
            text="¿Deseas realizar alguna otra acción?",
        )
        return mostrar_menu_post_registro(update, context)
    
    elif opcion == UNIRSE_WHATSAPP:
        logger.info(f"Usuario {user_name} seleccionó contacto WhatsApp desde menú post-registro")
        query.edit_message_text(
            f"📱 ¡Excelente! Puedes contactarnos por WhatsApp en el siguiente enlace:\n{WHATSAPP_URL}"
        )
        # Volver a mostrar el menú para continuar interactuando
        context.bot.send_message(
            chat_id=update.effective_chat.id,
            text="¿Deseas realizar alguna otra acción?",
        )
        return mostrar_menu_post_registro(update, context)
    
    elif opcion == VOLVER_MENU_PRINCIPAL:
        logger.info(f"Usuario {user_name} seleccionó regresar al menú principal")
        query.edit_message_text(
            "🔄 Regresando al menú principal..."
        )
        # Mostrar el menú principal
        return mostrar_menu_principal(update, context)
    
    elif opcion == FINALIZAR:
        nombre = context.user_data.get('nombre', user_name)
        logger.info(f"Usuario {user_name} seleccionó finalizar desde menú post-registro")
        query.edit_message_text(
            f"👋 ¡Gracias por registrarte, {nombre}! Estamos emocionados de tenerte como participante en Lotto Bueno. "
            "Te notificaremos si eres el ganador. ¡Buena suerte! 🍀"
        )
        # Limpiar cualquier dato de contexto pendiente
        try:
            context.user_data.clear()
            logger.info(f"Contexto limpiado para usuario {user_name}")
        except Exception as e:
            logger.error(f"Error al limpiar contexto: {e}")
        return ConversationHandler.END
    
    logger.warning(f"Opción post-registro desconocida recibida: {opcion}")
    query.edit_message_text("No pude entender tu selección. Por favor, intenta nuevamente.")
    return mostrar_menu_post_registro(update, context)

def mensaje_cedula(update: Update, context: CallbackContext) -> int:
    """Procesa mensajes de texto recibidos cuando se espera una cédula"""
    # Registrar actividad del usuario
    update_user_activity(update, context)
    
    user_name = update.effective_user.first_name
    text = update.message.text
    logger.info(f"Mensaje recibido en estado ESPERANDO_CEDULA: {text} de usuario: {user_name}")
    
    # Tratar de extraer cédula y procesarla
    cedula = extract_cedula(text)
    if cedula:
        logger.info(f"Cédula extraída del mensaje: {cedula}")
        context.user_data['cedula'] = cedula
        return asyncio.run(procesar_cedula(update, context))
    else:
        # Si no se identifica una cédula, informar al usuario
        update.message.reply_text(
            "No pude identificar un número de cédula válido en tu mensaje.\n"
            "Por favor envía solo tu número de cédula (entre 6 y 10 dígitos).\n\n"
            "Ejemplo: 12345678"
        )
        return ESPERANDO_CEDULA

def cancel(update: Update, context: CallbackContext) -> int:
    """Cancelar y finalizar la conversación"""
    user_name = update.effective_user.first_name
    logger.info(f"Usuario {user_name} canceló la conversación")
    
    update.message.reply_text(
        f"👋 ¡Adiós {user_name}! La conversación ha sido finalizada.\n"
        f"Puedes enviar cualquier mensaje cuando quieras volver a hablar conmigo."
    )
    
    # Limpiar datos del contexto
    try:
        context.user_data.clear()
        logger.info(f"Contexto limpiado para usuario {user_name}")
    except Exception as e:
        logger.error(f"Error al limpiar contexto: {e}")
        
    return ConversationHandler.END

def mensaje_inicial(update: Update, context: CallbackContext) -> None:
    """Responde a cualquier mensaje cuando no hay una conversación activa mostrando el menú principal"""
    user = update.effective_user
    logger.info(f"Mensaje inicial recibido de {user.first_name}: {update.message.text}")
    
    # En lugar de pedir /start, mostrar directamente el menú principal
    logger.info(f"Mostrando menú principal automáticamente para {user.first_name}")
    return mostrar_menu_principal(update, context)

def mostrar_menu_principal(update: Update, context: CallbackContext) -> int:
    """Mostrar menú principal para usuarios sin cédula registrada"""
    user_name = update.effective_user.first_name
    
    keyboard = [
        [InlineKeyboardButton("🎟️ Registrarme en Lotto Bueno", callback_data=REGISTRARSE)],
        [InlineKeyboardButton("🌐 Visitar sitio web", callback_data=VISITAR_WEB_PRINCIPAL)],
        [InlineKeyboardButton("📱 Contactarnos por WhatsApp", callback_data=UNIRSE_WHATSAPP_PRINCIPAL)],
        [InlineKeyboardButton("🔢 Verificar mi cédula", callback_data=INTENTAR_CEDULA)],
        [InlineKeyboardButton("👋 Finalizar conversación", callback_data=FINALIZAR_PRINCIPAL)]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    logger.info(f"Mostrando menú principal a usuario: {user_name}")
    
    # Mensaje de bienvenida con instrucciones claras
    welcome_message = f"👋 Hola {user_name}, bienvenido a Lotto Bueno!\n\n" \
                     f"¿Cómo puedo ayudarte hoy? Elige una opción:"
    
    # Enviar mensaje con el menú
    try:
        if update.message:
            update.message.reply_text(
                welcome_message,
                reply_markup=reply_markup
            )
        elif update.callback_query:
            # Si viene de un callback, actualizar el mensaje anterior o enviar uno nuevo
            try:
                update.callback_query.edit_message_text(
                    welcome_message,
                    reply_markup=reply_markup
                )
            except Exception as e:
                logger.error(f"Error al editar mensaje: {e}")
                context.bot.send_message(
                    chat_id=update.effective_chat.id,
                    text=welcome_message,
                    reply_markup=reply_markup
                )
        else:
            # En caso de que no haya ni mensaje ni callback
            context.bot.send_message(
                chat_id=update.effective_chat.id,
                text=welcome_message,
                reply_markup=reply_markup
            )
    except Exception as e:
        logger.error(f"Error al mostrar menú principal: {e}")
        try:
            context.bot.send_message(
                chat_id=update.effective_chat.id,
                text=welcome_message,
                reply_markup=reply_markup
            )
        except Exception as e2:
            logger.error(f"Error secundario al mostrar menú principal: {e2}")
    
    return MENU_PRINCIPAL

def mostrar_menu_post_registro(update: Update, context: CallbackContext) -> int:
    """Mostrar menú post-registro"""
    user_name = context.user_data.get('nombre', update.effective_user.first_name)
    
    keyboard = [
        [InlineKeyboardButton("🌐 Visitar Sitio Web", callback_data=VISITAR_WEB)],
        [InlineKeyboardButton("📱 Contactarnos por WhatsApp", callback_data=UNIRSE_WHATSAPP)],
        [InlineKeyboardButton("🔄 Regresar al Menú Principal", callback_data=VOLVER_MENU_PRINCIPAL)],
        [InlineKeyboardButton("👋 Finalizar Conversación", callback_data=FINALIZAR)]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    logger.info(f"Mostrando menú post-registro a usuario: {update.effective_user.first_name}")
    
    # Mensaje amigable
    post_reg_message = f"¡Felicidades {user_name}! Tu ticket está registrado.\n\n" \
                      f"¿Qué te gustaría hacer ahora?"
    
    # Enviar mensaje con el menú
    try:
        if update.message:
            update.message.reply_text(
                post_reg_message,
                reply_markup=reply_markup
            )
        elif update.callback_query:
            # Si viene de un callback, actualizar el mensaje anterior o enviar uno nuevo
            try:
                update.callback_query.edit_message_text(
                    post_reg_message,
                    reply_markup=reply_markup
                )
            except Exception as e:
                logger.error(f"Error al editar mensaje post-registro: {e}")
                context.bot.send_message(
                    chat_id=update.effective_chat.id,
                    text=post_reg_message,
                    reply_markup=reply_markup
                )
        else:
            # En caso de que no haya ni mensaje ni callback
            context.bot.send_message(
                chat_id=update.effective_chat.id,
                text=post_reg_message,
                reply_markup=reply_markup
            )
    except Exception as e:
        logger.error(f"Error al mostrar menú post-registro: {e}")
        try:
            context.bot.send_message(
                chat_id=update.effective_chat.id,
                text=post_reg_message,
                reply_markup=reply_markup
            )
        except Exception as e2:
            logger.error(f"Error secundario al mostrar menú post-registro: {e2}")
    
    return MENU_POST_REGISTRO

def main():
    """Función principal para iniciar el bot"""
    # Configurar logging más detallado
    logging.getLogger('telegram').setLevel(logging.INFO)
    logging.getLogger('telegram.ext').setLevel(logging.INFO)
    
    logger.info(f"Iniciando bot de Telegram con token: {TELEGRAM_TOKEN[:6]}...")
    
    # Crear el updater con un nivel de polling más agresivo
    updater = Updater(TELEGRAM_TOKEN)
    dispatcher = updater.dispatcher
    
    # Registrar manejadores con manejo de excepciones
    try:
        # Crear el manejador de conversación con más entry points
        conv_handler = ConversationHandler(
            entry_points=[
                CommandHandler('start', start),
                # Añadir un manejador para cualquier mensaje de texto como punto de entrada
                MessageHandler(Filters.text & ~Filters.command, mensaje_inicial)
            ],
            states={
                ESPERANDO_CEDULA: [
                    MessageHandler(Filters.text & ~Filters.command, mensaje_cedula)
                ],
                ESPERANDO_TELEFONO: [
                    MessageHandler(Filters.text & ~Filters.command, registrar_usuario)
                ],
                MENU_POST_REGISTRO: [
                    CallbackQueryHandler(button_callback),
                    # Manejar texto enviado mientras está en menú post-registro
                    MessageHandler(Filters.text & ~Filters.command, lambda update, context: mostrar_menu_post_registro(update, context))
                ],
                MENU_PRINCIPAL: [
                    CallbackQueryHandler(handle_menu_principal_callback),
                    # Manejar texto enviado mientras está en menú principal
                    MessageHandler(Filters.text & ~Filters.command, lambda update, context: mostrar_menu_principal(update, context))
                ]
            },
            fallbacks=[CommandHandler('cancel', cancel)],
            per_message=True,  # Importante para rastrear callbacks en cada mensaje
            name="conversacion_principal",
            # Hacer el manejador de conversación persistente
            allow_reentry=True
        )
        
        # Añadir el manejador al dispatcher
        dispatcher.add_handler(conv_handler)
        logger.info("Manejador de conversación registrado correctamente")
        
        # Manejador para comandos no reconocidos
        dispatcher.add_handler(MessageHandler(Filters.command & ~Filters.regex(r'^/start'), 
                              lambda update, context: mostrar_menu_principal(update, context)))
        
        # Ya no necesitamos este manejador ya que lo incluimos en entry_points
        # dispatcher.add_handler(MessageHandler(Filters.text & ~Filters.command, mensaje_inicial))
        logger.info("Manejadores adicionales registrados correctamente")
        
        # Añadir verificador de usuarios inactivos
        updater.job_queue.run_repeating(check_inactive_users, interval=15, first=15)
        logger.info("Verificador de inactividad programado")
        
        # Iniciar el bot con polling más agresivo para mayor responsividad
        logger.info("Iniciando polling...")
        updater.start_polling(poll_interval=0.5, timeout=30, drop_pending_updates=True)
        logger.info("Bot de Telegram iniciado correctamente")
        updater.idle()
        
    except Exception as e:
        logger.critical(f"Error crítico al iniciar el bot: {e}")
        # Intentar un reinicio limpio si es posible
        try:
            if updater:
                updater.stop()
        except:
            pass
        
        logger.info("Intentando reiniciar el bot después de error crítico...")

if __name__ == '__main__':
    main() 