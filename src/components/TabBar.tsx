import React from "react";
import styled from "styled-components/native";
import { Colors } from "../constants";

interface TabProps {
  active?: boolean;
}

const TabBarContainer = styled.View`
  flex-direction: row;
`;

const Tab = styled.TouchableOpacity`
  flex: 1;
  justify-content: center;
  align-items: center;
  height: 40;
  border-bottom-color: ${(props: TabProps) =>
    props.active ? Colors.ClearBlue : Colors.Light};
  border-bottom-width: ${(props: TabProps) => (props.active ? "2px" : "1px")};
`;

const TabName = styled.Text`
  font-size: 14;
  color: ${(props: TabProps) => (props.active ? "#000000" : Colors.LightGrey)};
`;

interface Props {
  tabs: {
    key: string;
    title: string;
  }[];
  active: string;
  onChange(tabKey: string): any;
}

export default function TabBar(props: Props) {
  return (
    <TabBarContainer>
      {props.tabs.map(t => {
        return (
          <Tab
            key={t.key}
            active={t.key === props.active}
            onPress={() => props.onChange(t.key)}
          >
            <TabName active={t.key === props.active}>{t.title}</TabName>
          </Tab>
        );
      })}
    </TabBarContainer>
  );
}
