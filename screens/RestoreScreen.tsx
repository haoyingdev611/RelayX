import React, { useState, useRef } from "react";
import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  Alert,
  TextInput,
  TextStyle
} from "react-native";
import I18n from "../src/locales";
import { Header } from "../src/components/Header";
import { PrimaryButton } from "../src/components/PrimaryButton";
import bip39 from "bip39";
import { useWalletInit, getKeyFromMnemonic } from "../actions";

import { NavigationProps } from "../src/types";
import util from "../utils/util";
import { Loader } from "../src/components/Loader";

type InputProps = {
  style: TextStyle;
  refFwd: (ref: TextInput) => any;
  editable: boolean;
  value: string;
  autoFocus: boolean;
  returnType: "done" | "next";
  placeholder: string;
  autoCapitalize: "none";
  onFocus: () => any;
  onChangeText: (text: string) => any;
  nextEditing: () => any;
  endEditing?: () => any;
};

function Input(props: InputProps) {
  const {
    refFwd,
    style,
    returnType,
    nextEditing,
    endEditing,
    ...restProps
  } = props;

  return (
    <TextInput
      style={style}
      ref={refFwd}
      autoCorrect={false}
      returnKeyType={returnType}
      onSubmitEditing={nextEditing}
      onEndEditing={endEditing}
      {...restProps}
    />
  );
}

interface OwnProps {}

type Props = OwnProps & NavigationProps<{ handle: string; address?: string }>;

//Rendering Compnents
export default function RestoreScreen(props: Props) {
  const walletInit = useWalletInit();
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [words, setWords] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
  ]);
  const [activeTextField, setActiveTextField] = useState(0);
  const [loading, setLoading] = useState(false);

  const onConfirmPress = async () => {
    let mnemonic = words.join(" ");
    mnemonic = mnemonic.trim();
    mnemonic = mnemonic.toLowerCase();
    console.log(mnemonic);
    if (!bip39.validateMnemonic(mnemonic)) {
      Alert.alert(I18n.t("invalidMnemonic"), I18n.t("invalidWords"), [
        {
          text: I18n.t("ok"),
          onPress: () => {
            return true;
          },
          style: "cancel"
        }
      ]);
      return;
    }
    try {
      const keys = await getKeyFromMnemonic(mnemonic);
      if (
        props.navigation.state.params.address &&
        keys.publicAddress !== props.navigation.state.params.address
      ) {
        util.showAlert("Mnemonic doesnt match handle");
        return;
      }
      setLoading(true);
      await walletInit(mnemonic, props.navigation.state.params.handle);
      setLoading(false);
      props.navigation.navigate("restoreSuccess");
    } catch (e) {
      console.log("Unable to access storage");
    }
  };

  //Functions
  const renderTextRowView = () => {
    return [
      <View style={styles.txtfieldRowInnerView} key={"first"}>
        {[0, 1, 2, 3].map(index => renderTextFieldView(index))}
      </View>,
      <View style={styles.txtfieldRowInnerView} key={"second"}>
        {[4, 5, 6, 7].map(index => renderTextFieldView(index))}
      </View>,
      <View style={styles.txtfieldRowInnerView} key={"third"}>
        {[8, 9, 10, 11].map(index => renderTextFieldView(index))}
      </View>
    ];
  };

  const renderTextFieldView = (index: number) => {
    return (
      <View style={styles.txtfieldCellInnerView} key={index}>
        <Input
          autoFocus={activeTextField === index}
          refFwd={ref => {
            inputRefs.current[index] = ref;
          }}
          placeholder={I18n.t("word", { number: index + 1 })}
          editable={true}
          returnType={index === 11 ? "done" : "next"}
          style={
            activeTextField === index ? styles.txtfieldFocus : styles.txtfield
          }
          onChangeText={text => {
            const words2 = [...words];
            words2[index] = text.trim();
            setWords(words2);
          }}
          value={words[index]}
          nextEditing={() => {
            const nextIndex = (index + 1) % 12;
            setActiveTextField(nextIndex);
            inputRefs.current[index] && inputRefs.current[index]!.focus();
          }}
          onFocus={() => {
            setActiveTextField(index);
          }}
          autoCapitalize="none"
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <Header headerText={""} onBackPress={() => props.navigation.goBack()} />
        <Text style={styles.lblTypeOrder}>{I18n.t("type12Words")}</Text>
        <View style={styles.txtfieldView}>{renderTextRowView()}</View>

        <PrimaryButton
          title={I18n.t("confirm")}
          disabled={words.map(w => !!w.trim()).includes(false)}
          onPress={onConfirmPress}
        />
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

  lblTypeOrder: {
    backgroundColor: "#fff",
    color: "#000",
    textAlign: "center",
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 22,
    marginTop: 30
  },

  txtfieldView: {
    backgroundColor: "#fff",
    marginTop: 30,
    marginLeft: 40,
    marginRight: 40,
    marginBottom: 30,
    height: 245
  },

  txtfieldRowInnerView: {
    flex: 1,
    backgroundColor: "#fff",
    flexDirection: "row"
  },

  txtfieldCellInnerView: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 6,
    justifyContent: "flex-end"
  },

  txtfield: {
    height: "75%",
    backgroundColor: "#fff",
    textAlign: "center",
    borderBottomColor: "rgb(215,215,219)",
    borderBottomWidth: 1,
    fontSize: 15,
    fontWeight: "bold",
    color: "rgb(42,42,46)"
  },

  txtfieldFocus: {
    height: "75%",
    backgroundColor: "#fff",
    textAlign: "center",
    borderBottomWidth: 1,
    fontSize: 15,
    fontWeight: "bold",
    borderBottomColor: "rgb(38,105,255)",
    color: "rgb(38,105,255)"
  }
});
