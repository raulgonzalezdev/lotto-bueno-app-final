import re
from typing import Tuple, Optional

def is_valid_phone(phone: str) -> bool:
    """
    Verifica si un número de teléfono es válido para Venezuela
    
    Args:
        phone (str): Número de teléfono a validar
        
    Returns:
        bool: True si el formato es válido, False en caso contrario
    """
    if not phone:
        return False
        
    # Eliminar caracteres no numéricos
    digits_only = ''.join(filter(str.isdigit, phone))
    
    # Verificar longitud mínima
    if len(digits_only) < 10:
        return False
        
    # Verificar formatos válidos para Venezuela
    # 1. Con prefijo internacional +58 (58 + 10 dígitos)
    if digits_only.startswith('58') and len(digits_only) == 12:
        # Verificar código de operadora válido
        if digits_only[2:5] in ['412', '414', '416', '424', '426', '422']:
            return True
            
    # 2. Sin prefijo internacional pero con 0 al inicio (0 + 10 dígitos)
    elif digits_only.startswith('0') and len(digits_only) == 11:
        # Verificar código de operadora válido
        if digits_only[1:4] in ['412', '414', '416', '424', '426', '422']:
            return True
            
    # 3. Solo el número nacional (10 dígitos)
    elif len(digits_only) == 10:
        # Verificar código de operadora válido
        if digits_only[:3] in ['412', '414', '416', '424', '426', '422']:
            return True
    
    # Si no cumple ninguno de los formatos válidos
    return False

def extract_operator_info(phone: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Extrae información del operador a partir de un número de teléfono
    
    Args:
        phone (str): Número de teléfono
        
    Returns:
        Tuple[Optional[str], Optional[str]]: (código_operador, nombre_operador)
    """
    if not phone or not is_valid_phone(phone):
        return None, None
        
    # Eliminar caracteres no numéricos
    digits_only = ''.join(filter(str.isdigit, phone))
    
    # Obtener el código de operador según el formato
    operator_code = None
    
    if digits_only.startswith('58'):
        operator_code = digits_only[2:5]
    elif digits_only.startswith('0'):
        operator_code = digits_only[1:4]
    elif len(digits_only) == 10:
        operator_code = digits_only[:3]
        
    # Mapeo de códigos a nombres de operadores
    operators_map = {
        '414': 'Movistar', 
        '424': 'Movistar',
        '416': 'Movilnet', 
        '426': 'Movilnet',
        '412': 'Digitel', 
        '422': 'Digitel'
    }
    
    operator_name = operators_map.get(operator_code) if operator_code else None
    
    return operator_code, operator_name

def normalize_phone_number(phone: str) -> str:
    """
    Normaliza un número de teléfono al formato internacional
    
    Args:
        phone (str): Número de teléfono a normalizar
        
    Returns:
        str: Número normalizado en formato +58XXXXXXXXXX
    """
    if not phone:
        return ""
        
    # Eliminar todos los caracteres no numéricos
    digits_only = ''.join(filter(str.isdigit, phone))
    
    # Para números venezolanos, asegurar el formato internacional correcto
    if digits_only.startswith('0'):
        # Si comienza con 0, reemplazar por 58
        normalized = f"+58{digits_only[1:]}"
    elif digits_only.startswith('58'):
        # Si ya comienza con 58 (código de país), agregar +
        normalized = f"+{digits_only}"
    elif len(digits_only) == 10:
        # Asumir que es un número sin código de país
        normalized = f"+58{digits_only}"
    else:
        # Por defecto, agregar + al inicio
        normalized = f"+{digits_only}"
            
    return normalized 