import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  FlatList
} from "react-native";
import { PaymentNameWithLogo } from "./PaymentNameWithLogo";
import { Colors } from "../constants";
import TabBar from "./TabBar";
import I18n from "../../src/locales";

const TABS = [
  {
    key: "fiat",
    title: I18n.t("fiat")
  },
  {
    key: "crypto",
    title: I18n.t("crypto")
  }
];
interface OwnProps<T> {
  data: Array<T>;
  onSelect(item: T): void;
  itemSubTitle?: (item: T) => string;
  selected?: number;
  flat?: boolean;
}
function keyExtractor(item: { paymentId: number }) {
  return item.paymentId.toString();
}
export function PaymentsList<T extends { status: number; paymentId: number }>(
  props: OwnProps<T>
) {
  const [activeTab, setActiveTab] = useState("fiat");
  const { data, flat } = props;
  let crypto: T[] = [],
    fiat: T[] = [];

  data.forEach(payment => {
    if (payment.paymentId > 10000 || payment.paymentId === 1) {
      crypto.push(payment);
    } else {
      fiat.push(payment);
    }
  });

  function setTab(tab: string) {
    setActiveTab(tab);
  }
  function renderItem({ item }: { item: T }) {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => props.onSelect(item)}
      >
        <View style={styles.payItem}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <PaymentNameWithLogo
              paymentId={item.paymentId}
              disabled={item.status === 0}
              textStyle={{
                fontSize: 16,
                lineHeight: 30,
                color: "#2a2a2e",
                fontWeight: "500",
                marginLeft: 7,
                marginRight: 10
              }}
            />

            {props.itemSubTitle && (
              <Text style={styles.orderCount}>{props.itemSubTitle(item)}</Text>
            )}
          </View>
          {item.paymentId === props.selected && (
            <Image
              source={require("../../icons/selected.png")}
              style={{ width: 24, height: 24 }}
            />
          )}
          {!props.selected && (
            <Image
              source={require("../../icons/next.png")}
              style={{ width: 24, height: 24 }}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  }
  if (flat) {
    return (
      <FlatList
        style={{ flex: 1, height: "100%", backgroundColor: "white" }}
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />
    );
  }
  return (
    <>
      <TabBar tabs={TABS} active={activeTab} onChange={setTab} />
      <FlatList
        style={{ flex: 1, height: "100%", backgroundColor: "white" }}
        data={activeTab === "fiat" ? fiat : crypto}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />
    </>
  );
}

const styles = StyleSheet.create({
  payItem: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: "#e9e9e9",
    borderBottomWidth: 1
  },
  orderCount: {
    fontSize: 13,
    color: Colors.ChateauGrey
  },
  titleStyle: {
    fontSize: 16,
    color: "#000",
    marginVertical: 15,
    fontWeight: "700",
    marginLeft: 20
  }
});
