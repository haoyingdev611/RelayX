import React from "react";
import { Image, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from "react-native";
import Swiper from "react-native-swiper";
import styled from "styled-components/native";
import { NavigationProps } from "../src/types";
import { Colors } from "../src/constants";
import { BottomPrimaryButton } from "../src/components/PrimaryButton";
import I18n from "../src/locales";
import util from "../utils/util";
import URL from "../utils/URL";

const { height } = Dimensions.get('window')

const HeaderText = styled.Text`
  font-size: 30px;
  line-height: 33px;
  font-weight: bold;
  margin-horizontal: 10px;
  margin-bottom: 20px;
  text-align: center;
`;

const MainCopy = styled.Text`
  font-size: 18px;
  line-height: 21px;
  margin-horizontal: 10px;
  text-align: center;
  background-color: transparent;
  margin-bottom: ${height * 0.0615};
`;

interface Props extends NavigationProps<void> { }

const SafeAreaWrapper = styled.SafeAreaView`
  background-color: #fff;
  flex: 1;
  justify-content: center;
`;

const Wrapper = styled.View`
  flex: 1;
  justify-content: center;
  margin-horizontal: 10px;
  margin-top: ${height * 0.0615};
`;


export default function StartScreen(props: Props) {

  async function handleSupport() {
    Alert.alert(
      "RelayX",
      I18n.t("contactTelegramSupportMessage", {
        telegramUrl: URL.RELAYX_TELEGRAM
      }),
      [
        {
          text: I18n.t("ok"),
          onPress: () => util.openUrlBrowser(URL.RELAYX_TELEGRAM)
        },
        {
          text: I18n.t("cancel"),
          style: "cancel"
        }
      ]
    );
  }

  function onClickStartButton() {
    props.navigation.navigate("onboarding");
  }

  return (
    <SafeAreaWrapper>
      <Wrapper>
        <HeaderText>Welcome!</HeaderText>
        <MainCopy>
          Relay is the Bitcoin wallet you can use anywhere.
          </MainCopy>
        <Swiper style={styles.wrapper} showsButtons={false}>
          <Image
            style={styles.ImageStyle}
            source={require("../icons/methods/noShadow.jpg")}
          />
          <Image
            style={styles.ImageStyle}
            source={require("../icons/methods/noShadow2.jpg")}
          />
        </Swiper>
        <Text style={styles.detail}>{I18n.t("continueAgreeRelayX")}</Text>
        <TouchableOpacity
          style={[styles.termsOfService, { marginBottom: 20 }]}
          onPress={handleSupport}
        >
          <Text style={{ fontSize: 16, color: Colors.SkyBlue }}>
            {I18n.t("termsOfService")}
          </Text>
        </TouchableOpacity>
        <BottomPrimaryButton
          title={I18n.t("start")}
          onPress={onClickStartButton}
        />
      </Wrapper>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  detail: {
    fontSize: 14,
    lineHeight: 16,
    color: "rgba(0,0,0,0.6)",
    textAlign: "center",
    marginTop: height*0.02
  },
  termsOfService: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  wrapper: {
    alignItems: 'center'   
  },
  text: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold"
  },
  ImageStyle: {
    width: height * 0.194,
    height: height * 0.4,
    resizeMode: 'cover',
    alignSelf: 'center'
  }
});
