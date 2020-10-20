import React from "react";
import { Image } from "react-native";
import styled from "styled-components/native";
import { Colors } from "../constants";

type Props = {
  icon: number;
  onPress: () => any;
};

const Button = styled.TouchableOpacity`
  background-color: ${Colors.ClearBlue};
  justify-content: center;
  align-items: center;
  border-radius: 25px;
  height: 50px;
  width: 50px;
  position: absolute;
  bottom: 70px;
  right: 40px;
  shadow-color: #000;
  shadow-offset: 0px 5px;
  shadow-opacity: 0.24;
  shadow-radius: 6px;
`;

export default function MaterialFloatingButton({ icon, onPress }: Props) {
  return (
    <Button activeOpacity={0.5} onPress={onPress}>
      <Image resizeMode="contain" source={icon} />
    </Button>
  );
}
