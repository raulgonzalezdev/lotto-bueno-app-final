# Guía de Pruebas de Carga y Monitoreo

Esta guía explica cómo ejecutar pruebas de carga en la API backend y cómo monitorear el rendimiento del sistema utilizando el stack incluido (k6, Prometheus, Grafana).

## Prerrequisitos

*   **Docker:** Asegúrate de tener Docker instalado y corriendo. [Instrucciones de instalación](https://docs.docker.com/engine/install/)
*   **Docker Compose:** Necesitas Docker Compose (generalmente incluido con Docker Desktop, o instálalo por separado). [Instrucciones de instalación](https://docs.docker.com/compose/install/)
*   **Archivos del Proyecto:** Debes tener clonado el repositorio del proyecto.

## 1. Construir e Iniciar el Entorno Completo

Este comando construirá las imágenes (si es necesario) e iniciará todos los servicios definidos en `docker-compose.yml`, incluyendo la base de datos, Redis, la API (`app`), los bots, el frontend, Nginx, las herramientas de monitoreo (`prometheus`, `grafana`, `node-exporter`, `cadvisor`) y la herramienta de pruebas de carga (`k6`).

```bash
# Desde la raíz del proyecto
docker-compose up -d --build
```

Espera a que todos los contenedores estén iniciados y saludables. Puedes verificar el estado con:

```bash
docker-compose ps
```

## 2. Ejecutar la Prueba de Carga con k6

El servicio `k6` ya está corriendo, pero está inactivo (`sleep infinity`). Para ejecutar la prueba definida en `load_test.js`, usa el comando `exec`:

```bash
# Desde la raíz del proyecto
docker-compose exec k6 k6 run /scripts/load_test.js
```

**¿Qué hace este comando?**

1.  `docker-compose exec k6`: Ejecuta un comando dentro del contenedor `k6` que ya está corriendo.
2.  `k6 run /scripts/load_test.js`: Le dice a k6 que ejecute la prueba definida en el archivo `/scripts/load_test.js` (que fue montado desde tu archivo local `load_test.js`).

**Salida de k6:**

k6 mostrará el progreso en tiempo real y, al finalizar, imprimirá un resumen detallado con métricas como:

*   `vus`: Número de usuarios virtuales.
*   `iterations`: Número total de ejecuciones del script.
*   `http_reqs`: Número total de peticiones HTTP realizadas.
*   `http_req_duration`: Tiempos de respuesta (promedio, p90, p95, min, max).
*   `http_req_failed`: Porcentaje de peticiones fallidas.
*   `checks`: Resultado de las verificaciones definidas en el script (pasadas/fallidas).

Presta atención a la tasa de errores (`http_req_failed`) y a las latencias (`http_req_duration`), especialmente p95 (percentil 95). Compara estos valores con los `thresholds` definidos en `load_test.js`.

## 3. Acceder a las Herramientas de Monitoreo (Mientras se ejecuta la prueba o después)

Puedes acceder a las interfaces web de las herramientas de monitoreo usando la IP de tu VM donde corre Docker (o `localhost` si corre localmente) y los puertos definidos en `docker-compose.yml`:

*   **Prometheus:** `http://34.134.166.180:9090`
    *   Aquí puedes ver los *targets* (servicios que está monitoreando: node-exporter, cadvisor, prometheus mismo) y ejecutar consultas PromQL.
*   **Grafana:** `http://34.134.166.180:3001`
    *   Credenciales por defecto: Usuario `admin`, Contraseña `admin` (puedes cambiarlas).
    *   Aquí visualizarás las métricas en dashboards gráficos.
*   **cAdvisor:** `http://34.134.166.180:8082`
    *   Ofrece una vista detallada y en tiempo real del consumo de recursos (CPU, memoria, red, disco) de cada contenedor Docker.

## 4. Configurar Grafana (Primera vez)

Al acceder a Grafana por primera vez (`http://34.134.166.180:3001`), necesitarás configurar Prometheus como fuente de datos y luego importar dashboards.

**a) Añadir Fuente de Datos Prometheus:**

1.  Inicia sesión (admin/admin).
2.  En el menú lateral izquierdo, ve a **Configuration** (icono de engranaje) -> **Data Sources**.
3.  Haz clic en **Add data source**.
4.  Selecciona **Prometheus**.
5.  En el campo **URL**, ingresa `http://prometheus:9090` (Grafana puede resolver el nombre del servicio `prometheus` porque están en la misma red Docker).
6.  Deja las demás configuraciones por defecto.
7.  Haz clic en **Save & test**. Deberías ver un mensaje de éxito ("Data source is working").

**b) Importar Dashboards:**

Grafana tiene una gran comunidad que comparte dashboards preconfigurados. Puedes importarlos fácilmente usando sus IDs.

1.  En el menú lateral izquierdo, ve a **Dashboards** (icono de cuatro cuadrados) -> **Browse**.
2.  Haz clic en **Import** (en la esquina superior derecha).
3.  Puedes importar usando un ID de Grafana.com. Aquí hay algunos recomendados:
    *   **Node Exporter Full (ID: `1860`):** Dashboard muy completo para métricas del servidor/VM (CPU, RAM, disco, red) recolectadas por `node-exporter`.
    *   **Docker Monitoring (Recomendado: busca uno actualizado para cAdvisor):** Busca dashboards populares para "Docker cAdvisor" o "Docker Monitoring" en [Grafana Dashboards](https://grafana.com/grafana/dashboards/). Un ID popular solía ser `179`, pero puede haber mejores opciones más recientes. Busca uno que use métricas de `cadvisor`.
    *   **Ejemplo de búsqueda:** Ve a Grafana.com -> Dashboards, busca "cadvisor". Uno popular podría ser "cAdvisor Exporter" (ID: `13981`) u otros.
4.  Ingresa el ID del dashboard que quieres importar en el campo "Import via grafana.com".
5.  Haz clic en **Load**.
6.  En la siguiente pantalla, asegúrate de seleccionar tu fuente de datos **Prometheus** en el desplegable.
7.  Haz clic en **Import**.

Repite el paso 3-7 para cada dashboard que quieras añadir.

## 5. Analizar el Rendimiento

*   **Mientras k6 corre:** Observa los dashboards de Grafana (Node Exporter, cAdvisor/Docker) en tiempo real. Busca picos inusuales de CPU, RAM, red o disco en los contenedores `app` y `postgres`.
*   **Resultados de k6:** Analiza la salida final de k6. ¿Se cumplieron los `thresholds`? ¿Hubo muchos errores (`http_req_failed`)? ¿Son aceptables las latencias (`http_req_duration`)?
*   **Logs:** Revisa los logs de los contenedores si ves errores o comportamientos extraños:
    ```bash
    docker-compose logs app
    docker-compose logs postgres
    # etc.
    ```

## 6. Detener el Entorno

Cuando hayas terminado con las pruebas y el monitoreo, puedes detener y eliminar los contenedores:

```bash
# Desde la raíz del proyecto
docker-compose down
```

Si quieres eliminar también los volúmenes (¡CUIDADO! Esto borrará los datos de PostgreSQL, Redis y Grafana):

```bash
docker-compose down -v
``` 