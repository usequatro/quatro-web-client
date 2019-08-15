import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as firebase from 'firebase/app';
import { trackUser } from '../../util/tracking';
import { setUser } from '../../modules/session';

const UserLoginListener = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      const userId = user === null ? null : user.uid;
      trackUser(userId);
      dispatch(setUser(userId));
    });

    return unsubscribe;
  }, [dispatch]);

  return null;
};

export default UserLoginListener;
