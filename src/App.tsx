import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  HelpCircle,
  FolderKanban
} from 'lucide-react';

/* ============ CATÁLOGOS (de la libreta de Christian) ============ */
const TIPOLOGIAS = [
  "Servicios Financieros",
  "Calidad de producto",
  "Cobro incorrecto",
  "Desarrollo inmobiliario",
  "Sustentabilidad",
  "Comentarios y sugerencias",
  "Denuncias",
];

const CLASIFICACIONES = [
  "Reembolsos",
  "Reclamo",
  "Asistencia y orientación",
  "Comentarios y sugerencias",
  "Producto",
];

const AREAS = [
  "Servicios Financieros",
  "Comercial",
  "Desarrollo inmobiliario",
  "Operaciones",
  "Sustentabilidad",
  "Tienda y otras áreas",
  "Auditorías",
];

const DETALLES = [
  "Tipo de garantía",
  "Expansión",
  "Renta de locales y/o espacios",
  "Formas de pago",
  "Producto",
  "Servicio",
];

const SUBDETALLES = ["Proveedor", "Tienda"];

const MOTIVOS = ["No funciona", "Producto dañado", "Producto incompleto", "Cobro incorrecto", "Otro"];

/* Combinación sugerida por tipología (según las notas) */
interface Sugerido {
  clasificacion: string;
  area: string;
  detalle: string;
}

const SUGERIDOS: Record<string, Sugerido> = {
  "Servicios Financieros": { clasificacion: "Reembolsos", area: "Servicios Financieros", detalle: "" },
  "Calidad de producto": { clasificacion: "Reclamo", area: "Comercial", detalle: "Tipo de garantía" },
  "Cobro incorrecto": { clasificacion: "Producto", area: "Operaciones", detalle: "Formas de pago" },
  "Desarrollo inmobiliario": { clasificacion: "Asistencia y orientación", area: "Desarrollo inmobiliario", detalle: "Expansión" },
  "Sustentabilidad": { clasificacion: "Comentarios y sugerencias", area: "Sustentabilidad", detalle: "" },
  "Comentarios y sugerencias": { clasificacion: "Comentarios y sugerencias", area: "Tienda y otras áreas", detalle: "Producto" },
  "Denuncias": { clasificacion: "Reclamo", area: "Tienda y otras áreas", detalle: "Servicio" },
};

/* Campos extra que aparecen según la tipología elegida */
interface CampoAdicional {
  id: string;
  label: string;
  tipo: 'select' | 'texto' | 'textarea';
  opciones?: string[];
  placeholder?: string;
}

const CAMPOS_POR_TIPOLOGIA: Record<string, CampoAdicional[]> = {
  "Calidad de producto": [
    { id: "despensa", label: "¿Es Tu Despensa (1ª opción)?", tipo: "select", opciones: ["Sí", "No"] },
  ],
  "Cobro incorrecto": [
    { id: "tipoError", label: "Tipo de error", tipo: "select", opciones: ["Cobrador", "Sistema"] },
    { id: "descripcionProducto", label: "Descripción del producto", tipo: "texto", placeholder: "Ej. Coca cola 2l" },
    { id: "folio", label: "Folio de ticket de compra (20 dígitos)", tipo: "texto", placeholder: "Ej. 26000000000000000000" },
  ],
  "Desarrollo inmobiliario": [
    { id: "cp", label: "C.P.", tipo: "texto", placeholder: "Código postal" },
  ],
};

/* Campos comunes a todos los casos */
const CAMPOS_COMUNES: CampoAdicional[] = [
  { id: "descripcion", label: "Descripción del caso", tipo: "textarea", placeholder: "Detalles del incidente o relato del cliente..." },
  { id: "solucion", label: "Solución del caso", tipo: "textarea", placeholder: "Acción inmediata o solución brindada..." },
];

/* Todos los campos posibles (para lista de casos y estado inicial) */
const TODOS_LOS_CAMPOS = [
  ...Object.values(CAMPOS_POR_TIPOLOGIA).flat(),
  ...CAMPOS_COMUNES,
];

/* Notas de plazos por tipología */
const NOTAS: Record<string, string> = {
  "Calidad de producto": "Calidad de producto se cierra hoy · Tu Despensa: 15 días",
};

/* ============ PESTAÑAS (orden de izquierda a derecha) ============ */
interface TabItem {
  id: string;
  nombre: string;
  corto: string;
  tipologia: string;
  color: string;
}

const TABS: TabItem[] = [
  {
    id: "reembolsos",
    nombre: "Reembolsos",
    corto: "Reembolsos",
    tipologia: "Servicios Financieros",
    color: "#0E7C86",
  },
  {
    id: "cobro-incorrecto",
    nombre: "Cobro Incorrecto",
    corto: "Cobro Incorrecto",
    tipologia: "Cobro incorrecto",
    color: "#F0621B",
  },
  {
    id: "sustentabilidad",
    nombre: "Sustentabilidad",
    corto: "Sustentabilidad",
    tipologia: "Sustentabilidad",
    color: "#2E7D5B",
  },
  {
    id: "comentarios-sugerencias",
    nombre: "Comentarios y Sugerencias",
    corto: "Comentarios y Sugerencias",
    tipologia: "Comentarios y sugerencias",
    color: "#8A6D1F",
  },
  {
    id: "denuncias",
    nombre: "Denuncias",
    corto: "Denuncias",
    tipologia: "Denuncias",
    color: "#9D174D",
  },
  {
    id: "desarrollo-inmobiliario",
    nombre: "Desarrollo Inmobiliario",
    corto: "Des. Inmobiliario",
    tipologia: "Desarrollo inmobiliario",
    color: "#5B4B8A",
  },
];

const ESTATUS = [
  { id: "Abierto", color: "#F0621B" },
  { id: "Incompleto", color: "#C79A1B" },
  { id: "Cerrado", color: "#2E7D5B" },
];

const STORAGE_KEY = "chedraui-casos-v1";

interface FormState {
  estatus: string;
  tipologia: string;
  clasificacion: string;
  area: string;
  busqueda: string;
  detalle: string;
  subdetalle: string;
  motivo: string;
  productoCorrecto: string;
  [key: string]: string;
}

interface Caso extends FormState {
  uid: string;
  tabId: string;
  creado: string;
  actualizado?: string;
}

const getVacio = (tab: TabItem): FormState => {
  const sug = SUGERIDOS[tab.tipologia] || { clasificacion: "", area: "", detalle: "" };
  const base: FormState = {
    estatus: "Abierto",
    tipologia: tab.tipologia,
    clasificacion: sug.clasificacion,
    area: sug.area,
    busqueda: "",
    detalle: sug.detalle || "",
    subdetalle: "",
    motivo: "",
    productoCorrecto: "",
  };
  TODOS_LOS_CAMPOS.forEach((c) => {
    base[c.id] = "";
  });
  return base;
};

export default function App() {
  const [tabActiva, setTabActiva] = useState<string>(TABS[0].id);
  const [casos, setCasos] = useState<Caso[]>([]);
  const [form, setForm] = useState<FormState>(getVacio(TABS[0]));
  const [editando, setEditando] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [aviso, setAviso] = useState<string>("");
  const [avisoTipo, setAvisoTipo] = useState<'success' | 'error' | ''>('');
  const [filtro, setFiltro] = useState<string>("Todos");
  const [mostrarBusqueda, setMostrarBusqueda] = useState<boolean>(true);
  
  // Custom Dark Mode State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme_dark');
      return saved === 'true';
    }
    return false;
  });

  const tab = TABS.find((t) => t.id === tabActiva) || TABS[0];

  /* Campos visibles según la tipología elegida en el formulario */
  const camposActivos = [
    ...(CAMPOS_POR_TIPOLOGIA[form.tipologia] || []),
    ...CAMPOS_COMUNES,
  ];

  // Helper to interact with potential multi-environment storage safely
  const getStoredData = async (): Promise<string | null> => {
    try {
      const g = window as any;
      if (g.storage && typeof g.storage.get === 'function') {
        const r = await g.storage.get(STORAGE_KEY);
        if (r && typeof r === 'object') return r.value;
        if (r) return r;
      }
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return localStorage.getItem(STORAGE_KEY);
    }
  };

  const setStoredData = async (value: string): Promise<void> => {
    try {
      const g = window as any;
      if (g.storage && typeof g.storage.set === 'function') {
        await g.storage.set(STORAGE_KEY, value);
        return;
      }
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      localStorage.setItem(STORAGE_KEY, value);
    }
  };

  /* ---- cargar casos guardados ---- */
  useEffect(() => {
    (async () => {
      try {
        const raw = await getStoredData();
        if (raw) {
          setCasos(JSON.parse(raw));
        } else {
          // Add mock demo cases initially so it doesn't look empty
          const demoCase1: Caso = {
            uid: "demo-1",
            tabId: "reembolsos",
            creado: new Date(Date.now() - 3600000).toISOString(),
            estatus: "Abierto",
            tipologia: "Servicios Financieros",
            clasificacion: "Reembolsos",
            area: "Servicios Financieros",
            busqueda: "Coca cola 2l",
            detalle: "Formas de pago",
            subdetalle: "Tienda",
            motivo: "Otro",
            productoCorrecto: "No",
            descripcion: "Cliente reporta que el precio cobrado por la Coca cola de 2 litros difiere del anunciado en pasillo.",
            solucion: "Se valida la diferencia con caja y se procede con la aclaración respectiva.",
            tipoError: "Sistema",
            folio: "2607"
          };
          const demoCase2: Caso = {
            uid: "demo-2",
            tabId: "cobro-incorrecto",
            creado: new Date(Date.now() - 1800000).toISOString(),
            estatus: "Abierto",
            tipologia: "Cobro incorrecto",
            clasificacion: "Producto",
            area: "Operaciones",
            busqueda: "Coca cola 2l",
            detalle: "Formas de pago",
            subdetalle: "Tienda",
            motivo: "Cobro incorrecto",
            productoCorrecto: "No",
            descripcionProducto: "Coca Cola 2 litros",
            descripcion: "Se detectó cobro duplicado en caja de autoservicio para el producto Coca Cola de 2 litros.",
            solucion: "Se realiza la reversa del cobro duplicado mediante terminal bancaria autorizada.",
            tipoError: "Sistema",
            folio: "26010203040506070809"
          };
          const demoCase3: Caso = {
            uid: "demo-3",
            tabId: "denuncias",
            creado: new Date(Date.now() - 900000).toISOString(),
            estatus: "Abierto",
            tipologia: "Denuncias",
            clasificacion: "Reclamo",
            area: "Tienda y otras áreas",
            busqueda: "Servicio al cliente",
            detalle: "Servicio",
            subdetalle: "Tienda",
            motivo: "Otro",
            productoCorrecto: "No",
            descripcion: "Denuncia de mal servicio en área de paquetería de la sucursal.",
            solucion: "Se escala al gerente de tienda para amonestar y reentrenar al personal involucrado.",
            tipoError: "",
            folio: ""
          };
          setCasos([demoCase1, demoCase2, demoCase3]);
        }
      } catch (e) {
        /* sin datos guardados aún */
      }
      setCargando(false);
    })();
  }, []);

  // Save Theme preference
  useEffect(() => {
    localStorage.setItem('theme_dark', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const triggerAviso = (msg: string, tipo: 'success' | 'error' = 'success') => {
    setAviso(msg);
    setAvisoTipo(tipo);
    setTimeout(() => {
      setAviso("");
      setAvisoTipo("");
    }, 4000);
  };

  const guardarStorage = async (lista: Caso[]) => {
    try {
      await setStoredData(JSON.stringify(lista));
    } catch (e) {
      triggerAviso("No se pudo guardar en el almacenamiento local.", "error");
    }
  };

  const cambiarTab = (id: string) => {
    setTabActiva(id);
    const targetTab = TABS.find((t) => t.id === id) || TABS[0];
    setForm(getVacio(targetTab));
    setEditando(null);
    setFiltro("Todos");
    setMostrarBusqueda(true);
  };

  const setCampo = (id: string, valor: string) => {
    setForm((f) => ({ ...f, [id]: valor }));
  };

  /* Al cambiar Tipología, sugiere Clasificación, Área y Detalle */
  const cambiarTipologia = (t: string) => {
    const sug = SUGERIDOS[t] || { clasificacion: "", area: "", detalle: "" };
    setForm((f) => ({
      ...f,
      tipologia: t,
      clasificacion: sug.clasificacion || f.clasificacion,
      area: sug.area || f.area,
      detalle: sug.detalle ?? f.detalle,
    }));
  };

  const guardarCaso = async () => {
    const camposRevisar = [
      "busqueda", "detalle", "subdetalle", "motivo", "productoCorrecto",
      ...camposActivos.map((c) => c.id),
    ];
    const tieneAlgo = camposRevisar.some((id) => (form[id] || "").trim() !== "");
    if (!tieneAlgo) {
      triggerAviso("Llena al menos un campo para guardar el caso.", "error");
      return;
    }

    let lista: Caso[];
    if (editando) {
      lista = casos.map((c) =>
        c.uid === editando ? { ...c, ...form, actualizado: new Date().toISOString() } : c
      );
      triggerAviso("Caso actualizado correctamente.");
    } else {
      const nuevo: Caso = {
        uid: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        tabId: tab.id,
        creado: new Date().toISOString(),
        ...form,
      };
      lista = [nuevo, ...casos];
      triggerAviso("Caso guardado y registrado exitosamente.");
    }

    setCasos(lista);
    await guardarStorage(lista);
    setForm(getVacio(tab));
    setEditando(null);
  };

  const editarCaso = (c: Caso) => {
    const f = getVacio(tab);
    Object.keys(f).forEach((k) => {
      f[k] = c[k] ?? "";
    });
    setForm(f);
    setEditando(c.uid);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const borrarCaso = async (uid: string) => {
    const lista = casos.filter((c) => c.uid !== uid);
    setCasos(lista);
    await guardarStorage(lista);
    if (editando === uid) {
      setEditando(null);
      setForm(getVacio(tab));
    }
    triggerAviso("Caso eliminado correctamente.");
  };

  const cambiarEstatus = async (uid: string, estatus: string) => {
    const lista = casos.map((c) => (c.uid === uid ? { ...c, estatus } : c));
    setCasos(lista);
    await guardarStorage(lista);
    triggerAviso(`Estatus cambiado a "${estatus}"`);
  };

  const casosTab = casos.filter(
    (c) => c.tabId === tab.id && (filtro === "Todos" || c.estatus === filtro)
  );
  const totalTab = casos.filter((c) => c.tabId === tab.id).length;

  const getFechaFormateada = (iso: string) => {
    return new Date(iso).toLocaleString("es-MX", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`min-h-screen font-barlow transition-colors duration-300 ${
      darkMode ? 'bg-[#0b0f17] text-slate-100' : 'bg-[#FAF8F5] text-[#1B2430]'
    }`}>
      
      {/* ---------- Encabezado ---------- */}
      <header className={`py-4 px-6 border-b transition-colors duration-300 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#1b2330] border-[#d6cfc2] text-white'
      }`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold ${
              darkMode ? 'bg-[#F0621B] text-white' : 'bg-[#FAF8F5] text-[#1B2430]'
            }`}>
              C
            </div>
            <div>
              <h1 className="text-xl font-bold font-condensed tracking-wide uppercase">
                Registro de Casos
              </h1>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-300'}`}>
                Capacitación · Atención a clientes Chedraui
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle Button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-full transition-all duration-200 cursor-pointer border ${
                darkMode 
                  ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' 
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
              title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            <div className="hidden sm:block text-right">
              <span className="block text-[11px] font-mono tracking-widest uppercase opacity-75">
                OPERADOR DE TURNO
              </span>
              <span className="text-xs font-semibold text-orange-500">
                Christian Rojas
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- Pestañas tipo libreta ---------- */}
      <nav className="max-w-4xl mx-auto px-4 mt-6" aria-label="Tipos de caso">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {TABS.map((t) => {
            const activa = t.id === tabActiva;
            const n = casos.filter((c) => c.tabId === t.id).length;
            return (
              <button
                key={t.id}
                onClick={() => cambiarTab(t.id)}
                className={`px-4 py-3 text-sm font-semibold rounded-t-xl font-condensed tracking-wide uppercase transition-all duration-200 cursor-pointer flex items-center gap-2 border-t-4 ${
                  activa
                    ? darkMode
                      ? 'bg-slate-900 text-white shadow-md scale-102 border-slate-900'
                      : 'bg-white text-slate-900 shadow-xs scale-102 border-white'
                    : darkMode
                      ? 'bg-slate-800/40 text-slate-400 border-transparent hover:bg-slate-800/80 hover:text-slate-200'
                      : 'bg-slate-200/60 text-slate-600 border-transparent hover:bg-slate-200 hover:text-slate-800'
                }`}
                style={{ borderTopColor: t.color }}
              >
                <span>{t.corto}</span>
                {n > 0 && (
                  <span 
                    className="text-[10px] font-extrabold text-white px-2 py-0.5 rounded-full shadow-xs"
                    style={{ backgroundColor: t.color }}
                  >
                    {n}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ---------- Main Content Area ---------- */}
      <main className="max-w-4xl mx-auto px-4 pb-20 flex flex-col gap-6">

        {/* Form Container Card */}
        <section className={`rounded-b-2xl rounded-tr-2xl p-6 border shadow-sm transition-all duration-300 ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#D8D2C4]'
        }`}
        style={{ borderTop: `6px solid ${tab.color}` }}>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-dashed border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-extrabold font-condensed tracking-wide uppercase flex items-center gap-2">
                <span className="w-2.5 h-5 rounded-xs" style={{ backgroundColor: tab.color }}></span>
                {editando ? "Editar caso" : `Nuevo caso · ${tab.nombre}`}
              </h2>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Rellena la información correspondiente a {tab.tipologia}
              </p>
            </div>
            
            {NOTAS[form.tipologia] && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{NOTAS[form.tipologia]}</span>
              </div>
            )}
          </div>

          {/* CLASIFICA EL CASO: 3 Selects */}
          <div className={`p-4 rounded-xl border mb-6 transition-colors duration-200 ${
            darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-[#F3EEE3] border-[#C9C3B5]'
          }`}>
            <span className={`block text-xs font-extrabold uppercase tracking-widest mb-3 ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Clasificación del caso
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tipología */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Tipología</span>
                <div className="relative">
                  <select
                    value={form.tipologia}
                    onChange={(e) => cambiarTipologia(e.target.value)}
                    className={`w-full rounded-lg pl-3 pr-10 py-2 text-sm font-semibold cursor-pointer appearance-none border transition-colors ${
                      darkMode 
                        ? 'bg-slate-900 border-slate-800 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500' 
                        : 'bg-white border-[#D8D2C4] text-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                    }`}
                  >
                    {TIPOLOGIAS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Clasificación */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Clasificación</span>
                <div className="relative">
                  <select
                    value={form.clasificacion}
                    onChange={(e) => setCampo("clasificacion", e.target.value)}
                    className={`w-full rounded-lg pl-3 pr-10 py-2 text-sm font-semibold cursor-pointer appearance-none border transition-colors ${
                      darkMode 
                        ? 'bg-slate-900 border-slate-800 text-white focus:border-orange-500' 
                        : 'bg-white border-[#D8D2C4] text-slate-800 focus:border-orange-500'
                    }`}
                  >
                    <option value="">— Selecciona —</option>
                    {CLASIFICACIONES.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Área */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Área</span>
                <div className="relative">
                  <select
                    value={form.area}
                    onChange={(e) => setCampo("area", e.target.value)}
                    className={`w-full rounded-lg pl-3 pr-10 py-2 text-sm font-semibold cursor-pointer appearance-none border transition-colors ${
                      darkMode 
                        ? 'bg-slate-900 border-slate-800 text-white focus:border-orange-500' 
                        : 'bg-white border-[#D8D2C4] text-slate-800 focus:border-orange-500'
                    }`}
                  >
                    <option value="">— Selecciona —</option>
                    {AREAS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <p className={`text-[11px] mt-2 italic flex items-center gap-1 ${
              darkMode ? 'text-amber-500/80' : 'text-slate-500'
            }`}>
              <Sparkles className="w-3 h-3 shrink-0" />
              Al elegir la tipología se sugieren la clasificación y el área, pero puedes cambiarlas.
            </p>
          </div>

          {/* ---------- DESCRIPCIÓN DE BÚSQUEDA ---------- */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setMostrarBusqueda(!mostrarBusqueda)}
              className={`w-full rounded-xl px-4 py-3 font-semibold text-sm flex items-center justify-between transition-all border cursor-pointer ${
                mostrarBusqueda
                  ? darkMode
                    ? 'bg-slate-950 border-slate-800 text-white'
                    : 'bg-[#1b2330] border-[#1b2330] text-white'
                  : darkMode
                    ? 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    : 'bg-[#F3EEE3] border-[#C9C3B5] text-slate-800 hover:bg-slate-200/60'
              }`}
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-orange-500" />
                <span>🔎 Descripción de búsqueda</span>
              </span>
              {mostrarBusqueda ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {mostrarBusqueda && (
              <div className={`p-4 rounded-b-xl border-x border-b transition-colors duration-200 flex flex-col gap-4 ${
                darkMode ? 'bg-slate-950/30 border-slate-800' : 'bg-white border-[#D8D2C4]'
              }`}>
                {/* Search Input Box */}
                <div className="relative">
                  <input
                    type="text"
                    value={form.busqueda}
                    placeholder="Describe el producto o caso para buscarlo (ej: Coca cola 2l)…"
                    onChange={(e) => setCampo("busqueda", e.target.value)}
                    className={`w-full rounded-lg pl-3 pr-10 py-2.5 text-sm font-medium border focus:ring-1 focus:ring-orange-500 focus:outline-hidden ${
                      darkMode
                        ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                        : 'bg-white border-[#D8D2C4] text-slate-800 placeholder-slate-400 shadow-inner'
                    }`}
                  />
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>

                {/* Live matches/no matches information */}
                {form.busqueda.trim().length >= 3 ? (() => {
                  const query = form.busqueda.trim().toLowerCase();
                  const coincidencias = casos.filter((c) =>
                    Object.values(c).some(
                      (v) => typeof v === "string" && v.toLowerCase().includes(query)
                    )
                  );
                  return coincidencias.length > 0 ? (
                    <div className={`p-3 rounded-lg text-xs flex flex-col gap-2 border ${
                      darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-[#F3EEE3] border-[#C9C3B5]'
                    }`}>
                      <span className="font-extrabold uppercase tracking-wider text-orange-500">
                        Casos guardados que coinciden ({coincidencias.length})
                      </span>
                      <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-36 overflow-y-auto">
                        {coincidencias.slice(0, 5).map((c) => (
                          <div key={c.uid} className="py-1.5 flex justify-between items-center text-slate-400 hover:text-slate-200 transition-colors">
                            <span>
                              <strong className="text-slate-700 dark:text-slate-200">{c.tipologia}</strong> · {c.clasificacion} · {c.area}
                              {c.busqueda && <span className="italic block text-[10px]">"{c.busqueda}"</span>}
                            </span>
                            <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full uppercase">
                              {c.estatus}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">
                      Sin coincidencias en casos guardados. La descripción se guardará con este caso.
                    </p>
                  );
                })() : (
                  <p className="text-xs text-gray-400 italic">
                    Escribe al menos 3 caracteres para buscar coincidencias en el historial.
                  </p>
                )}

                {/* ⚡ CRITICAL REPOSITION: "TIPO DE ERROR" & FIELDS BELOW COCA COLA SEARCH ⚡ */}
                {/* Dynamically display additionals like "tipoError", "folio", "despensa" or "cp" right inside this box below the Search box */}
                {camposActivos.filter(c => c.id !== 'descripcion' && c.id !== 'solucion').length > 0 && (
                  <div className={`p-4 rounded-xl border mt-2 transition-all ${
                    darkMode ? 'bg-slate-900/40 border-slate-800/80' : 'bg-[#FAF8F5] border-[#E4DED5]'
                  }`}>
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="inline-block w-1.5 h-3.5 bg-orange-500 rounded-xs"></span>
                      <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Campos específicos de la Tipología ({form.tipologia})
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {camposActivos.filter(c => c.id !== 'descripcion' && c.id !== 'solucion').map((c) => (
                        <div key={c.id} className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            {c.label}
                          </label>

                          {c.tipo === 'select' ? (
                            <div className="relative">
                              <select
                                value={form[c.id] || ""}
                                onChange={(e) => setCampo(c.id, e.target.value)}
                                className={`w-full rounded-lg pl-3 pr-10 py-2 text-sm font-semibold cursor-pointer appearance-none border transition-colors ${
                                  darkMode
                                    ? 'bg-slate-900 border-slate-800 text-white focus:border-orange-500'
                                    : 'bg-white border-[#D8D2C4] text-slate-800 focus:border-orange-500'
                                }`}
                              >
                                <option value="">— Selecciona —</option>
                                {c.opciones?.map((op) => (
                                  <option key={op} value={op}>{op}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                          ) : (
                            <div className="flex flex-col w-full">
                              <input
                                type="text"
                                value={form[c.id] || ""}
                                placeholder={c.placeholder || ""}
                                onChange={(e) => setCampo(c.id, e.target.value)}
                                className={`w-full rounded-lg px-3 py-2 text-sm font-medium border focus:ring-1 focus:ring-orange-500 focus:outline-hidden ${
                                  darkMode
                                    ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-600'
                                    : 'bg-white border-[#D8D2C4] text-slate-800 placeholder-slate-400 shadow-inner'
                                }`}
                              />
                              {c.id === 'folio' && (
                                <div className="mt-1 text-xs">
                                  {!form.folio ? (
                                    <span className="text-slate-400 dark:text-slate-500">Debe comenzar con 26 y tener exactamente 20 dígitos.</span>
                                  ) : form.folio.startsWith('26') && form.folio.length === 20 && /^\d+$/.test(form.folio) ? (
                                    <span className="text-emerald-500 font-bold">✓ Folio válido (20 dígitos comenzando con 26)</span>
                                  ) : (
                                    <span className="text-rose-500 font-bold">✗ Debe comenzar con 26 y tener exactamente 20 dígitos (actual: {form.folio.length}/20)</span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* DETALLES DEL CASO: Detalle, Subdetalle, Motivo */}
          <div className={`p-4 rounded-xl border mb-6 transition-colors duration-200 ${
            darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-[#F3EEE3] border-[#C9C3B5]'
          }`}>
            <span className={`block text-xs font-extrabold uppercase tracking-widest mb-3 ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Detalle del caso
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Detalle */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Detalle</span>
                <div className="relative">
                  <select
                    value={form.detalle}
                    onChange={(e) => setCampo("detalle", e.target.value)}
                    className={`w-full rounded-lg pl-3 pr-10 py-2 text-sm font-semibold cursor-pointer appearance-none border transition-colors ${
                      darkMode 
                        ? 'bg-slate-900 border-slate-800 text-white focus:border-orange-500' 
                        : 'bg-white border-[#D8D2C4] text-slate-800 focus:border-orange-500'
                    }`}
                  >
                    <option value="">— Selecciona —</option>
                    {DETALLES.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Subdetalle */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Subdetalle</span>
                <div className="relative">
                  <select
                    value={form.subdetalle}
                    onChange={(e) => setCampo("subdetalle", e.target.value)}
                    className={`w-full rounded-lg pl-3 pr-10 py-2 text-sm font-semibold cursor-pointer appearance-none border transition-colors ${
                      darkMode 
                        ? 'bg-slate-900 border-slate-800 text-white focus:border-orange-500' 
                        : 'bg-white border-[#D8D2C4] text-slate-800 focus:border-orange-500'
                    }`}
                  >
                    <option value="">— Selecciona —</option>
                    {SUBDETALLES.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Motivo */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Motivo</span>
                <div className="relative">
                  <select
                    value={form.motivo}
                    onChange={(e) => setCampo("motivo", e.target.value)}
                    className={`w-full rounded-lg pl-3 pr-10 py-2 text-sm font-semibold cursor-pointer appearance-none border transition-colors ${
                      darkMode 
                        ? 'bg-slate-900 border-slate-800 text-white focus:border-orange-500' 
                        : 'bg-white border-[#D8D2C4] text-slate-800 focus:border-orange-500'
                    }`}
                  >
                    <option value="">— Selecciona —</option>
                    {MOTIVOS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* PRODUCTO CORRECTO BUTTONS */}
          <div className={`p-4 rounded-xl border mb-6 transition-colors duration-200 ${
            darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-[#F3EEE3] border-[#C9C3B5]'
          }`}>
            <span className={`block text-xs font-extrabold uppercase tracking-widest mb-3 ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              ¿Producto correcto?
            </span>

            <div className="flex gap-4">
              {["Sí", "No"].map((op) => (
                <button
                  key={op}
                  type="button"
                  onClick={() => setCampo("productoCorrecto", form.productoCorrecto === op ? "" : op)}
                  className={`w-28 py-2 rounded-xl text-xs font-extrabold tracking-wider transition-all duration-200 cursor-pointer border ${
                    form.productoCorrecto === op
                      ? op === "Sí"
                        ? "bg-[#2E7D5B] border-[#2E7D5B] text-white ring-2 ring-emerald-500/20"
                        : "bg-[#B3261E] border-[#B3261E] text-white ring-2 ring-red-500/20"
                      : darkMode
                        ? "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        : "bg-white border-[#D8D2C4] text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          {/* TEXTAREAS: Descripción & Solución */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            {camposActivos.filter(c => c.id === 'descripcion' || c.id === 'solucion').map((c) => (
              <div key={c.id} className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {c.label}
                </label>
                <textarea
                  rows={3}
                  value={form[c.id] || ""}
                  placeholder={c.placeholder || ""}
                  onChange={(e) => setCampo(c.id, e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 text-sm font-medium border focus:ring-1 focus:ring-orange-500 focus:outline-hidden resize-y transition-colors ${
                    darkMode
                      ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-600'
                      : 'bg-white border-[#D8D2C4] text-slate-800 placeholder-slate-400 shadow-inner'
                  }`}
                />
              </div>
            ))}

            {/* ESTATUS OF CURRENT FORM */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Estatus del Caso</span>
              <div className="flex gap-2 flex-wrap">
                {ESTATUS.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setCampo("estatus", e.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-extrabold tracking-wider border transition-all cursor-pointer ${
                      form.estatus === e.id
                        ? 'text-white'
                        : darkMode
                          ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                          : 'bg-white border-[#D8D2C4] text-slate-600 hover:bg-slate-50'
                    }`}
                    style={{
                      backgroundColor: form.estatus === e.id ? e.color : undefined,
                      borderColor: form.estatus === e.id ? e.color : undefined,
                    }}
                  >
                    {e.id}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS & AVISOS */}
          <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={guardarCaso}
              className={`px-6 py-3 rounded-xl font-bold font-condensed tracking-wide uppercase text-sm text-white shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2`}
              style={{ backgroundColor: tab.color }}
            >
              <Save className="w-4 h-4" />
              <span>{editando ? "Actualizar caso" : "Guardar caso"}</span>
            </button>

            {editando && (
              <button
                onClick={() => {
                  setEditando(null);
                  setForm(getVacio(tab));
                }}
                className={`px-4 py-3 rounded-xl font-bold font-condensed tracking-wide uppercase text-sm border cursor-pointer ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                    : 'bg-slate-100 border-[#D8D2C4] text-slate-600 hover:bg-slate-200'
                }`}
              >
                Cancelar
              </button>
            )}

            {aviso && (
              <div className={`ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold animate-fade-in ${
                avisoTipo === 'error'
                  ? 'bg-red-500/10 text-red-500'
                  : 'bg-emerald-500/10 text-emerald-500'
              }`}>
                {avisoTipo === 'error' ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>{aviso}</span>
              </div>
            )}
          </div>

        </section>

        {/* ---------- LISTA DE CASOS REGISTRADOS ---------- */}
        <section className={`rounded-2xl p-6 border shadow-sm transition-all duration-300 ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#D8D2C4]'
        }`}>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-extrabold font-condensed tracking-wide uppercase flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-orange-500" />
                <span>Casos registrados</span>
                <span className={`text-sm font-medium normal-case ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  ({totalTab})
                </span>
              </h3>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Visualizando registros de la categoría activa
              </p>
            </div>

            {/* FILTROS ESTATUS */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {["Todos", ...ESTATUS.map((e) => e.id)].map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltro(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase border transition-all cursor-pointer ${
                    filtro === f
                      ? darkMode
                        ? 'bg-white border-white text-slate-900 font-extrabold'
                        : 'bg-[#1b2330] border-[#1b2330] text-white font-extrabold'
                      : darkMode
                        ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                        : 'bg-slate-100 border-[#D8D2C4] text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {cargando ? (
            <div className="text-center py-10">
              <span className="inline-block w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Cargando casos guardados…</p>
            </div>
          ) : casosTab.length === 0 ? (
            <div className={`text-center py-12 px-6 rounded-xl border border-dashed flex flex-col items-center gap-3 ${
              darkMode ? 'bg-slate-950/20 border-slate-800' : 'bg-[#FAF8F5] border-[#D8D2C4]'
            }`}>
              <FileText className="w-8 h-8 text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                Aún no hay casos aquí con el filtro seleccionado.
              </p>
              <p className="text-xs text-slate-400/80">
                Llena el formulario superior y presiona "Guardar caso" para agregar uno nuevo.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {casosTab.map((c) => {
                const e = ESTATUS.find((x) => x.id === c.estatus) || ESTATUS[0];
                return (
                  <li 
                    key={c.uid} 
                    className={`p-5 rounded-xl border transition-all duration-200 hover:shadow-xs relative ${
                      darkMode 
                        ? 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-950/70' 
                        : 'bg-[#FAF8F5] border-[#E4DED5] hover:bg-amber-50/10'
                    }`}
                  >
                    {/* Header Item */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-[10px] font-extrabold text-white px-2.5 py-0.5 rounded-full uppercase"
                          style={{ backgroundColor: e.color }}
                        >
                          {c.estatus}
                        </span>
                        
                        <span className={`text-[11px] font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {getFechaFormateada(c.creado)}
                        </span>
                      </div>

                      {/* Edit / Delete actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => editarCaso(c)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            darkMode 
                              ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800' 
                              : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                          }`}
                          title="Editar caso"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <button
                          onClick={() => borrarCaso(c.uid)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            darkMode 
                              ? 'border-slate-800 text-red-400 hover:text-red-300 hover:bg-red-500/10' 
                              : 'border-slate-200 text-red-500 hover:text-red-700 hover:bg-red-50'
                          }`}
                          title="Eliminar caso"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-extrabold uppercase tracking-wide font-condensed">
                      {c.tipologia} · <span className="text-orange-500">{c.clasificacion}</span> · <span className="opacity-75">{c.area}</span>
                    </h4>

                    {/* Metadata display */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                      {(c.busqueda || "").trim() && (
                        <div className="flex gap-1">
                          <span className="font-bold opacity-75">Búsqueda:</span>
                          <span className="italic font-semibold text-orange-500">"{c.busqueda}"</span>
                        </div>
                      )}

                      {[
                        ["Detalle", c.detalle],
                        ["Subdetalle", c.subdetalle],
                        ["Motivo", c.motivo],
                        ["Producto correcto", c.productoCorrecto],
                      ].map(([lab, val]) =>
                        (val || "").trim() ? (
                          <div key={lab} className="flex gap-1">
                            <span className="font-bold opacity-75">{lab}:</span>
                            <span>{val}</span>
                          </div>
                        ) : null
                      )}

                      {/* Display custom tipology fields if they were defined */}
                      {TODOS_LOS_CAMPOS.map((cc) =>
                        (c[cc.id] || "").trim() ? (
                          <div key={cc.id} className="flex gap-1 col-span-1 sm:col-span-2">
                            <span className="font-bold opacity-75">{cc.label}:</span>
                            <span className="font-medium text-slate-800 dark:text-slate-300">{c[cc.id]}</span>
                          </div>
                        ) : null
                      )}
                    </div>

                    {/* Inline Status change picker */}
                    <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold opacity-75 uppercase">Cambiar Estatus:</span>
                        <div className="relative">
                          <select
                            value={c.estatus}
                            onChange={(ev) => cambiarEstatus(c.uid, ev.target.value)}
                            className={`rounded-md px-2 py-1 text-xs font-bold appearance-none cursor-pointer border pr-6 ${
                              darkMode
                                ? 'bg-slate-900 border-slate-800 text-slate-300'
                                : 'bg-white border-[#D8D2C4] text-slate-700'
                            }`}
                          >
                            {ESTATUS.map((x) => (
                              <option key={x.id} value={x.id}>{x.id}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {c.actualizado && (
                        <span className="text-[10px] italic opacity-60">
                          Editado: {getFechaFormateada(c.actualizado)}
                        </span>
                      )}
                    </div>

                  </li>
                );
              })}
            </ul>
          )}

        </section>

      </main>

      <footer className={`py-6 text-center text-xs border-t transition-colors duration-300 ${
        darkMode ? 'bg-slate-900/50 border-slate-800 text-slate-500' : 'bg-[#FAF8F5] border-[#E4DED5] text-slate-400'
      }`}>
        <p>Los casos se guardan automáticamente en este dispositivo.</p>
        <p className="mt-1 font-mono opacity-75">Sesión actual: LocalStorage activa · Chedraui 2026</p>
        <p className="mt-2 text-orange-500 font-bold tracking-wide">© 2026 Christian-Rojas todos los derechos reservados</p>
      </footer>
    </div>
  );
}
