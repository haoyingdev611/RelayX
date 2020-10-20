// Common input warning text
import styled from "styled-components/native";
import { Colors } from "../constants";

export const InputMetaTextInfo = styled.Text`
  color: ${Colors.BlueyGrey};
  font-size: 12;
  line-height: 20;
  text-align: center;
`;

export const InputMetaTextWarn = styled.Text`
  color: ${Colors.OrangeYellow};
  font-size: 14;
  line-height: 20;
  text-align: center;
`;

export const InputMetaTextSpacer = styled.Text`
  line-height: 20;
`;
