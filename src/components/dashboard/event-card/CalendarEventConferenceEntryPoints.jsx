import React from 'react';
import PropTypes from 'prop-types';
import cond from 'lodash/cond';
import { useSelector } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import MuiLink from '@material-ui/core/Link';
import MuiIcon from '@material-ui/core/Icon';
import LaunchRoundedIcon from '@material-ui/icons/LaunchRounded';
import PhoneIcon from '@material-ui/icons/Phone';
import VideoCallIcon from '@material-ui/icons/VideoCall';
import DialerSipIcon from '@material-ui/icons/DialerSip';
import HelpOutlineRoundedIcon from '@material-ui/icons/HelpOutlineRounded';

import { selectCalendarEventConferenceData } from '../../../modules/calendarEvents';

const entryPointTypeToIcon = {
  video: VideoCallIcon,
  phone: PhoneIcon,
  sip: DialerSipIcon,
  more: HelpOutlineRoundedIcon,
  fallback: LaunchRoundedIcon,
};

const CalendarEventConferenceEntryPoints = ({ id, render }) => {
  const conferenceData = useSelector((state) => selectCalendarEventConferenceData(state, id));

  if (!conferenceData) {
    return null;
  }

  return (conferenceData.entryPoints || []).map((entryPoint, index) => {
    const Icon =
      index === 0 ? (
        <MuiIcon>
          <img
            src={conferenceData.solutionIconUri}
            alt={`${conferenceData.solutionName} icon`}
            style={{ width: '100%' }}
          />
        </MuiIcon>
      ) : (
        entryPointTypeToIcon[entryPoint.type] || entryPointTypeToIcon.fallback
      );

    const iconTooltip = cond([
      [() => entryPoint.type === 'more', () => 'Joining instructions'],
      [() => index === 0, () => conferenceData.solutionName],
      [() => true, () => entryPoint.label || ''],
    ])();

    const mainLabel = cond([
      [() => entryPoint.type === 'more', () => 'Joining instructions'],
      [
        () => entryPoint.type === 'phone',
        () => `${entryPoint.regionCode ? `(${entryPoint.regionCode}) ` : ''}${entryPoint.label}`,
      ],
      [() => index === 0, () => `Join ${conferenceData.solutionName}`],
      [() => true, () => entryPoint.label || ''],
    ])();

    const content = (
      <>
        <Typography variant="body2">
          <MuiLink href={entryPoint.uri} target="_blank">
            {mainLabel}
          </MuiLink>
        </Typography>

        {entryPoint.meetingCode && (
          <Typography variant="body2" color="textSecondary">
            Meeting code: {entryPoint.meetingCode}
          </Typography>
        )}

        {entryPoint.passcode && (
          <Typography variant="body2" color="textSecondary">
            Passcode: {entryPoint.passcode}
          </Typography>
        )}

        {entryPoint.password && (
          <Typography variant="body2" color="textSecondary">
            Password: {entryPoint.password}
          </Typography>
        )}

        {entryPoint.pin && (
          <Typography variant="body2" color="textSecondary">
            PIN: {entryPoint.pin}
          </Typography>
        )}
      </>
    );

    return (
      <React.Fragment key={entryPoint.type}>
        {render({
          Icon,
          iconTooltip,
          content,
        })}
      </React.Fragment>
    );
  });
};

CalendarEventConferenceEntryPoints.propTypes = {
  id: PropTypes.string.isRequired,
  render: PropTypes.func.isRequired,
};

CalendarEventConferenceEntryPoints.defaultProps = {};

export default CalendarEventConferenceEntryPoints;
