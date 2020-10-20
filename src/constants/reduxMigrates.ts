export const reduxMigrations = {
  0: (state: any) => {
    // migration clear out device state
    return {
      ...state,
      main: {
        ...state.main,
        favoriteList: state.main.favoriteList || []
      }
    };
  },
  1: (state: any) => {
    const mainCopy = { ...state.main };
    delete mainCopy.feePer;
    delete mainCopy.networkFee;
    delete mainCopy.relayFee;
    delete mainCopy.settingFee;
    delete mainCopy.settingRate;
    delete mainCopy.currencyExchangeRate;
    delete mainCopy.currencyExchangeRatePay;

    return { ...state, main: mainCopy };
  },
  2: (state: any) => {
    const walletCopy = { ...state.wallet };
    if (typeof walletCopy.satoshi === "undefined") {
      walletCopy.satoshi = 0;
    }
    delete walletCopy.relayOneUnconfirmedBalance;
    delete walletCopy.relayOneBalance;
    delete walletCopy.relayOneUnconfirmedSatoshi;

    const mainCopy = { ...state.main };
    delete mainCopy.balance;
    delete mainCopy.unconfirmedBalance;
    delete mainCopy.balanceShow;
    delete mainCopy.satoshi;

    return { ...state, wallet: walletCopy, main: mainCopy };
  },
  3: (state: any) => {
    const mainCopy = { ...state.main };
    const settingCopy = { ...state.settingReducer };

    delete mainCopy.isAmount;
    delete mainCopy.bipAmount;
    delete mainCopy.amountSuccess;
    delete mainCopy.handleAddress;
    delete mainCopy.sendHandle;
    delete mainCopy.iconType;
    delete mainCopy.linkedAccountId;
    delete mainCopy.linkedInfo;
    delete mainCopy.linkedSign;
    delete mainCopy.linkedSymbolName;
    delete mainCopy.linkedSymbolId;
    delete mainCopy.linkedName;
    delete mainCopy.linkedStatus;
    delete mainCopy.receiveAmount;
    delete mainCopy.walletEarnAmount;
    delete mainCopy.jsonInfo;
    delete mainCopy.orderNumber;

    delete settingCopy.receivePay;
    delete settingCopy.receiveSign;
    delete settingCopy.receiveWalletId;
    delete settingCopy.receiveWalletName;

    mainCopy.favoriteList = (mainCopy.favoriteList || []).map((item: any) => ({
      paymentId: 1,
      name: item.handle || item.address,
      linkedInfo: item.handle || item.address
    }));

    return { ...state, main: mainCopy };
  }
};
