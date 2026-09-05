import React from "react";
import { View, Image } from "react-native";
import Svg, { Path, Defs, ClipPath } from "react-native-svg";

export default function HeartPhoto({ size = 220, imageUri }: { size?: number; imageUri?: string }) {
  const path = "M32 57s-1.6-1.3-5.8-4.7C18.3 45.6 8 37.2 8 26.9 8 18.3 14.8 11 22.8 11c4.5 0 8.4 2.3 10.7 5.6C35 13.3 38.9 11 43.4 11 51.4 11 58.2 18.3 58.2 26.9c0 10.3-10.3 18.7-18.2 25.4C33.6 55.7 32 57 32 57z";
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <ClipPath id="heartClip">
            <Path d={path} />
          </ClipPath>
        </Defs>
        <Image
          href={{ uri: imageUri || "https://placekitten.com/400/400" }}
          width={size}
          height={size}
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#heartClip)"
        />
      </Svg>
    </View>
  );
}
