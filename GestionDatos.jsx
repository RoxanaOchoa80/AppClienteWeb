import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, obtenerUsuarioActual } from "../services/authService";
import "../assets/css/style.css";

const logo = "/img/logo.png";

function GestionDatos() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [formato, setFormato] = useState("json");

  useEffect(() => {
    const usuarioActual = obtenerUsuarioActual();
    if (usuarioActual) {
      setUsuario(usuarioActual);
    }
  }, []);
  const [preview, setPreview] = useState("");
  const [mostrarPreview, setMostrarPreview] = useState(false);

  const [exportar, setExportar] = useState({
    empleados: true,
    departamentos: true,
    solicitudes: true,
    evaluaciones: true,
  });

  const cerrarSesion = () => {
    logout();
    alert("Sesión cerrada");
    navigate("/");
  };

  const seleccionarFormato = (tipo) => {
    setFormato(tipo);
  };

  const handleCheckbox = (e) => {
    setExportar({
      ...exportar,
      [e.target.name]: e.target.checked,
    });
  };

  const generarVistaPrevia = () => {
    const datos = {
      formato,
      exportar,
      mensaje: "Aquí se mostrarán los datos reales del sistema",
    };

    let contenido = "";

    if (formato === "json") {
      contenido = JSON.stringify(datos, null, 2);
    } else {
      contenido = `
<datos>
  <formato>${formato}</formato>
  <empleados>${exportar.empleados}</empleados>
  <departamentos>${exportar.departamentos}</departamentos>
  <solicitudes>${exportar.solicitudes}</solicitudes>
  <evaluaciones>${exportar.evaluaciones}</evaluaciones>
</datos>`;
    }

    setPreview(contenido);
    setMostrarPreview(true);
  };

  const copiarAlPortapapeles = () => {
    navigator.clipboard.writeText(preview);
    alert("Contenido copiado al portapapeles");
  };

  const exportarDatos = () => {
    const blob = new Blob([preview], {
      type: formato === "json" ? "application/json" : "application/xml",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `respaldo.${formato}`;
    link.click();
  };

  return (
    <div>
      {/* HEADER */}
      <header className="header">
        <nav className="nav">
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <img 
              src={logo} 
              alt="Logo ULEAM" 
              style={{ width: "50px", height: "50px" }} 
            />
            <h1>Gestión de Datos - XML/JSON - ULEAM</h1>
          </div>

          <div className="nav-links">
            {usuario && (
              <span style={{ 
                color: "#333", 
                fontWeight: "bold",
                marginRight: "15px" 
              }}>
                👤 {usuario.nombre}
              </span>
            )}

            <button className="btn btn-secondary" onClick={() => navigate("/admin")}>
              Panel Admin
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/empleados")}>
              Empleados
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/departamentos")}>
              Departamentos
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/reportes")}>
              Reportes
            </button>

            <button 
              className="btn btn-danger" 
              onClick={cerrarSesion}
            >
              Cerrar Sesión
            </button>
          </div>

        </nav>
      </header>

      <main className="container">

        {/* EXPORTACIÓN */}
        <div className="card">
          <h2>Exportar Datos</h2>

          <div className="data-section">
            <h3>Selecciona datos:</h3>

            {[
              ["empleados", "Empleados"],
              ["departamentos", "Departamentos"],
              ["solicitudes", "Solicitudes"],
              ["evaluaciones", "Evaluaciones"],
            ].map(([key, label]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  name={key}
                  checked={exportar[key]}
                  onChange={handleCheckbox}
                />{" "}
                {label}
              </label>
            ))}

            <h3>Formato:</h3>
            <div className="format-selector">
              <button
                className={`format-btn ${formato === "json" ? "active" : ""}`}
                onClick={() => seleccionarFormato("json")}
              >
                JSON
              </button>
              <button
                className={`format-btn ${formato === "xml" ? "active" : ""}`}
                onClick={() => seleccionarFormato("xml")}
              >
                XML
              </button>
            </div>

            <div className="action-buttons">
              <button className="btn btn-primary" onClick={generarVistaPrevia}>
                Vista Previa
              </button>
              <button className="btn btn-success" onClick={exportarDatos}>
                Descargar
              </button>
              <button className="btn btn-info" onClick={copiarAlPortapapeles}>
                Copiar
              </button>
            </div>
          </div>

          {mostrarPreview && (
            <div>
              <h3>Vista Previa</h3>
              <div className="preview-container">
                <pre>{preview}</pre>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default GestionDatos;
