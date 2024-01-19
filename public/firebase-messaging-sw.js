// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');
// Initialize the Firebase app in the service worker by passing the generated config
var firebaseConfig = {
    apiKey: "AIzaSyA2dtJwlInlJc6gA3HNFNNGdJA-ymeee7o",
    authDomain: "cyecom-af359.firebaseapp.com",
    projectId: "cyecom-af359",
    storageBucket: "cyecom-af359.appspot.com",
    messagingSenderId: "239925665310",
    appId: "1:239925665310:web:c86f900685b9e37309180f",
    measurementId: "G-9LQY6C92K7"
};
firebase.initializeApp(firebaseConfig);
// Retrieve firebase messaging
const messaging = firebase.messaging();
messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };
  self.registration.showNotification(notificationTitle,
    notificationOptions);
});