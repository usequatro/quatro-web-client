import { validateTaskSchema } from './taskSchema';

describe('#validateTaskSchema', () => {
  describe('clamping effort and impact', () => {
    it('leaves effort and impact the same when within range', () => {
      const { value } = validateTaskSchema(
        {
          impact: 0,
          effort: 3,
        },
        { sync: true },
      );
      expect(value.impact).toBe(0);
      expect(value.effort).toBe(3);
    });

    it('clamps effort', () => {
      const { value } = validateTaskSchema(
        {
          impact: 1,
          effort: 4,
        },
        { sync: true },
      );
      expect(value.effort).toBe(3);
    });

    it('clamps impact', () => {
      const { value } = validateTaskSchema(
        {
          effort: 1,
          impact: 4,
        },
        { sync: true },
      );
      expect(value.impact).toBe(3);
    });

    it('clamps when updating', () => {
      const { value } = validateTaskSchema(
        {
          effort: 4,
          impact: 4,
        },
        { sync: true, isUpdate: true },
      );
      expect(value.impact).toBe(3);
    });
  });
});
