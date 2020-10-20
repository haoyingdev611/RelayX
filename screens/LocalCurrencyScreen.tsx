import React from "react";
import {
  Image,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  FlatList,
  SafeAreaView
} from "react-native";
import { useOnSettingCurrencyList, useUpdateCurrency } from "../actions";
import I18n from "../src/locales";
import { Loader } from "../src/components/Loader";

import { NavigationProps} from "../src/types";
import { AppState } from "../reducers";
import { CurrencyListItem } from "../reducers/SettingReducer";
import { Header } from "../src/components/Header";
import { useSelector } from "react-redux";

interface OwnProps {}

interface ReduxProps {
  symbolId: number;
  currencyLoading: boolean;
  currencyList: CurrencyListItem[];
}

type Props = OwnProps & NavigationProps<void>;

export default function LocalCurrencyScreen(props: Props) {
  const { symbolId, currencyList, currencyLoading } = useSelector(
    mapStateToProps
  );
  const updateCurrency = useUpdateCurrency();
  const onSettingCurrencyList = useOnSettingCurrencyList();
  
  function selectCoin(symbolId: number) {
    const params = {
      localSymbolId: symbolId
    };
    updateCurrency(params);
    onBack();
  }

  function onBack() {
    props.navigation.goBack();
  }

  function onRefresh() {
    onSettingCurrencyList(2);
  }
  //
  function onLoadMore() {}

  function keyExtractor(item: CurrencyListItem) {
    return item.symbol;
  }

  function renderItem({ item }: { item: CurrencyListItem }) {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => selectCoin(item.symbolId)}
      >
        <View style={[styles.list]}>
          <View style={[styles.column]}>
            <Image
              resizeMode="contain"
              source={item.imageUrl}
              style={{ width: 30, height: 30 }}
            />
            <Text style={[styles.currency]}>
              {I18n.t(item.symbol, { defaultValue: item.symbol })}
            </Text>
          </View>
          {symbolId === item.symbolId && (
            <Image
              resizeMode="contain"
              source={require("../icons/selected.png")}
              style={{ width: 24, height: 24, marginTop: 3 }}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={{ backgroundColor: "#fff", flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: "#f8f8fa" }}>
          <Header headerText={I18n.t("localCurrency")} onBackPress={onBack} />

          {!currencyLoading && currencyList.length > 0 && (
            <View
              style={{
                backgroundColor: "#F8F8FA",
                flex: 1,
                flexDirection: "column",
                paddingTop: 20
              }}
            >
              <StatusBar barStyle="dark-content" />
              <FlatList
                style={{ flex: 1, height: "100%", alignSelf: "stretch" }}
                data={currencyList}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                //下拉刷新相关
                onRefresh={onRefresh}
                refreshing={false}
                // 加载更多
                onEndReached={onLoadMore}
                onEndReachedThreshold={0.1}
              />
            </View>
          )}

          {!currencyLoading && currencyList.length < 1 && (
            <View
              style={{
                backgroundColor: "#F8F8FA",
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                width: "100%"
              }}
            >
              <Image
                resizeMode="contain"
                source={require("../icons/none-list.png")}
              />
              <Text>{I18n.t("emptyLocalCurrencyList")}</Text>
            </View>
          )}
        </View>
        <Loader visible={currencyLoading} />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  list: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    paddingLeft: 11,
    paddingRight: 15,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderBottomColor: "#e9e9e9",
    borderBottomWidth: 1
  },
  column: {
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  currency: {
    fontSize: 16,
    lineHeight: 30,
    color: "#2a2a2e",
    fontWeight: "500",
    marginLeft: 7,
    marginRight: 10
  }
});

const mapStateToProps = ({ main, settingReducer }: AppState): ReduxProps => {
  const { symbolId } = main;
  const { currencyList, currencyLoading } = settingReducer;
  return { currencyList, symbolId, currencyLoading };
};
