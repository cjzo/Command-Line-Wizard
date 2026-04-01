import React from "react";
import { Box, Text } from "ink";

interface VictoryScreenProps {
  tick: number;
  enemiesKilled: number;
  wavesCleared: number;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  tick,
  enemiesKilled,
  wavesCleared,
}) => {
  return (
    <Box flexDirection="column" alignItems="center" paddingTop={2}>
      <Text color="greenBright" bold>{"  ╔═══════════════════════════╗"}</Text>
      <Text color="greenBright" bold>{"  ║       VICTORY!            ║"}</Text>
      <Text color="greenBright" bold>{"  ╚═══════════════════════════╝"}</Text>
      <Text> </Text>
      <Text color="cyanBright">All {wavesCleared} waves cleared!</Text>
      <Text color="whiteBright">Time: {Math.floor(tick * 0.12)}s</Text>
      <Text color="whiteBright">Enemies defeated: {enemiesKilled}</Text>
      <Text> </Text>
      <Text color="white">Press Enter to return to menu</Text>
    </Box>
  );
};
