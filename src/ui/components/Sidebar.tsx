import React from "react";
import { Text, Box } from "ink";

interface SidebarProps {
  width: number;
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ width, children }) => {
  return (
    <Box flexDirection="column" width={width} paddingLeft={1}>
      {children}
    </Box>
  );
};
