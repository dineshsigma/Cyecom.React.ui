
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";


const firebaseConfig = {
    apiKey: "AIzaSyA2dtJwlInlJc6gA3HNFNNGdJA-ymeee7o",
    authDomain: "cyecom-af359.firebaseapp.com",
    projectId: "cyecom-af359",
    storageBucket: "cyecom-af359.appspot.com",
    messagingSenderId: "239925665310",
    appId: "1:239925665310:web:c86f900685b9e37309180f",
    measurementId: "G-9LQY6C92K7"
  };

function requestPermission() {
  
  Notification.requestPermission().then((permission) => {
    console.log("permission",permission)
    if (permission === "granted") {
     
      const app = initializeApp(firebaseConfig);

      const messaging = getMessaging(app);
      getToken(messaging, {
        vapidKey:
          "BL9OYYtRYHbNI5YdwQehkm1_l6zj3lt3y9dN8U_2xHFTSpkIoNxihRpAeZVBhwxpevGB2-SAozAuXbFOrLQZqWk",
      }).then((currentToken) => {
        if (currentToken) {
          console.log("currentToken",currentToken)
          localStorage.setItem('fcmToken', currentToken)
          return currentToken
        } else {
          console.log("Can not get token");
        }
      });
    } else {
      console.log("Do not have permission!");
    }
  });
}

requestPermission();