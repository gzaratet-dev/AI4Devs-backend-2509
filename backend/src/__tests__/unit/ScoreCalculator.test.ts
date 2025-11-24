import { ScoreCalculator } from '../../domain/services/ScoreCalculator';
import { Interview } from '../../domain/models/Interview';

describe('ScoreCalculator', () => {
  describe('calculateAverage', () => {
    it('should calculate average score correctly', () => {
      const interviews = [
        new Interview({ score: 8 }),
        new Interview({ score: 9 }),
        new Interview({ score: 7 })
      ];

      const average = ScoreCalculator.calculateAverage(interviews);
      expect(average).toBe(8);
    });

    it('should return null if no interviews have scores', () => {
      const interviews = [
        new Interview({ score: null }),
        new Interview({ score: undefined })
      ];

      const average = ScoreCalculator.calculateAverage(interviews);
      expect(average).toBeNull();
    });

    it('should ignore null scores in calculation', () => {
      const interviews = [
        new Interview({ score: 10 }),
        new Interview({ score: null }),
        new Interview({ score: 8 })
      ];

      const average = ScoreCalculator.calculateAverage(interviews);
      expect(average).toBe(9);
    });

    it('should return null for empty array', () => {
      const interviews: Interview[] = [];

      const average = ScoreCalculator.calculateAverage(interviews);
      expect(average).toBeNull();
    });

    it('should round to 2 decimal places', () => {
      const interviews = [
        new Interview({ score: 7 }),
        new Interview({ score: 8 }),
        new Interview({ score: 9 })
      ];

      const average = ScoreCalculator.calculateAverage(interviews);
      expect(average).toBe(8); // (7+8+9)/3 = 8
    });

    it('should handle decimal scores correctly', () => {
      const interviews = [
        new Interview({ score: 7.5 }),
        new Interview({ score: 8.3 }),
        new Interview({ score: 9.2 })
      ];

      const average = ScoreCalculator.calculateAverage(interviews);
      expect(average).toBe(8.33); // (7.5+8.3+9.2)/3 = 8.333... rounded to 8.33
    });
  });
});

