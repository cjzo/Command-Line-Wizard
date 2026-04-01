import React from "react";
import { Text } from "ink";

interface HealthBarProps {
  current: number;
  max: number;
  width?: number;
}

export const HealthBar: React.FC<HealthBarProps> = ({ current, max, width = 10 }) => {
  const ratio = max > 0 ? current / max : 0;
  const filled = Math.round(ratio * width);
  const bar = "█".repeat(filled) + "░".repeat(width - filled);

  let color: string;
  if (ratio > 0.5) color = "green";
  else if (ratio > 0.25) color = "yellow";
  else color = "red";

  return (
    <Text color={color}>HP:  [{bar}] {current}/{max}</Text>
  );
};
