import React from "react";
import { View, StyleSheet, Text, TextInput } from "react-native";
import { InputMetaTextSpacer, InputMetaTextInfo } from "./InputMetaText";
import { IconButton } from "./IconButton";
import { Colors } from "../constants";

interface OwnProps {
  placeholder: string;
  value: string;
  onChange(value: string, submit?: boolean): any;
  error?: string;
  info?: string;
  actionIcon?: number;
  readonly?: boolean;
  autoFocus?: boolean;
  onFocus?(focused: boolean): any;
  onSubmitEditing?(): any;
  onActionIcon?(): any;
  onInfoClick?(): any;
}

export default function Input(props: OwnProps) {
  const handleRelayFocus = () => {
    if (props.onFocus) {
      props.onFocus(true);
    }
  };

  const handleBlur = () => {
    if (props.onFocus) {
      props.onFocus(false);
    }
  };

  const handleSubmitEditing = () => {
    if (props.onSubmitEditing) {
      props.onSubmitEditing();
    }
  };

  const onChangeText = (value: string) => {
    props.onChange(value);
  };

  const onClear = () => {
    props.onChange("");
  };

  const onActionIcon = () => {
    props.onActionIcon && props.onActionIcon();
  };

  const { value, readonly, actionIcon, autoFocus } = props;

  let metaText = <InputMetaTextSpacer> </InputMetaTextSpacer>;

  if (props.info) {
    metaText = (
      <InputMetaTextInfo onPress={props.onInfoClick}>
        {props.info}
      </InputMetaTextInfo>
    );
  }

  if (props.error) {
    metaText = <InputMetaTextInfo>{props.error}</InputMetaTextInfo>;
  }

  return (
    <>
      <View
        style={[
          styles.handleWrapper,
          {
            borderColor: readonly ? "white" : Colors.Light,
            flexDirection: "row"
          }
        ]}
      >
        {readonly && (
          <Text style={styles.pastedHandle} numberOfLines={0}>
            {value}
          </Text>
        )}
        {!readonly && (
          <TextInput
            style={value ? styles.handleName : styles.placeholderStyle}
            allowFontScaling={false}
            autoFocus={autoFocus}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            keyboardType="email-address"
            placeholder={props.placeholder}
            placeholderTextColor={Colors.ChateauGrey}
            underlineColorAndroid="transparent"
            value={value}
            editable={true}
            onSubmitEditing={handleSubmitEditing}
            onFocus={handleRelayFocus}
            onBlur={handleBlur}
            onChangeText={onChangeText}
          />
        )}
        {!!value && (
          <IconButton
            tintColor={Colors.LightGrey}
            size={16}
            source={require("../../icons/cross-circle.png")}
            onPress={onClear}
          />
        )}
        {!value && actionIcon && (
          <IconButton
            tintColor={Colors.LightGrey}
            size={16}
            source={actionIcon}
            onPress={onActionIcon}
          />
        )}
      </View>
      {metaText}
    </>
  );
}

const styles = StyleSheet.create({
  handleWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 1,
    alignItems: "center",
    height: 55,
    marginBottom: 20,
    marginTop: 20,
    paddingLeft: 10,
    marginHorizontal: 10
  },
  placeholderStyle: {
    fontSize: 16,
    lineHeight: 36,
    padding: 0,
    flex: 1
  },
  handleName: {
    fontSize: 30,
    lineHeight: 36,
    padding: 0,
    flex: 1
  },
  pastedHandle: {
    flex: 1,
    fontSize: 16,
    textAlign: "center"
  }
});
