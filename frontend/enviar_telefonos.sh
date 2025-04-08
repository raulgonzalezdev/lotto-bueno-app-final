#!/bin/bash
for id in {4..103}
do
  curl -X DELETE http://34.134.166.180:8000/lineas_telefonicas/$id
  echo "Eliminado ID: $id"
done
