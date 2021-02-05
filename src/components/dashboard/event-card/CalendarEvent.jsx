import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import startOfDay from 'date-fns/startOfDay';
import differenceInMinutes from 'date-fns/differenceInMinutes';

import {
  selectCalendarEventSummary,
  selectCalendarEventStartTimestamp,
  selectCalendarEventEndTimestamp,
  selectCalendarEventAllDay,
  selectCalendarEventDeclined,
  selectCalendarEventCollisionCount,
  selectCalendarEventCollisionOrder,
  selectCalendarEventCalendarId,
  selectCalendarEventTaskId,
  selectCalendarEventSynching,
} from '../../../modules/calendarEvents';
import { selectCalendarColor } from '../../../modules/calendars';
import EventCardView from './EventCardView';
import CalendarEventPopover from './CalendarEventPopover';
import { useAppDragDropContext } from '../DashboardDragDropContext';

const CalendarEvent = ({ id, scrollAnchorRef, interactive, tickHeight, ticksPerHour }) => {
  const { draggableTaskId } = useAppDragDropContext();

  const summary = useSelector((state) => selectCalendarEventSummary(state, id));
  const startTimestamp = useSelector((state) => selectCalendarEventStartTimestamp(state, id));
  const endTimestamp = useSelector((state) => selectCalendarEventEndTimestamp(state, id));
  const allDay = useSelector((state) => selectCalendarEventAllDay(state, id));
  const declined = useSelector((state) => selectCalendarEventDeclined(state, id));
  const collisionCount = useSelector((state) => selectCalendarEventCollisionCount(state, id));
  const collisionOrder = useSelector((state) => selectCalendarEventCollisionOrder(state, id));
  const calendarId = useSelector((state) => selectCalendarEventCalendarId(state, id));
  const taskId = useSelector((state) => selectCalendarEventTaskId(state, id));
  const synching = useSelector((state) => selectCalendarEventSynching(state, id));
  const color = useSelector((state) => selectCalendarColor(state, calendarId)) || '#000000';

  const [calendarDetailsOpen, setCalendarDetailsOpen] = useState(false);
  const cardRef = useRef();

  const minutesForOneTick = 60 / ticksPerHour;
  const durationInMinutes = differenceInMinutes(endTimestamp, startTimestamp);
  const startTimeInMinutes = differenceInMinutes(startTimestamp, startOfDay(startTimestamp));

  const cardWidth = Math.floor(100 / (1 + (collisionCount || 0)));
  const cardLeft = (collisionOrder || 0) * cardWidth;

  return (
    <>
      <EventCardView
        id={id}
        key={id}
        scrollAnchorRef={scrollAnchorRef}
        elevated={calendarDetailsOpen}
        showLoader={Boolean(synching)}
        summary={summary}
        startTimestamp={startTimestamp}
        endTimestamp={endTimestamp}
        allDay={allDay}
        declined={Boolean(declined)}
        taskId={taskId}
        showComplete={interactive && Boolean(taskId)}
        selectable={interactive}
        isBeingRedragged={draggableTaskId === taskId}
        color={color}
        height={allDay ? 40 : Math.floor(tickHeight * (durationInMinutes / minutesForOneTick))}
        width={`${cardWidth}%`}
        coordinates={{
          x: `${cardLeft}%`,
          y: Math.floor(tickHeight * (startTimeInMinutes / minutesForOneTick)),
        }}
        onSelect={() => setCalendarDetailsOpen(true)}
        ref={cardRef}
      />

      {interactive && (
        <CalendarEventPopover
          id={id}
          open={calendarDetailsOpen}
          anchorEl={cardRef.current}
          onClose={() => setCalendarDetailsOpen(false)}
        />
      )}
    </>
  );
};

CalendarEvent.propTypes = {
  id: PropTypes.string.isRequired,
  interactive: PropTypes.bool.isRequired,
  scrollAnchorRef: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  tickHeight: PropTypes.number.isRequired,
  ticksPerHour: PropTypes.number.isRequired,
};

CalendarEvent.defaultProps = {
  scrollAnchorRef: undefined,
};

export default CalendarEvent;
