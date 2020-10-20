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

import MainScreen from "./screens/MainScreen";
import SettingsScreen from "./screens/settings";
import LocalCurrencyScreen from "./screens/LocalCurrencyScreen";
import TransactionsScreen from "./screens/TransactionsScreen";
import SendFiatScreen from "./screens/SendFiatScreen";
import ScanScreen from "./screens/ScanScreen";
import TopUpScreen from "./screens/TopUpScreen";
import UploadScreen from "./screens/UploadScreen";
import PinScreen from "./screens/PinScreen";
import BackupScreen from "./screens/BackupScreen";
import RestoreScreen from "./screens/RestoreScreen";
import RestoreSuccessScreen from "./screens/RestoreSuccess";
import ReceiveCodeScreen from "./screens/ReceiveCodeScreen";
import SendScreen from "./screens/SendScreen";
import SendSecondScreen from "./screens/SendSecondScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import TransactionDetailScreen from "./screens/TransactionDetail";
import AdvancedWithdrawScreen from "./screens/AdvancedWithdraw";
import SetAmountScreen from "./screens/SetAmountScreen";
import USDRScreen from "./screens/USDRScreen";
import USDREnterScreen from "./screens/USDREnterScreen";
import USDRCompletedScreen from "./screens/USDRCompletedScreen";
import SelectPaymentScreen from "./screens/SelectPaymentScreen";
import SelectFavoriteScreen from "./screens/SelectFavoriteScreen";
import RelayOneAuth from "./screens/RelayOneAuth";
import RelayOneSync from "./screens/RelayOneSync";
import RelayOneScreen from "./screens/RelayOneScreen";
import RelayWithdrawScreen from "./screens/RelayWithdrawScreen";
import RelayDetailScreen from "./screens/RelayDetailScreen";
import SendSuccessScreen from "./screens/SendSuccessScreen";
import InviteFriendScreen from "./screens/InviteFriendScreen";
import LanguageScreen from "./screens/LanguageScreen";
import WebContainerScreen from "./screens/WebContainerScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import ExpiredPageScreen from "./screens/ExpiredPageScreen";

import WithdrawModal from "./src/components/WithdrawTransactionModal";
import NotificationScreen from "./screens/NotificationScreen";
import { useCheckOrderReceive } from "./actions/OrdersActions";
import { isValidRelayOneQR } from "./src/relayone";

import * as Sentry from "@sentry/react-native";

import { PortalProvider, WhitePortal } from "react-native-portal";
import { setApiKey } from "./src/api";
import { useDidMount } from "./src/hooks/useDidMount";
import { useBalanceUpdate } from "./src/hooks/useBalanceUpdate";
import { useOnTransactionsList } from "./actions";
import { useUpdateExchangeRates } from "./actions/CurrencyActions";

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
    prevScene.route.routeName === "main" &&
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
    transactions: { screen: TransactionsScreen },
    transactionDetail: { screen: TransactionDetailScreen },
    webContainer: { screen: WebContainerScreen },
    advancedWithdraw: { screen: AdvancedWithdrawScreen }
  },
  {
    headerMode: "none",
    initialRouteName: "transactions"
  }
);

// Settings Navigation Flow
const SettingsNavigator = createStackNavigator(
  {
    settings: { screen: SettingsScreen },
    localCurrency: { screen: LocalCurrencyScreen },
    pin: { screen: PinScreen },
    backup: { screen: BackupScreen },
    restore: { screen: RestoreScreen },
    restoreSuccess: { screen: RestoreSuccessScreen },
    notification: { screen: NotificationScreen },
    usdr: { screen: USDRScreen },
    usdrEnter: { screen: USDREnterScreen },
    usdrCompleted: { screen: USDRCompletedScreen },
    relayOneAuth: { screen: RelayOneAuth },
    relayOneSync: { screen: RelayOneSync },
    relayOne: { screen: RelayOneScreen },
    relayWithdraw: { screen: RelayWithdrawScreen },
    relayDetail: { screen: RelayDetailScreen },
    language: { screen: LanguageScreen },
    inviteFriend: { screen: InviteFriendScreen }
  },
  {
    headerMode: "none",
    initialRouteName: "settings"
  }
);

// Main Navigation Flow
const MainNavigator = createStackNavigator(
  {
    main: MainScreen,
    sendFiat: SendFiatScreen,
    scan: ScanScreen,
    send: SendScreen,
    sendSecond: SendSecondScreen,
    topUp: TopUpScreen,
    setAmount: SetAmountScreen,
    receiveCode: ReceiveCodeScreen,
    transactionDetail: TransactionDetailScreen,
    advancedWithdraw: AdvancedWithdrawScreen,
    selectPaymentMethod: SelectPaymentScreen,
    selectFavorite: SelectFavoriteScreen,
    sendSuccess: SendSuccessScreen,
    transactionNavigator: TransactionNavigator,
    settingsNavigator: SettingsNavigator,
    upload: UploadScreen,
    expiredPage: ExpiredPageScreen
  },
  {
    headerMode: "none",
    initialRouteName: "main",
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

// Disable due to unused drawer by Maxim.
/* const MyAppNavigator = createDrawerNavigator(
  {
    mainNavigator: { screen: MainNavigator },
    transactionNavigator: { screen: TransactionNavigator },
    settingsNavigator: { screen: SettingsNavigator },
    setHandle: { screen: SetHandleScreen }
  },
  {
    drawerLockMode: "locked-closed",
    contentComponent: props => <Drawer {...props} />,
    initialRouteName: "mainNavigator"
  }
); */

const StarterNavigator = createStackNavigator(
  {
    welcome: WelcomeScreen,
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
    }
    appState = state;
  };

  const handleUrl = async ({ url }: { url: string }) => {
    console.log(url);
    if (isValidRelayOneQR(url)) {
      // Link relay one
      console.log("valid");
      delay(() => {
        navigate("relayOneAuth", { qrCode: url });
      }, 1000);
    }
  };

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
