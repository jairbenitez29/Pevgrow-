// Diccionario de sinónimos para el dominio cannabis/grow
// Cada clave mapea a un array de términos equivalentes

export const SYNONYMS: Record<string, string[]> = {
  // Fertilizantes y nutrientes
  'fertilizante': ['abono', 'nutriente', 'nutrientes', 'fertilizantes', 'fertilizer'],
  'abono': ['fertilizante', 'nutriente', 'nutrientes', 'fertilizantes'],
  'nutriente': ['fertilizante', 'abono', 'nutrientes', 'fertilizantes'],

  // Sustratos
  'sustrato': ['tierra', 'coco', 'fibra de coco', 'medio de cultivo', 'substrate'],
  'tierra': ['sustrato', 'soil', 'medio de cultivo'],
  'coco': ['fibra de coco', 'sustrato de coco', 'coconut'],

  // Semillas
  'semilla': ['seed', 'semillas', 'seeds', 'genetica', 'genética'],
  'semillas': ['seeds', 'semilla', 'genetica', 'genética'],
  'feminizada': ['feminizadas', 'fem', 'feminized'],
  'autofloreciente': ['autoflorecientes', 'auto', 'autoflower', 'automatica', 'automática'],
  'regular': ['regulares', 'reg'],

  // Iluminación
  'led': ['iluminacion', 'iluminación', 'luz', 'lampara', 'lámpara', 'foco', 'panel led'],
  'iluminacion': ['iluminación', 'led', 'luz', 'lampara', 'lámpara', 'lighting'],
  'luz': ['iluminacion', 'iluminación', 'led', 'lampara', 'lámpara'],
  'lampara': ['lámpara', 'luz', 'led', 'foco', 'bombilla'],
  'hps': ['sodio', 'alta presion', 'high pressure sodium'],
  'lec': ['cmh', 'ceramic metal halide'],

  // Macetas y contenedores
  'maceta': ['tiesto', 'pot', 'contenedor', 'macetas'],
  'tiesto': ['maceta', 'pot', 'contenedor'],
  'smartpot': ['maceta textil', 'air pot', 'maceta de tela'],

  // Ventilación
  'extractor': ['ventilador', 'fan', 'ventilacion', 'ventilación'],
  'ventilador': ['extractor', 'fan', 'ventilacion', 'ventilación'],
  'filtro': ['filtro de carbon', 'carbon', 'carbón', 'antiolor'],
  'carbon': ['carbón', 'filtro', 'filtro de carbon'],

  // Armarios y espacios
  'armario': ['carpa', 'grow tent', 'tent', 'indoor', 'box'],
  'carpa': ['armario', 'grow tent', 'tent', 'indoor'],
  'indoor': ['interior', 'armario', 'carpa'],
  'outdoor': ['exterior', 'guerrilla'],

  // Riego
  'riego': ['irrigacion', 'irrigación', 'watering', 'sistema de riego'],
  'goteo': ['drip', 'riego por goteo', 'dripper'],
  'hidroponia': ['hidroponía', 'hidro', 'hydro', 'hydroponics'],
  'aeroponia': ['aeroponía', 'aero'],

  // Control de clima
  'humidificador': ['humidifier', 'humedad'],
  'deshumidificador': ['dehumidifier'],
  'termometro': ['termómetro', 'thermometer', 'temperatura'],
  'higrometro': ['higrómetro', 'hygrometer', 'humedad'],

  // Plagas y enfermedades
  'insecticida': ['pesticida', 'plaguicida', 'anti plagas'],
  'fungicida': ['antihongos', 'anti hongos'],
  'neem': ['aceite de neem', 'neem oil'],
  'preventivo': ['prevencion', 'prevención'],

  // CBD y derivados
  'cbd': ['cannabidiol', 'cannabis', 'hemp', 'cañamo', 'cáñamo'],
  'aceite': ['oil', 'extracto', 'tintura'],
  'crema': ['pomada', 'bálsamo', 'cream', 'topico', 'tópico'],
  'flores': ['cogollos', 'buds', 'flor'],

  // Accesorios para fumar
  'grinder': ['triturador', 'molinillo', 'grinders'],
  'papel': ['papers', 'papel de liar', 'rolling papers'],
  'bong': ['pipa de agua', 'water pipe', 'bongs'],
  'pipa': ['pipe', 'pipas'],
  'vaporizador': ['vaper', 'vaporizer', 'vape'],

  // Marcas comunes (para mejorar búsqueda)
  'biobizz': ['bio bizz', 'biobiz'],
  'canna': ['cana'],
  'advanced nutrients': ['advanced', 'an nutrients'],
  'plagron': ['plagon'],
  'atami': ['atamy'],
};

// Función para expandir un término con sus sinónimos
export function expandWithSynonyms(term: string): string[] {
  const normalizedTerm = term.toLowerCase().trim();
  const expanded: Set<string> = new Set([normalizedTerm]);

  // Buscar sinónimos directos
  if (SYNONYMS[normalizedTerm]) {
    SYNONYMS[normalizedTerm].forEach(syn => expanded.add(syn));
  }

  // Buscar si el término es sinónimo de otra palabra
  for (const [key, synonyms] of Object.entries(SYNONYMS)) {
    if (synonyms.includes(normalizedTerm)) {
      expanded.add(key);
      synonyms.forEach(syn => expanded.add(syn));
    }
  }

  return Array.from(expanded);
}

// Función para obtener el término principal de un sinónimo
export function getPrimaryTerm(term: string): string {
  const normalizedTerm = term.toLowerCase().trim();

  // Si es una clave principal, devolverla
  if (SYNONYMS[normalizedTerm]) {
    return normalizedTerm;
  }

  // Buscar en los valores
  for (const [key, synonyms] of Object.entries(SYNONYMS)) {
    if (synonyms.includes(normalizedTerm)) {
      return key;
    }
  }

  return normalizedTerm;
}

// Lista de términos populares para sugerencias rápidas
export const POPULAR_TERMS = [
  'semillas feminizadas',
  'semillas autoflorecientes',
  'fertilizante',
  'led',
  'armario de cultivo',
  'macetas',
  'sustrato',
  'cbd',
  'grinder',
  'vaporizador',
];
