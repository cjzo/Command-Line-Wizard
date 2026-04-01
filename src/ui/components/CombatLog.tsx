import React from "react";
import { Box, Text } from "ink";

interface CombatLogProps {
  messages: string[];
  maxLines?: number;
}

export const CombatLog: React.FC<CombatLogProps> = ({ messages, maxLines = 6 }) => {
  const visible = messages.slice(-maxLines);

  return (
    <Box flexDirection="column">
      <Text color="whiteBright" bold>── Combat Log ──</Text>
      {visible.map((msg, i) => (
        <Text key={i} color={i === visible.length - 1 ? "whiteBright" : "white"}>
          {msg}
        </Text>
      ))}
    </Box>
  );
};
