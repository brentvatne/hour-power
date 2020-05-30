import React, { useState, useRef } from "react";
import { A } from "@expo/html-elements";
import { useActive, useHover, useFocus } from "react-native-web-hooks";

export default function AnchorButton(props: any) {
  const ref = useRef(null);
  const isHovered = useHover(ref);

  return (
    <A
      {...props}
      ref={ref}
      style={[props.style, { opacity: isHovered ? 0.7 : 1 }]}
    >
      {props.children}
    </A>
  );
}
