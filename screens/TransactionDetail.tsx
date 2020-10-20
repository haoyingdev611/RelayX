import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  StatusBar,
  Dimensions,
  Image,
  Clipboard
} from "react-native";
import I18n from "../src/locales";
import ImagePicker from "react-native-image-picker";
import URL from "../utils/URL";
import util from "../utils/util";
import { Colors } from "../src/constants";
import { Header } from "../src/components/Header";
import { ConfirmModal } from "../src/components/ConfirmModal";
import DisputeModal from "../src/components/DisputeModal";
import {
  PaymentLogo,
  PaymentDestinationName
} from "../src/components/PaymentNameWithLogo";
import { NavigationProps } from "../src/types";
import { AppState } from "../reducers";
import { useOnTransactionsList } from "../actions";
import { Loader } from "../src/components/Loader";
import { useSelector } from "react-redux";
import { useDidMount } from "../src/hooks/useDidMount";
import { useDidUpdate } from "../src/hooks/useDidUpdate";
import { useApi } from "../src/api";
import { AUTO_CLOSE_TIMEOUT } from "../src/config";

const screenWidth = Dimensions.get("window").width;

type OwnProps = NavigationProps<{
  orderId: string;
  tranType: number;
  autoClose?: boolean;
}>;

type Props = OwnProps;

function getStatusLabel(status: number | null, tranType: number) {
  switch (status) {
    case 0:
      return "Pending";
    case 10000:
      return "Completed";
    case -200:
      return "Cancelled";
    case -100:
      return "Conflict";
  }

  if (tranType === 1) {
    switch (status) {
      case 100:
        return "Pending";
      case 200:
        return "Awaiting your confirmation";
    }
  }

  if (tranType === 2) {
    switch (status) {
      case 100:
        return "Awaiting your confirmation";
      case 200:
        return "Pending";
    }
  }

  return "Pending";
}

export default function TransactionDetailScreen(props: Props) {
  const api = useApi();
  const transaction = useSelector(({ transactionsReducer }: AppState) => {
    return transactionsReducer.transactions.find(
      t =>
        t.serialNumber === props.navigation.state.params.orderId &&
        t.tranType === props.navigation.state.params.tranType
    );
  });
  const onTransactionsList = useOnTransactionsList();

  const [timer, setTimer] = useState(0);
  const [operateType, setOperateType] = useState(0);
  const [stateStatus, setStatus] = useState(null as null | number);
  const [feeDesc, setFeeDesc] = useState("");
  const [walletEarnAmount, setWalletEarnAmount] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isVisibleDispute, setIsVisibleDispute] = useState(false);
  const [loading, setLoading] = useState(!transaction);

  const orderId = props.navigation.state.params.orderId;
  const tranType = transaction
    ? transaction.tranType
    : props.navigation.state.params.tranType;
  const localSign = transaction ? transaction.localSymbolSign : "";
  const localAmount = transaction ? transaction.localAmount : 0;

  const createdDate = transaction
    ? util.formatCalendar(util.parseDate(transaction.createdDate))
    : "";

  const txId = transaction ? transaction.txid : "";
  const status = stateStatus
    ? stateStatus
    : transaction
    ? transaction.status
    : null;

  const payMark = transaction ? transaction.payMark : "";

  const paymentId = transaction ? transaction.payMode : 1;

  const statusLabel = getStatusLabel(status, tranType);

  const tranFrom = transaction ? transaction.tranFrom : 1;

  useDidMount(() => {
    if (props.navigation.state.params.autoClose) {
      setTimeout(() => {
        props.navigation.navigate("scan");
      }, AUTO_CLOSE_TIMEOUT);
    }

    onFetch();
  });

  useDidUpdate(() => {
    if (transaction) {
      setLoading(false);
    }

    if (!transaction) {
      setLoading(true);
      onTransactionsList();
    }
  }, [transaction]);

  async function onFetch() {
    // FIXME fetch individual tx
    if (!transaction) onTransactionsList();
    const res = await api.earnGetDetail(orderId, tranType);

    // console.log(res);
    if (res.code === 0) {
      let { feeDesc } = res.data;
      feeDesc = feeDesc.replace(/\W/g, "");
      feeDesc = feeDesc.charAt(0).toLowerCase() + feeDesc.substring(1);
      setStatus(res.data.status);
      setOperateType(res.data.operateType);
      setWalletEarnAmount(res.data.walletEarnAmount);
      setFeeDesc(feeDesc);
      if (
        ((res.data.status === 200 && res.data.type === 1) ||
          (res.data.type === 2 &&
            (res.data.status === 0 ||
              res.data.status === 100 ||
              res.data.status === 200))) &&
        !timer &&
        res.data.expireTime
      ) {
        setTimer(res.data.expireTime);
      }
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => setTimer(timer - 1), 1000);
    if (timer === 0) {
      onFetch();
    }
    return () => clearTimeout(timeout);
  }, [timer]);

  function handleBack() {
    props.navigation.goBack();
  }

  async function handleSentPress() {
    try {
      await api.rechargeSend(orderId);
      props.navigation.navigate("scan");
    } catch (err) {
      console.log(err);
    }
  }

  async function handleCancelPress() {
    try {
      api.cancelRecharge(orderId);
      props.navigation.navigate("scan");
    } catch {
      // FIXME
      console.log("cancel failed");
    }
  }

  async function handleSupport() {
    Clipboard.setString(orderId);
    Alert.alert("RelayX", I18n.t("contactEmailSupportMessage"), [
      {
        text: I18n.t("ok"),
        onPress: () => {
          const properties = {
            to: "support@relayx.io",
            subject: "Report",
            body: ""
          };
          util.sendEmail(properties);
        }
      },
      {
        text: I18n.t("cancel"),
        style: "cancel"
      }
    ]);
  }

  function handleDisputeYes() {
    ImagePicker.launchImageLibrary(
      {
        title: I18n.t("selectProof"),
        noData: false,
        storageOptions: {
          skipBackup: true,
          cameraRoll: true,
          waitUntilSaved: true,
          path: "images"
        }
      },
      response => {
        if (!response.didCancel && !response.error) {
          const type = response.type || "image/jpeg";
          const base64Data = `data:${type};base64,${response.data}`;
          setIsVisibleDispute(false);

          api
            .rechargeDisputeImage(orderId, base64Data)
            .then(() => props.navigation.navigate("scan"))
            .catch(() => {
              props.navigation.navigate("scan");
            });
        }
      }
    );
  }

  function handleDisputeCancel() {
    setIsVisibleDispute(false);

    props.navigation.navigate("scan");
  }

  function handleActionExplorer() {
    props.navigation.navigate("webContainer", {
      txId
    });
  }

  function handleAdvancedOrderDetails() {}

  // 取消订单
  async function onCancelOrder() {
    try {
      const res = await api.sendOrderCancel(orderId);
      console.log(res);
      onFetch();
    } catch (err) {
      console.log(err);
      if (err.code === -5 || err.code === -213) {
        setIsModalVisible(true);
      }
    }
  }

  // 弹窗点击OK
  function popUpOk() {
    setIsModalVisible(false);
    onFetch();
  }

  const orderStyle = { color: Colors.LightGrey };
  const currencyStyle = { color: Colors.ChateauGrey };
  if (status === 200 && tranType === 2) {
    orderStyle.color = Colors.OrangeYellow;
  }
  if (status === 10000) {
    currencyStyle.color = orderStyle.color =
      tranType === 2 ? Colors.FrogGreen : Colors.OrangeYellow;
  }
  if (status === 0) {
    orderStyle.color = Colors.BlueyGrey;
  }

  const cancelButtonStyle = {
    backgroundColor: Colors.LightPeriwinkleWithOpacity(0.3)
  };
  const cancelTitle = { color: Colors.ClearBlue };
  const warningBackground = {
    backgroundColor:
      tranType === 2 && status === 100
        ? Colors.OrangeYellowWithOpacity(0.1)
        : "transparent"
  };

  const isInstant = payMark.startsWith("float:") || payMark.startsWith("okex:");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <View style={styles.container}>
        <Header
          hideBack={!!props.navigation.state.params.autoClose}
          headerText={""}
          onBackPress={handleBack}
        />
        <View style={styles.payLogo}>
          <PaymentLogo paymentId={paymentId} linkedInfo={payMark} size={60} />
        </View>
        <View style={styles.contactInfo}>
          <View style={styles.favorite}>
            <PaymentDestinationName
              paymentId={paymentId}
              linkedInfo={payMark}
              style={{ marginRight: paymentId === 1 ? 0 : 10 }}
            />
          </View>
          {paymentId === 1 && !isInstant && (
            <Text style={styles.payMark}>
              {payMark.replace("okex:", "").replace("float:", "")}
            </Text>
          )}
        </View>

        <View style={[styles.flexOne, styles.center]}>
          <View style={[styles.row, styles.center]}>
            <Text style={[styles.textCurrencySymbol, currencyStyle]}>
              {tranType === 0 ? "" : tranType === 1 ? "-" : "+"} {localSign}
            </Text>
            <Text style={[styles.textCurrencyAmount, currencyStyle]}>
              {util.assignCurrency(localAmount)}
            </Text>
          </View>
          {status === 10000 && (
            <Text style={styles.textPayType}>
              {tranType === 2 ? I18n.t("deposit") : I18n.t("sent")}
            </Text>
          )}
          {status !== 10000 && (
            <Text style={[styles.textOrderStatus, orderStyle]}>
              {I18n.t(statusLabel, { defaultValue: statusLabel })}
            </Text>
          )}
        </View>

        <View style={styles.flexOne}>
          <View style={styles.orderWrapper}>
            <Text style={styles.description}>{I18n.t("orderId")}</Text>
            <Text style={styles.textContent}>{orderId}</Text>
          </View>
          <View style={[styles.orderWrapper, styles.borderTop]}>
            <Text style={styles.description}>{I18n.t("orderCreateTime")}</Text>
            <Text style={styles.textContent}>{createdDate}</Text>
          </View>
          {Number(walletEarnAmount) > 0 && (
            <View style={[styles.orderWrapper, styles.borderTop]}>
              <Text style={styles.description}>
                {I18n.t(feeDesc, {
                  defaultValue: feeDesc
                })}
              </Text>
              <Text style={styles.textContent}>
                {localSign} {walletEarnAmount}
              </Text>
            </View>
          )}
          {status !== -100 && status !== -200 && !!txId && (
            <View style={styles.actionButtonWrapper}>
              <TouchableOpacity onPress={handleActionExplorer}>
                <Text style={[styles.description, cancelTitle]}>
                  {I18n.t("viewDetails")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={[styles.timerWrapper, styles.center]}>
          {status === 100 && tranType === 2 && (
            <Text style={styles.textTimer}>
              {timer > 0 ? I18n.t("expiresTime", { seconds: timer }) : ""}
            </Text>
          )}
        </View>

        <View style={[styles.warningView, warningBackground]}>
          {tranType === 2 && status === 100 && (
            <Text style={styles.warningText}>
              {I18n.t("falseConfirmWarnMessage")}
            </Text>
          )}
        </View>

        {tranType === 2 && (
          <View style={styles.bottomButtonWrapper}>
            {status === 100 && (
              <TouchableOpacity
                style={[styles.button, styles.center, cancelButtonStyle]}
                onPress={handleCancelPress}
              >
                <Text style={[styles.buttonTitle, cancelTitle]}>
                  {I18n.t("cancel")}
                </Text>
              </TouchableOpacity>
            )}

            {status === 100 && (
              <TouchableOpacity
                style={[styles.button, styles.center]}
                onPress={handleSentPress}
              >
                <Text style={[styles.buttonTitle]}>{I18n.t("sent")}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {tranType === 1 && (status === 0 || status === 100) && (
          <View>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={
                tranFrom === 5 && operateType === 1
                  ? handleAdvancedOrderDetails
                  : onCancelOrder
              }
            >
              <View style={[styles.sentView, cancelButtonStyle]}>
                <Text
                  allowFontScaling={false}
                  style={[styles.sent, cancelTitle]}
                >
                  {tranFrom === 5 && operateType === 1 ? "" : I18n.t("cancel")}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          style={[styles.favorite, { marginBottom: 20 }]}
          onPress={handleSupport}
        >
          <Image
            source={require("../icons/telegram.png")}
            style={styles.sendIcon}
          />
          <Text style={{ fontSize: 13, color: Colors.ChateauGrey }}>
            {I18n.t("helpSupport")}
          </Text>
        </TouchableOpacity>
        <ConfirmModal
          visible={isModalVisible}
          title={I18n.t("paymentInProgress")}
          description={I18n.t("tryAgainMessage")}
          titleYes={I18n.t("ok")}
          single={true}
          onPressYes={popUpOk}
        />
      </View>
      <Loader visible={loading} />
      <DisputeModal
        visible={isVisibleDispute}
        serialNumber={orderId}
        paymentId={paymentId}
        linkedInfo={payMark}
        walletSymbolSign={localSign}
        walletSendAmount={localAmount.toString()}
        onPressCancel={handleDisputeCancel}
        onPressYes={handleDisputeYes}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  payLogo: {
    position: "absolute",
    top: 10,
    left: (screenWidth - 60) / 2
  },
  contactInfo: {
    marginTop: 20,
    paddingTop: 10,
    alignItems: "center"
  },
  favorite: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  payMark: {
    fontSize: 12,
    color: Colors.LightGrey
  },
  orderWrapper: {
    flexDirection: "row",
    marginHorizontal: 30,
    paddingVertical: 13,
    justifyContent: "space-between"
  },
  borderTop: {
    borderTopColor: Colors.Light,
    borderTopWidth: 1
  },
  warningView: {
    marginHorizontal: 15,
    padding: 8,
    height: 30,
    marginBottom: 10,
    alignItems: "center"
  },
  actionButtonWrapper: {
    paddingTop: 12,
    paddingHorizontal: 30,
    alignItems: "flex-end"
  },
  bottomButtonWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 50,
    marginTop: 10,
    marginBottom: 20,
    marginHorizontal: 15
  },
  sentView: {
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 20,
    borderRadius: 5,
    height: 50,
    backgroundColor: Colors.ClearBlue,
    justifyContent: "center"
  },
  sent: {
    fontWeight: "bold",
    fontSize: 19,
    textAlign: "center",
    color: "#fff"
  },
  timerWrapper: { height: 34 },
  textOrderStatus: { fontSize: 16, fontWeight: "500" },
  textCurrencySymbol: {
    fontSize: 20,
    fontWeight: "bold",
    padding: 10,
    color: "#000"
  },
  textCurrencyAmount: { fontSize: 45, fontWeight: "500", color: "#000" },
  textPayType: { fontSize: 16, paddingTop: 10, color: Colors.BlueyGrey },
  description: { fontSize: 13, color: Colors.BlueyGrey },
  textContent: { fontSize: 13, color: Colors.DarkGrey },
  warningText: { fontSize: 12, color: Colors.OrangeYellow },
  textTimer: { fontSize: 14, color: Colors.LightGrey, fontWeight: "500" },
  buttonTitle: { fontSize: 19, fontWeight: "bold", color: "white" },
  button: {
    height: 50,
    borderRadius: 5,
    width: "48%",
    backgroundColor: Colors.ClearBlue
  },
  center: { justifyContent: "center", alignItems: "center" },
  row: { flexDirection: "row" },
  flexOne: { flex: 1 },
  sendIcon: {
    tintColor: Colors.ChateauGrey,
    width: 16,
    height: 16,
    marginRight: 5
  }
});
