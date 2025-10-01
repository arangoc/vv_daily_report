import React, { useState, useEffect } from 'react';
import { Calendar, Users, Truck, BarChart3, AlertTriangle, Save, Send, MapPin, TrendingUp, Package, Download, Database, Copy } from 'lucide-react';

const ObraControlApp = () => {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [proyectoDB, setProyectoDB] = useState({
    reportes: {},
    configuracion: {}
  });

  const tarifariosPredefinidos = {
    'Operador Excavadora': { tarifaHora: 18.50, horasMinimas: 4 },
    'Operador Retroexcavadora': { tarifaHora: 17.25, horasMinimas: 4 },
    'Ayudante General': { tarifaHora: 8.50, horasMinimas: 8 },
    'Albañil': { tarifaHora: 12.75, horasMinimas: 8 },
    'Capataz': { tarifaHora: 22.00, horasMinimas: 8 },
    'Jefe de Obra': { tarifaHora: 35.00, horasMinimas: 8 },
    'Topógrafo': { tarifaHora: 25.50, horasMinimas: 8 }
  };

  const tarifarioEquipos = {
    'Excavadora CAT 320': 125.00,
    'Retroexcavadora CAT 420': 110.00,
    'Volqueta 10m³': 75.00,
    'Compactador Vibratorio': 85.00
  };

  const [reportData, setReportData] = useState({
    proyecto: 'Villa Marina Fase 4',
    cliente: 'Grupo VerdeAzul',
    fecha: currentDate,
    clima: '',
    supervisor: '',
    personalCampo: [],
    personalAdmin: [],
    equipos: [],
    materiales: [],
    acarreos: [],
    avancePartidas: [],
    extras: [],
    gastosOperativos: [],
    observaciones: '',
    incidentesSeguridad: ''
  });

  useEffect(() => {
    setProyectoDB(prev => ({
      ...prev,
      reportes: {
        ...prev.reportes,
        [currentDate]: reportData
      }
    }));
  }, [reportData, currentDate]);

  const partidasContrato = [
    { codigo: '1.01', descripcion: 'Oficina de campo', unidad: 'Glob', presupuesto: 1134.97 },
    { codigo: '4.01', descripcion: 'Limpieza y desraigue', unidad: 'm2', presupuesto: 12953.33 },
    { codigo: '4.02', descripcion: 'Corte y Disposición', unidad: 'm3', presupuesto: 49771.45 },
    { codigo: '5.01', descripcion: 'Capa Base', unidad: 'm²', presupuesto: 35538.72 },
    { codigo: '6.01', descripcion: 'Tubería PVC 4"', unidad: 'ml', presupuesto: 26867.30 }
  ];

  const tiposPersonalCampo = ['Operador Excavadora', 'Operador Retroexcavadora', 'Ayudante General', 'Albañil'];
  const tiposPersonalAdmin = ['Capataz', 'Jefe de Obra', 'Topógrafo'];
  const tiposEquipo = Object.keys(tarifarioEquipos);

  const cargarPlantillaDiaAnterior = () => {
    const fechaAnterior = new Date(currentDate);
    fechaAnterior.setDate(fechaAnterior.getDate() - 1);
    const fechaAnteriorStr = fechaAnterior.toISOString().split('T')[0];
    
    const reporteAnterior = proyectoDB.reportes[fechaAnteriorStr];
    
    if (reporteAnterior) {
      const nuevaPlantilla = {
        ...reporteAnterior,
        fecha: currentDate,
        observaciones: '',
        personalCampo: reporteAnterior.personalCampo.map(p => ({
          ...p,
          horasNormales: tarifariosPredefinidos[p.tipo]?.horasMinimas || 8,
          horasExtras: 0,
          presente: true
        })),
        personalAdmin: reporteAnterior.personalAdmin.map(p => ({
          ...p,
          horasNormales: tarifariosPredefinidos[p.tipo]?.horasMinimas || 8,
          horasExtras: 0,
          presente: true
        })),
        equipos: reporteAnterior.equipos.map(e => ({
          ...e,
          horasTrabajo: 0,
          combustible: 0
        })),
        materiales: [],
        acarreos: [],
        extras: [],
        gastosOperativos: []
      };
      
      setReportData(nuevaPlantilla);
      alert('✅ Plantilla cargada');
    } else {
      alert('❌ No hay reporte anterior');
    }
  };

  const exportarBaseDatos = () => {
    const dataStr = JSON.stringify(proyectoDB, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bd-villa-marina.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const addPersonalCampo = () => {
    setReportData(prev => ({
      ...prev,
      personalCampo: [...prev.personalCampo, {
        id: Date.now(),
        nombre: '',
        tipo: '',
        horasNormales: 8,
        horasExtras: 0,
        actividad: '',
        tarifaHora: 0,
        presente: true
      }]
    }));
  };

  const addPersonalAdmin = () => {
    setReportData(prev => ({
      ...prev,
      personalAdmin: [...prev.personalAdmin, {
        id: Date.now(),
        nombre: '',
        tipo: '',
        horasNormales: 8,
        horasExtras: 0,
        actividad: '',
        tarifaHora: 0,
        presente: true
      }]
    }));
  };

  const addEquipo = () => {
    setReportData(prev => ({
      ...prev,
      equipos: [...prev.equipos, {
        id: Date.now(),
        tipo: '',
        identificacion: '',
        operador: '',
        horasTrabajo: 0,
        combustible: 0,
        actividad: '',
        estado: 'Operativo',
        costoHora: 0
      }]
    }));
  };

  const addMaterial = () => {
    setReportData(prev => ({
      ...prev,
      materiales: [...prev.materiales, {
        id: Date.now(),
        tipo: '',
        cantidad: 0,
        unidad: '',
        proveedor: '',
        costoUnitario: 0,
        costoTotal: 0
      }]
    }));
  };

  const addAvancePartida = () => {
    setReportData(prev => ({
      ...prev,
      avancePartidas: [...prev.avancePartidas, {
        id: Date.now(),
        codigo: '',
        avanceHoy: 0,
        avanceAcumulado: 0,
        observaciones: ''
      }]
    }));
  };

  const updateField = (section, id, field, value) => {
    setReportData(prev => ({
      ...prev,
      [section]: prev[section].map(item => {
        if (item.id === id) {
          let updatedItem = { ...item, [field]: value };
          
          if (field === 'tipo' && (section === 'personalCampo' || section === 'personalAdmin')) {
            const tarifario = tarifariosPredefinidos[value];
            if (tarifario) {
              updatedItem.tarifaHora = tarifario.tarifaHora;
              updatedItem.horasNormales = tarifario.horasMinimas;
            }
          }
          
          if (field === 'tipo' && section === 'equipos') {
            const costoHora = tarifarioEquipos[value];
            if (costoHora) {
              updatedItem.costoHora = costoHora;
            }
          }
          
          if (section === 'materiales' && (field === 'cantidad' || field === 'costoUnitario')) {
            updatedItem.costoTotal = updatedItem.cantidad * updatedItem.costoUnitario;
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const removeItem = (section, id) => {
    setReportData(prev => ({
      ...prev,
      [section]: prev[section].filter(item => item.id !== id)
    }));
  };

  const generateReport = () => {
    const costoPersonalCampo = reportData.personalCampo.reduce((sum, p) => sum + ((p.horasNormales + p.horasExtras) * p.tarifaHora), 0);
    const costoPersonalAdmin = reportData.personalAdmin.reduce((sum, p) => sum + ((p.horasNormales + p.horasExtras) * p.tarifaHora), 0);
    const costoEquipos = reportData.equipos.reduce((sum, e) => sum + (e.horasTrabajo * e.costoHora), 0);
    const costoMateriales = reportData.materiales.reduce((sum, m) => sum + m.costoTotal, 0);

    const report = {
      ...reportData,
      timestamp: new Date().toISOString(),
      resumenDia: {
        costoPersonalCampo,
        costoPersonalAdmin,
        costoEquipos,
        costoMateriales,
        costoTotalDia: costoPersonalCampo + costoPersonalAdmin + costoEquipos + costoMateriales
      }
    };
    
    return JSON.stringify(report, null, 2);
  };

  const sendReport = () => {
    const reportContent = generateReport();
    const subject = 'Reporte Diario - Villa Marina - ' + reportData.fecha;
    const body = encodeURIComponent('Reporte diario:\n\n' + reportContent);
    window.open('mailto:?subject=' + subject + '&body=' + body);
  };

  const [activeTab, setActiveTab] = useState('info');

  const TabButton = ({ id, icon: Icon, label, active, onClick, count = null }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center p-2 rounded-lg transition-colors relative ${
        active 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <Icon size={18} />
      <span className="text-xs mt-1">{label}</span>
      {count !== null && count > 0 && (
        <span className={`absolute -top-1 -right-1 text-xs rounded-full w-5 h-5 flex items-center justify-center ${
          active ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold">{reportData.proyecto}</h1>
            <p className="text-blue-100 text-sm">{reportData.cliente}</p>
            <div className="flex items-center mt-1 text-xs">
              <Database size={14} className="mr-1" />
              <span>BD: {Object.keys(proyectoDB.reportes).length} reportes</span>
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="flex items-center">
              <Calendar size={16} className="mr-1" />
              <span>{reportData.fecha}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <button
            onClick={cargarPlantillaDiaAnterior}
            className="bg-blue-500 hover:bg-blue-400 px-2 py-1 rounded flex items-center"
          >
            <Copy size={12} className="mr-1" />
            Día Anterior
          </button>
          <button
            onClick={exportarBaseDatos}
            className="bg-red-500 hover:bg-red-400 px-2 py-1 rounded flex items-center"
          >
            <Database size={12} className="mr-1" />
            Exportar BD
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-bold text-lg mb-3 flex items-center">
                <MapPin size={20} className="mr-2 text-blue-600" />
                Información General
              </h2>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Supervisor de Obra</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    value={reportData.supervisor}
                    onChange={(e) => setReportData(prev => ({...prev, supervisor: e.target.value}))}
                    placeholder="Nombre del supervisor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Condiciones Climáticas</label>
                  <select
                    className="w-full p-2 border rounded-lg"
                    value={reportData.clima}
                    onChange={(e) => setReportData(prev => ({...prev, clima: e.target.value}))}
                  >
                    <option value="">Seleccionar clima</option>
                    <option value="Soleado">☀️ Soleado</option>
                    <option value="Nublado">☁️ Nublado</option>
                    <option value="Lluvioso">🌧️ Lluvioso</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg shadow">
              <h3 className="font-bold text-lg mb-3 flex items-center">
                <TrendingUp size={20} className="mr-2 text-green-600" />
                Resumen del Día
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Personal Campo:</span>
                    <span className="font-semibold">{reportData.personalCampo.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Personal Admin:</span>
                    <span className="font-semibold">{reportData.personalAdmin.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Equipos:</span>
                    <span className="font-semibold">{reportData.equipos.length}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Partidas:</span>
                    <span className="font-semibold">{reportData.avancePartidas.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reportes BD:</span>
                    <span className="font-semibold text-blue-600">{Object.keys(proyectoDB.reportes).length}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg shadow">
              <h3 className="font-bold text-lg mb-3">💰 Tarifarios Automáticos</h3>
              <div className="text-xs text-yellow-700">
                <p><strong>Personal:</strong> Operador Excavadora B/.18.50/h, Jefe Obra B/.35.00/h</p>
                <p><strong>Equipos:</strong> Excavadora CAT B/.125/h, Volqueta B/.75/h</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'personal' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-lg flex items-center">
                  <Users size={20} className="mr-2 text-blue-600" />
                  Personal de Campo
                </h2>
                <button onClick={addPersonalCampo} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">
                  + Agregar
                </button>
              </div>
              
              {reportData.personalCampo.map((persona) => (
                <div key={persona.id} className="border rounded-lg p-3 mb-3 bg-blue-50">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={persona.presente}
                        onChange={(e) => updateField('personalCampo', persona.id, 'presente', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label className="text-sm font-medium">
                        {persona.presente ? '✅ Presente' : '❌ Ausente'}
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      className="p-2 border rounded"
                      value={persona.nombre}
                      onChange={(e) => updateField('personalCampo', persona.id, 'nombre', e.target.value)}
                    />
                    <select
                      className="p-2 border rounded"
                      value={persona.tipo}
                      onChange={(e) => updateField('personalCampo', persona.id, 'tipo', e.target.value)}
                    >
                      <option value="">Seleccionar tipo</option>
                      {tiposPersonalCampo.map(tipo => (
                        <option key={tipo} value={tipo}>
                          {tipo} - B/. {tarifariosPredefinidos[tipo]?.tarifaHora}/h
                        </option>
                      ))}
                    </select>
                    
                    {persona.tipo && (
                      <div className="bg-gray-100 p-2 rounded text-xs">
                        <strong>Tarifa:</strong> B/. {persona.tarifaHora}/h
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600">Horas Normales</label>
                        <input
                          type="number"
                          step="0.5"
                          className="w-full p-2 border rounded"
                          value={persona.horasNormales}
                          onChange={(e) => updateField('personalCampo', persona.id, 'horasNormales', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Horas Extras</label>
                        <input
                          type="number"
                          step="0.5"
                          className="w-full p-2 border rounded"
                          value={persona.horasExtras}
                          onChange={(e) => updateField('personalCampo', persona.id, 'horasExtras', Number(e.target.value))}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-green-100 p-2 rounded">
                      <div className="text-xs text-gray-600">Costo Total</div>
                      <div className="text-lg font-bold text-green-700">
                        B/. {((persona.horasNormales + persona.horasExtras) * persona.tarifaHora).toFixed(2)}
                      </div>
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Actividad asignada"
                      className="p-2 border rounded"
                      value={persona.actividad}
                      onChange={(e) => updateField('personalCampo', persona.id, 'actividad', e.target.value)}
                    />
                    <button 
                      onClick={() => removeItem('personalCampo', persona.id)}
                      className="text-red-600 text-sm hover:bg-red-50 p-1 rounded"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-lg flex items-center">
                  <Users size={20} className="mr-2 text-green-600" />
                  Personal Administrativo
                </h2>
                <button onClick={addPersonalAdmin} className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm">
                  + Agregar
                </button>
              </div>
              
              {reportData.personalAdmin.map((persona) => (
                <div key={persona.id} className="border rounded-lg p-3 mb-3 bg-green-50">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={persona.presente}
                        onChange={(e) => updateField('personalAdmin', persona.id, 'presente', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label className="text-sm font-medium">
                        {persona.presente ? '✅ Presente' : '❌ Ausente'}
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      className="p-2 border rounded"
                      value={persona.nombre}
                      onChange={(e) => updateField('personalAdmin', persona.id, 'nombre', e.target.value)}
                    />
                    <select
                      className="p-2 border rounded"
                      value={persona.tipo}
                      onChange={(e) => updateField('personalAdmin', persona.id, 'tipo', e.target.value)}
                    >
                      <option value="">Seleccionar cargo</option>
                      {tiposPersonalAdmin.map(tipo => (
                        <option key={tipo} value={tipo}>
                          {tipo} - B/. {tarifariosPredefinidos[tipo]?.tarifaHora}/h
                        </option>
                      ))}
                    </select>
                    
                    {persona.tipo && (
                      <div className="bg-gray-100 p-2 rounded text-xs">
                        <strong>Tarifa:</strong> B/. {persona.tarifaHora}/h
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600">Horas Normales</label>
                        <input
                          type="number"
                          step="0.5"
                          className="w-full p-2 border rounded"
                          value={persona.horasNormales}
                          onChange={(e) => updateField('personalAdmin', persona.id, 'horasNormales', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Horas Extras</label>
                        <input
                          type="number"
                          step="0.5"
                          className="w-full p-2 border rounded"
                          value={persona.horasExtras}
                          onChange={(e) => updateField('personalAdmin', persona.id, 'horasExtras', Number(e.target.value))}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-green-100 p-2 rounded">
                      <div className="text-xs text-gray-600">Costo Total</div>
                      <div className="text-lg font-bold text-green-700">
                        B/. {((persona.horasNormales + persona.horasExtras) * persona.tarifaHora).toFixed(2)}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => removeItem('personalAdmin', persona.id)}
                      className="text-red-600 text-sm hover:bg-red-50 p-1 rounded"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'equipos' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-lg flex items-center">
                  <Truck size={20} className="mr-2 text-orange-600" />
                  Control de Equipos
                </h2>
                <button onClick={addEquipo} className="bg-orange-600 text-white px-3 py-1 rounded-lg text-sm">
                  + Agregar
                </button>
              </div>
              
              {reportData.equipos.map((equipo) => (
                <div key={equipo.id} className="border rounded-lg p-3 mb-3 bg-orange-50">
                  <div className="grid grid-cols-1 gap-2">
                    <select
                      className="p-2 border rounded"
                      value={equipo.tipo}
                      onChange={(e) => updateField('equipos', equipo.id, 'tipo', e.target.value)}
                    >
                      <option value="">Tipo de equipo</option>
                      {tiposEquipo.map(tipo => (
                        <option key={tipo} value={tipo}>
                          {tipo} - B/. {tarifarioEquipos[tipo]}/h
                        </option>
                      ))}
                    </select>
                    
                    {equipo.tipo && (
                      <div className="bg-gray-100 p-2 rounded text-xs">
                        <strong>Tarifa:</strong> B/. {equipo.costoHora}/h
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Identificación/Placa"
                        className="p-2 border rounded"
                        value={equipo.identificacion}
                        onChange={(e) => updateField('equipos', equipo.id, 'identificacion', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Operador"
                        className="p-2 border rounded"
                        value={equipo.operador}
                        onChange={(e) => updateField('equipos', equipo.id, 'operador', e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600">Horas Trabajo</label>
                        <input
                          type="number"
                          step="0.1"
                          className="w-full p-2 border rounded"
                          value={equipo.horasTrabajo}
                          onChange={(e) => updateField('equipos', equipo.id, 'horasTrabajo', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Combustible (gal)</label>
                        <input
                          type="number"
                          step="0.1"
                          className="w-full p-2 border rounded"
                          value={equipo.combustible}
                          onChange={(e) => updateField('equipos', equipo.id, 'combustible', Number(e.target.value))}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-green-100 p-2 rounded">
                      <div className="text-xs text-gray-600">Costo Total</div>
                      <div className="text-lg font-bold text-green-700">
                        B/. {(equipo.horasTrabajo * equipo.costoHora).toFixed(2)}
                      </div>
                    </div>
                    
                    <select
                      className="p-2 border rounded"
                      value={equipo.estado}
                      onChange={(e) => updateField('equipos', equipo.id, 'estado', e.target.value)}
                    >
                      <option value="Operativo">✅ Operativo</option>
                      <option value="Mantenimiento">🔧 Mantenimiento</option>
                      <option value="Averiado">❌ Averiado</option>
                      <option value="Standby">⏸️ Standby</option>
                    </select>
                    
                    <input
                      type="text"
                      placeholder="Actividad asignada"
                      className="p-2 border rounded"
                      value={equipo.actividad}
                      onChange={(e) => updateField('equipos', equipo.id, 'actividad', e.target.value)}
                    />
                    
                    <button 
                      onClick={() => removeItem('equipos', equipo.id)}
                      className="text-red-600 text-sm hover:bg-red-50 p-1 rounded"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'avance' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-lg flex items-center">
                  <BarChart3 size={20} className="mr-2 text-blue-600" />
                  Avance por Partidas
                </h2>
                <button onClick={addAvancePartida} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">
                  + Agregar
                </button>
              </div>
              
              {reportData.avancePartidas.map((avance) => (
                <div key={avance.id} className="border rounded-lg p-3 mb-3 bg-blue-50">
                  <div className="grid grid-cols-1 gap-2">
                    <select
                      className="p-2 border rounded text-sm"
                      value={avance.codigo}
                      onChange={(e) => updateField('avancePartidas', avance.id, 'codigo', e.target.value)}
                    >
                      <option value="">Seleccionar partida</option>
                      {partidasContrato.map(partida => (
                        <option key={partida.codigo} value={partida.codigo}>
                          {partida.codigo} - {partida.descripcion}
                        </option>
                      ))}
                    </select>
                    
                    {avance.codigo && (
                      <div className="bg-gray-100 p-2 rounded text-xs">
                        <strong>Presupuesto:</strong> B/. {partidasContrato.find(p => p.codigo === avance.codigo)?.presupuesto.toLocaleString()}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600">Avance Hoy</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full p-2 border rounded"
                          value={avance.avanceHoy}
                          onChange={(e) => updateField('avancePartidas', avance.id, 'avanceHoy', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">% Acumulado</label>
                        <input
                          type="number"
                          step="0.1"
                          className="w-full p-2 border rounded"
                          value={avance.avanceAcumulado}
                          onChange={(e) => updateField('avancePartidas', avance.id, 'avanceAcumulado', Number(e.target.value))}
                        />
                      </div>
                    </div>
                    
                    <textarea
                      placeholder="Observaciones del avance"
                      className="p-2 border rounded"
                      rows="2"
                      value={avance.observaciones}
                      onChange={(e) => updateField('avancePartidas', avance.id, 'observaciones', e.target.value)}
                    />
                    
                    <button 
                      onClick={() => removeItem('avancePartidas', avance.id)}
                      className="text-red-600 text-sm hover:bg-red-50 p-1 rounded"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'materiales' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-lg flex items-center">
                  <Package size={20} className="mr-2 text-green-600" />
                  Control de Materiales
                </h2>
                <button onClick={addMaterial} className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm">
                  + Agregar
                </button>
              </div>
              
              {reportData.materiales.map((material) => (
                <div key={material.id} className="border rounded-lg p-3 mb-3 bg-green-50">
                  <div className="grid grid-cols-1 gap-2">
                    <input
                      type="text"
                      placeholder="Tipo de material"
                      className="p-2 border rounded"
                      value={material.tipo}
                      onChange={(e) => updateField('materiales', material.id, 'tipo', e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600">Cantidad</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full p-2 border rounded"
                          value={material.cantidad}
                          onChange={(e) => updateField('materiales', material.id, 'cantidad', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Unidad</label>
                        <select
                          className="w-full p-2 border rounded"
                          value={material.unidad}
                          onChange={(e) => updateField('materiales', material.id, 'unidad', e.target.value)}
                        >
                          <option value="">Unidad</option>
                          <option value="m3">m³</option>
                          <option value="ton">Toneladas</option>
                          <option value="saco">Sacos</option>
                          <option value="und">Unidades</option>
                        </select>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Proveedor"
                      className="p-2 border rounded"
                      value={material.proveedor}
                      onChange={(e) => updateField('materiales', material.id, 'proveedor', e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600">Costo Unit. B/.</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full p-2 border rounded"
                          value={material.costoUnitario}
                          onChange={(e) => updateField('materiales', material.id, 'costoUnitario', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Total B/.</label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded bg-gray-100 font-semibold"
                          value={material.costoTotal.toFixed(2)}
                          readOnly
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => removeItem('materiales', material.id)}
                      className="text-red-600 text-sm hover:bg-red-50 p-1 rounded"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reporte' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-bold text-lg mb-3">📋 Observaciones y Reporte</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Observaciones Generales</label>
                  <textarea
                    className="w-full p-3 border rounded-lg"
                    rows="4"
                    placeholder="Eventos importantes, problemas, decisiones tomadas..."
                    value={reportData.observaciones}
                    onChange={(e) => setReportData(prev => ({...prev, observaciones: e.target.value}))}
                  />
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-3 flex items-center">
                    <TrendingUp size={18} className="mr-2" />
                    💰 Resumen Financiero del Día
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Personal Campo:</span>
                        <span className="font-semibold text-blue-700">
                          B/. {reportData.personalCampo.reduce((sum, p) => sum + ((p.horasNormales + p.horasExtras) * p.tarifaHora), 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Personal Admin:</span>
                        <span className="font-semibold text-blue-700">
                          B/. {reportData.personalAdmin.reduce((sum, p) => sum + ((p.horasNormales + p.horasExtras) * p.tarifaHora), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Equipos:</span>
                        <span className="font-semibold text-blue-700">
                          B/. {reportData.equipos.reduce((sum, e) => sum + (e.horasTrabajo * e.costoHora), 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Materiales:</span>
                        <span className="font-semibold text-green-700">
                          B/. {reportData.materiales.reduce((sum, m) => sum + m.costoTotal, 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t mt-3 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Total Costo del Día:</span>
                      <span className="font-bold text-2xl text-red-600">
                        B/. {(
                          reportData.personalCampo.reduce((sum, p) => sum + ((p.horasNormales + p.horasExtras) * p.tarifaHora), 0) +
                          reportData.personalAdmin.reduce((sum, p) => sum + ((p.horasNormales + p.horasExtras) * p.tarifaHora), 0) +
                          reportData.equipos.reduce((sum, e) => sum + (e.horasTrabajo * e.costoHora), 0) +
                          reportData.materiales.reduce((sum, m) => sum + m.costoTotal, 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="font-medium text-indigo-800 mb-3 flex items-center">
                    <Database size={18} className="mr-2" />
                    🗄️ Base de Datos
                  </h3>
                  <div className="text-sm text-indigo-700">
                    <p><strong>Reportes almacenados:</strong> {Object.keys(proyectoDB.reportes).length}</p>
                    <p><strong>Tarifarios definidos:</strong> {Object.keys(tarifariosPredefinidos).length} personal + {Object.keys(tarifarioEquipos).length} equipos</p>
                    <p><strong>Funcionalidades:</strong> Tarifarios automáticos, carga día anterior, exportación BD</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="grid grid-cols-5 gap-1 p-2">
          <TabButton
            id="info"
            icon={MapPin}
            label="Info"
            active={activeTab === 'info'}
            onClick={() => setActiveTab('info')}
          />
          <TabButton
            id="personal"
            icon={Users}
            label="Personal"
            active={activeTab === 'personal'}
            onClick={() => setActiveTab('personal')}
            count={reportData.personalCampo.length + reportData.personalAdmin.length}
          />
          <TabButton
            id="equipos"
            icon={Truck}
            label="Equipos"
            active={activeTab === 'equipos'}
            onClick={() => setActiveTab('equipos')}
            count={reportData.equipos.length}
          />
          <TabButton
            id="avance"
            icon={BarChart3}
            label="Avance"
            active={activeTab === 'avance'}
            onClick={() => setActiveTab('avance')}
            count={reportData.avancePartidas.length}
          />
          <TabButton
            id="materiales"
            icon={Package}
            label="Materiales"
            active={activeTab === 'materiales'}
            onClick={() => setActiveTab('materiales')}
            count={reportData.materiales.length}
          />
          <TabButton
            id="reporte"
            icon={TrendingUp}
            label="Reporte"
            active={activeTab === 'reporte'}
            onClick={() => setActiveTab('reporte')}
          />
        </div>
        
        <div className="flex space-x-2 p-3 bg-gray-50">
          <button
            onClick={() => {
              const data = generateReport();
              navigator.clipboard.writeText(data);
              alert('✅ Reporte copiado al portapapeles');
            }}
            className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg flex items-center justify-center font-medium hover:bg-gray-700"
          >
            <Save size={16} className="mr-2" />
            Guardar
          </button>
          <button
            onClick={sendReport}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center font-medium hover:from-blue-700 hover:to-blue-800"
          >
            <Send size={16} className="mr-2" />
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ObraControlApp;