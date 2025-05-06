import os
import urllib.request
import shutil
from pathlib import Path

# URL base
BASE_URL = "https://yosigoconmorel.com/simulador/img"

# Ruta base del proyecto
BASE_DIR = r"D:\lotto-bueno-clean\simuladorbrito\public"

# Lista de imágenes a descargar
IMAGENES_PARTIDOS = [
    "logo_morel.png",
    "logo_cne.png",
    "union_cambio.png",
    "mra.png",
    "conde.png",
    "fuerza_vecinal.png",
    "un_nuevo_tiempo.png",
    "ecologico.png",
    "avanzada.png",
    "arepa_digital.png",
    "min_unidad.png",
    "bandera_roja.png",
    "primero_justicia.png",
    "lapiz.png",
    "une.png",
    "soluciones.png",
    "copei.png",
    "mr.png",
    "primero_venezuela.png",
    "ad.png",
    "unidad_venezuela.png",
    "el_cambio.png",
    "cambiemos.png",
    "venezuela_unidad.png",
    "voluntad_popular.png"
]

# Mapeo de nombres originales a nombres requeridos
MAPEO_NOMBRES = {
    "copei.png": "copei.png",  # Este ya coincide
    "psuv.png": "psuv.png",  # Este nombre podría no existir
    "mr.png": "ppt.png",  # Asumiendo que este es el Partido Patria Para Todos
    "primero_justicia.png": "tupamaro.png",  # Asignación temporal
    "union_cambio.png": "futuro.png",  # Asignación temporal
    "arepa_digital.png": "somos.png",  # Asignación temporal
    "min_unidad.png": "mep.png",  # Asignación temporal
    "fuerza_vecinal.png": "podemos.png",  # Asignación temporal
    "bandera_roja.png": "pcv.png",  # Asignación temporal
    "un_nuevo_tiempo.png": "alianza.png",  # Asignación temporal
    "soluciones.png": "upv.png",  # Asignación temporal
    "ecologico.png": "enamorate.png",  # Asignación temporal
    "avanzada.png": "ora.png",  # Asignación temporal
    "lapiz.png": "verde.png",  # Asignación temporal
    "unidad_venezuela.png": "udp.png",  # Asignación temporal
}

# Posibles nombres para la imagen del candidato y tarjetón
POSIBLES_CANDIDATOS = ["brito.jpg", "brito.png", "candidato.jpg", "candidato.png", "morel.jpg", "morel.png"]
POSIBLES_TARJETONES = ["tarjeton-electoral.png", "tarjeton.png", "tarjeton_electoral.png", "tarjeton-completo.png", "papeleta.png"]

def crear_directorios():
    """Crear directorios necesarios si no existen."""
    Path(os.path.join(BASE_DIR, "partidos")).mkdir(parents=True, exist_ok=True)
    Path(os.path.join(BASE_DIR, "candidatos")).mkdir(parents=True, exist_ok=True)

def descargar_imagen(url, destino):
    """Descargar una imagen desde la URL al destino especificado."""
    try:
        print(f"Descargando {url}...")
        with urllib.request.urlopen(url) as response, open(destino, 'wb') as out_file:
            shutil.copyfileobj(response, out_file)
        print(f"✓ Descargada: {os.path.basename(destino)}")
        return True
    except Exception as e:
        print(f"✗ Error al descargar {url}: {str(e)}")
        return False

def descargar_partidos():
    """Descargar las imágenes de los partidos políticos."""
    partidos_dir = os.path.join(BASE_DIR, "partidos")
    
    # Descargar todas las imágenes primero con sus nombres originales
    for imagen in IMAGENES_PARTIDOS:
        url = f"{BASE_URL}/{imagen}"
        destino = os.path.join(partidos_dir, imagen)
        descargar_imagen(url, destino)
    
    # Renombrar/copiar archivos según el mapeo
    for original, nuevo in MAPEO_NOMBRES.items():
        ruta_original = os.path.join(partidos_dir, original)
        ruta_nueva = os.path.join(partidos_dir, nuevo)
        
        if os.path.exists(ruta_original):
            if original != nuevo:
                try:
                    shutil.copy2(ruta_original, ruta_nueva)
                    print(f"✓ Copiado {original} como {nuevo}")
                except Exception as e:
                    print(f"✗ Error al copiar {original} a {nuevo}: {str(e)}")
        else:
            print(f"✗ No se encontró el archivo {original}")

def descargar_candidato():
    """Intentar descargar la imagen del candidato."""
    candidatos_dir = os.path.join(BASE_DIR, "candidatos")
    destino_final = os.path.join(candidatos_dir, "brito.jpg")
    
    for candidato in POSIBLES_CANDIDATOS:
        url = f"{BASE_URL}/{candidato}"
        if descargar_imagen(url, destino_final):
            return True
    
    print("⚠️ No se pudo encontrar la imagen del candidato. Deberás agregarla manualmente.")
    return False

def descargar_tarjeton():
    """Intentar descargar el tarjetón electoral."""
    destino_final = os.path.join(BASE_DIR, "tarjeton-electoral.png")
    
    for tarjeton in POSIBLES_TARJETONES:
        url = f"{BASE_URL}/{tarjeton}"
        if descargar_imagen(url, destino_final):
            return True
    
    print("⚠️ No se pudo encontrar el tarjetón electoral. Deberás agregarlo manualmente.")
    return False

def main():
    """Función principal."""
    print("=== DESCARGANDO IMÁGENES PARA EL SIMULADOR ELECTORAL ===\n")
    
    # Crear directorios necesarios
    crear_directorios()
    
    # Descargar imágenes de partidos
    print("\n=== DESCARGANDO LOGOS DE PARTIDOS ===")
    descargar_partidos()
    
    # Descargar imagen del candidato
    print("\n=== DESCARGANDO IMAGEN DEL CANDIDATO ===")
    descargar_candidato()
    
    # Descargar tarjetón electoral
    print("\n=== DESCARGANDO TARJETÓN ELECTORAL ===")
    descargar_tarjeton()
    
    print("\n=== PROCESO COMPLETADO ===")
    print(f"Verifica las imágenes en los siguientes directorios:")
    print(f"- Partidos: {os.path.join(BASE_DIR, 'partidos')}")
    print(f"- Candidato: {os.path.join(BASE_DIR, 'candidatos')}")
    print(f"- Tarjetón: {BASE_DIR}")

if __name__ == "__main__":
    main() 