import React, { Component } from "react";
import { WebView, StatusBar, SafeAreaView } from "react-native";
import I18n from "../src/locales";
import { Header } from "../src/components/Header";
import { Loader } from "../src/components/Loader";
import { DispatchProps, NavigationProps } from "../src/types";
type Props = DispatchProps & NavigationProps<any>;

class WebContainerScreen extends Component<Props> {
  state = {
    loading: true
  };

  handleBack = () => this.props.navigation.goBack();

  render() {
    const { loading } = this.state;
    const { navigation } = this.props;
    const txId = navigation.state.params.txId;

    const headerTitle = I18n.t("tranDetails");

    return (
      <SafeAreaView style={{ backgroundColor: "#fff", flex: 1 }}>
        <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
        <Header headerText={headerTitle} onBackPress={this.handleBack} />
        <WebView
          source={{ uri: `https://www.whatsonchain.com/tx/${txId}` }}
          style={{ flex: 1 }}
          onLoadEnd={() => {
            this.setState({ loading: false });
          }}
        />
        <Loader visible={loading} />
      </SafeAreaView>
    );
  }
}
export default WebContainerScreen;
