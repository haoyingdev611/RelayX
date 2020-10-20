import React, { useState } from "react";
import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput
} from "react-native";
import I18n from "../src/locales";
import { Header } from "./../src/components/Header";
import util from "../utils/util";
import { PayWallet, Colors } from "../src/constants";

import { NavigationProps, useDispatch } from "../src/types";
import { State } from "../reducers";
import { getPaymentById } from "../src/selectors/paymentSelectors";
import { Loader } from "../src/components/Loader";
import { onUpdateFavorite } from "../actions";
import { useSelector } from "react-redux";
import QREditor from "./upload/QREditor";
import ExchangeAccountEditor from "./upload/ExchangeAccountEditor";
import { isInstantExchange } from "../src/payments";

type OwnProps = NavigationProps<{
  paymentId: number;
  onSuccess: (args: { paymentId: number; linkedInfo: string }) => void;
}>;

type Props = OwnProps;

export default function UploadScreen(props: Props) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [linkedInfo, setLinkedInfo] = useState("");

  const payment = useSelector((state: State) =>
    getPaymentById(state, props.navigation.state.params.paymentId)
  );

  const paymentId = payment.paymentId;

  const onUpload = async () => {
    if ((name || "").trim()) {
      dispatch(onUpdateFavorite({ name, paymentId, linkedInfo }));
    }

    try {
      props.navigation.state.params.onSuccess({
        paymentId,
        linkedInfo
      });
    } catch (res) {
      console.log(res);
      util.showAlert(res.msg ? res.msg : I18n.t("tryAgainMessage"));
    }
  };

  const onBack = () => {
    props.navigation.goBack();
  };

  const onChangeName = (name: string) => {
    setName(name);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <Header headerText={I18n.t("send")} onBackPress={onBack} />
        <View style={{ flex: 1, padding: 12 }}>
          <Text style={{ fontSize: 12, color: Colors.DarkGrey }}>
            {I18n.t("paymentInfo")}
          </Text>
          <View style={styles.favView}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "center"
              }}
            >
              <Image
                resizeMode="contain"
                source={PayWallet[payment.paymentName]}
                style={{
                  marginLeft: 15,
                  marginTop: 10,
                  width: 40,
                  height: 40
                }}
              />
              <Text
                allowFontScaling={false}
                style={{
                  justifyContent: "center",
                  alignSelf: "center",
                  marginLeft: 8,
                  fontSize: 20
                }}
              >
                {I18n.t(payment.paymentName, {
                  defaultValue: payment.paymentName
                })}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end", justifyContent: "center" }}>
              <TouchableOpacity onPress={onBack}>
                <Text
                  style={{
                    fontSize: 16,
                    marginRight: 12,
                    color: "#2669FF"
                  }}
                >
                  {I18n.t("change")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {isInstantExchange(paymentId) ? (
            <ExchangeAccountEditor
              linkedInfo={linkedInfo}
              onChange={setLinkedInfo}
              paymentId={paymentId}
            />
          ) : (
            <QREditor
              setLoading={setLoading}
              linkedInfo={linkedInfo}
              onChange={setLinkedInfo}
              paymentId={paymentId}
            />
          )}

          <Text style={{ fontSize: 12, color: Colors.DarkGrey, marginTop: 50 }}>
            {I18n.t("Display Name (optional)")}
          </Text>
          <View style={[styles.favView, { backgroundColor: "#fff" }]}>
            <TextInput
              style={[styles.handle]}
              allowFontScaling={false}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              placeholder={I18n.t("displayName")}
              underlineColorAndroid="transparent"
              onChangeText={onChangeName}
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={
            linkedInfo ? styles.btnConfirmActive : styles.btnConfrimInActive
          }
          onPress={() => linkedInfo && onUpload()}
        >
          <Text
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: 19,
              color: "#fff"
            }}
          >
            {I18n.t("next")}
          </Text>
        </TouchableOpacity>
      </View>
      <Loader visible={loading} />
    </SafeAreaView>
  );
}

//Create Stylesheet
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff"
  },

  favView: {
    marginTop: 10,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#f8f8fa",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  handle: {
    fontSize: 16,
    lineHeight: 21,
    height: 40,
    width: "100%",
    borderBottomColor: "#00000020",
    borderBottomWidth: 1
  },

  footer: {
    marginBottom: 30,
    padding: 15
  },

  btnConfirmActive: {
    backgroundColor: "rgb(38,105,255)",
    justifyContent: "center",
    borderRadius: 5,
    height: 50
  },

  btnConfrimInActive: {
    backgroundColor: "rgb(204,220,255)",
    justifyContent: "center",
    borderRadius: 5,
    height: 50
  }
});
