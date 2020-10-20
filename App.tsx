import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  AsyncStorage,
  Linking,
  YellowBox,
  AppState,
  AppStateStatus,
  Animated,
  Easing
} from "react-native";
import { Provider } from "react-redux";
import { createStore, applyMiddleware, compose } from "redux";
import { createMigrate, persistReducer, persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { reduxMigrations } from "./src/constants";

import {
  createStackNavigator,
  NavigationActions,
  NavigationContainerComponent,
  NavigationTransitionProps
} from "react-navigation";
import { fromLeft, fromRight } from "react-navigation-transitions";
import reducers from "./reducers";
import wrap from "lodash/wrap";
import delay from "lodash/delay";

import SettingsScreen from "./screens/settings";
import LocalCurrencyScreen from "./screens/LocalCurrencyScreen";
import TransactionDetailScreen from "./screens/TransactionDetail";
import SendFiatScreen from "./screens/SendFiatScreen";
import ScanScreen from "./screens/ScanScreen";
import UploadScreen from "./screens/UploadScreen";
import BackupScreen from "./screens/BackupScreen";
import RestoreScreen from "./screens/RestoreScreen";
import RestoreSuccessScreen from "./screens/RestoreSuccess";
import ReceiveCodeScreen from "./screens/ReceiveCodeScreen";
import SendSecondScreen from "./screens/SendSecondScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import SelectPaymentScreen from "./screens/SelectPaymentScreen";
import RelayOneSync from "./screens/RelayOneSync";
import RelayOneScreen from "./screens/RelayOneScreen";
import RelayOneAuth from "./screens/RelayOneAuth";
import RelayWithdrawScreen from "./screens/RelayWithdrawScreen";
import RelayDetailScreen from "./screens/RelayDetailScreen";
import SendSuccessScreen from "./screens/SendSuccessScreen";
import InviteFriendScreen from "./screens/InviteFriendScreen";
import WebContainerScreen from "./screens/WebContainerScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import StartScreen from "./screens/StartScreen";
import ExpiredPageScreen from "./screens/ExpiredPageScreen";
import ScanChannelSelectScreen from "./screens/ScanChannelSelectScreen";

import WithdrawModal from "./src/components/WithdrawTransactionModal";
import { useCheckOrderReceive } from "./actions/OrdersActions";
import { isValidRelayOneQR } from "./src/relayone";

import * as Sentry from "@sentry/react-native";

import { PortalProvider, WhitePortal } from "react-native-portal";
import { setApiKey } from "./src/api";
import { useDidMount } from "./src/hooks/useDidMount";
import { useBalanceUpdate } from "./src/hooks/useBalanceUpdate";
import { useOnTransactionsList } from "./actions";
import { useUpdateExchangeRates } from "./actions/CurrencyActions";
import ReactNativeBiometrics from "react-native-biometrics";

if (!__DEV__) {
  Sentry.init({
    dsn: "https://319b803a64a24f77badc92a0e6c78e91@sentry.io/1728164"
  });
}

//字体不随系统字体变化
// FIXME: replace with component
// @ts-ignore
Text.render = wrap(Text.render, function(func, ...args) {
  // @ts-ignore
  const originText = func.apply(this, args);
  return React.cloneElement(originText, { allowFontScaling: false });
});

const handleCustomMainTransition = ({ scenes }: NavigationTransitionProps) => {
  const prevScene = scenes[scenes.length - 2];
  const nextScene = scenes[scenes.length - 1];

  // Custom transitions go there
  if (
    prevScene &&
    prevScene.route.routeName === "scan" &&
    nextScene.route.routeName === "settingsNavigator"
  ) {
    return fromLeft();
  }

  return fromRight();
};

const handleCustomWelcomeToMainTransition = ({
  scenes
}: NavigationTransitionProps) => {
  const prevScene = scenes[scenes.length - 2];
  const nextScene = scenes[scenes.length - 1];

  if (
    prevScene &&
    prevScene.route.routeName === "welcome" &&
    nextScene.route.routeName === "appNavigator"
  ) {
    return {
      transitionSpec: {
        duration: 0,
        timing: Animated.timing,
        easing: Easing.step0
      }
    };
  }
  return fromRight();
};

// Transaction Navigation Flow
const TransactionNavigator = createStackNavigator(
  {
    transactionDetail: { screen: TransactionDetailScreen },
    webContainer: { screen: WebContainerScreen }
  },
  {
    headerMode: "none",
    initialRouteName: "transactions"
  }
);

// Settings Navigation Flow
const SettingsNavigator = createStackNavigator(
  {
    settings: SettingsScreen,
    localCurrency: LocalCurrencyScreen,
    backup: BackupScreen,
    restore: RestoreScreen,
    restoreSuccess: RestoreSuccessScreen,
    relayOneSync: RelayOneSync,
    relayOne: RelayOneScreen,
    relayWithdraw: RelayWithdrawScreen,
    relayDetail: RelayDetailScreen,
    inviteFriend: InviteFriendScreen
  },
  {
    headerMode: "none",
    initialRouteName: "settings"
  }
);

// Main Navigation Flow
const MainNavigator = createStackNavigator(
  {
    sendFiat: SendFiatScreen,
    channelSelect: ScanChannelSelectScreen,
    scan: ScanScreen,
    sendSecond: SendSecondScreen,
    receiveCode: ReceiveCodeScreen,
    transactionDetail: TransactionDetailScreen,
    selectPaymentMethod: SelectPaymentScreen,
    sendSuccess: SendSuccessScreen,
    transactionNavigator: TransactionNavigator,
    settingsNavigator: SettingsNavigator,
    upload: UploadScreen,
    expiredPage: ExpiredPageScreen,
    relayOneAuth: RelayOneAuth
  },
  {
    headerMode: "none",
    initialRouteName: "scan",
    transitionConfig: handleCustomMainTransition
  }
);

let _navigator: NavigationContainerComponent;

function navigate(routeName: string, params: any) {
  if (!_navigator) return;
  _navigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params
    })
  );
}

const StarterNavigator = createStackNavigator(
  {
    welcome: WelcomeScreen,
    start: StartScreen,
    onboarding: OnboardingScreen,
    restore: RestoreScreen,

    appNavigator: MainNavigator
  },
  {
    headerMode: "none",
    initialRouteName: "welcome",
    transitionConfig: handleCustomWelcomeToMainTransition
  }
);

const LOG_ACTIONS = false;

const middlewares = [];

if (process.env.NODE_ENV === "development") {
  const { logger } = require("redux-logger");

  if (LOG_ACTIONS) middlewares.push(logger);
}

const persistConfig = {
  key: "relayx",
  storage: AsyncStorage,
  version: 3,
  migrate: createMigrate(reduxMigrations, { debug: false })
};

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = compose(applyMiddleware(...middlewares))(createStore)(
  persistedReducer
);
// const store = createStore(reducers, {}, applyMiddleware(ReduxThunk));
const persistor = persistStore(store);
// FIXME move to ref in app
let appState = AppState.currentState;
let fingerPrintStatus: number;
let didFingerPrint = false;

function App() {
  const apiKey = store.getState().settingReducer.apiKey;
  const checkBalanceUpdate = useBalanceUpdate();
  const updateExchangeRates = useUpdateExchangeRates();
  const checkOrderReceive = useCheckOrderReceive();
  const onTransactionList = useOnTransactionsList();
  const checkTimer = useRef(0);
  useDidMount(() => {
    YellowBox.ignoreWarnings([
      "Module RCTImagePickerManager requires main queue setup since it overrides `init`"
    ]);
    Linking.getInitialURL().then(url => {
      if (url) {
        handleUrl({ url });
      }
    });
  });

  useEffect(() => {
    AppState.addEventListener("change", onStateChange);
    Linking.addEventListener("url", handleUrl);
    checkLastWithdrawReceive();
    return () => {
      AppState.removeEventListener("change", onStateChange);
      Linking.removeEventListener("url", handleUrl);
      if (checkTimer.current) clearTimeout(checkTimer.current);
    };
  }, []);

  const onStateChange = (state: AppStateStatus) => {
    if (appState.match(/(inactive)|(background)/) && state === "active") {
      checkBalanceUpdate();
      updateExchangeRates();
      onTransactionList();
      biometricsFun();
    } else if (state === "background") {
      fingerPrintStatus = +new Date();
      didFingerPrint = false;
    }
    appState = state;
  };

  const handleUrl = async ({ url }: { url: string }) => {
    console.log(url);
    if (isValidRelayOneQR(url)) {
      // Link relay one
      const needsOnboarding =
        !store.getState().wallet.privateKey || !store.getState().main.handle;
      console.log("valid");
      delay(() => {
        if (needsOnboarding) {
          return;
        }
        navigate("main", { qrCodeString: url });
      }, 1000);
    }
  };

  async function biometricsFun() {
    if (didFingerPrint) {
      return;
    }
    const needsOnboarding =
      !store.getState().wallet.privateKey || !store.getState().main.handle;

    if (!needsOnboarding && +new Date() - fingerPrintStatus > 60 * 1000) {
      try {
        const biometryType = await ReactNativeBiometrics.isSensorAvailable();
        if (biometryType && biometryType === ReactNativeBiometrics.TouchID) {
          const prompt = await ReactNativeBiometrics.simplePrompt(
            "Confirm fingerprint"
          );
          if (prompt) {
            navigate("appNavigator", {});
            didFingerPrint = true;
          } else {
            didFingerPrint = true;
          }
        } else {
          navigate("appNavigator", {});
          didFingerPrint = true;
        }
      } catch (e) {
        navigate("start", {});
        didFingerPrint = true;
      }
    }
  }

  const checkLastWithdrawReceive = async () => {
    const apiKey = store.getState().settingReducer.apiKey;
    if (apiKey) {
      try {
        const transactions = store.getState().transactionsReducer.transactions;
        const pendingOrders = transactions.filter(
          tx =>
            tx.serialNumber &&
            tx.tranType === 1 &&
            tx.status !== -200 &&
            tx.status !== 10000
        );

        for (let i = 0; i < pendingOrders.length; i++) {
          await checkOrderReceive(pendingOrders[i].serialNumber);
        }
        if (Math.random() > 0.8) {
          await onTransactionList();
        }
      } catch (err) {
        console.log(err);
      }
    }
    checkTimer.current = delay(checkLastWithdrawReceive, 3000);
  };

  return (
    <View style={styles.container}>
      <StarterNavigator
        ref={navigatorRef => {
          _navigator = navigatorRef!;
        }}
      />

      {!!apiKey && <WithdrawModal />}
      <WhitePortal name="modal" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  }
});

function AppWrapper2() {
  setApiKey(store.getState().settingReducer.apiKey || "");
  return <App />;
}

export default function AppWrapper() {
  return (
    <PortalProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AppWrapper2 />
        </PersistGate>
      </Provider>
    </PortalProvider>
  );
}
