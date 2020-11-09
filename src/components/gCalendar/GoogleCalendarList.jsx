import React from 'react';
import { useSelector } from 'react-redux';

import {
  selectGoogleCalendars,
} from '../../modules/googleCalendar';

const GoogleCalendarsList = () => {
  const googleCalendars = useSelector(selectGoogleCalendars);
  console.log('googleCalendars',googleCalendars)
  
  return (
    <div>
      <p>Hello</p>
    </div>
  )
};


export default GoogleCalendarsList;