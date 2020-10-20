import { useSelector } from "react-redux";
import { useApi } from "../api";
import { receiveBalanceAction } from "../../actions/WalletActions";
import { useDispatch } from "../types";
import { AppState } from "../../reducers";

export function useBalanceUpdate() {
  const dispatch = useDispatch();
  const wallet = useSelector((state: AppState) => state.wallet);
  const api = useApi();

  return async function checkBalanceUpdate() {
    const { publicAddress, relayOnePublicAddress } = wallet;
    const [main, relayOne] = await Promise.all([
      api.fetchFinanceBalance(publicAddress!),
      api.fetchFinanceBalance(relayOnePublicAddress!)
    ]);
    console.log(main, relayOne, "--");
    dispatch(
      receiveBalanceAction({
        satoshi: main.satoshi,
        relayOneSatoshi: relayOne.satoshi
      })
    );
  };
}
