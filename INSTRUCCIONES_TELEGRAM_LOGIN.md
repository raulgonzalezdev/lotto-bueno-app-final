# Configuración del Widget de Login de Telegram

Este documento explica los pasos para configurar el widget de login de Telegram en tu aplicación Lotto Bueno.

## 1. Configurar tu bot en BotFather

1. Abre Telegram y busca [@BotFather](https://t.me/BotFather)
2. Envía el comando `/setdomain` a BotFather
3. Selecciona tu bot `@Applottobueno_bot`
4. Envía el dominio de tu sitio web (sin https://): `applottobueno.com`
5. BotFather confirmará que el dominio ha sido vinculado a tu bot

## 2. Verificar las variables de entorno

Asegúrate de que las siguientes variables estén configuradas:

### En el servidor (`.env`):
```
API_TELEGRAM_TOKEN=tu_token_del_bot
TELEGRAM_BOT_USERNAME=Applottobueno_bot
```

### En el frontend (`.env.local`):
```
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=Applottobueno_bot
```

## 3. Aplicar la migración de la base de datos

Ejecuta el siguiente comando para aplicar la migración que añade el campo `telegram_id` a la tabla `users`:

```
alembic upgrade head
```

## 4. Reiniciar los servicios

```
docker-compose down
docker-compose up -d
```

## 5. Probar la funcionalidad

1. Accede a la página de registro (`RegisterWindow`)
2. Deberías ver el botón "Login with Telegram" debajo de las opciones de registro
3. Al hacer clic, se abrirá una ventana de autorización de Telegram
4. Después de autorizar, serás redirigido y autenticado automáticamente

## 6. Solución de problemas

Si el widget no aparece o no funciona correctamente:

1. Verifica que el bot esté activo y configurado correctamente
2. Comprueba que el dominio esté correctamente vinculado en BotFather
3. Asegúrate de que las variables de entorno estén bien configuradas
4. Revisa la consola del navegador para ver si hay errores
5. Verifica los logs del servidor para detectar posibles problemas en la API

## 7. Personalización adicional

Puedes personalizar el widget modificando los siguientes atributos en `RegisterWindow.tsx`:

- `data-size`: El tamaño del botón (small, medium, large)
- `data-radius`: Radio de las esquinas del botón
- `data-auth-url`: URL alternativa para redirección (en lugar de usar la callback)
- `data-request-access`: Nivel de acceso solicitado (write o read)

---

Para más información, consulta la [documentación oficial del Login Widget de Telegram](https://core.telegram.org/widgets/login). 