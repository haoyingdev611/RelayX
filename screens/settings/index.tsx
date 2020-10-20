import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  SectionList,
  StatusBar
} from "react-native";
import util from "../../utils/util";
import I18n from "../../src/locales";
import { Colors } from "../../src/constants";
import { Header } from "../../src/components/Header";
import { ListItem } from "./components/ListItem";
import { useOnSettingCurrencyList } from "../../actions";
import { AppState } from "../../reducers";
import { NavigationProps } from "../../src/types";
import { getRelayOneBalanceShow } from "../../src/selectors/walletSelectors";
import { useDidMount } from "../../src/hooks/useDidMount";
import { useBalanceUpdate } from "../../src/hooks/useBalanceUpdate";
import { useSelector } from "react-redux";

type Props = NavigationProps<void>;

const SettingsAction = {
  RELAY_ONE: 0,
  EARN: 2,
  LOCAL_CURRENCY: 3,
  LANGUAGE: 4,
  NOTIFICATION: 5,
  BACKUP: 7,
  RESTORE: 8,
  INVITE: 9
};

interface FormatProps {
  localSymbolSign: string;
  localSymbolName: string;
  relayOneBalance: string;
}

type FormatCallback = (props: FormatProps) => string;

interface SectionItem {
  id: number;
  title: string | FormatCallback;
  description: string | FormatCallback;
}

interface Section {
  title: string;
  data: SectionItem[];
}

const SECTIONS: Section[] = [
  {
    title: "",
    data: [
      {
        id: SettingsAction.RELAY_ONE,
        title: I18n.t("relayone"),
        description: (props: FormatProps) =>
          `${props.localSymbolSign} ${props.relayOneBalance}`
      }
    ]
  },
  {
    title: I18n.t("settings"),
    data: [
      {
        id: SettingsAction.LOCAL_CURRENCY,
        title: I18n.t("localCurrency"),
        description: (props: FormatProps) =>
          `${props.localSymbolName} (${props.localSymbolSign})`
      }
    ]
  },
  {
    title: I18n.t("security"),
    data: [
      {
        id: SettingsAction.BACKUP,
        title: I18n.t("backup"),
        description: ""
      }
      // {
      //   id: SettingsAction.RESTORE,
      //   title: I18n.t("restore"),
      //   description: ""
      // }
    ]
  },
  {
    title: "",
    data: [
      {
        id: SettingsAction.INVITE,
        title: I18n.t("inviteFriends"),
        description: ""
      }
    ]
  }
];

export default function SettingsScreen(props: Props) {
  const checkBalanceUpdate = useBalanceUpdate();
  const onSettingCurrencyList = useOnSettingCurrencyList();
  const {
    localSymbolName,
    relayOneBalance,
    localSymbolSign,
    handle
  } = useSelector(mapStateToProps);

  useDidMount(async () => {
    checkBalanceUpdate();
  });

  const keyExtractor = (item: SectionItem) => "" + item.id;

  const handleBackPress = () => props.navigation.navigate("scan");

  const handlePressTelegram = () => {
    const properties = {
      to: "support@relayx.io",
      subject: "Report",
      body: ""
    };
    util.sendEmail(properties);
  };

  const handleItemPress = (itemId: number) => async () => {
    const { navigation } = props;
    switch (itemId) {
      case SettingsAction.RELAY_ONE:
        navigation.navigate("relayOneSync", {});
        break;
      case SettingsAction.LOCAL_CURRENCY:
        onSettingCurrencyList(2);
        navigation.navigate("localCurrency");
        break;
      case SettingsAction.BACKUP:
        navigation.navigate("backup");
        break;
      // case SettingsAction.RESTORE:
      //   navigation.navigate("restore");
      //   break;
      case SettingsAction.INVITE:
        navigation.navigate("inviteFriend");
        break;
      default:
        console.log("unhandled action - ", itemId);
        break;
    }
  };

  const renderSection = ({ section: { title } }: { section: Section }) => {
    const titleEl = !!title && <Text style={styles.sectionTitle}>{title}</Text>;

    return <View style={styles.section}>{titleEl}</View>;
  };

  const renderItem = ({ item }: { item: SectionItem }) => {
    let description = item.description;
    let title = item.title;
    if (typeof description === "function") {
      description = description({
        localSymbolName,
        localSymbolSign,
        relayOneBalance
      });
    }

    if (typeof title === "function") {
      title = title({ localSymbolName, localSymbolSign, relayOneBalance });
    }

    return (
      <ListItem
        title={title}
        description={description}
        onPress={handleItemPress(item.id)}
      />
    );
  };

  const handlePressVersion = () => {
    // counter.current++;
    // if (this.counter === 5) {
    //   const state = store.getState();
    //   Clipboard.setString(
    //     JSON.stringify(
    //       { main: state.main, mnemonics: state.mnemonicGraveyard },
    //       void 0,
    //       2
    //     )
    //   );
    // }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <Header headerText={handle} onBackPress={handleBackPress} />

      <View style={styles.list}>
        <SectionList
          sections={[...SECTIONS]}
          keyExtractor={keyExtractor}
          renderSectionHeader={renderSection as any}
          renderItem={renderItem}
        />
      </View>

      <View style={styles.versions}>
        <View style={{ flex: 1 }}>
          <Text style={styles.versionDescription}>
            {I18n.t("supportOnEmail")}:
          </Text>
          <TouchableOpacity onPress={handlePressTelegram}>
            <Text style={styles.versionDescription}>support@relayx.io</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.version} onPress={handlePressVersion}>
          {I18n.t("version", { versionNumber: util.getAppVersion() })}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  list: {
    flex: 1,
    backgroundColor: Colors.PaleGrey
  },
  section: {
    backgroundColor: Colors.PaleGrey,
    paddingTop: 15
  },
  sectionTitle: {
    marginTop: 5,
    paddingVertical: 5,
    paddingHorizontal: 15,
    color: "#737373"
  },
  versions: {
    flexDirection: "row",
    backgroundColor: Colors.PaleGrey,
    padding: 15,
    alignItems: "flex-end"
  },
  versionDescription: {
    fontSize: 14,
    color: Colors.Slate
  },
  version: {
    fontSize: 12,
    color: "#a9b1ba"
  }
});

const mapStateToProps = (state: AppState) => {
  const { main, settingReducer } = state;
  return {
    handle: main.handle,
    pin: main.pin,
    symbolId: main.symbolId,
    localSymbolSign: main.localSymbolSign,
    localSymbolName: main.localSymbolName,
    relayOneBalance: getRelayOneBalanceShow(state),
    language: settingReducer.language
  };
};
