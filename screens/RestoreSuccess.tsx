import React, { Component } from "react";
import {
  Text,
  Image,
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity
} from "react-native";
import I18n from "../src/locales";
import { NavigationProps } from "../src/types";

const imgSuccess = require("../icons/success.png");

//Rendering Compnents
class RestoreSuccess extends Component<NavigationProps<void>> {
  render() {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View
          style={{
            flex: 1,
            backgroundColor: "#fff",
            justifyContent: "flex-end"
          }}
        >
          <View style={styles.viewSuccess}>
            <Image source={imgSuccess} style={{ width: 160, height: 140 }} />
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: 21,
                color: "#000",
                marginTop: 25
              }}
            >
              {I18n.t("success")}
            </Text>
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: 16,
                color: "#000",
                marginTop: 15
              }}
            >
              {I18n.t("restoreWalletSuccess")}
            </Text>
          </View>
          <View style={styles.viewOK}>
            <TouchableOpacity
              style={styles.btnOK}
              onPress={() => {
                this.props.navigation.navigate("scan");
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: 19,
                  color: "#fff"
                }}
              >
                {I18n.t("ok")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.fixBackground} />
      </SafeAreaView>
    );
  }
}

//Export Components
export default RestoreSuccess;

//Create Stylesheet
const styles = StyleSheet.create({
  fixBackground: {
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    height: 100,
    zIndex: -1000
  },

  safeArea: {
    flex: 1,
    backgroundColor: "#fff"
  },

  viewOK: {
    height: 70,
    backgroundColor: "#fff"
  },

  viewSuccess: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center"
  },

  btnOK: {
    flex: 1,
    margin: 10,
    backgroundColor: "rgb(38,105,255)",
    borderRadius: 5,
    justifyContent: "center"
  }
});
