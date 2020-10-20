import React from "react";
import QRCode from "react-native-qrcode";
import { Colors } from "../constants";

import styled from "styled-components/native";

const Container = styled.View.attrs({
  size: 200
})`
  overflow: hidden;
  width: ${props => props.size};
  height: ${props => props.size};
`;

const LogoContainer = styled.View.attrs({
  size: 200,
  logoSize: 40,
  padding: 4
})`
  position: absolute;
  left: ${props => (props.size - props.logoSize - props.padding) / 2};
  top: ${props => (props.size - props.logoSize - props.padding) / 2};
  padding: ${props => props.padding}px;
  background-color: white;
`;

const Logo = styled.Image.attrs({
  logoSize: 40
})`
  width: ${props => props.logoSize};
  height: ${props => props.logoSize};
  background-color: ${Colors.ClearBlue};
`;

interface Props {
  size: number;
  logoSize: number;
  logo: number;
  qrCode: string;
}

export default function QRWithLogo(props: Props) {
  return (
    <Container size={props.size}>
      <QRCode value={props.qrCode} size={200} />
      <LogoContainer size={props.size} logoSize={props.logoSize}>
        <Logo
          logoSize={props.logoSize}
          resizeMode="contain"
          source={props.logo}
        />
      </LogoContainer>
    </Container>
  );
}
