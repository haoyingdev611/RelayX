import React from "react";
import styled from "styled-components/native";

const MarkWrapper = styled.View`
  width: 14px;
  height: 14px;
  border-radius: 7px;
  border-width: 2px;
  border-color: white;
  position: absolute;
  left: 24;
  bottom: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const MarkImage = styled.Image`
  width: 12px;
  height: 12px;
  background-color: ${(props: { bg: string }) => props.bg};
`;

const IconClose = require("../../icons/close.png");
const IconCheck = require("../../icons/check.png");
const IconPending = require("../../icons/pending.png");

const markMap = {
  pending: IconPending,
  close: IconClose,
  check: IconCheck
};

interface MarkProps {
  mark: "pending" | "check" | "close";
  markBg: string;
}

function Mark(props: MarkProps) {
  return (
    <MarkWrapper>
      <MarkImage
        resizeMode="contain"
        source={markMap[props.mark]}
        bg={props.markBg}
      />
    </MarkWrapper>
  );
}

interface Props extends MarkProps {
  image: number;
  bg?: string;
}

const Icon = styled.Image`
  width: 34px;
  height: 34px;
  border-radius: 17px;
`;

const CircleImage = styled.Image`
  width: 24px;
  height: 24px;
  overflow: hidden;
`;

const CircleIconWrapper = styled.View`
  width: 34px;
  height: 34px;
  border-radius: 17px;
  align-items: center;
  justify-content: center;
  background-color: ${(props: { bg: string }) => props.bg};
`;

function CircleIcon(props: { source: number; bg: string }) {
  return (
    <CircleIconWrapper bg={props.bg}>
      <CircleImage source={props.source} />
    </CircleIconWrapper>
  );
}

export default function IconWithMark(props: Props) {
  const { image, ...rest } = props;
  return (
    <>
      {!props.bg ? (
        <Icon source={image} />
      ) : (
        <CircleIcon source={image} bg={props.bg} />
      )}
      <Mark {...rest} />
    </>
  );
}
