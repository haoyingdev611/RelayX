// @flow
import React, { Component } from "react";
import {
  StatusBar,
  View,
  SafeAreaView,
  StyleSheet,
  Clipboard,
  Text,
  Image
} from "react-native";
import QRCode from "react-native-qrcode";
import I18n from "../src/locales";
import URL from "../utils/URL";
import { Colors } from "../src/constants";
import { Header } from "../src/components/Header";
import { BottomPrimaryButton } from "../src/components/PrimaryButton";
import { NavigationProps } from "../src/types";

interface State {
  copied: boolean;
}

//Rendering Components
class InviteFriendScreen extends Component<NavigationProps<void>, State> {
  state = {
    copied: false
  };

  copyAddressToClipboard = async () => {
    if (this.state.copied) return;
    await Clipboard.setString(URL.APP_SHARE_LINK);
    this.setState({ copied: true });
    setTimeout(() => {
      this.setState({
        copied: false
      });
    }, 2000);
  };

  render() {
    const { copied } = this.state;
    const { navigation } = this.props;
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          backgroundColor={Colors.ClearBlue}
          barStyle="light-content"
        />

        <Header
          headerText={I18n.t("inviteFriends")}
          onBackPress={() => navigation.goBack()}
        />

        <View style={styles.body}>
          <View style={styles.qrCode}>
            <QRCode value={URL.APP_SHARE_LINK} size={200} />

            <View style={styles.relayInQr}>
              <Image
                resizeMode="contain"
                source={require("../icons/methods/relay.png")}
                style={styles.relayLogo}
              />
            </View>
          </View>

          <Text style={styles.description}>
            {I18n.t("inviteFriendDescription")}
          </Text>
        </View>

        <BottomPrimaryButton
          color={copied ? "green" : "blue"}
          title={copied ? I18n.t("copied") : I18n.t("copyDownloadLink")}
          onPress={this.copyAddressToClipboard}
        />
      </SafeAreaView>
    );
  }
}

//Create Stylesheet
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white"
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  qrCode: {
    overflow: "hidden",
    width: 200,
    height: 200
  },
  relayInQr: {
    position: "absolute",
    left: 78,
    top: 78,
    padding: 4,
    borderRadius: 4,
    backgroundColor: "white"
  },
  relayLogo: {
    width: 40,
    height: 40,
    backgroundColor: Colors.ClearBlue
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.LightGrey,
    marginTop: 24,
    textAlign: "center"
  }
});

export default InviteFriendScreen;
