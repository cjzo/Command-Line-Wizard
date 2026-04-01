import React from "react";
import { Box, Text } from "ink";

interface DeathScreenProps {
  tick: number;
  enemiesKilled: number;
}

export const DeathScreen: React.FC<DeathScreenProps> = ({ tick, enemiesKilled }) => {
  return (
    <Box flexDirection="column" alignItems="center" paddingTop={2}>
      <Text color="redBright" bold>{"  ╔═══════════════════════════╗"}</Text>
      <Text color="redBright" bold>{"  ║       YOU  DIED           ║"}</Text>
      <Text color="redBright" bold>{"  ╚═══════════════════════════╝"}</Text>
      <Text> </Text>
      <Text color="whiteBright">Survived: {Math.floor(tick * 0.12)}s</Text>
      <Text color="whiteBright">Enemies defeated: {enemiesKilled}</Text>
      <Text> </Text>
      <Text color="white">Press Enter to return to menu</Text>
    </Box>
  );
};
