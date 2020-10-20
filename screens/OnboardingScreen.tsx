import React, { useState, useEffect } from "react";
import styled from "styled-components/native";
import { NavigationProps } from "../src/types";
import Input from "../src/components/Input";
import { Header } from "../src/components/Header";
import { BottomPrimaryButton } from "../src/components/PrimaryButton";
import I18n from "../src/locales";
import bip39 from "bip39";
import { useWalletInit, getKeyFromMnemonic } from "../actions";
import { Loader } from "../src/components/Loader";
import { AsyncStorage, View, NativeModules, Platform } from "react-native";
import KeyboardAvoidingView from "../src/components/KeyboardAvoidingView";
import util from "../utils/util";
import { useDidMount } from "../src/hooks/useDidMount";
import { useUpdateCurrency } from "../actions";

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const HeaderText = styled.Text`
  font-size: 30px;
  line-height: 33px;
  font-weight: bold;
  margin-horizontal: 10px;
  margin-bottom: 20px;
  text-align: center;
`;

const MainCopy = styled.Text`
  font-size: 20px;
  line-height: 21px;
  margin-horizontal: 10px;
  text-align: center;
`;

interface Props extends NavigationProps<void> {}

const SafeAreaWrapper = styled.SafeAreaView`
  background-color: #fff;
  flex: 1;
`;

const Wrapper = styled.View`
  flex: 1;
  justify-content: center;
  margin-horizontal: 10px;
`;

interface ScreenProps extends React.Props<void> {
  header: boolean;
  text?: string;
}

function Screen(props: ScreenProps) {
  let header = null;
  if (props.header) {
    header = (
      <Header hideBack headerText={props.text || ""} onBackPress={() => {}} />
    );
  }
  return (
    <SafeAreaWrapper>
      {header}
      {props.children}
    </SafeAreaWrapper>
  );
}
const localIds: { [key: string]: number } = {};
localIds["ko_KR"] = 10073;
localIds["zh_"] = 10034;
localIds["en_AU"] = 10009;
localIds["en_US"] = 10024;
localIds["en_CA"] = 10030;
localIds["in_ID"] = 10063;
localIds["zh_HK"] = 10059;
localIds["en_US"] = 10024;
localIds["ja_JP"] = 10068;
localIds["en_PH"] = 10111;
localIds["th_TH"] = 10137;
localIds["en_GB"] = 10146;
localIds["es_AR"] = 10007;

export default function OnboardingScreen(props: Props) {
  const walletInit = useWalletInit();
  const [existingAddress, setExistingAddress] = useState("");
  const [handle, setHandle] = useState("");
  const [handleAddress, setHandleAddress] = useState<{
    [key: string]: string | null | undefined;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [mnemonic, setMnemonic] = useState("");
  const debouncedHandle = useDebounce(handle, 300).trim();
  const isValid = debouncedHandle.match(/^1[a-z][a-z0-9]+$/);
  const address = handleAddress[handle];
  const disabled = !isValid || typeof address === "undefined";
  const updateCurrency = useUpdateCurrency();

  useDidMount(() => {
    AsyncStorage.getItem("mnemonic", (error, result) => {
      if (result) {
        setMnemonic(result);
        getKeyFromMnemonic(result).then(keys => {
          setExistingAddress(keys.publicAddress);
        });
      }
    });
  });

  useEffect(() => {
    const handle = debouncedHandle;
    if (handleAddress[handle]) {
      return;
    }
    if (isValid) {
      setIsLoading(true);
      fetch(`https://relayx.io/api/receivingAddress/${handle}`)
        .then(r => r.json())
        .then(r => {
          if (r.receivingAddress) {
            setHandleAddress(state => ({
              ...state,
              [handle]: r.receivingAddress
            }));
          } else {
            setHandleAddress(state => ({ ...state, [handle]: null }));
          }

          setIsLoading(false);
        })
        .catch(e => {
          setIsLoading(false);
          util.showAlert("Network error, try again later.");
          console.log(e);
        });
    }
  }, [debouncedHandle]);

  function onHandleChange(text: string) {
    if (text === "") {
      text = "1";
    }
    if (text.match(/^1[a-z0-9]*$/)) {
      setHandle(text);
    }
  }

  async function onSubmit() {
    if (typeof address === "undefined") {
      return;
    }
    if (address && address !== existingAddress) {
      props.navigation.navigate("restore", { handle, address });
    } else {
      setIsLoading(true);
      // FIXME reset state
      try {
        await walletInit(
          mnemonic ? mnemonic : bip39.generateMnemonic(),
          handle
        );
        let locale;
        if (Platform.OS === "ios") {
          locale = NativeModules.SettingsManager.settings.AppleLocale;
          if (locale === undefined) {
            locale = NativeModules.SettingsManager.settings.AppleLanguages[1].replace(
              /-/,
              "_"
            );
          }
        }
        if (Platform.OS === "android") {
          locale = NativeModules.I18nManager.localeIdentifier;
        }
        if (locale != "zh_HK") {
          if (locale.toString().indexOf("zh_") !== -1) {
            locale = "zh_";
          }
        }
        if (!locale) {
          locale = "en_US";
        }
        let params = {
          localSymbolId: localIds[locale] || 10024
        };
        await updateCurrency(params);
        props.navigation.navigate("scan");
      } catch {
        util.showAlert("Try again later");
        setIsLoading(false);
      }
    }
  }

  function onInfoClick() {
    props.navigation.navigate("restore", { handle });
  }

  function onFocus(focused: boolean) {
    if (focused && handle === "") {
      setHandle("1");
    }
  }

  return (
    <Screen header={false}>
      <KeyboardAvoidingView>
        <Wrapper style={{ marginBottom: 30 }}>
          <View style={{ flex: 1 }} />
          <HeaderText>Create Account</HeaderText>
          <MainCopy style={{ marginBottom: 10 }}>
            Your handle is your Relay username.
          </MainCopy>
          <Input
            placeholder={"Enter handle"}
            value={handle}
            onFocus={onFocus}
            onChange={onHandleChange}
            onSubmitEditing={onSubmit}
            info={
              disabled
                ? ""
                : address
                ? "This handle already exists - yours? Try Restore below"
                : "Tap here to restore different wallet mnemonic"
            }
            onInfoClick={!address && !disabled ? onInfoClick : void 0}
          />
          <View style={{ flex: 1 }} />
          <BottomPrimaryButton
            title={
              address === existingAddress
                ? I18n.t("set")
                : address
                ? I18n.t("restore")
                : I18n.t("create")
            }
            disabled={disabled}
            onPress={onSubmit}
          />
          <Loader visible={isLoading} />
        </Wrapper>
      </KeyboardAvoidingView>
    </Screen>
  );
}
