import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBScgRdp-HT0u_djegM718oczPo0KEBnUw',
  authDomain: 'tasket-project.firebaseapp.com',
  databaseURL: 'https://tasket-project.firebaseio.com',
  projectId: 'tasket-project',
  storageBucket: 'tasket-project.appspot.com',
  // messagingSenderId: 'sender-id',
  // appID: 'app-id',
};
firebase.initializeApp(firebaseConfig);
