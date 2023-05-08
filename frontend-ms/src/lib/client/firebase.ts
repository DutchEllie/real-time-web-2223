// Import the functions you need from the SDKs you need
import { memoize } from 'lodash';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyDZlPI3TtOTpH-ILH7I-KoQPHA5kG5HvNU",
	authDomain: "realtime-web-a93ae.firebaseapp.com",
	projectId: "realtime-web-a93ae",
	storageBucket: "realtime-web-a93ae.appspot.com",
	messagingSenderId: "345646265433",
	appId: "1:345646265433:web:36075dc9dce56324d6ad48"
};

export const initFirebase = memoize(() => {
	const app = initializeApp(firebaseConfig);
	const auth = getAuth(app);
	return { app, auth }
})