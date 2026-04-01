import React from "react";
import { Box, Text } from "ink";

interface MainMenuProps {
  onStart: () => void;
  onQuit: () => void;
  selectedIndex: number;
}

const TITLE_ART = `
  ╔═══════════════════════════════════╗
  ║     COMMAND LINE WIZARD           ║
  ╚═══════════════════════════════════╝`;

export const MainMenu: React.FC<MainMenuProps> = ({ selectedIndex }) => {
  const options = ["Start Game", "Quit"];

  return (
    <Box flexDirection="column" alignItems="center" paddingTop={2}>
      <Text color="cyanBright" bold>{TITLE_ART}</Text>
      <Box flexDirection="column" marginTop={2}>
        {options.map((opt, i) => (
          <Text key={opt} color={i === selectedIndex ? "yellowBright" : "whiteBright"}>
            {i === selectedIndex ? " ► " : "   "}{opt}
          </Text>
        ))}
      </Box>
      <Box marginTop={2}>
        <Text color="white">W/S to navigate  •  Enter to select</Text>
      </Box>
    </Box>
  );
};
