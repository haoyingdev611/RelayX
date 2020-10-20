import React, { Component } from "react";
import {
  View,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
  Image,
  Text
} from "react-native";
import QRCodeScanner from "./QRScanner";
import ImagePicker from "react-native-image-crop-picker";
import I18n from "../locales";
import { ConfirmModal } from "../../src/components/ConfirmModal";

interface ImageButtonProps {
  onPress: () => any;
  image: number;
  children: React.ReactNode;
}

function ImageButton(props: ImageButtonProps) {
  return (
    <TouchableOpacity style={[styles.scanButton]} onPress={props.onPress}>
      <Image
        resizeMode="contain"
        source={props.image}
        style={{ height: 21, width: 21 }}
      />
      <Text allowFontScaling={false} style={styles.scanText}>
        {props.children}
      </Text>
    </TouchableOpacity>
  );
}

interface OwnProps {
  error: string;
  onRequestClose: () => any;
  onSuccess: (data: string) => Promise<any>;
  scanEnable: boolean;
  getImage: (uri: string) => void;
}
type Props = OwnProps;

interface State {
  isModalVisible: boolean;
  error: string;
  rootVisible: boolean;
}

//Rendering Components 二维码
export default class QRScannerUI extends Component<Props, State> {
  state = {
    isModalVisible: false,
    error: "",
    rootVisible: true
  };

  componentDidUpdate(prevProps: Props) {
    if (this.props.error !== prevProps.error) {
      this.setState({ error: this.props.error });
    }
  }

  // 返回主页
  handleBackPress = () => {
    this.props.onRequestClose();
  };

  onSuccess = async (e: { data: string }) => {
    return this.props.onSuccess(e.data);
  };

  handleAlbumPress = async () => {
    try {
      let response = await ImagePicker.openPicker({
        width: 400,
        height: 400,
        cropping: true,
        includeBase64: true
      }).catch(() => {
        return;
      });
      if (Array.isArray(response)) {
        response = response[0];
      }
      if (response) {
        let uri = response.path;
        if (Platform.OS === "android") {
          uri = uri.replace("file://", "");
        }
        this.props.getImage(uri);
        // const data = await QRreader(uri);
        // console.log("QRCode scan success:", data);
        // this.onSuccess({ data });
      }
    } catch (e) {
      this.setState({ error: I18n.t("invalidQrCode") });
      console.log(e);
    }
  };

  onPressOk = () => {
    this.setState(
      {
        error: ""
      },
      () => {
        this.props.onRequestClose();
      }
    );
  };

  render() {
    return (
      <View style={styles.safeArea}>
        <StatusBar backgroundColor="#000" barStyle="light-content" />
        <QRCodeScanner
          onRead={this.onSuccess}
          onBack={this.handleBackPress}
          onAlbum={this.handleAlbumPress}
          scanEnable={this.props.scanEnable}
        />
        <ConfirmModal
          visible={!!this.state.error}
          title={I18n.t("unsupportMessage")}
          description={`${I18n.t("scannedResults")}  ${this.state.error}`}
          titleYes="GOT IT"
          single={true}
          onPressYes={this.onPressOk}
        />
      </View>
    );
  }
}

//Create Stylesheet
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "black"
  },
  scanButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: 340,
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 5,
    alignSelf: "center",
    marginBottom: 40
  },
  scanText: {
    fontSize: 19,
    lineHeight: 22,
    fontWeight: "500",
    color: "#fff",
    marginLeft: 10
  }
});
