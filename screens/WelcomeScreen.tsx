import React from "react";
import {
  StatusBar,
  View,
  SafeAreaView,
  StyleSheet,
  Image,
  AsyncStorage
} from "react-native";

import { Colors } from "../src/constants";
import { NavigationProps } from "../src/types";
import { AppState } from "../reducers";
import {
  useOnSettingCurrencyList,
  useOnSettingPayment,
  useGetCurrencySettings,
  useLoadConfig,
  useOnUserInfo,
  useWalletInit
} from "../actions";
import { useSelector } from "react-redux";
import { useDidMount } from "../src/hooks/useDidMount";
import ReactNativeBiometrics from "react-native-biometrics";

type OwnProps = NavigationProps<any>;

async function wait(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export default function WelcomeScreen(props: OwnProps) {
  const needsOnboarding = useSelector((state: AppState) => {
    return !state.wallet.privateKey || !state.main.handle;
  });
  const publicAddress = useSelector((state: AppState) => {
    return state.wallet.publicAddress;
  });
  const apiKey = useSelector((state: AppState) => {
    return state.settingReducer.apiKey || "";
  });
  const handle = useSelector((state: AppState) => {
    return state.main.handle || "";
  });
  const getCurrencySettings = useGetCurrencySettings();
  const onSettingCurrencyList = useOnSettingCurrencyList();
  const onSettingPayment = useOnSettingPayment();
  const loadConfig = useLoadConfig();
  const onUserInfo = useOnUserInfo();
  const walletInit = useWalletInit();

  useDidMount(async () => {
    if (needsOnboarding) {
      props.navigation.navigate("start");
      return;
    }
    if (!apiKey) {
      const mnemonic = await AsyncStorage.getItem("mnemonic");
      await walletInit(mnemonic!, handle);
    }
    const p1 = onSettingCurrencyList(2);
    const p2 = onSettingPayment();
    const p3 = loadConfig();
    await Promise.all([p1, p2, p3, wait(1000)]);
    onUserInfo(publicAddress!);

    getCurrencySettings();
    try {
      const biometryType = await ReactNativeBiometrics.isSensorAvailable();
      if (biometryType && biometryType === ReactNativeBiometrics.TouchID) {
        const prompt = await ReactNativeBiometrics.simplePrompt(
          "Confirm fingerprint"
        );
        if (prompt) {
          props.navigation.replace("appNavigator");
        }
      } else {
        props.navigation.replace("appNavigator");
      }
    } catch (e) {
      props.navigation.navigate("start");
    }
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.ClearBlue} barStyle="light-content" />
      <View style={styles.container}>
        <Image
          style={styles.logo}
          source={require("../icons/logoTextPortraitWhite.png")}
        />
      </View>
    </SafeAreaView>
  );
}

//Create Stylesheet
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.ClearBlue
  },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  logo: {
    width: 100,
    height: 103.5
  }
});
