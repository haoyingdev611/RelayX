import React, { Component } from "react";
import { Text, View, StatusBar, SafeAreaView, Alert } from "react-native";

import I18n from "../src/locales";
import { Colors } from "../src/constants";
import { Header } from "../src/components/Header";
import { NavigationProps } from "../src/types";
import { PaymentsList } from "../src/components/PaymentsList";
import { ScanData, useApi, VerifyResult } from "../src/api";
import { Loader } from "../src/components/Loader";
import { QRreader } from "react-native-qr-scanner";
import { isValidRelayOneQR } from "../src/relayone";

interface OwnProps {
  data: ScanData[];
  onSelect(item: ScanData): void;
}

type Props = NavigationProps<{
  scanType: string;
  uri: string;
}>;
function SelectPayment(props: OwnProps) {
  const { data } = props;
  const dataDetail: ScanData = data[0];
  return (
    <View style={{ flex: 1, flexDirection: "column", backgroundColor: "#fff" }}>
      <Text
        style={{
          fontSize: 10,
          color: Colors.ChateauGrey,
          alignSelf: "center",
          marginTop: 15
        }}
      >
        {dataDetail.qrCode}
      </Text>
      <Text
        style={{
          fontSize: 20,
          alignSelf: "center",
          color: Colors.DarkGrey,
          marginVertical: 20,
          marginTop: 60
        }}
      >
        {I18n.t("whichChannelAreYou")}
      </Text>
      <PaymentsList data={data} onSelect={props.onSelect} flat />
    </View>
  );
}

class SelectChanneltScreen extends Component<Props> {
  state = {
    loading: true,
    data: []
  };
  async componentDidMount() {
    try {
      const { uri, scanType } = this.props.navigation.state.params;
      if (scanType === "image") {
        const data = await QRreader(uri);
        this.onSuccess(data);
      } else {
        this.onSuccess(uri);
      }
    } catch (e) {
      this.errorAlert();
    }
  }

  normalizeAmount(amount: number, paymentId: number) {
    if (paymentId === 11831 || paymentId === 10001) {
      return amount / 100000000;
    }

    return amount;
  }

  goToSendScreen(data: ScanData) {
    if (data.paymentId === 1) {
      this.props.navigation.navigate("sendSecond", {
        paymentId: 1,
        amount: data.amount,
        handle: data.handle === "BSV" ? data.qrCode : data.handle,
        handleAddress: data.qrCode
      });
    } else {
      this.props.navigation.navigate("sendFiat", {
        amountInFiat: data.amount
          ? this.normalizeAmount(data.amount, data.paymentId)
          : data.amount,
        paymentId: data.paymentId,
        linkedInfo: data.qrCode
      });
    }
    setTimeout(() => {
      this.setState({ loading: false });
    }, 1500);
  }

  async onSuccess(qrCode: string) {
    const api = useApi();
    if (isValidRelayOneQR(qrCode)) {
      this.props.navigation.navigate("relayOneAuth", { qrCode });
      return;
    }

    try {
      const qrInfo = qrCode;
      const res = await api.paymentsVerify({ qrInfo });
      const { data } = res;
      let list: ScanData[] = [];
      data.forEach(result => {
        list.push({
          qrCode: result.qrCode,
          paymentId: result.paymentId,
          amount: result.amount,
          handle: result.handle,
          status: result.status
        });
      });
      if (data.length === 1) {
        this.goToSendScreen(data[0]);
      } else {
        this.setState({ loading: false });
      }
      this.setState({ data: list });
    } catch {
      this.errorAlert();
    }
  }

  errorAlert() {
    Alert.alert("RelayX", I18n.t("invalidQrCode"), [
      {
        text: I18n.t("ok"),
        onPress: () => this.props.navigation.goBack()
      }
    ]);
  }

  onSelect = (item: ScanData) => {
    this.goToSendScreen(item);
  };

  render() {
    const { data, loading } = this.state;
    return (
      <SafeAreaView style={{ backgroundColor: "#fff", flex: 1 }}>
        <StatusBar barStyle="dark-content" />
        <Header
          headerText={I18n.t("scanResults")}
          onBackPress={() => {
            this.props.navigation.goBack();
          }}
        />
        {data.length > 0 && (
          <SelectPayment onSelect={this.onSelect} data={data} />
        )}
        <Loader visible={loading} />
      </SafeAreaView>
    );
  }
}

export default SelectChanneltScreen;
