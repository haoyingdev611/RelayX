import React, { useState, useEffect } from "react";
import {
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  StyleSheet
} from "react-native";

export default function KeyboardAvoiding(props: React.Props<void>) {
  const [keyboardAvoidingViewKey, setKeyboardAvoidingViewKey] = useState(
    "keyboardAvoidingViewKey"
  );
  useEffect(() => {
    const listener = Keyboard.addListener(
      Platform.OS === "android" ? "keyboardDidHide" : "keyboardWillHide",
      () => {
        setKeyboardAvoidingViewKey(
          "keyboardAvoidingViewKey" + new Date().getTime()
        );
      }
    );

    return () => listener.remove();
  });

  return (
    <KeyboardAvoidingView
      style={style.flex}
      behavior={"height"}
      key={keyboardAvoidingViewKey}
    >
      {props.children}
    </KeyboardAvoidingView>
  );
}

const style = StyleSheet.create({
  flex: { flex: 1 }
});
