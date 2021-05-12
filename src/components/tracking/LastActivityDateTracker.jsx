import { useSelector } from 'react-redux';
import isBefore from 'date-fns/isBefore';
import isSameHour from 'date-fns/isSameHour';
import { selectCurrentTimestamp } from '../../modules/dashboard';
import {
  selectUserLastActivityDate,
  selectUserExternalConfigIsFetching,
} from '../../modules/userExternalConfig';
import { fetchUpdateUserExternalConfig } from '../../utils/apiClient';
import { selectFirebaseUserIsLoggedIn } from '../../modules/session';

/**
 * Updates the userExternalConfig with the lastActivityDate every hour
 * This date is used to send daily emails and do things on the backend based on user activity
 */
const LastActivityDateTracker = () => {
  const firebaseUserIsLoggedIn = useSelector(selectFirebaseUserIsLoggedIn);
  const userExternalConfigLoaded = !useSelector(selectUserExternalConfigIsFetching);
  const lastActivityDate = useSelector(selectUserLastActivityDate);
  const currentTime = useSelector(selectCurrentTimestamp);

  if (!firebaseUserIsLoggedIn || !userExternalConfigLoaded) {
    return null;
  }

  if (
    !lastActivityDate ||
    (isBefore(lastActivityDate, currentTime) && !isSameHour(lastActivityDate, currentTime))
  ) {
    fetchUpdateUserExternalConfig({ lastActivityDate: currentTime });
  }

  return null;
};

export default LastActivityDateTracker;
