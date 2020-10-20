/* global require */
import React, { useState, useEffect } from "react";
import {
  Image,
  Text,
  View,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  BackHandler,
  Clipboard,
  ScrollView,
  RefreshControl
} from "react-native";
import compareVersions from "compare-versions";
import find from "lodash/find";
import I18n from "../src/locales";
import util from "../utils/util";
import { Colors } from "../src/constants";
import { ConfirmModal } from "../src/components/ConfirmModal";
import { Loader } from "../src/components/Loader";
import NotificationsSubscriber from "../src/components/NotificationsSubscriber";
import { useOnTransactionsList, onSetBalanceFlag } from "../actions";
import { NavigationProps, useDispatch } from "../src/types";
import { AppState } from "../reducers";
import { useUpdateExchangeRates } from "../actions/CurrencyActions";
import { getBalanceShow } from "../src/selectors/walletSelectors";
import BackupWarning from "./main/BackupWarning";
import { Header } from "../src/components/Header";
import { useDidMount } from "../src/hooks/useDidMount";
import { useDidUpdate } from "../src/hooks/useDidUpdate";
import { useBalanceUpdate } from "../src/hooks/useBalanceUpdate";
import { useApi } from "../src/api";
import { useSelector } from "react-redux";
import { AuthorizeSheet } from "../src/components/AuthorizeSheet";

interface ImageButtonProps {
  onPress: () => any;
  image: number;
  children: React.ReactNode;
}

function ImageButton(props: ImageButtonProps) {
  return (
    <TouchableOpacity style={[styles.scanButton]} onPress={props.onPress}>
      <Image
        resizeMode="contain"
        source={props.image}
        style={{ height: 32, width: 32 }}
      />
      <Text allowFontScaling={false} style={styles.scanText}>
        {props.children}
      </Text>
    </TouchableOpacity>
  );
}

interface CenterViewProps {
  title: string;
  titleAddon?: React.ReactElement;
  subTitle: string;
  subTitleAddon?: React.ReactElement;
  onPress: () => void;
}

function CenterView(props: CenterViewProps) {
  const { title, titleAddon, subTitle, subTitleAddon, onPress } = props;
  return (
    <>
      <TouchableOpacity style={styles.showBalance} onPress={onPress}>
        <Text allowFontScaling={false} style={styles.balance}>
          {title}
        </Text>
        {!!titleAddon && titleAddon}
      </TouchableOpacity>
      <View style={styles.row}>
        <Text allowFontScaling={false} style={styles.amount}>
          {subTitle}
        </Text>
        {!!subTitleAddon && subTitleAddon}
      </View>
    </>
  );
}

interface BalanceViewProps {
  onPress: () => void;
}

function BalanceView(props: BalanceViewProps) {
  const { onPress } = props;
  const dispatch = useDispatch();
  let { showBalanceFlag, balanceShow, localSymbolSign, satoshi } = useSelector(
    mapStateToProps
  );

  const onShowHiddenBalance = () => {
    dispatch(onSetBalanceFlag(!showBalanceFlag));
  };

  let showBsv = false;
  let amountDisplay = util.roundCurrency(satoshi);
  if (satoshi >= 100000000) {
    const satoshiString = satoshi.toString();
    showBsv = true;
    amountDisplay =
      satoshiString.slice(0, satoshiString.length - 8) +
      "." +
      satoshiString.slice(satoshiString.length - 8);
  }

  return (
    <CenterView
      title={showBalanceFlag ? amountDisplay : "***"}
      titleAddon={
        <Text style={styles.satoshiUnit}>
          {" "}
          {showBsv ? "BSV" : I18n.t("satoshi")}
        </Text>
      }
      subTitle={`${localSymbolSign} ${
        showBalanceFlag ? util.formatCurrency(balanceShow) : "*****"
      }`}
      subTitleAddon={
        <TouchableOpacity activeOpacity={0.5} onPress={onShowHiddenBalance}>
          {showBalanceFlag ? (
            <Image
              resizeMode="contain"
              source={require("../icons/show-balance.png")}
              style={{ height: 20, width: 20, marginLeft: 10 }}
            />
          ) : (
            <Image
              resizeMode="contain"
              source={require("../icons/hidden-balance.png")}
              style={{ height: 20, width: 20, marginLeft: 10 }}
            />
          )}
        </TouchableOpacity>
      }
      onPress={onPress}
    />
  );
}

type Props = NavigationProps<{
  qrCodeString?: string;
}>;

export default function MainScreen(props: Props) {
  const api = useApi();
  const updateExchangeRates = useUpdateExchangeRates();
  const onTransactionsList = useOnTransactionsList();
  const checkBalanceUpdate = useBalanceUpdate();
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [versionInfo, setVersionInfo] = useState({ isVisible: false } as {
    isVisible: boolean;
    url?: string;
    version?: number;
    upgrade?: boolean;
  });
  const {
    handle,
    hideBackupWarning,
    currencyExchangeRate,
    localSymbolSign
  } = useSelector(mapStateToProps);

  useDidMount(async () => {
    await Promise.all([checkBalanceUpdate(), updateExchangeRates()]);
    BackHandler.addEventListener("hardwareBackPress", handleBackButton);
    setLoading(false);
    await checkNewVersion();
    onTransactionsList();
  });

  useEffect(() => {
    const listener = props.navigation.addListener("didFocus", () => {
      Promise.all([checkBalanceUpdate(), updateExchangeRates()]);
    });

    return () => listener.remove();
  });

  useEffect(() => {
    Promise.all([checkBalanceUpdate(), updateExchangeRates()]).then(() => {
      setRefreshing(false);
    });
  }, [refreshing]);

  useDidUpdate(async () => {
    if (showBalance) {
      setLoading(true);
      try {
        await Promise.all([checkBalanceUpdate(), updateExchangeRates()]);
      } catch {
        console.log("err fetching balance");
      }
      setLoading(false);
    }
  }, [showBalance]);

  async function checkNewVersion() {
    try {
      const res = await api.settingNewVersion();
      if (res.code === 0) {
        const versionInfo = find(res.data, { os: Platform.OS.toUpperCase() });
        if (versionInfo) {
          const appVersion = util.getAppVersion();
          if (compareVersions(appVersion, versionInfo.version) < 0) {
            setVersionInfo({
              ...versionInfo,
              isVisible: true
            });
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  function handleBackButton() {
    BackHandler.exitApp();
    return true;
  }

  const openSideMenu = () => {
    props.navigation.navigate("settingsNavigator" as any);
  };

  const openTopUpBSV = () => {
    props.navigation.navigate("topUp", { paymentId: 1 });
  };

  const goTopUp = () => {
    props.navigation.navigate("topUp", {});
  };

  const navigateToSend = () => {
    props.navigation.navigate("send");
  };

  const onClickScanButton = () => {
    props.navigation.navigate("scan");
  };

  const switchBalance = () => {
    setShowBalance(!showBalance);
  };

  const handleUpdateCancelPress = () => {
    setVersionInfo({
      ...versionInfo,
      isVisible: false
    });
  };

  const handleUpdatePress = () => {
    util.openUrlBrowser(versionInfo.url!);
  };

  const onBackup = () => {
    props.navigation.navigate("backup");
  };

  const paymail = `${handle.substring(1)}@relayx.io`;

  const copyPaymail = () => {
    if (copied) {
      return;
    }
    Clipboard.setString(paymail);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const paymailEl = (
    <TouchableOpacity activeOpacity={0.5} onPress={copyPaymail}>
      <View style={styles.row}>
        <Text allowFontScaling={false} style={[styles.title]}>
          {copied ? I18n.t("copied") : paymail}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <NotificationsSubscriber />
      <StatusBar
        backgroundColor={Colors.DarkBlueGrey}
        barStyle="light-content"
      />
      <Header
        theme={"light"}
        headerText={""}
        onBackPress={openSideMenu}
        leftIcon={require("../icons/more-white.png")}
        rightButtonText={I18n.t("activity")}
      />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
            }}
          />
        }
      >
        <View style={{ flex: 1 }}>
          <View style={styles.main}>
            {paymailEl}
            {showBalance ? (
              <BalanceView onPress={switchBalance} />
            ) : (
              <CenterView
                onPress={switchBalance}
                title={`${localSymbolSign} ${util.assignCurrency(
                  1 / Number(currencyExchangeRate),
                  2
                )}`}
                subTitle={I18n.t("price")}
              />
            )}
            <TouchableOpacity onPress={goTopUp}>
              <View style={styles.topUpView}>
                <Text
                  style={{ fontSize: 14, lineHeight: 32, color: "#2a2a2e" }}
                >
                  {I18n.t("addFunds")}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          {!hideBackupWarning && <BackupWarning onPress={onBackup} />}
          <View style={styles.scan}>
            <ImageButton
              image={require("../icons/receive.png")}
              onPress={openTopUpBSV}
            >
              {I18n.t("receive")}
            </ImageButton>

            <ImageButton
              image={require("../icons/send.png")}
              onPress={navigateToSend}
            >
              {I18n.t("send")}
            </ImageButton>
            <ImageButton
              image={require("../icons/scan-QC.png")}
              onPress={onClickScanButton}
            >
              {I18n.t("scan")}
            </ImageButton>
          </View>
        </View>
      </ScrollView>
      <ConfirmModal
        visible={versionInfo.isVisible}
        title={I18n.t("updateModalTitle")}
        titleStyle={{ textAlign: "left" }}
        description={I18n.t("updateModalMessage", {
          versionNumber: versionInfo.version
        })}
        descriptionStyle={{
          textAlign: "left",
          marginTop: 10,
          marginBottom: 20
        }}
        titleYes={I18n.t("update")}
        titleNo={I18n.t("later")}
        single={versionInfo.upgrade!}
        onPressCancel={handleUpdateCancelPress}
        onPressYes={handleUpdatePress}
      />
      {!!props.navigation.state.params.qrCodeString && (
        <AuthorizeSheet
          onRequestClose={() => {
            props.navigation.setParams({ qrCodeString: "" });
          }}
          isLoading={false}
          navigation={props.navigation}
        />
      )}

      <Loader visible={loading} theme="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row"
  },
  container: {
    backgroundColor: Colors.DarkBlueGrey,
    flex: 1
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    color: Colors.LightGrey,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? void 0 : ""
  },
  main: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  amount: {
    fontSize: 15,
    lineHeight: 20,
    color: Colors.LightGrey,
    marginBottom: 16
  },
  showBalance: {
    marginVertical: 8,
    flexDirection: "row",
    justifyContent: "center"
  },
  balance: {
    lineHeight: 42,
    fontSize: 36,
    fontWeight: "500",
    color: "#ebebf5"
  },
  scan: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    marginHorizontal: 12
  },
  scanButton: {
    flex: 1,
    marginHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
    height: 72,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12
  },
  scanText: {
    fontSize: 15,
    lineHeight: 20,
    color: "#EBEBF5"
  },
  topUpView: {
    backgroundColor: "#f2f2f7",
    borderRadius: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "center"
  },
  satoshiUnit: {
    fontSize: 15,
    lineHeight: 32,
    color: "#ebebf5"
  }
});

function mapStateToProps(state: AppState) {
  const { main, wallet, currency, ui } = state;
  return {
    balanceShow: getBalanceShow(state),
    symbolId: main.symbolId,
    handle: main.handle,
    satoshi: wallet.satoshi,
    showBalanceFlag: main.showBalanceFlag,
    currencyExchangeRate: currency[main.symbolId] || 1,
    localSymbolSign: main.localSymbolSign,
    hideBackupWarning: !!ui.hideBackupWarning
  };
}
