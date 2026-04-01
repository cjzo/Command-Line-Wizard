import React from "react";
import { Box } from "ink";
import { Grid } from "../components/Grid.js";
import { Sidebar } from "../components/Sidebar.js";
import type { Cell } from "../../rendering/frameBuffer.js";

interface CombatScreenProps {
  cells: Cell[][];
  sidebarWidth: number;
  sidebarContent: React.ReactNode;
}

export const CombatScreen: React.FC<CombatScreenProps> = ({
  cells,
  sidebarWidth,
  sidebarContent,
}) => {
  return (
    <Box>
      <Grid cells={cells} borderColor="whiteBright" />
      <Sidebar width={sidebarWidth}>{sidebarContent}</Sidebar>
    </Box>
  );
};
