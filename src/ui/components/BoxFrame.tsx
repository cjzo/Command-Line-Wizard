import React from "react";
import { Box, Text } from "ink";

interface BoxFrameProps {
  title?: string;
  width?: number;
  color?: string;
  children: React.ReactNode;
}

export const BoxFrame: React.FC<BoxFrameProps> = ({
  title,
  width,
  color = "gray",
  children,
}) => {
  const innerWidth = width ? width - 2 : undefined;
  const topLine = title
    ? `┌─ ${title} ${"─".repeat(Math.max(0, (innerWidth ?? 20) - title.length - 3))}┐`
    : `┌${"─".repeat(innerWidth ?? 20)}┐`;
  const bottomLine = `└${"─".repeat(innerWidth ?? 20)}┘`;

  return (
    <Box flexDirection="column" width={width}>
      <Text color={color}>{topLine}</Text>
      <Box flexDirection="column" paddingLeft={1} paddingRight={1}>
        {children}
      </Box>
      <Text color={color}>{bottomLine}</Text>
    </Box>
  );
};
