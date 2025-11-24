import { Interview } from '../models/Interview';

export class ScoreCalculator {
  static calculateAverage(interviews: Interview[]): number | null {
    const validScores = interviews
      .map(i => i.score)
      .filter((score): score is number => score !== null && score !== undefined);
    
    if (validScores.length === 0) return null;
    
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    return Math.round((sum / validScores.length) * 100) / 100;
  }
}

