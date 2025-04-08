import os
import csv

def split_csv_file(input_file, output_dir, lines_per_file):
    # Crear el directorio de salida si no existe
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    with open(input_file, 'r', encoding='windows-1252') as file:
        reader = csv.reader(file)
        header = next(reader)  # Leer la cabecera
        file_number = 1
        lines_written = 0

        output_file = open(os.path.join(output_dir, f'part_{file_number}.csv'), 'w', newline='', encoding='utf-8')
        writer = csv.writer(output_file)
        writer.writerow(header)  # Escribir la cabecera en el archivo de salida

        for row in reader:
            if lines_written >= lines_per_file:
                output_file.close()
                file_number += 1
                lines_written = 0
                output_file = open(os.path.join(output_dir, f'part_{file_number}.csv'), 'w', newline='', encoding='utf-8')
                writer = csv.writer(output_file)
                writer.writerow(header)  # Escribir la cabecera en el nuevo archivo

            writer.writerow(row)
            lines_written += 1

        output_file.close()

# Configuración
input_file_path ='/app/app/data/re20240416_pp.txt'
output_directory = '/app/app/data/split_files'
lines_per_file = 100000  # Ajusta el número de líneas por archivo según tus necesidades

# Dividir el archivo
split_csv_file(input_file_path, output_directory, lines_per_file)
