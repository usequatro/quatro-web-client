import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getAuth } from '../firebase';
import { setUserFromFirebaseUser } from '../modules/session';
import { useMixpanel } from './tracking/MixpanelContext';

const UserLoginListener = () => {
  const dispatch = useDispatch();
  const mixpanel = useMixpanel();

  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((user) => {
      if (user && user.uid) {
        try {
          mixpanel.identify(user.uid);
          mixpanel.people.set({
            $name: user.displayName,
            $email: user.email,
            $created: user.metadata.creationTime,
          });
        } catch (error) {
          console.error(error); // eslint-disable-line no-console
        }
      }

      dispatch(setUserFromFirebaseUser(user));
    });

    return unsubscribe;
  }, [dispatch, mixpanel]);

  return null;
};

export default UserLoginListener;
