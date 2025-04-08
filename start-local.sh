#!/bin/bash

# Define variables
DB_USER="lottobueno"
DB_PASSWORD="lottobueno"
DB_NAME="lottobueno"
DB_HOST="172.17.0.3"
DB_PORT="5432"

# Check if PostgreSQL is running
if pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; then
    echo "PostgreSQL is running and ready to accept connections."
else
    echo "PostgreSQL is not running or not accepting connections."
    exit 1
fi

# Activate virtual environment
source env/bin/activate

# Install dependencies
#pip install -r requirements.txt

# Set environment variables
export DATABASE_URL=postgresql+psycopg://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME

# Start the application