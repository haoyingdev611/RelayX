import React from "react";
import { Header, Props as HeaderProps } from "./Header";
import { useSelector } from "react-redux";
import { getBalanceShow } from "../selectors/walletSelectors";
import { AppState } from "../../reducers";
import util from "../../utils/util";

type Props = Omit<HeaderProps, "rightButtonText">;

export default function BalanceHeader(props: Props) {
  const { balanceShow, localSymbolSign } = useSelector(mapStateToProps);

  return (
    <Header
      {...props}
      rightButtonText={localSymbolSign + util.formatCurrency(balanceShow)}
    />
  );
}

function mapStateToProps(state: AppState) {
  return {
    balanceShow: getBalanceShow(state),
    localSymbolSign: state.main.localSymbolSign
  };
}
