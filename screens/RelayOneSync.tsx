import React, { Component } from "react";
import { View, SafeAreaView, StyleSheet, Text, StatusBar } from "react-native";
import I18n from "../src/locales";
import util from "../utils/util";
import { Colors } from "../src/constants";
import { Button } from "../src/components/Button";
import { InputMetaTextInfo } from "../src/components/InputMetaText";
import SuccessTextView from "../src/components/SuccessTextView";
import { Header } from "../src/components/Header";
import { LinkButton } from "../src/components/LinkButton";
import URL from "../utils/URL";

import { DispatchProps, NavigationProps, connect } from "../src/types";
import { AppState } from "../reducers";
import { getRelayOneBalanceShow } from "../src/selectors/walletSelectors";

interface OwnProps {}

interface ReduxProps {
  currencySign: string;
  relayOneBalance: string;
  relayOneSatoshi: number;
}

type Props = OwnProps &
  ReduxProps &
  DispatchProps &
  NavigationProps<{ sync: boolean }>;

class RelayOneSync extends Component<Props> {
  handleAddFunds = () => {
    this.props.navigation.navigate("relayOne");
  };

  handleWithdraw = () => {
    this.props.navigation.navigate("relayWithdraw");
  };

  handleBackPress = () => {
    this.props.navigation.navigate("settings");
  };

  handlePressRelayOne = () => {
    util.openUrlBrowser(URL.RERLAY_ONE);
  };

  render() {
    const {
      currencySign,
      relayOneBalance,
      relayOneSatoshi,
      navigation
    } = this.props;
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
          <Header
            headerText={I18n.t("relayone")}
            onBackPress={this.handleBackPress}
          />

          <View style={styles.content}>
            {navigation.state.params.sync ? (
              <SuccessTextView text={I18n.t("linkSuccess")} isFadeOut />
            ) : (
              <View />
            )}

            <View>
              <View style={styles.numberView}>
                <Text style={styles.unit}>{currencySign}</Text>
                <Text style={styles.number}>
                  {util.assignCurrency(relayOneBalance)}
                </Text>
              </View>

              <InputMetaTextInfo>
                {util.assignCurrency(relayOneSatoshi, 0)} {I18n.t("satoshi")}
              </InputMetaTextInfo>
            </View>

            <View style={styles.center}>
              <Button
                style={styles.button}
                theme="clearBlue"
                title={I18n.t("topup")}
                onPress={this.handleAddFunds}
              />

              <Button
                style={styles.button}
                theme="lightPeriwinkle"
                title={I18n.t("withdraw")}
                onPress={this.handleWithdraw}
              />
            </View>
            <View style={styles.numberView}>
              <Text style={styles.description}>
                {I18n.t("poweredByPrefix")}
              </Text>
              <LinkButton
                title="one.relayx.io"
                onPress={this.handlePressRelayOne}
              />
              <Text style={styles.description}>
                {I18n.t("poweredBySuffix")}
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

//Create Stylesheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  content: {
    flex: 1,
    margin: 15,
    marginVertical: 20,
    marginHorizontal: 15,
    justifyContent: "space-between"
  },
  center: {
    alignItems: "center"
  },
  numberView: {
    flexDirection: "row",
    height: 60,
    justifyContent: "center",
    alignItems: "center"
  },
  number: {
    fontSize: 50,
    lineHeight: 60,
    color: Colors.DarkGrey
  },
  unit: {
    fontSize: 22,
    lineHeight: 60,
    marginRight: 6,
    fontWeight: "bold",
    textAlignVertical: "center",
    color: Colors.DarkGrey
  },
  description: {
    fontSize: 14,
    paddingTop: 2,
    textAlign: "center",
    color: Colors.BlueyGrey
  },
  button: {
    marginVertical: 8,
    width: 185
  }
});

const mapStateToProps = (state: AppState): ReduxProps => {
  const { main, wallet } = state;
  return {
    currencySign: main.localSymbolSign,
    relayOneBalance: getRelayOneBalanceShow(state),
    relayOneSatoshi: wallet.relayOneSatoshi
  };
};

export default connect(mapStateToProps)(RelayOneSync);
