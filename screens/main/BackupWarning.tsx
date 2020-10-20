import React from "react";
import styled from "styled-components/native";
import IconWithMark from "../../src/components/IconWithMark";
import { Colors } from "../../src/constants";

const Container = styled.TouchableOpacity`
  margin-horizontal: 16px;
  background-color: white;
  border-radius: 10px;
  padding: 15px;
`;

const Header = styled.Text`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const Row = styled.View`
  flex-direction: row;
`;

const MarkWrapper = styled.View`
  margin-right: 10px;
`;

const ContentWrapped = styled.View``;

const MainCopy = styled.Text`
  color: ${Colors.DarkGrey};
  font-size: 14px;
`;

interface Props {
  onPress: () => void;
}

export default function BackupWarning(props: Props) {
  return (
    <Container activeOpacity={0.7} onPress={props.onPress}>
      <Header>Secure your wallet</Header>
      <Row>
        <MarkWrapper>
          <IconWithMark
            mark="check"
            image={require("../../icons/note.png")}
            markBg={Colors.ClearBlue}
            bg={Colors.LightPeriwinkle}
          />
        </MarkWrapper>
        <ContentWrapped>
          <MainCopy>Back up your recovery phrase</MainCopy>
        </ContentWrapped>
      </Row>
    </Container>
  );
}
