import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as firebase from 'firebase/app';
import pick from 'lodash/pick';
import { trackUser } from 'util/tracking';
import { setUser } from 'modules/session';

const UserLoginListener = ({ mixpanel }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      const userId = user === null ? null : user.uid;
      trackUser(userId);

      if (userId) {
        mixpanel.identify(userId);
        mixpanel.people.set({
          $email: user.email,
        });
      }

      const reduxUser = user !== null ? pick(user, [
        'uid',
        'displayName',
        'photoURL',
        'email',
        'emailVerified',
      ]) : null;
      dispatch(setUser(reduxUser));
    });

    return unsubscribe;
  }, [dispatch]);

  return null;
};

export default UserLoginListener;
