import { addTimestamps, getCollisions } from './calendarEvents';

describe('calendarEvents', () => {
  describe('#getCollisions', () => {
    it('should detect collisions for overlapping events', () => {
      const items = [
        {
          id: '1',
          summary: 'Event 1',
          start: {
            dateTime: '2020-12-24T12:00:00+01:00',
          },
          end: {
            dateTime: '2020-12-24T12:30:00+01:00',
          },
        },
        {
          id: '2',
          summary: 'Event 2',
          start: {
            dateTime: '2020-12-24T16:00:00+01:00',
          },
          end: {
            dateTime: '2020-12-24T17:00:00+01:00',
          },
        },
        {
          id: '3',
          summary: 'Event 3',
          start: {
            dateTime: '2020-12-24T16:15:00+01:00',
          },
          end: {
            dateTime: '2020-12-24T16:30:00+01:00',
          },
        },
      ];
      const itemsWithTimestamps = addTimestamps(items);

      expect(getCollisions(itemsWithTimestamps[0], itemsWithTimestamps)).toEqual([]);
      expect(getCollisions(itemsWithTimestamps[1], itemsWithTimestamps)).toEqual(['3']);
      expect(getCollisions(itemsWithTimestamps[2], itemsWithTimestamps)).toEqual(['2']);
    });

    it('should detect collisions for events at the same time', () => {
      const items = [
        {
          id: '1',
          summary: 'Event 1',
          start: {
            dateTime: '2020-12-24T12:00:00+01:00',
          },
          end: {
            dateTime: '2020-12-24T12:30:00+01:00',
          },
        },
        {
          id: '2',
          summary: 'Event 2',
          start: {
            dateTime: '2020-12-24T16:00:00+01:00',
          },
          end: {
            dateTime: '2020-12-24T17:00:00+01:00',
          },
        },
        {
          id: '3',
          summary: 'Event 3',
          start: {
            dateTime: '2020-12-24T16:00:00+01:00',
          },
          end: {
            dateTime: '2020-12-24T17:00:00+01:00',
          },
        },
      ];
      const itemsWithTimestamps = addTimestamps(items);

      expect(getCollisions(itemsWithTimestamps[0], itemsWithTimestamps)).toEqual([]);
      expect(getCollisions(itemsWithTimestamps[1], itemsWithTimestamps)).toEqual(['3']);
      expect(getCollisions(itemsWithTimestamps[2], itemsWithTimestamps)).toEqual(['2']);
    });
  });
});
