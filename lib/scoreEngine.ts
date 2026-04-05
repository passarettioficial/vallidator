/* ─────────────────────────────────────────────────────────────────────────
   VALLIDATOR Score Engine v1.0
   Lógica 100% determinística — zero dependência de API
   Entrada : 12 respostas dos 4 blocos do formulário Gênesis
   Saída   : 8 scores por dimensão + score geral + metadados
─────────────────────────────────────────────────────────────────────────── */

export interface FormAnswers {
  /* Bloco 1 — Identidade */
  startup_name?: string;
  one_liner?: string;
  stage?: string;
  /* Bloco 2 — Mercado */
  icp?: string;
  pain?: string;
  tam?: string;
  /* Bloco 3 — Diferenciação */
  unique?: string;
  competition?: string;
  moat?: string;
  /* Bloco 4 — Recursos */
  team?: string;
  runway?: string;
  traction?: string;
}

export interface DimensionResult {
  label: string;
  score: number;      // 0–100
  color: string;
  status: 'strong' | 'moderate' | 'risk' | 'critical';
  interpretation: string;
}

export interface DiagnosisResult {
  overallScore: number;
  dimensions: DimensionResult[];
  weakestDimension: string;
  strongestDimension: string;
  phase: string;           // ex: "Gênesis"
  completedAt: string;     // ISO
}

/* ─── Paleta de cores por dimensão ──────────────────────────────────────── */
export const DIMENSION_COLORS: Record<string, string> = {
  'Problema':          '#FFFD02',
  'Mercado':           '#60A5FA',
  'Solução':           '#4ADE80',
  'Diferenciação':     '#F5A623',
  'Tração':            '#FF4D30',
  'Time':              '#A78BFA',
  'Modelo de Negócio': '#FB923C',
  'Validação':         '#34D399',
};

/* ─── Helpers ─────────────────────────────────────────────────────────────
   Todos puros (sem efeitos colaterais) para testabilidade
──────────────────────────────────────────────────────────────────────────── */

/** Qualidade de texto: 0.0 → 1.0 baseada em comprimento + ausência de placeholder */
function textQuality(text: string | undefined): number {
  if (!text || text.trim().length === 0) return 0;
  const t = text.trim();
  // Penaliza o placeholder padrão do formulário
  if (t.includes('[perfil]') || t.includes('[resultado]') || t.includes('[método]')) return 0.1;
  const len = t.length;
  if (len < 15)  return 0.12;
  if (len < 40)  return 0.32;
  if (len < 80)  return 0.58;
  if (len < 140) return 0.75;
  if (len < 220) return 0.85;
  return 0.90;
}

/** Detecta métricas concretas no texto (números, moeda, unidades) */
function hasMetrics(text: string | undefined): boolean {
  if (!text) return false;
  return /[\d]/.test(text) &&
    /[R$€£%kKmMbB]|MRR|ARR|LTV|CAC|usuário|cliente|carta|LOI|beta|download|assinante/i.test(text);
}

/** Ruído determinístico baseado no nome da startup: -5 a +5
    Garante que dois founders com respostas idênticas mas startups diferentes
    recebam scores ligeiramente diferentes (simulando variação real) */
function noise(name: string | undefined, dim: string): number {
  const seed = (name ?? '') + dim;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 11) - 5; // -5 a +5
}

/** Garante que o score fique dentro dos limites [min, max] */
function clamp(n: number, min = 8, max = 96): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

/** Status qualitativo a partir do score */
function statusOf(score: number): DimensionResult['status'] {
  if (score >= 72) return 'strong';
  if (score >= 52) return 'moderate';
  if (score >= 35) return 'risk';
  return 'critical';
}

/** Interpretação textual para cada score/dimensão */
function interpret(dim: string, score: number): string {
  const s = statusOf(score);
  const map: Record<string, Record<string, string>> = {
    'Problema': {
      strong:   'Problema articulado com clareza e especificidade — compatível com o que investidores esperam.',
      moderate: 'Problema identificado, mas articulação precisa ser refinada para pitch.',
      risk:     'Definição de problema ainda vaga. Dificulta validação e comunicação.',
      critical: 'Problema não está suficientemente definido — risco fundacional.',
    },
    'Mercado': {
      strong:   'Mercado dimensionado com dados e concorrência mapeada.',
      moderate: 'Mercado válido, mas com lacunas na análise de tamanho ou concorrência.',
      risk:     'Mercado pouco dimensionado — difícil calcular oportunidade real.',
      critical: 'Sem clareza de mercado. Investimento antes disso é prematuro.',
    },
    'Solução': {
      strong:   'Solução com evidência de produto funcional e diferencial articulado.',
      moderate: 'Solução em desenvolvimento com hipóteses plausíveis.',
      risk:     'Solução ainda na fase de hipótese sem validação técnica.',
      critical: 'Sem evidência de solução construída — risco de execução alto.',
    },
    'Diferenciação': {
      strong:   'Diferencial com barreira defensável — compatível com critério de moat de VCs.',
      moderate: 'Diferenciação presente, mas sem barreira estrutural contra cópias.',
      risk:     'Diferencial fraco — concorrentes maiores podem replicar facilmente.',
      critical: 'Sem moat identificado. Alta probabilidade de commoditização.',
    },
    'Tração': {
      strong:   'Tração com métricas concretas — evidências de demanda real.',
      moderate: 'Indícios de tração, mas abaixo do mínimo para captação competitiva.',
      risk:     'Tração insuficiente. Prioridade antes de qualquer captação.',
      critical: 'Sem tração documentada — risco mais alto da startup atualmente.',
    },
    'Time': {
      strong:   'Composição de time adequada com especialistas complementares.',
      moderate: 'Time em formação — gaps identificáveis em due diligence.',
      risk:     'Time incompleto para a complexidade do problema.',
      critical: 'Sem time estruturado — execução em risco.',
    },
    'Modelo de Negócio': {
      strong:   'Runway saudável e tamanho de mercado sustentam o modelo.',
      moderate: 'Modelo plausível, mas sem evidências suficientes de sustentabilidade.',
      risk:     'Runway curto compromete a capacidade de validação.',
      critical: 'Modelo financeiro inviável no estágio atual.',
    },
    'Validação': {
      strong:   'Validação com evidências de clientes ou métricas de uso — PMF em desenvolvimento.',
      moderate: 'Validação parcial — dados insuficientes para afirmar PMF.',
      risk:     'Pré-validação. Continue coletando evidências antes de escalar.',
      critical: 'Ausência de validação — principal causa de falha documentada no banco.',
    },
  };
  return map[dim]?.[s] ?? `Score ${score}/100.`;
}

/* ─── Funções de score por dimensão ─────────────────────────────────────── */

function scoreProblema(a: FormAnswers): number {
  // Pesos: one_liner 40% + icp 30% + pain 30%
  const base = 15
    + textQuality(a.one_liner) * 40
    + textQuality(a.icp)       * 30
    + textQuality(a.pain)      * 30;
  return clamp(base + noise(a.startup_name, 'Problema'));
}

function scoreMercado(a: FormAnswers): number {
  const tamPoints: Record<string, number> = {
    'Não sei ainda': 5, '< R$50M': 18, 'R$50M – R$500M': 30,
    'R$500M – R$5B': 38, '> R$5B': 42,
  };
  const comp = (a.competition ?? '').toLowerCase();
  // Conhece concorrentes = mapeou o mercado → bônus
  const compBonus = (!comp || comp === 'nenhum' || comp.includes('não tenho')) ? 6 : 22;

  const base = 12
    + (tamPoints[a.tam ?? ''] ?? 8)
    + textQuality(a.icp) * 32
    + compBonus;
  return clamp(base + noise(a.startup_name, 'Mercado'));
}

function scoreSolucao(a: FormAnswers): number {
  const stagePoints: Record<string, number> = {
    'Ideia': 6, 'Protótipo': 18, 'MVP': 30,
    'Produto com clientes': 38, 'Escalando': 44,
  };
  // Solução é inferida: estágio + clareza do one-liner + profundidade do diferencial
  const base = 10
    + (stagePoints[a.stage ?? ''] ?? 8)
    + textQuality(a.one_liner) * 22
    + textQuality(a.unique)    * 28;
  return clamp(base + noise(a.startup_name, 'Solução'));
}

function scoreDiferenciacao(a: FormAnswers): number {
  const moatPoints: Record<string, number> = {
    'Dados exclusivos':       30, 'Network effect':        34,
    'Custo de troca alto':    26, 'Marca/confiança':       20,
    'Tecnologia proprietária':30, 'Nenhum ainda':           4,
  };
  const comp = (a.competition ?? '').toLowerCase();
  const compBonus = (!comp || comp === 'nenhum' || comp.includes('não tenho')) ? 4 : 18;

  const base = 8
    + textQuality(a.unique) * 42
    + (moatPoints[a.moat ?? ''] ?? 8)
    + compBonus;
  return clamp(base + noise(a.startup_name, 'Diferenciação'));
}

function scoreTracao(a: FormAnswers): number {
  const stagePoints: Record<string, number> = {
    'Ideia': 4, 'Protótipo': 12, 'MVP': 22,
    'Produto com clientes': 40, 'Escalando': 52,
  };
  const tq = textQuality(a.traction);
  const metricsBonus = hasMetrics(a.traction) ? 18 : 0;

  const base = 8
    + (stagePoints[a.stage ?? ''] ?? 5)
    + tq * 28
    + metricsBonus;
  return clamp(base + noise(a.startup_name, 'Tração'), 5, 94);
}

function scoreTime(a: FormAnswers): number {
  const teamPoints: Record<string, number> = {
    'Solo founder':           32,
    '2 co-founders':          58,
    '3+ pessoas':             72,
    'Equipe com especialistas': 84,
  };
  const base = teamPoints[a.team ?? ''] ?? 30;
  return clamp(base + noise(a.startup_name, 'Time'));
}

function scoreModeloNegocio(a: FormAnswers): number {
  const runwayPoints: Record<string, number> = {
    '< 3 meses': 8,   '3–6 meses': 22,    '6–12 meses': 38,
    '12–18 meses': 52, '> 18 meses': 62,   'Bootstrapped sem pressão': 65,
  };
  const tamBonus: Record<string, number> = {
    'Não sei ainda': 4, '< R$50M': 12, 'R$50M – R$500M': 22,
    'R$500M – R$5B': 30, '> R$5B': 34,
  };
  const base = 8
    + (runwayPoints[a.runway ?? ''] ?? 14)
    + (tamBonus[a.tam ?? ''] ?? 8);
  return clamp(base + noise(a.startup_name, 'Modelo de Negócio'));
}

function scoreValidacao(a: FormAnswers): number {
  const stagePoints: Record<string, number> = {
    'Ideia': 4, 'Protótipo': 14, 'MVP': 24,
    'Produto com clientes': 36, 'Escalando': 44,
  };
  const tq = textQuality(a.traction);
  const metricsBonus = hasMetrics(a.traction) ? 14 : 0;

  const base = 8
    + (stagePoints[a.stage ?? ''] ?? 4)
    + textQuality(a.pain)   * 28   // dor articulada implica conversas com clientes
    + tq * 22
    + metricsBonus;
  return clamp(base + noise(a.startup_name, 'Validação'), 5, 94);
}

/* ─── Motor principal ────────────────────────────────────────────────────── */

export function calculateScore(answers: FormAnswers): DiagnosisResult {
  const raw: Array<{ label: string; score: number }> = [
    { label: 'Problema',          score: scoreProblema(answers) },
    { label: 'Mercado',           score: scoreMercado(answers) },
    { label: 'Solução',           score: scoreSolucao(answers) },
    { label: 'Diferenciação',     score: scoreDiferenciacao(answers) },
    { label: 'Tração',            score: scoreTracao(answers) },
    { label: 'Time',              score: scoreTime(answers) },
    { label: 'Modelo de Negócio', score: scoreModeloNegocio(answers) },
    { label: 'Validação',         score: scoreValidacao(answers) },
  ];

  const dimensions: DimensionResult[] = raw.map(d => ({
    label:          d.label,
    score:          d.score,
    color:          DIMENSION_COLORS[d.label] ?? '#94A3B8',
    status:         statusOf(d.score),
    interpretation: interpret(d.label, d.score),
  }));

  const overallScore = clamp(
    Math.round(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length),
    8, 96
  );

  const sorted = [...dimensions].sort((a, b) => a.score - b.score);

  return {
    overallScore,
    dimensions,
    weakestDimension:   sorted[0].label,
    strongestDimension: sorted[sorted.length - 1].label,
    phase:              'Gênesis',
    completedAt:        new Date().toISOString(),
  };
}

/* ─── Constante de default (antes de ter diagnóstico real) ──────────────── */
export const DEFAULT_DIMENSIONS: DimensionResult[] = Object.keys(DIMENSION_COLORS).map(label => ({
  label,
  score:          50,
  color:          DIMENSION_COLORS[label],
  status:         'moderate' as const,
  interpretation: '',
}));

/* ─── Calibração de perfil ──────────────────────────────────────────────────
   Contexto adicional das 5 perguntas da Calibração.
   Ajustes PEQUENOS (±2 a ±10) — o Form (12 respostas) continua sendo primário.
──────────────────────────────────────────────────────────────────────────── */
export interface CalibrationAnswers {
  stage?:      string;  // 'idea' | 'validate' | 'building' | 'launched' | 'traction' | 'scaling'
  model?:      string;  // 'b2b' | 'b2c' | 'marketplace' | 'ecommerce' | 'deeptech' | 'undefined'
  priority?:   string;  // 'identity' | 'market' | 'product' | 'traction' | 'finance' | 'team'
  background?: string;  // 'first' | 'failed' | 'success' | 'mentor'
  goal?:       string;  // 'viability' | 'mistakes' | 'plan' | 'investors'
}

export const CALIBRATION_KEY = 'vallidator-calibration-answers';

export function saveCalibrationAnswers(answers: CalibrationAnswers): void {
  localStorage.setItem(CALIBRATION_KEY, JSON.stringify(answers));
}

export function loadCalibrationAnswers(): CalibrationAnswers | null {
  try {
    const raw = localStorage.getItem(CALIBRATION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/**
 * Aplica ajustes de contexto de calibração sobre um DiagnosisResult já calculado.
 * Mantém o score principal inalterado na maior parte — calibração é sinal secundário.
 */
export function applyCalibrationContext(
  base: DiagnosisResult,
  cal: CalibrationAnswers
): DiagnosisResult {
  /* Mapa de ajustes: dimensão → delta */
  const deltas: Record<string, number> = {};

  const add = (dim: string, d: number) => {
    deltas[dim] = (deltas[dim] ?? 0) + d;
  };

  /* ── stage ─────────────────────────────────────────────────────── */
  switch (cal.stage) {
    case 'idea':     add('Tração', -5);  add('Validação', -5);              break;
    case 'building': add('Solução', +5);                                     break;
    case 'launched': add('Tração', +5);  add('Solução', +5);                break;
    case 'traction': add('Tração', +8);  add('Validação', +8);              break;
    case 'scaling':  add('Tração', +10); add('Validação', +10); add('Modelo de Negócio', +5); break;
  }

  /* ── model ─────────────────────────────────────────────────────── */
  switch (cal.model) {
    case 'b2b':        add('Mercado', +3);                                   break;
    case 'b2c':        add('Tração', -2);                                    break;
    case 'marketplace':add('Diferenciação', +3);                             break;
    case 'deeptech':   add('Solução', +5); add('Diferenciação', +5);         break;
  }

  /* ── background ────────────────────────────────────────────────── */
  switch (cal.background) {
    case 'failed':  add('Time', +5); break;
    case 'success': add('Time', +8); break;
    case 'mentor':  add('Time', +3); break;
  }

  /* ── goal ──────────────────────────────────────────────────────── */
  switch (cal.goal) {
    case 'investors': add('Diferenciação', +2); break;
    case 'mistakes':  add('Validação', +2);     break;
  }

  /* Aplica deltas com clamp */
  const dimensions = base.dimensions.map(d => {
    const delta = deltas[d.label] ?? 0;
    if (delta === 0) return d;
    const newScore = clamp(d.score + delta);
    return {
      ...d,
      score:  newScore,
      status: statusOf(newScore),
      interpretation: interpret(d.label, newScore),
    };
  });

  const overallScore = clamp(
    Math.round(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length)
  );

  const sorted = [...dimensions].sort((a, b) => a.score - b.score);

  return {
    ...base,
    overallScore,
    dimensions,
    weakestDimension:   sorted[0].label,
    strongestDimension: sorted[sorted.length - 1].label,
  };
}
