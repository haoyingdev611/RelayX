import React, { ReactNode } from "react";
import { Modal, View, TouchableOpacity, Text } from "react-native";
import { Colors } from "../constants";

type Props = {
  visible: boolean;
  title: string;
  description: string;
  titleStyle?: any;
  descriptionStyle?: any;
  onPressYes: () => any;
  onPressCancel?: () => any;
  titleYes: string;
  titleNo?: string;
  single: boolean;
  children?: ReactNode;
};

const ConfirmModal = ({
  visible,
  title,
  titleStyle,
  description,
  descriptionStyle,
  onPressYes,
  onPressCancel,
  titleYes,
  titleNo,
  single,
  children
}: Props) => {
  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, titleStyle]}>{title}</Text>
          </View>

          {Boolean(description) && (
            <View style={styles.body}>
              <Text style={[styles.description, descriptionStyle]}>
                {description}
              </Text>
            </View>
          )}
          {children}

          <View style={styles.footer}>
            {!single && (
              <TouchableOpacity style={styles.button} onPress={onPressCancel}>
                <Text style={styles.buttonTitle}>{titleNo}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.button} onPress={onPressYes}>
              <Text style={styles.buttonTitle}>{titleYes}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  container: {
    paddingVertical: 20,
    paddingHorizontal: 48,
    flex: 1,
    justifyContent: "center" as "center",
    alignItems: "center" as "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: "white"
  },
  header: {
    paddingHorizontal: 8
  },
  body: {
    paddingHorizontal: 8
  },
  footer: {
    flexDirection: "row" as "row",
    padding: 8,
    justifyContent: "flex-end" as "flex-end",
    alignItems: "flex-end" as "flex-end"
  },
  title: {
    textAlign: "center",
    fontSize: 20,
    lineHeight: 28,
    color: "rgba(0, 0, 0, 0.87)"
  },
  description: {
    paddingTop: 10,
    fontSize: 16,
    lineHeight: 21,
    color: "rgba(0, 0, 0, 0.54)"
  },
  button: {
    width: 75,
    height: 36,
    justifyContent: "center" as "center",
    alignItems: "center" as "center"
  },
  buttonTitle: {
    fontSize: 14,
    color: Colors.ClearBlue
  }
};

export { ConfirmModal };
