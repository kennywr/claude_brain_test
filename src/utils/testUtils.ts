export function ms(num: number): string {
  return `${Math.round(num)} ms`;
}

export function mean(xs: number[]): number {
  if (!xs || xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function stdev(xs: number[]): number {
  const m = mean(xs);
  const v = mean(xs.map((x) => (x - m) ** 2));
  return Math.sqrt(v);
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export function scoreForChart(testId: string, result: any): number {
  switch (testId) {
    case 'rt':
      return result.meanMs ? Math.max(0, 1000 - result.meanMs) : 0;
    case 'nback':
      return result.accuracy ? Math.round(result.accuracy * 100) : 0;
    case 'digit':
      return result.maxSpan || 0;
    case 'stroop':
      return result.score || 0;
    case 'animal':
      // Use difficulty-adjusted score if available, fallback to raw score
      return result.score || result.rawScore || 0;
    default:
      return 0;
  }
}

export const TEST_DEFINITIONS = [
  {
    id: 'rt',
    name: 'Reaction Time',
    description: 'Measures visual reaction speed',
    color: '#3B82F6'
  },
  {
    id: 'nback',
    name: '2-Back Memory',
    description: 'Tests working memory capacity',
    color: '#8B5CF6'
  },
  {
    id: 'digit',
    name: 'Digit Span',
    description: 'Measures memory span',
    color: '#10B981'
  },
  {
    id: 'stroop',
    name: 'Stroop Test',
    description: 'Assesses attention and inhibition',
    color: '#F59E0B'
  },
  {
    id: 'animal',
    name: 'Animal Naming',
    description: 'Tests visual recognition and semantic memory',
    color: '#7C3AED'
  }
];