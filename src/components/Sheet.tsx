import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  TouchableWithoutFeedback
} from "react-native";
import { BlackPortal } from "react-native-portal";
import styled from "styled-components/native";
import { useDidMount } from "../hooks/useDidMount";
import { Loader } from "./Loader";

const { width } = Dimensions.get("screen");

const SHEET_HEIGHT = 325;

const ModalContainer = styled.View`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  align-items: center;
  justify-content: center;

  background-color: rgba(51, 51, 51, 0.4);
`;

const ModalBackdrop = styled.View`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const Wrapper = styled.View`
  padding-bottom: 10;
  align-items: center;
  width: 100%;
`;

const Content = styled.View`
  padding-bottom: 30;
  padding-top: 17;
  width: 100%;
`;

const KnobBody = styled.View`
  width: 60;
  height: 7;
  background-color: #d0d0d0;
  border-radius: 5;
`;

const Knob = styled.View`
  padding-top: 13;
  padding-horizontal: 10;
  padding-bottom: 13;
`;

export interface Props {
  loading: boolean;

  onRequestClose(): any;
}

export default function Sheet(props: React.PropsWithChildren<Props>) {
  const { loading } = props;
  const y = useRef(new Animated.Value(SHEET_HEIGHT));

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dy > 0)
          Animated.event([null, { dy: y.current }])(e, gestureState);
      },
      onPanResponderTerminate: () => {
        Animated.spring(y.current, { toValue: 0 }).start();
      },
      onPanResponderRelease(_e, gestureState) {
        if (gestureState.dy > 200) {
          Animated.timing(y.current, {
            toValue: SHEET_HEIGHT,
            duration: 150
          }).start(() => {
            props.onRequestClose();
          });
          return;
        }
        Animated.spring(y.current, { toValue: 0 }).start();
      }
    })
  );

  function onClose() {
    Animated.timing(y.current, { toValue: SHEET_HEIGHT, duration: 200 }).start(
      () => {
        props.onRequestClose();
      }
    );
  }

  useDidMount(() => {
    Animated.spring(y.current, {
      toValue: 0
    }).start();
  });

  return (
    <BlackPortal name={"modal"}>
      <ModalContainer
        style={{ alignItems: "center", justifyContent: "flex-end" }}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <ModalBackdrop />
        </TouchableWithoutFeedback>

        <Animated.View
          style={{
            position: "absolute",
            bottom: Animated.multiply(y.current, -1),
            backgroundColor: "rgba(255, 255, 255, 1)",
            width: width,
            height: SHEET_HEIGHT,
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25
          }}
        >
          <Wrapper style={{}}>
            <Knob {...panResponder.current.panHandlers}>
              <KnobBody />
            </Knob>
            <Content>{props.children}</Content>
            <Loader sheet visible={loading} />
          </Wrapper>
        </Animated.View>
      </ModalContainer>
    </BlackPortal>
  );
}
