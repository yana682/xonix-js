  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-analytics.js";

  const firebaseConfig = {
    apiKey: "AIzaSyB4ieuq_RMRMtT3T2Jz_4xoofNSMpY4r-s",
    authDomain: "xonix-acba3.firebaseapp.com",
    projectId: "xonix-acba3",
    storageBucket: "xonix-acba3.appspot.com",
    messagingSenderId: "608965544329",
    appId: "1:608965544329:web:1bc1a470675f78e110f958",
    measurementId: "G-CJ5VP9JXL5"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
