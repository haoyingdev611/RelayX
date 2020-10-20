import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  AsyncStorage
} from "react-native";
import { Header } from "../src/components/Header";
import I18n from "../src/locales";
import { NavigationProps, useDispatch } from "../src/types";
import { hideBackupWarning } from "../actions/UIStateActions";

export default function BackupScreen(props: NavigationProps<void>) {
  const dispatch = useDispatch();
  const [SwitchVal, setSwitchVal] = useState(false);
  const [arr, setArr] = useState([
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

  useEffect(() => {
    AsyncStorage.getItem("mnemonic", (error, result) => {
      if (result) {
        const arr = result.split(" ");
        setArr(arr);
      }
    });
  }, []);

  // 确认
  const onConfirm = () => {
    dispatch(hideBackupWarning());
    props.navigation.navigate("scan");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
          justifyContent: "space-between"
        }}
      >
        <View>
          <Header headerText="" onBackPress={() => props.navigation.goBack()} />

          <Text
            style={{
              textAlign: "center",
              margin: 16,
              fontSize: 21,
              fontWeight: "600"
            }}
          >
            {I18n.t("backupWordsMessage")}
          </Text>

          <View style={{ marginLeft: 40, marginRight: 40 }}>
            <TouchableOpacity
              style={{
                margin: 14
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: 19,
                  color: "#2669ff"
                }}
              >
                {arr[0]} {arr[1]} {arr[2]}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                margin: 14
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: 19,
                  color: "#2669ff"
                }}
              >
                {arr[3]} {arr[4]} {arr[5]}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                margin: 14
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: 19,
                  color: "#2669ff"
                }}
              >
                {arr[6]} {arr[7]} {arr[8]}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                margin: 14
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: 19,
                  color: "#2669ff"
                }}
              >
                {arr[9]} {arr[10]} {arr[11]}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ margin: 16 }}>
          <View style={{ flexDirection: "row" }}>
            <Text
              style={{ margin: 10, fontSize: 17, fontWeight: "400", flex: 1 }}
            >
              {I18n.t("backupWarnMessage")}
            </Text>
            <Switch
              thumbColor={SwitchVal ? "#2669ff" : "#f1f1f1"}
              trackColor={{ false: "#f1f1f1", true: "#ccdcff" }}
              onValueChange={() => setSwitchVal(!SwitchVal)}
              value={SwitchVal}
            />
          </View>

          <TouchableOpacity
            style={{
              height: 55,
              backgroundColor: SwitchVal ? "#2669ff" : "#ccdcff",
              margin: 5,
              borderRadius: 8,
              justifyContent: "center"
            }}
            onPress={() => {
              if (SwitchVal) {
                onConfirm();
              }
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "600",
                color: "#fff",
                alignSelf: "center"
              }}
            >
              {I18n.t("backupWrittrnMessage")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.fixBackground} />
    </SafeAreaView>
  );
}

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
  }
});
