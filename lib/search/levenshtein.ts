// Algoritmo de distancia de Levenshtein para corrección ortográfica

/**
 * Calcula la distancia de Levenshtein entre dos strings
 * Menor distancia = más similares
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 0;
  if (s1.length === 0) return s2.length;
  if (s2.length === 0) return s1.length;

  const matrix: number[][] = [];

  // Inicializar la primera columna
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }

  // Inicializar la primera fila
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }

  // Llenar el resto de la matriz
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // Eliminación
        matrix[i][j - 1] + 1,      // Inserción
        matrix[i - 1][j - 1] + cost // Sustitución
      );
    }
  }

  return matrix[s1.length][s2.length];
}

/**
 * Calcula la similitud entre dos strings (0 a 1)
 * 1 = idénticos, 0 = completamente diferentes
 */
export function similarity(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / maxLen;
}

/**
 * Encuentra las palabras más similares a un término dado
 */
export function findSimilarWords(
  term: string,
  dictionary: string[],
  options: {
    maxDistance?: number;
    maxResults?: number;
    minSimilarity?: number;
  } = {}
): Array<{ word: string; distance: number; similarity: number }> {
  const {
    maxDistance = 3,
    maxResults = 5,
    minSimilarity = 0.5
  } = options;

  const results: Array<{ word: string; distance: number; similarity: number }> = [];

  for (const word of dictionary) {
    const distance = levenshteinDistance(term, word);
    const sim = similarity(term, word);

    if (distance <= maxDistance && sim >= minSimilarity) {
      results.push({ word, distance, similarity: sim });
    }
  }

  // Ordenar por distancia (menor primero) y luego por similitud (mayor primero)
  results.sort((a, b) => {
    if (a.distance !== b.distance) {
      return a.distance - b.distance;
    }
    return b.similarity - a.similarity;
  });

  return results.slice(0, maxResults);
}

/**
 * Verifica si un término podría ser un error ortográfico
 * y sugiere correcciones
 */
export function suggestCorrections(
  term: string,
  dictionary: string[]
): string | null {
  // Si el término está en el diccionario, no hay corrección necesaria
  const normalizedTerm = term.toLowerCase().trim();
  if (dictionary.some(word => word.toLowerCase() === normalizedTerm)) {
    return null;
  }

  // Encontrar palabras similares
  const similar = findSimilarWords(term, dictionary, {
    maxDistance: 2,
    maxResults: 1,
    minSimilarity: 0.6
  });

  if (similar.length > 0) {
    return similar[0].word;
  }

  return null;
}

// Diccionario de términos comunes del dominio para corrección ortográfica
export const SEARCH_DICTIONARY = [
  // Productos principales
  'semillas', 'semilla', 'feminizadas', 'feminizada', 'autoflorecientes', 'autofloreciente',
  'regulares', 'regular', 'cbd', 'thc',

  // Cultivo
  'fertilizante', 'fertilizantes', 'abono', 'abonos', 'nutriente', 'nutrientes',
  'sustrato', 'sustratos', 'tierra', 'coco', 'hidroponia', 'aeroponia',

  // Iluminación
  'led', 'leds', 'iluminacion', 'lampara', 'lamparas', 'hps', 'lec', 'cmh',
  'panel', 'paneles', 'bombilla', 'bombillas', 'luz', 'luces',

  // Equipamiento
  'armario', 'armarios', 'carpa', 'carpas', 'indoor', 'outdoor',
  'maceta', 'macetas', 'tiesto', 'tiestos', 'smartpot',
  'extractor', 'extractores', 'ventilador', 'ventiladores', 'filtro', 'filtros',
  'carbon', 'carbono', 'intractor',

  // Riego
  'riego', 'goteo', 'temporizador', 'temporizadores', 'bomba', 'bombas',

  // Control
  'termometro', 'higrometro', 'controlador', 'controladores',
  'humidificador', 'deshumidificador', 'calefactor',

  // Plagas
  'insecticida', 'fungicida', 'neem', 'preventivo', 'plaga', 'plagas',
  'araña', 'trips', 'mosca', 'pulgon',

  // Accesorios
  'grinder', 'grinders', 'papel', 'papeles', 'bong', 'bongs',
  'pipa', 'pipas', 'vaporizador', 'vaporizadores', 'vaper',

  // CBD
  'aceite', 'aceites', 'crema', 'cremas', 'flores', 'cogollos',
  'extracto', 'extractos', 'tintura',

  // Marcas populares
  'biobizz', 'canna', 'plagron', 'atami', 'advanced', 'general hydroponics',
  'top crop', 'grotek', 'hesi', 'aptus', 'mills', 'house garden',
];
