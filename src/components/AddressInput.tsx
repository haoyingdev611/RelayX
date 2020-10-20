import React from "react";
import { Clipboard } from "react-native";
import I18n from "../locales";
import { PaymentMeta } from "../../src/api";
import { AppState } from "../../reducers";
import { connect } from "../types";
import Input from "./Input";

interface OwnProps {
  paymentId: number;
  invalid: boolean;
  address: string;
  onChange(address: string, submit?: boolean): any;
  onFocus?(focused: boolean): any;
  onSubmitEditing?(): any;
}

interface ReduxProps {
  payment?: PaymentMeta;
}

type Props = OwnProps & ReduxProps;

interface State {
  pasted: boolean;
}

function getPlaceholderName(paymentName: string) {
  let placeholder = I18n.t("handleNameOrPaymail");
  if (paymentName === "Cash App") {
    placeholder = I18n.t("enterHandle", { handle: "$handle", address: "" });
  } else if (paymentName === "Cash App UK") {
    placeholder = I18n.t("enterHandle", { handle: "£handle", address: "" });
  } else if (paymentName === "Bitcoin Core") {
    placeholder = I18n.t("enterHandle", {
      handle: "Bitcoin Core",
      address: I18n.t("address")
    });
  } else if (paymentName === "Bitcoin Cash") {
    placeholder = I18n.t("enterHandle", {
      handle: "Bitcoin Cash",
      address: I18n.t("address")
    });
  } else if (paymentName === "Tether ERC-20") {
    placeholder = I18n.t("enterHandle", {
      handle: "Tether ERC-20",
      address: I18n.t("address")
    });
  } else if (paymentName === "Ethereum") {
    placeholder = I18n.t("enterHandle", {
      handle: "Ethereum",
      address: I18n.t("address")
    });
  }

  return placeholder;
}

export class AddressInput extends React.Component<Props, State> {
  state = {
    pasted: false
  };
  handleRelayFocus = (focused: boolean) => {
    const { address, paymentId, onChange } = this.props;
    if (this.props.onFocus) {
      this.props.onFocus(focused);
    }
    if (!focused) return;
    if (address) return;
    if (paymentId === 92) {
      //cashapp
      onChange("$");
    } else if (paymentId === 93) {
      //cashapp uk
      onChange("£");
    }else if (paymentId === 1) {
      onChange("");
    }
  };

  onChangeText = (value: string) => {
    if (value !== "") {
      if (value.slice(-1) === "@" && value.charAt(0) === "1") {
        value = value.substr(1);
      }
    }

    this.props.onChange(value);
  };

  pasteReturnAddress = async () => {
    let returnAddress = await Clipboard.getString();

    if (returnAddress.length > 0) {
      if (~returnAddress.indexOf(":")) {
        returnAddress = returnAddress.split(":")[1];
      }

      if (~returnAddress.indexOf("?")) {
        returnAddress = returnAddress.split("?")[0];
      }

      this.setState({
        pasted: true
      });

      this.props.onChange(returnAddress, true);
    }
  };

  render() {
    const { payment, address } = this.props;
    const { pasted } = this.state;
    if (!payment) {
      throw new Error("Payment resolution error");
    }

    return (
      <Input
        value={address}
        placeholder={getPlaceholderName(payment.paymentName)}
        error={this.props.invalid ? I18n.t("recipientNotFound") : ""}
        readonly={address === "" ? false : pasted}
        actionIcon={require("../../icons/paste.png")}
        onSubmitEditing={this.props.onSubmitEditing}
        onFocus={this.handleRelayFocus}
        onChange={this.onChangeText}
        onActionIcon={this.pasteReturnAddress}
      />
    );
  }
}

const mapStateToProps = (state: AppState, props: OwnProps): ReduxProps => {
  return {
    payment: state.settingReducer.receiveList.find(
      p => p.paymentId === props.paymentId
    )
  };
};

export default connect(mapStateToProps)(AddressInput);
