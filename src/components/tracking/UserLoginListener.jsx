import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import pick from 'lodash/pick';
import { trackUser } from '../../util/tracking';
import { getAuth } from '../../firebase';
import { setUser } from '../../modules/session';

const UserLoginListener = ({ mixpanel }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((user) => {
      const userId = user === null ? null : user.uid;
      trackUser(userId);

      if (userId) {
        try {
          mixpanel.identify(userId);
          mixpanel.people.set({
            $email: user.email,
          });
        } catch (error) {
          console.error(error); // eslint-disable-line no-console
        }
      }

      // eslint-disable-next-line operator-linebreak
      const reduxUser =
        user !== null
          ? pick(user, ['uid', 'displayName', 'photoURL', 'email', 'emailVerified'])
          : null;
      dispatch(setUser(reduxUser));
    });

    return unsubscribe;
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

export default UserLoginListener;
