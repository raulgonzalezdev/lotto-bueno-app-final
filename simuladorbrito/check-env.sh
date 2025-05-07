#!/bin/bash

# Verificar si .env existe en sass_front
if [ -f sass_front/.env ]; then
  echo "Copiando .env desde sass_front a la raíz..."
  cp sass_front/.env .env
  echo "Archivo .env copiado correctamente."
elif [ -f sass_front/.env.local ]; then
  echo "Copiando .env.local desde sass_front a la raíz como .env..."
  cp sass_front/.env.local .env
  echo "Archivo .env.local copiado correctamente como .env."
else
  # Si no existe en sass_front, buscar en la raíz
  if [ ! -f .env ]; then
    echo "ADVERTENCIA: No se encontró archivo .env en el proyecto."
    echo "Creando archivo .env de ejemplo..."
    
    # Crear un archivo .env básico
    cat > .env << EOL
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Sitio web
NEXT_PUBLIC_SITE_URL=https://spaininsideapp.nl
EOL
    echo "Archivo .env de ejemplo creado. Por favor, edítelo con sus credenciales antes de continuar."
    exit 1
  else
    echo "Archivo .env encontrado en la raíz del proyecto."
  fi
fi

# Corregir automáticamente variables sin el prefijo NEXT_PUBLIC_
echo "Verificando y corrigiendo variables de entorno..."

# Modificar el archivo .env para agregar las variables con prefijo NEXT_PUBLIC_
# Necesitamos crear un archivo temporal
touch .env.temp

# Primero copiamos todo el contenido original
cat .env > .env.temp

# Supabase URL
if ! grep -q "NEXT_PUBLIC_SUPABASE_URL" .env && grep -q "SUPABASE_URL" .env; then
  SUPABASE_URL=$(grep "SUPABASE_URL" .env | cut -d '=' -f2)
  echo "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL" >> .env.temp
  echo "Variable NEXT_PUBLIC_SUPABASE_URL añadida automáticamente."
fi

# Supabase Anon Key
if ! grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env && grep -q "SUPABASE_ANON_KEY" .env; then
  SUPABASE_ANON_KEY=$(grep "SUPABASE_ANON_KEY" .env | cut -d '=' -f2)
  echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" >> .env.temp
  echo "Variable NEXT_PUBLIC_SUPABASE_ANON_KEY añadida automáticamente."
fi

# Stripe Publishable Key
if ! grep -q "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" .env && grep -q "STRIPE_PUBLISHABLE_KEY" .env; then
  STRIPE_PUBLISHABLE_KEY=$(grep "STRIPE_PUBLISHABLE_KEY" .env | cut -d '=' -f2)
  echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY" >> .env.temp
  echo "Variable NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY añadida automáticamente."
fi

# Verificar STRIPE_WEBHOOK_SECRET vacío
if grep -q "STRIPE_WEBHOOK_SECRET=$" .env; then
  echo "ADVERTENCIA: STRIPE_WEBHOOK_SECRET está vacío."
  echo "Generando un valor de prueba para desarrollo..."
  WEBHOOK_SECRET="whsec_123456789012345678901234"
  echo "STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET" >> .env.temp
  echo "Valor de prueba generado para STRIPE_WEBHOOK_SECRET."
fi

# Añadir NEXT_PUBLIC_SITE_URL si no existe
if ! grep -q "NEXT_PUBLIC_SITE_URL" .env; then
  echo "NEXT_PUBLIC_SITE_URL=https://spaininsideapp.nl" >> .env.temp
  echo "Variable NEXT_PUBLIC_SITE_URL añadida automáticamente."
fi

# Reemplazar el archivo original
mv .env.temp .env

echo "Verificación de archivo .env completada con éxito."
exit 0 