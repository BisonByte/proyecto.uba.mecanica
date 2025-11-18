# Panel IoT para sistema de bombeo

Panel web construido con Laravel 12, Vite y Tailwind que permite operar una bomba de fluidos en modo demo mientras se prepara la integración con hardware ESP32. El repositorio incluye autenticación de demostración, dashboard en vivo, API para el dispositivo y cálculos hidráulicos automáticos.

## Lo esencial

- Dashboard profesional con estado ON/OFF y métricas que se actualizan en tiempo real (`resources/views/dashboard.blade.php`).
- API REST lista para recibir registros, comandos y telemetría del ESP32 (`routes/api.php`).
- Centro de configuración donde se editan las credenciales de la demo, la red WiFi del módulo y los endpoints de sincronización (`resources/views/settings/edit.blade.php`).
- Documentación interactiva dentro del panel en `/documentation` con guía paso a paso para el personal de planta (`resources/views/documentation.blade.php`).

## Requisitos

- PHP 8.2 o superior con extensiones típicas de Laravel (OpenSSL, PDO, Mbstring, JSON, etc.).
- Composer.
- Node.js 20+ con npm para compilar los assets.
- SQLite o MySQL para las migraciones. En demo basta con SQLite (configuración por defecto).

## Puesta en marcha en 5 pasos

```bash
# 1. Instalar dependencias PHP
composer install

# 2. Preparar variables de entorno
cp .env.example .env  # si aún no existe .env
php artisan key:generate

# 3. Ejecutar migraciones de la demo
php artisan migrate --seed

# 4. Instalar dependencias front-end
npm install

# 5. Levantar ambos procesos en paralelo
npm run dev      # compila assets con Vite
php artisan serve  # expone http://localhost:8000
```

Accede a `http://localhost:8000`, inicia sesión con las credenciales de demostración (por defecto `demo / demo`) y recorre el dashboard. Puedes modificar las credenciales desde **Configuración → Demo**; se guardan en `storage/app/settings.json` mediante `App\Services\SettingsRepository`.

### Scripts útiles

| Acción | Comando |
| --- | --- |
| Compilar assets en producción | `npm run build` |
| Ejecutar tests de Laravel | `php artisan test` |
| Limpiar cache de configuración | `php artisan config:clear` |
| Simular telemetría de laboratorio | `php artisan pump:simulate` (opcional si existe el comando en tu entorno) |

## Variables de entorno relevantes

El archivo `.env` incluye los toggles que alimentan la configuración del panel y del ESP32. Los principales parámetros están definidos en `config/device.php` y se combinan con lo que se guarde vía interfaz en `storage/app/settings.json`.

```env
DEMO_USERNAME=demo
DEMO_PASSWORD=demo
ESP32_ENABLED=false
ESP32_DEVICE_ID=BB-ESP32-01
ESP32_FIRMWARE_VERSION=1.0.0
ESP32_ACTIVATION_MODE=http
ESP32_HTTP_ENDPOINT=https://api.example.com/esp32/activate
ESP32_MQTT_TOPIC=iot/bisonbyte/pump/control
ESP32_ACTIVATION_KEY=CLAVE-DEMO-1234
ESP32_HTTP_STATE_ENDPOINT=
ESP32_HTTP_SET_ENDPOINT=
ESP32_HTTP_TELEMETRY_ENDPOINT=
ESP32_HTTP_POLL_SECONDS=2
```

Activa `ESP32_ENABLED=true` cuando quieras que la interfaz muestre el hardware como disponible. Si necesitas URLs personalizadas para el firmware, define los endpoints `ESP32_HTTP_*` y se reflejarán en la respuesta del registro (`App\Http\Controllers\Api\DeviceRegistrationController`).

## Integración express con ESP32

1. **Prepara el backend.**
   - Marca `ESP32_ENABLED=true` en `.env` y ejecuta `php artisan config:clear`.
   - Verifica desde `/settings` que el estado del dispositivo cambió a "Listo para conectar".
   - Anota el `device_id` que aparecerá tras el registro automático.

2. **Registra el módulo desde el firmware.**
   - Envía un `POST /api/devices/register` con al menos la MAC y un nombre amigable. La respuesta incluye el `device_id`, un token efímero y los endpoints que debe usar el ESP32.

     ```http
     POST /api/devices/register HTTP/1.1
     Content-Type: application/json

     {
       "mac": "AA:BB:CC:DD:EE:FF",
       "name": "Bomba principal",
       "connection_type": "http"
     }
     ```

3. **Consulta el estado de la bomba.**
   - Con cada polling envía el token en el encabezado `Authorization: Bearer {token}` y el `device_id` como query o JSON.

     ```http
     GET /api/pump/state?device_id=1 HTTP/1.1
     Authorization: Bearer {token}
     ```

     La respuesta incluye `should_run` y `command` para encender o apagar el relé (`App\Http\Controllers\Api\PumpStateController`).

4. **Reporta telemetría mínima.**
   - Publica lecturas con `POST /api/telemetry`. Solo necesitas enviar `device_id`, el token y las variables disponibles; el backend calcula hidráulica en `App\Jobs\ProcessTelemetry` y devuelve el estado actual.

    ```http
     POST /api/telemetry HTTP/1.1
     Authorization: Bearer {token}
     Content-Type: application/json

     {
       "device_id": 1,
       "telemetry": {
         "voltage": 220.4,
         "current": 3.6,
         "is_on": true
       }
     }
     ```

5. **Sin firmware listo todavía?** Usa la sección "Simulación" del dashboard para alternar la bomba y observar cómo cambia la respuesta del backend. También puedes emular el flujo con `curl` desde tu terminal.

Si prefieres MQTT, ajusta `ESP32_ACTIVATION_MODE=mqtt` y define el tópico en `ESP32_MQTT_TOPIC`. Aun así, el panel seguirá publicando las rutas REST para compatibilidad.

### Flasheo directo del firmware HTTP

Cuando edites los parámetros del dispositivo en `.env`, el flujo de compilación genera automáticamente la configuración por defecto del firmware:

1. **Edita `.env`** con las claves `ESP32_WIFI_*`, `ESP32_DEVICE_ID`, `ESP32_ACTIVATION_KEY` y los endpoints `ESP32_HTTP_*` que correspondan a tu panel.
2. Al ejecutar `pio run -t upload` (o cualquier tarea que invoque PlatformIO), el script `esp32-ap-web-main/pre_build_env.py` leerá esas variables y creará `esp32-ap-web-main/include/DefaultBackendConfig.h` con los `#define` necesarios.
3. `src/main.cpp` incluye ese header y usa los valores resultantes como credenciales iniciales, por lo que el firmware queda flasheado apuntando al backend correcto desde el primer arranque.

El archivo generado se sobreescribe en cada build, así que basta con actualizar `.env` para propagar nuevos endpoints o tokens antes de volver a flashear el ESP32.

## Estructura principal

```
app/
├─ Http/
│  ├─ Controllers/Api/… → endpoints para registro, estado y telemetría del ESP32
│  └─ Middleware/… → validación de tokens demo y de dispositivos
├─ Jobs/ProcessTelemetry.php → calcula métricas hidráulicas y guarda el historial
├─ Services/SettingsRepository.php → gestiona storage/app/settings.json
resources/
├─ views/dashboard.blade.php → interfaz principal
├─ views/settings/edit.blade.php → formulario de configuración del ESP32
└─ js/dashboard.js → lógica del frontend (SSE, charts, simulación)
```

### Entradas de Vite para el diseñador hidráulico

- `resources/ts/main.tsx` es el entrypoint único del editor React que se monta con `@vite('resources/ts/main.tsx')`.
- `resources/ts/pages/hydraulic-designer/` agrupa las vistas conectadas al router público del diseñador.
- `resources/views/hydraulic-designer-root.blade.php` y `resources/views/system-editor.blade.php` cargan el mismo bundle porque ambas renderizan el contenedor `system-editor-root`.

Con esta guía puedes conectar el hardware sin perderte en configuraciones avanzadas. Cuando el ESP32 quede sincronizado, la simulación del dashboard se desactiva automáticamente en favor de las lecturas reales.
