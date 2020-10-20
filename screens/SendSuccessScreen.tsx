import React, { useEffect } from "react";
import { View, SafeAreaView, StyleSheet, Image, Text } from "react-native";
import I18n from "../src/locales";
import util from "../utils/util";
import { Colors } from "../src/constants";
import { InputMetaTextInfo } from "../src/components/InputMetaText";
import { NavigationProps } from "../src/types";
import { AppState } from "../reducers";
import { useSelector } from "react-redux";
import { AUTO_CLOSE_TIMEOUT } from "../src/config";

interface OwnProps {}

type Props = OwnProps &
  NavigationProps<{
    amount: number;
    amountSAT: number;
    handle: string;
    inputMode: number;
  }>;

const InputMode = {
  Currency: 0,
  Satoshi: 1
};

export default function SendSuccessScreen(props: Props) {
  const onBack = () => {
    props.navigation.navigate("scan");
  };

  useEffect(() => {
    const id = setTimeout(onBack, AUTO_CLOSE_TIMEOUT);
    return () => clearTimeout(id);
  });
  const localSymbolSign = useSelector(({ main }: AppState) => {
    const { localSymbolSign } = main;
    return localSymbolSign || "";
  });

  const {
    amount,
    amountSAT,
    handle,
    inputMode
  } = props.navigation.state.params;
  return (
    <SafeAreaView style={{ backgroundColor: "#fff", flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.mainView}>
          <View style={[styles.button, styles.acceptButton]}>
            <Image
              resizeMode="contain"
              source={require("../icons/selected.png")}
              style={styles.acceptImage}
            />
          </View>
          <Text style={styles.fund}>
            {handle
              ? I18n.t("sendSuccessMessage", { recipient: handle })
              : I18n.t("sendSuccessAnonymous")}
          </Text>
          <View style={styles.numberView}>
            <Text style={styles.unit}>
              {inputMode === InputMode.Currency ? localSymbolSign : "sat"}
            </Text>
            <Text style={styles.number}>
              {util.assignCurrency(
                inputMode === InputMode.Currency ? amount : amountSAT,
                inputMode === InputMode.Currency ? 2 : 0
              )}
            </Text>
          </View>
          {inputMode === InputMode.Satoshi && (
            <InputMetaTextInfo>{`${localSymbolSign} ${util.assignCurrency(
              amount
            )}`}</InputMetaTextInfo>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  mainView: {
    marginTop: 190,
    marginBottom: 55,
    justifyContent: "center",
    alignItems: "center"
  },
  fund: {
    fontSize: 14,
    lineHeight: 18,
    color: "#000",
    marginTop: 18,
    textAlign: "center"
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    justifyContent: "center",
    alignItems: "center"
  },
  acceptButton: { borderColor: Colors.FrogGreen },
  acceptImage: { width: 40, height: 40, tintColor: Colors.FrogGreen },
  numberView: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 10
  },
  number: {
    fontSize: 45,
    lineHeight: 52,
    color: "rgb(42, 42, 46)"
  },
  unit: {
    fontSize: 19,
    lineHeight: 52,
    color: "rgb(42, 42, 46)",
    marginRight: 5
  }
});
