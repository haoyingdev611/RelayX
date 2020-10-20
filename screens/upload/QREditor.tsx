import React, { useState } from "react";
import ImagePicker from "react-native-image-crop-picker";
import { QRreader } from "react-native-qr-scanner";
import util from "../../utils/util";
import {
  Platform,
  Image,
  Text,
  View,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import Permissions from "react-native-permissions";
import { Colors } from "../../src/constants";
import I18n from "../../src/locales";
import { useApi } from "../../src/api";
import { useDidMount } from "../../src/hooks/useDidMount";

interface Props {
  paymentId: number;
  linkedInfo: string;
  onChange(linkedInfo: string): void;
  setLoading(loading: boolean): void;
}

export default function QREditor(props: Props) {
  const api = useApi();
  const [hasPhotoPermission, setHasPhotoPermission] = useState(true);

  useDidMount(() => {
    if (Platform.OS === "ios") {
      Permissions.request("photo").then(stat => {
        setHasPhotoPermission(stat !== "denied");
      });
    }
  });

  const uploadQR = async () => {
    const { paymentId, setLoading } = props;
    setLoading(true);
    try {
      let response = await ImagePicker.openPicker({
        width: 400,
        height: 400,
        cropping: true
      });
      if (Array.isArray(response)) {
        response = response[0];
      }
      if (response) {
        let uri = response.path;
        if (Platform.OS === "android") {
          uri = uri.replace("file://", "");
        }

        try {
          const data = await QRreader(uri);
          console.log("QRCode scan success:", data);
          console.log(data);
          const res = await api.settingPaymentVerify(data);

          if (res.code !== 0 || res.data.paymentId !== paymentId) {
            throw new Error("Validation error");
          }
          setLoading(false);
          props.onChange(res.data.qrCode);
        } catch (err) {
          console.log("QRCode scan failed:", err);
          util.showAlert("Can't read QRCode");
          setLoading(false);
        }
      }
    } catch (error) {
      setLoading(false);

      console.log(error);
    }
  };

  return !props.linkedInfo ? (
    <View style={styles.favViewUpload}>
      <TouchableOpacity
        onPress={uploadQR}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          flex: 1
        }}
      >
        <Image
          resizeMode="contain"
          source={require("../../icons/uploadQrCode.png")}
          style={{
            marginLeft: 15,
            width: 40,
            height: 40
          }}
        />
        <Text
          allowFontScaling={false}
          style={{
            justifyContent: "center",
            alignSelf: "center",
            color: hasPhotoPermission ? "#2669FF" : Colors.ChateauGrey,
            marginLeft: 8,
            fontSize: 16
          }}
        >
          {hasPhotoPermission
            ? I18n.t("Upload receive code")
            : I18n.t("noPhotoPermission")}
        </Text>
      </TouchableOpacity>
    </View>
  ) : (
    <View style={[styles.favViewUpload]}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "center"
        }}
      >
        <Image
          resizeMode="contain"
          source={require("../../icons/qr.png")}
          style={{
            marginLeft: 15,
            marginTop: 5,
            width: 40,
            height: 40
          }}
        />
        <Text
          allowFontScaling={false}
          style={{
            justifyContent: "center",
            alignSelf: "center",
            color: Colors.DarkGrey,
            marginLeft: 8,
            fontSize: 16
          }}
        >
          {I18n.t("uploaded")}
        </Text>
      </View>
      {/* <View
              style={{
                alignItems: "flex-end",
                justifyContent: "center"
              }}
            >
              <TouchableOpacity onPress={this.onBack}>
                <Text
                  style={{
                    fontSize: 16,
                    marginRight: 12,
                    color: "#2669FF"
                  }}
                >
                  {I18n.t("view")}
                </Text>
              </TouchableOpacity>
            </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  favViewUpload: {
    marginTop: 10,
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CCDCFF",
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between"
  }
});
