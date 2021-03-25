import updateArray from './updateArray';

describe('updateArray', () => {
  it('should return the array as-is if nothing else passed', () => {
    expect(updateArray([2], {})).toEqual([2]);
  });
  it('should add and remove values', () => {
    expect(updateArray([2, 3, 4], { add: [5, 6], remove: [3, 5] })).toEqual([2, 4, 5, 6]);
  });
});
