import { useEffect } from "react";
import { ADMIN_MODULE_LABELS } from "./adminModules";
import Reports from "../modulos/Reports";
import Sugerencias from "../modulos/Sugerencias";
import Historial from "../modulos/Historial";
import Mensajes from "../modulos/Mensajes";
import Solicitudes from "../modulos/Solicitudes";
import Permisos from "../modulos/Permisos";
import Creacion from "../modulos/Creacion";
import Eliminacion from "../modulos/Eliminacion";
import Edicion from "../modulos/Edicion";
//import Exploracion from "../modulos/Exploracion";
import Atendido from "../modulos/Atendido";
import Estadistica from "../modulos/Estadistica";
import Guardado from "../modulos/Guardado";
import Nuevos from "../modulos/Nuevos";
import Redirigidos from "../modulos/Redirigidos";
import Anadir from "../modulos/Anadir";
import Suspension from "../modulos/Suspension";
import Backups from "../modulos/Backups";
import Mensaje from "../modulos/Mensaje";
import Definicion from "../modulos/Definicion";
import "../../../styles/components/admin/Adminfeed.css";
import "../../../styles/components/admin/Adminreports.css";

const MODULE_COMPONENTS = {
  reportes: Reports,
  sugerencias: Sugerencias,
  historial: Historial,
  mensajes: Mensajes,
  solicitudes: Solicitudes,
  permisos: Permisos,
  creacion: Creacion,
  eliminacion: Eliminacion,
  edicion: Edicion,
  //exploracion: Exploracion,
  atendido: Atendido,
  estadistica: Estadistica,
  guardado: Guardado,
  nuevos: Nuevos,
  redirigidos: Redirigidos,
  anadir: Anadir,
  suspension: Suspension,
  backups: Backups,
  mensaje: Mensaje,
  definicion: Definicion,
};

export default function AdminFeed({ activePage }) {
  const ActiveModule = MODULE_COMPONENTS[activePage] ?? Reports;

  useEffect(() => {
    const moduleName = ADMIN_MODULE_LABELS[activePage] ?? "Reportes";
    console.log(`Modulo ${moduleName} seleccionado`);
  }, [activePage]);

  return (
    <main className="admin-feed">
      <ActiveModule />
    </main>
  );
}
