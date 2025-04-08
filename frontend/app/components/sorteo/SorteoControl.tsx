"use client";
import React, { useState, useEffect } from "react";
import Toast from '../toast/Toast';
import { useEstados } from "../../hooks/useEstados";
import { useMunicipios } from "../../hooks/useMunicipios";
import { useRealizarSorteo, useQuitarGanadores } from "../../hooks/useSorteoMutations";
import { detectHost } from "../../api";

interface Ticket {
  id: number;
  numero_ticket: string;
  cedula: string;
  nombre: string;
  telefono: string;
  estado: string;
  municipio: string;
  parroquia: string;
  referido_id: number | null;
  validado: boolean;
  ganador: boolean;
}

const SorteoControl: React.FC = () => {
  const [ganadores, setGanadores] = useState<Ticket[]>([]);
  const [cantidadGanadores, setCantidadGanadores] = useState(1);
  const [estadoSelected, setEstadoSelected] = useState("");
  const [municipioSelected, setMunicipioSelected] = useState("");
  const [estadoDescripcion, setEstadoDescripcion] = useState("");
  const [municipioDescripcion, setMunicipioDescripcion] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [APIHost, setAPIHost] = useState<string | null>(null);

  // Usar hooks de React Query
  const { data: estados = [], isLoading: estadosLoading } = useEstados();
  const { data: municipios = [], isLoading: municipiosLoading } = useMunicipios(estadoSelected);
  
  // Mutaciones para el sorteo
  const realizarSorteoMutation = useRealizarSorteo();
  const quitarGanadoresMutation = useQuitarGanadores();

  useEffect(() => {
    // Usar directamente detectHost en lugar de la función fetchHost
    const initHost = async () => {
      try {
        const host = await detectHost();
        setAPIHost(host);
      } catch (error) {
        console.error("Error detecting host:", error);
        setAPIHost(process.env.NEXT_PUBLIC_API_URL || 'https://applottobueno.com');
      }
    };
    
    initHost();
  }, []);

  useEffect(() => {
    if (municipioSelected === "") {
      setMunicipioDescripcion("");
    }
  }, [municipioSelected]);

  const handleSorteo = async () => {
    try {
      const estadoDesc = estados.find(e => e.codigo_estado.toString() === estadoSelected.toString())?.estado || "";
      const municipioDesc = municipios.find(m => m.codigo_municipio.toString() === municipioSelected.toString())?.municipio || "";

      // Usar la mutación de realizar sorteo
      const payload = {
        cantidad_ganadores: cantidadGanadores,
        estado: estadoSelected !== "" && estadoSelected !== "Seleccionar Estado" ? estadoDesc : "",
        municipio: municipioSelected !== "" && municipioSelected !== "Seleccionar Municipio" ? municipioDesc : ""
      };

      const result = await realizarSorteoMutation.mutateAsync(payload);
      
      setGanadores(Array.isArray(result) ? result : []);
      setToastMessage("Sorteo realizado exitosamente");
      setToastType("success");
    } catch (error) {
      console.error("Error realizando el sorteo:", error);
      setGanadores([]);
      setToastMessage("Error realizando el sorteo. Por favor, intenta de nuevo.");
      setToastType("error");
    }
  };

  const handleQuitarGanadores = async () => {
    try {
      // Usar la mutación de quitar ganadores
      await quitarGanadoresMutation.mutateAsync();
      
      setGanadores([]);
      setToastMessage("Marca de ganadores eliminada exitosamente");
      setToastType("success");
    } catch (error) {
      console.error("Error quitando la marca de ganadores:", error);
      setToastMessage("Error quitando la marca de ganadores. Por favor, intenta de nuevo.");
      setToastType("error");
    }
  };

  return (
    <div className="p-4">
      <h2>Control de Sorteo de Ganadores</h2>
      <div className="mb-4">
        <label className="block mb-2">Cantidad de Ganadores</label>
        <input
          type="number"
          value={cantidadGanadores}
          onChange={(e) => setCantidadGanadores(parseInt(e.target.value))}
          className="input input-bordered w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Estado</label>
        <select
          value={estadoSelected}
          onChange={(e) => {
            setEstadoSelected(e.target.value);
            setMunicipioSelected("");
            const selectedEstado = estados.find(est => est.codigo_estado === e.target.value);
            setEstadoDescripcion(selectedEstado ? selectedEstado.estado : "");
          }}
          className="input input-bordered w-full"
          disabled={estadosLoading}
        >
          <option value="">Seleccionar Estado</option>
          {!estadosLoading && estados.length > 0 ? (
            estados.map((estado) => (
              <option key={estado.codigo_estado} value={estado.codigo_estado}>{estado.estado}</option>
            ))
          ) : (
            <option value="" disabled>Cargando estados...</option>
          )}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-2">Municipio</label>
        <select
          value={municipioSelected}
          onChange={(e) => {
            setMunicipioSelected(e.target.value);
            const selectedMunicipio = municipios.find(mun => mun.codigo_municipio === e.target.value);
            setMunicipioDescripcion(selectedMunicipio ? selectedMunicipio.municipio : "");
          }}
          className="input input-bordered w-full"
          disabled={municipiosLoading || !estadoSelected}
        >
          <option value="">Seleccionar Municipio</option>
          {!municipiosLoading && municipios.length > 0 ? (
            municipios.map((municipio) => (
              <option key={municipio.codigo_municipio} value={municipio.codigo_municipio}>{municipio.municipio}</option>
            ))
          ) : (
            <option value="" disabled>
              {estadoSelected ? "Cargando municipios..." : "Seleccione primero un estado"}
            </option>
          )}
        </select>
      </div>
      <button 
        onClick={handleSorteo} 
        className="btn btn-primary mr-2"
        disabled={realizarSorteoMutation.isPending}
      >
        {realizarSorteoMutation.isPending ? "Realizando sorteo..." : "Realizar Sorteo"}
      </button>
      <button 
        onClick={handleQuitarGanadores} 
        className="btn btn-danger"
        disabled={quitarGanadoresMutation.isPending}
      >
        {quitarGanadoresMutation.isPending ? "Procesando..." : "Quitar Marca de Ganadores"}
      </button>
      {toastMessage && (
        <Toast 
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
      <h3 className="mt-4">Ganadores del Sorteo</h3>
      <table className="table-auto w-full mb-4">
        <thead>
          <tr>
            <th>ID</th>
            <th>Número Ticket</th>
            <th>Cédula</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th>Municipio</th>
          </tr>
        </thead>
        <tbody>
          {ganadores.length > 0 ? (
            ganadores.map((ganador) => (
              <tr key={ganador.id}>
                <td>{ganador.id}</td>
                <td>{ganador.numero_ticket}</td>
                <td>{ganador.cedula}</td>
                <td>{ganador.nombre}</td>
                <td>{ganador.telefono}</td>
                <td>{ganador.estado}</td>
                <td>{ganador.municipio}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center">No hay ganadores disponibles</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SorteoControl;
