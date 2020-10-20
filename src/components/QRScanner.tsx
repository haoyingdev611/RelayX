import React, { Component } from "react";

import {
  StyleSheet,
  Dimensions,
  Vibration,
  Animated,
  View,
  Text,
  Platform,
  Image,
  SafeAreaView,
  TouchableOpacity
} from "react-native";

import Permissions from "react-native-permissions";
import { RNCamera as Camera } from "react-native-camera";
import I18n from "../locales";

const { height: heightReading, width } = Dimensions.get("window");
const height = heightReading - 50; /* header */
const camSize = width * 0.65;
const camInactiveColor = "rgba(51, 51, 61, 0.65)";

const spaceWidth = (width - camSize) / 2;

const PERMISSION_AUTHORIZED = "authorized";
const CAMERA_PERMISSION = "camera";
const CAMERA_FLASH_MODE = Camera.Constants.FlashMode;

interface Props {
  onRead: (e: { data: string }) => Promise<any>;
  onAlbum: () => any;
  onBack: () => any;
  scanEnable: boolean;
}

interface State {
  scanning: boolean;
  fadeInOpacity: Animated.Value;
  isAuthorized: boolean;
  isAuthorizationChecked: boolean;
  disableVibrationByUser: boolean;
}

export default class QRCodeScanner extends Component<Props, State> {
  _scannerTimeout: NodeJS.Timeout | null;

  constructor(props: Props) {
    super(props);
    this.state = {
      scanning: false,
      fadeInOpacity: new Animated.Value(0),
      isAuthorized: false,
      isAuthorizationChecked: false,
      disableVibrationByUser: false
    };

    this._scannerTimeout = null;
    this._handleBarCodeRead = this._handleBarCodeRead.bind(this);
  }
  componentDidMount() {
    if (Platform.OS === "ios") {
      Permissions.request(CAMERA_PERMISSION).then(response => {
        this.setState({
          isAuthorized: response === PERMISSION_AUTHORIZED,
          isAuthorizationChecked: true
        });
      });
    } else {
      this.setState({ isAuthorized: true, isAuthorizationChecked: true });
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.scanEnable !== nextProps.scanEnable) {
      this.setState({ scanning: !nextProps.scanEnable });
    }
  }

  componentWillUnmount() {
    if (this._scannerTimeout !== null) {
      clearTimeout(this._scannerTimeout);
    }
    this._scannerTimeout = null;
  }
  disable() {
    this.setState({ disableVibrationByUser: true });
  }
  enable() {
    this.setState({ disableVibrationByUser: false });
  }

  _setScanning(value: boolean) {
    this.setState({ scanning: value });
  }

  _handleBarCodeRead = (e: { data: string }) => {
    if (!this.state.scanning && !this.state.disableVibrationByUser) {
      Vibration.vibrate(400);
      this._setScanning(true);
      this.props.onRead(e);
    }
  };

  _renderCamera() {
    const { isAuthorized, isAuthorizationChecked } = this.state;
    if (isAuthorized) {
      return (
        <>
          <Camera
            style={[styles.camera]}
            onBarCodeRead={this._handleBarCodeRead}
            type={"back"}
            flashMode={CAMERA_FLASH_MODE.auto}
            captureAudio={false}
          ></Camera>
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <Text style={styles.description}>{I18n.t("scanText")}</Text>
          </View>
          <View style={styles.container}>
            <SafeAreaView style={{ ...styles.header }}>
              <TouchableOpacity onPress={this.props.onBack}>
                <Image
                  source={require("../../icons/menu.png")}
                  style={styles.icon}
                  resizeMode="stretch"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={this.props.onAlbum}>
                <Image
                  source={require("../../icons/uploadPhoto.png")}
                  style={styles.icon}
                  resizeMode="stretch"
                />
              </TouchableOpacity>
            </SafeAreaView>
          </View>
        </>
      );
    } else if (!isAuthorizationChecked) {
      return (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontSize: 16
            }}
          >
            ...
          </Text>
        </View>
      );
    } else {
      return (
        <>
          <View style={styles.container}>
            <SafeAreaView style={{ ...styles.header }}>
              <TouchableOpacity onPress={this.props.onBack}>
                <Image
                  source={require("../../icons/menu.png")}
                  style={styles.icon}
                  resizeMode="stretch"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={this.props.onAlbum}>
                <Image
                  source={require("../../icons/uploadPhoto.png")}
                  style={styles.icon}
                  resizeMode="stretch"
                />
              </TouchableOpacity>
            </SafeAreaView>
          </View>
          <View
            style={{ flex: 1, justifyContent: "flex-end", marginBottom: 40 }}
          >
            <Text style={styles.description}>{I18n.t("scanText")}</Text>
          </View>
        </>
      );
    }
  }

  reactivate = () => {
    this._setScanning(false);
  };

  render() {
    return <View style={[styles.mainContainer]}>{this._renderCamera()}</View>;
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 25
  },
  header: {
    backgroundColor: "transparent",
    paddingTop: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  camera: {
    flex: 0,
    flexDirection: "row",
    backgroundColor: "transparent",
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width
  },
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "transparent"
  },
  description: {
    fontSize: 30,
    alignSelf: "center",
    color: "white",
    marginBottom: 40
  }
});
