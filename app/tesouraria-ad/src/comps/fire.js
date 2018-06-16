import firebase from 'firebase';
var config = {
	apiKey: "AIzaSyArdmlAsb7EjKjIT7-UVStCRMdDuhIiu_0",
	authDomain: "app-tesouraria-ad.firebaseapp.com",
	databaseURL: "https://app-tesouraria-ad.firebaseio.com",
	projectId: "app-tesouraria-ad",
	storageBucket: "app-tesouraria-ad.appspot.com",
	messagingSenderId: "352878868537"
};
var fire = firebase.initializeApp(config);
export default fire;