import parseISO from 'date-fns/parseISO';
import { getCollisions } from './calendarEvents';

describe('calendarEvents', () => {
  describe('#getCollisions', () => {
    it('should detect collisions for overlapping events', () => {
      const items = [
        {
          id: '1',
          summary: 'Event 1',
          start: {
            timestamp: parseISO('2020-12-24T12:00:00+01:00').getTime(),
          },
          end: {
            timestamp: parseISO('2020-12-24T12:30:00+01:00').getTime(),
          },
        },
        {
          id: '2',
          summary: 'Event 2',
          start: {
            timestamp: parseISO('2020-12-24T16:00:00+01:00').getTime(),
          },
          end: {
            timestamp: parseISO('2020-12-24T17:00:00+01:00').getTime(),
          },
        },
        {
          id: '3',
          summary: 'Event 3',
          start: {
            timestamp: parseISO('2020-12-24T16:15:00+01:00').getTime(),
          },
          end: {
            timestamp: parseISO('2020-12-24T16:30:00+01:00').getTime(),
          },
        },
      ];

      expect(getCollisions(items[0], items)).toEqual([]);
      expect(getCollisions(items[1], items)).toEqual(['3']);
      expect(getCollisions(items[2], items)).toEqual(['2']);
    });

    it('should detect collisions for events at the same time', () => {
      const items = [
        {
          id: '1',
          summary: 'Event 1',
          start: {
            timestamp: parseISO('2020-12-24T12:00:00+01:00'),
          },
          end: {
            timestamp: parseISO('2020-12-24T12:30:00+01:00'),
          },
        },
        {
          id: '2',
          summary: 'Event 2',
          start: {
            timestamp: parseISO('2020-12-24T16:00:00+01:00'),
          },
          end: {
            timestamp: parseISO('2020-12-24T17:00:00+01:00'),
          },
        },
        {
          id: '3',
          summary: 'Event 3',
          start: {
            timestamp: parseISO('2020-12-24T16:00:00+01:00'),
          },
          end: {
            timestamp: parseISO('2020-12-24T17:00:00+01:00'),
          },
        },
      ];

      expect(getCollisions(items[0], items)).toEqual([]);
      expect(getCollisions(items[1], items)).toEqual(['3']);
      expect(getCollisions(items[2], items)).toEqual(['2']);
    });
  });
});
