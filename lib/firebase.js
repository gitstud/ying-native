import firebase from 'firebase';

const config = {
  apiKey: "AIzaSyDjVfe0fezkIqaXW4xW7k-7L735pwXJAOA",
  authDomain: "ying-native.firebaseapp.com",
  databaseURL: "https://ying-native.firebaseio.com",
  projectId: "ying-native",
}

firebase.initializeApp(config);

export const ref = firebase.database().ref()
export const firebaseAuth = firebase.auth

export default firebase
