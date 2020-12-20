import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';

import { selectGapiUserId } from '../../../modules/session';

const ConnectedAccount = ({ uid, imageUrl, email, name, providerId }) => {
  const gapiUserId = useSelector(selectGapiUserId);
  const isConnectedAccount = uid === gapiUserId;

  if (providerId !== 'google.com') {
    return 'Not implemented';
  }

  return (
    <ListItem>
      <ListItemAvatar>
        <Avatar
          alt={name || email}
          src={imageUrl}
          style={{ opacity: isConnectedAccount ? 1 : 0.5 }}
        />
      </ListItemAvatar>
      <ListItemText
        primary={`${[name, email].filter(Boolean).join(' - ')}`}
        secondary={
          !isConnectedAccount
            ? 'Re-enable Quatro to access your calendars by signing in'
            : undefined
        }
      />
    </ListItem>
  );
};

ConnectedAccount.propTypes = {
  providerId: PropTypes.string.isRequired,
  uid: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
};

export default ConnectedAccount;
