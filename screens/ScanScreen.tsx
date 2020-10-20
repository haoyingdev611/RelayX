import React, { useState, useEffect } from "react";
import I18n from "../src/locales";
import { isValidRelayOneQR } from "../src/relayone";
import QRScannerUI from "../src/components/QRScannerUI";
import { NavigationProps } from "../src/types";
import { useApi, VerifyResult } from "../src/api";
import { useDidMount } from "../src/hooks/useDidMount";
import { useUpdateExchangeRates } from "../actions/CurrencyActions";
import { useOnTransactionsList } from "../actions";
import { useBalanceUpdate } from "../src/hooks/useBalanceUpdate";

interface OwnProps {}

type Props = OwnProps & NavigationProps<void>;

export default function ScanScreen(props: Props) {
  const [error, setError] = useState("");
  const [scanEnable, setScanEnable] = useState(false);
  const api = useApi();
  const updateExchangeRates = useUpdateExchangeRates();
  const onTransactionsList = useOnTransactionsList();
  const checkBalanceUpdate = useBalanceUpdate();

  // fixme move to app
  useDidMount(async () => {
    await Promise.all([checkBalanceUpdate(), updateExchangeRates()]);
    onTransactionsList();
  });

  useEffect(() => {
    const listener = props.navigation.addListener("didFocus", () => {
      setScanEnable(true);
      Promise.all([checkBalanceUpdate(), updateExchangeRates()]);
    });

    return () => listener.remove();
  });

  async function onSuccess(qrCode: string) {
    setScanEnable(false);
    props.navigation.navigate("channelSelect", {
      scanType: "scan",
      uri: qrCode
    });
    return;
  }

  function getImage(uri: string) {
    setScanEnable(false);
    props.navigation.navigate("channelSelect", {
      scanType: "image",
      uri
    });
  }

  return (
    <QRScannerUI
      error={error}
      onSuccess={onSuccess}
      onRequestClose={() => {
        setScanEnable(!scanEnable);
        props.navigation.navigate("settingsNavigator");
      }}
      scanEnable={scanEnable}
      getImage={getImage}
    />
  );
}
