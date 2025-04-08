#!/bin/bash

# Iniciar el servidor FastAPI
uvicorn app.main:app --host 0.0.0.0 --port 8000 &

# Esperar unos segundos para asegurarse de que FastAPI esté completamente iniciado
sleep 5

# Ejecutar el bot de WhatsApp
python app/bot.py
