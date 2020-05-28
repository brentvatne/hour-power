import * as React from "react";
import { Text, TextProperties } from "react-native";

interface Props extends TextProperties {
  children?: any;
}

export const Light = (props: Props) => (
  <Text
    {...props}
    style={[{ fontFamily: "SourceSansPro_300Light" }, props.style]}
  />
);

export const Regular = (props: Props) => (
  <Text
    {...props}
    style={[{ fontFamily: "SourceSansPro_400Regular" }, props.style]}
  />
);

export const Italic = (props: Props) => (
  <Text
    {...props}
    style={[{ fontFamily: "SourceSansPro_400Regular_Italic" }, props.style]}
  />
);

export const SemiBold = (props: Props) => (
  <Text
    {...props}
    style={[{ fontFamily: "SourceSansPro_600SemiBold" }, props.style]}
  />
);

export const Bold = (props: Props) => (
  <Text
    {...props}
    style={[{ fontFamily: "SourceSansPro_700Bold" }, props.style]}
  />
);

export const Title = (props: Props) => (
  <Bold {...props} style={[{ fontSize: 28 }, props.style]} />
);

export const Subtitle = (props: Props) => (
  <Regular {...props} style={[{ color: "#888", fontSize: 25 }, props.style]} />
);

export const Secondary = (props: Props) => (
  <Regular {...props} style={[{ color: "#888" }, props.style]} />
);
