import { useEffect } from "react";
import { AsyncStorage } from "react-native";
import firebase from "react-native-firebase";
import { useApi } from "../api";

export default function NotificationsSubscriber() {
  const api = useApi();
  useEffect(() => {
    checkPermission();
  }, []);

  async function checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      getToken();
    } else {
      requestPermission();
    }
  }

  // Register device token
  async function getToken() {
    let fcmToken = await AsyncStorage.getItem("fcmToken2");
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        // user has a device token
        await AsyncStorage.setItem("fcmToken2", fcmToken);
        console.log(fcmToken);
      }
    }
    try {
      const res = await api.registerFCMToken(fcmToken);

      console.log("Register fcm success", res);
    } catch (e) {
      console.log("Register fcm failed", e);
    }
  }

  // Ask Push notification permission
  async function requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      // User has authorised
      getToken();
    } catch (error) {
      // User has rejected permissions
      console.log("permission rejected");
    }
  }

  return null;
}
