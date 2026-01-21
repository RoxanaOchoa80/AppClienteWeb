import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, obtenerUsuarioActual } from "../services/authService";
import { cargarDatos, guardarDatos } from "../services/dataService";
import { 
  cargarXML, 
  exportarDatosXML, 
  descargarXML, 
  leerArchivoXML, 
  importarDatosXML 
} from "../services/xmlService";
import "../assets/css/style.css";

const logo = "/img/logo.png";

function GestionXML() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState("empleados");
  const [datos, setDatos] = useState([]);
  const [vistaXML, setVistaXML] = useState("");
  const [mostrarVista, setMostrarVista] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const usuarioActual = obtenerUsuarioActual();
    if (usuarioActual) {
      setUsuario(usuarioActual);
    }
    cargarDatosActuales();
  }, []);

  useEffect(() => {
    cargarDatosActuales();
  }, [tipoSeleccionado]);

  const cargarDatosActuales = async () => {
    const datosActuales = await cargarDatos(tipoSeleccionado);
    setDatos(datosActuales);
  };
  
  const cerrarSesion = () => {
    logout();
    alert("Sesión cerrada");
    navigate("/");
  };

  // Cargar XML desde archivo público
  const cargarXMLPublico = async () => {
    try {
      const archivo = `/data/${tipoSeleccionado}.xml`;
      const jsonData = await cargarXML(archivo);
      
      // Extraer el array de datos
      const rootKey = Object.keys(jsonData)[0];
      const datosXML = jsonData[rootKey];
      
      let arrayDatos = [];
      if (datosXML) {
        const itemKey = Object.keys(datosXML)[0];
        arrayDatos = Array.isArray(datosXML[itemKey]) 
          ? datosXML[itemKey] 
          : [datosXML[itemKey]];
      }
      
      // Convertir valores a números donde corresponda
      arrayDatos = arrayDatos.map(item => {
        const convertido = {};
        for (const key in item) {
          const valor = item[key];
          // Intentar convertir a número si es posible
          if (!isNaN(valor) && valor !== '' && (key === 'id' || key === 'salario' || key === 'empleados' || key === 'vacantes' || key === 'presupuesto')) {
            convertido[key] = Number(valor);
          } else {
            convertido[key] = valor;
          }
        }
        return convertido;
      });
      
      setDatos(arrayDatos);
      guardarDatos(tipoSeleccionado, arrayDatos);
      setMensaje(`✅ XML cargado exitosamente: ${arrayDatos.length} registros`);
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      setMensaje(`❌ Error al cargar XML: ${error.message}`);
    }
  };

  // Exportar datos actuales a XML
  const exportarAXML = () => {
    try {
      const xmlString = exportarDatosXML(datos, tipoSeleccionado);
      setVistaXML(xmlString);
      setMostrarVista(true);
      setMensaje("✅ XML generado correctamente");
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      setMensaje(`❌ Error al generar XML: ${error.message}`);
    }
  };

  // Descargar XML
  const descargarArchivoXML = () => {
    try {
      const xmlString = exportarDatosXML(datos, tipoSeleccionado);
      descargarXML(xmlString, `${tipoSeleccionado}_${Date.now()}.xml`);
      setMensaje("✅ Archivo XML descargado");
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      setMensaje(`❌ Error al descargar: ${error.message}`);
    }
  };

  // Importar XML desde archivo
  const importarXML = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const datosImportados = await importarDatosXML(file);
      
      // Convertir valores a números donde corresponda
      const datosConvertidos = datosImportados.map(item => {
        const convertido = {};
        for (const key in item) {
          const valor = item[key];
          if (!isNaN(valor) && valor !== '' && (key === 'id' || key === 'salario' || key === 'empleados' || key === 'vacantes' || key === 'presupuesto')) {
            convertido[key] = Number(valor);
          } else {
            convertido[key] = valor;
          }
        }
        return convertido;
      });
      
      setDatos(datosConvertidos);
      guardarDatos(tipoSeleccionado, datosConvertidos);
      setMensaje(`✅ Importados ${datosConvertidos.length} registros desde XML`);
      setTimeout(() => setMensaje(""), 3000);
      event.target.value = ''; // Limpiar input
    } catch (error) {
      setMensaje(`❌ Error al importar: ${error.message}`);
      event.target.value = '';
    }
  };

  return (
    <div className="react-container">
      {/* HEADER */}
      <header className="header">
        <nav className="nav">
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <img 
              src={logo} 
              alt="Logo ULEAM" 
              style={{ width: "50px", height: "50px" }} 
            />
            <h1>Gestión de Datos XML - ULEAM</h1>
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

      <main className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* MENSAJE DE ESTADO */}
        {mensaje && (
          <div style={{
            padding: '15px',
            marginBottom: '20px',
            background: mensaje.includes('❌') ? '#ffebee' : '#e8f5e9',
            color: mensaje.includes('❌') ? '#c62828' : '#2e7d32',
            borderRadius: '8px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            {mensaje}
          </div>
        )}

        {/* SELECTOR DE TIPO DE DATOS */}
        <div className="card" style={{ marginBottom: '30px' }}>
          <h2 style={{ marginBottom: '20px' }}>📂 Seleccionar Tipo de Datos</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['empleados', 'departamentos', 'solicitudes', 'reportes'].map(tipo => (
              <button
                key={tipo}
                onClick={() => setTipoSeleccionado(tipo)}
                style={{
                  padding: '12px 24px',
                  background: tipoSeleccionado === tipo 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : '#f0f0f0',
                  color: tipoSeleccionado === tipo ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  textTransform: 'capitalize',
                  transition: 'all 0.3s'
                }}
              >
                {tipo}
              </button>
            ))}
          </div>
          <p style={{ marginTop: '15px', color: '#666' }}>
            📊 Registros actuales: <strong>{datos.length}</strong>
          </p>
        </div>

        {/* ACCIONES XML */}
        <div className="card" style={{ marginBottom: '30px' }}>
          <h2 style={{ marginBottom: '20px' }}>⚙️ Operaciones XML</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            
            {/* Cargar XML público */}
            <button
              onClick={cargarXMLPublico}
              style={{
                padding: '15px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              📥 Cargar XML del Sistema
            </button>

            {/* Exportar a XML */}
            <button
              onClick={exportarAXML}
              style={{
                padding: '15px',
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              🔄 Convertir a XML
            </button>

            {/* Descargar XML */}
            <button
              onClick={descargarArchivoXML}
              style={{
                padding: '15px',
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              💾 Descargar XML
            </button>

            {/* Importar XML */}
            <label
              style={{
                padding: '15px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              📤 Importar XML
              <input
                type="file"
                accept=".xml"
                onChange={importarXML}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        {/* VISTA XML */}
        {mostrarVista && vistaXML && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>📄 Vista Previa XML</h2>
              <button
                onClick={() => setMostrarVista(false)}
                style={{
                  padding: '8px 16px',
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ✕ Cerrar
              </button>
            </div>
            <pre style={{
              background: '#f5f5f5',
              padding: '20px',
              borderRadius: '8px',
              overflow: 'auto',
              maxHeight: '400px',
              fontSize: '0.9rem',
              lineHeight: '1.5'
            }}>
              {vistaXML}
            </pre>
          </div>
        )}

        {/* TABLA DE DATOS ACTUALES */}
        <div className="card">
          <h2 style={{ marginBottom: '20px' }}>📋 Datos Actuales ({tipoSeleccionado})</h2>
          {datos.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    {Object.keys(datos[0]).map(key => (
                      <th key={key} style={{ 
                        padding: '12px', 
                        textAlign: 'left', 
                        borderBottom: '2px solid #e0e0e0',
                        textTransform: 'capitalize'
                      }}>
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {datos.map((item, index) => (
                    <tr 
                      key={index}
                      style={{ borderBottom: '1px solid #e0e0e0' }}
                      onMouseEnter={(ev) => ev.currentTarget.style.background = '#f8f9fa'}
                      onMouseLeave={(ev) => ev.currentTarget.style.background = 'white'}
                    >
                      {Object.values(item).map((value, i) => (
                        <td key={i} style={{ padding: '12px' }}>
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#999'
            }}>
              <p style={{ fontSize: '4rem', margin: '0' }}>📭</p>
              <p style={{ fontSize: '1.3rem', margin: '20px 0 0 0' }}>
                No hay datos cargados. Importa o carga un archivo XML.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default GestionXML;

