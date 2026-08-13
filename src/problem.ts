export interface TestCase {
  input: string;
  output?: string;
}

export interface CompetitiveCompanionProblem {
  name: string;
  language?: string;
  tests?: TestCase[];
  // keep flexible for CC variants
  [key: string]: unknown;
}