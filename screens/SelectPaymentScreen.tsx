import React, { Component } from "react";
import {
  StatusBar,
  SafeAreaView,
  View
} from "react-native";

import I18n from "../src/locales";
import { Header } from "../src/components/Header";

import { useOnSettingPayment } from "../actions";
import { PaymentMeta } from "../src/api";
import { NavigationProps } from "../src/types";
import { AppState } from "../reducers";
import { Loader } from "../src/components/Loader";
import { useSelector } from "react-redux";
import { useDidMount } from "../src/hooks/useDidMount";
import { PaymentsList } from "../src/components/PaymentsList"

type OnlyPaymentCallback = (item: PaymentMeta) => boolean;

interface OwnProps {}

type Props = OwnProps &
  NavigationProps<{
    onSelect(args: { paymentId: number; linkedInfo: string }): void;
    selected?: number;
    dataSource?: () => Promise<PaymentMeta[]>;
    onlyPayment: boolean | OnlyPaymentCallback;
    filter?: (item: PaymentMeta) => boolean;
    itemSubTitle?: (item: PaymentMeta) => string;
  }>;

export function SelectPayment(props: {
  selected?: number;
  data: PaymentMeta[];
  filter?(item: PaymentMeta): boolean;
  onSelect(item: PaymentMeta): void;
  itemSubTitle?: (item: PaymentMeta) => string;
  dataSource?: () => Promise<PaymentMeta[]>
}) {
  const receiveList = useSelector(
    (state: AppState) => state.settingReducer.receiveList
  );
  const onSettingPayment = useOnSettingPayment();

  useDidMount(onSettingPayment);

  const data = props.dataSource ? props.data : receiveList;

  const filteredData = data
    .filter(props.filter || Boolean)
    .filter(item => item.status !== 0)
    .sort((a, b) => (a.paymentName > b.paymentName ? 1 : -1));  

  return (    
    <View style={{ flex: 1, flexDirection: "column", backgroundColor: "#fff" }}>
      <PaymentsList
        data={filteredData}
        onSelect={props.onSelect}
        selected={props.selected}
        itemSubTitle={props.itemSubTitle}
      />
    </View>
  );
}

class SelectWalletScreen extends Component<Props> {
  state = {
    loading: !!this.props.navigation.state.params.dataSource,
    data: []
  };

  async componentDidMount() {
    if (this.props.navigation.state.params.dataSource) {
      const data = await this.props.navigation.state.params.dataSource();
      this.setState({
        data,
        loading: false
      });
    }
  }

  onSelect = async(item: PaymentMeta) => {
    if (item.status === 0) return;
    let onlyPayment = this.props.navigation.state.params.onlyPayment;
    if (typeof this.props.navigation.state.params.onlyPayment === "function") {
      onlyPayment = this.props.navigation.state.params.onlyPayment(item);
    }
    if (onlyPayment) {
      this.props.navigation.state.params.onSelect({
        paymentId: item.paymentId,
        linkedInfo: ""
      });
    } else {
      this.props.navigation.navigate("upload", {
        paymentId: item.paymentId,
        onSuccess: (payload: { paymentId: number; linkedInfo: string }) => {
          this.props.navigation.state.params.onSelect(payload);
        }
      });
    }
  };

  render() {
    return (
      <SafeAreaView style={{ backgroundColor: "#fff", flex: 1 }}>
        <StatusBar barStyle="dark-content" />
        <Header
          headerText={I18n.t("selectChannel")}
          onBackPress={() => this.props.navigation.goBack()}
        />
        <SelectPayment
          selected={this.props.navigation.state.params.selected}
          data={this.state.data}
          onSelect={this.onSelect}
          filter={this.props.navigation.state.params.filter}
          itemSubTitle={this.props.navigation.state.params.itemSubTitle}
          dataSource={this.props.navigation.state.params.dataSource}
        />
        <Loader visible={this.state.loading} />
      </SafeAreaView>
    );
  }
}

export default SelectWalletScreen;
