import React from "react";
import { Text } from "ink";

interface UltimateBarProps {
  current: number;
  max: number;
  ready: boolean;
  width?: number;
}

export const UltimateBar: React.FC<UltimateBarProps> = ({
  current,
  max,
  ready,
  width = 10,
}) => {
  const ratio = max > 0 ? current / max : 0;
  const filled = Math.round(ratio * width);
  const bar = "█".repeat(filled) + "░".repeat(width - filled);

  if (ready) {
    return <Text color="yellowBright" bold>ULT: [{"█".repeat(width)}] READY!</Text>;
  }

  return (
    <Text color="cyanBright">ULT: [{bar}] {current}/{max}</Text>
  );
};
