import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import type { AbilityData, UltimateData } from "../../core/data/schemas.js";

interface AbilitySelectProps {
  abilities: AbilityData[];
  ultimates: UltimateData[];
  onConfirm: (ability1: string, ability2: string, ultimate: string) => void;
}

type SelectPhase = "ability1" | "ability2" | "ultimate" | "confirm";

export const AbilitySelect: React.FC<AbilitySelectProps> = ({
  abilities,
  ultimates,
  onConfirm,
}) => {
  const [phase, setPhase] = useState<SelectPhase>("ability1");
  const [cursor, setCursor] = useState(0);
  const [ability1, setAbility1] = useState<string | null>(null);
  const [ability2, setAbility2] = useState<string | null>(null);
  const [ultimate, setUltimate] = useState<string | null>(null);

  const currentList = phase === "ultimate" ? ultimates : abilities;
  const filteredList = phase === "ability2"
    ? abilities.filter((a) => a.id !== ability1)
    : currentList;

  useInput((input, key) => {
    if (phase === "confirm") {
      if (key.return) {
        onConfirm(ability1!, ability2!, ultimate!);
      }
      if (input === "q") {
        setPhase("ability1");
        setAbility1(null);
        setAbility2(null);
        setUltimate(null);
        setCursor(0);
      }
      return;
    }

    if (input === "w" || key.upArrow) {
      setCursor((c) => Math.max(0, c - 1));
    }
    if (input === "s" || key.downArrow) {
      setCursor((c) => Math.min(filteredList.length - 1, c + 1));
    }

    if (key.return && filteredList.length > 0) {
      const selected = filteredList[cursor];
      if (phase === "ability1") {
        setAbility1(selected.id);
        setPhase("ability2");
        setCursor(0);
      } else if (phase === "ability2") {
        setAbility2(selected.id);
        setPhase("ultimate");
        setCursor(0);
      } else if (phase === "ultimate") {
        setUltimate(selected.id);
        setPhase("confirm");
      }
    }
  });

  const getPhaseTitle = () => {
    switch (phase) {
      case "ability1": return "Choose First Attack (J key)";
      case "ability2": return "Choose Second Attack (K key)";
      case "ultimate": return "Choose Ultimate (L key)";
      case "confirm": return "Confirm Loadout";
    }
  };

  const typeColor: Record<string, string> = {
    projectile: "red",
    beam: "yellow",
    cone: "cyan",
    delayed: "magenta",
    movement: "white",
  };

  if (phase === "confirm") {
    const a1 = abilities.find((a) => a.id === ability1);
    const a2 = abilities.find((a) => a.id === ability2);
    const u = ultimates.find((u) => u.id === ultimate);

    return (
      <Box flexDirection="column" paddingTop={1} paddingLeft={2}>
        <Text color="cyan" bold>{"═══ YOUR LOADOUT ═══"}</Text>
        <Text> </Text>
        <Text color="white">J: <Text color={typeColor[a1?.type ?? ""] ?? "white"}>{a1?.name}</Text> - {a1?.description}</Text>
        <Text color="white">K: <Text color={typeColor[a2?.type ?? ""] ?? "white"}>{a2?.name}</Text> - {a2?.description}</Text>
        <Text color="yellowBright">L: {u?.name} - {u?.description}</Text>
        <Text> </Text>
        <Text color="green">Press Enter to begin  •  Q to re-select</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingTop={1} paddingLeft={2}>
      <Text color="cyan" bold>{"═══ " + getPhaseTitle() + " ═══"}</Text>
      <Text> </Text>
      {filteredList.map((item, i) => {
        const isAbility = "type" in item && item.type !== undefined;
        const abilityType = isAbility ? (item as AbilityData).type : "";
        const color = typeColor[abilityType] ?? "yellow";

        return (
          <Box key={item.id} flexDirection="column">
            <Text color={i === cursor ? color : "gray"}>
              {i === cursor ? " ► " : "   "}
              <Text bold={i === cursor}>{item.name}</Text>
              {isAbility ? <Text color="gray"> [{abilityType}]</Text> : null}
            </Text>
            {i === cursor && (
              <Text color="gray" dimColor>     {item.description}</Text>
            )}
          </Box>
        );
      })}
      <Text> </Text>
      {ability1 && <Text color="gray">J: {abilities.find((a) => a.id === ability1)?.name}</Text>}
      {ability2 && <Text color="gray">K: {abilities.find((a) => a.id === ability2)?.name}</Text>}
      <Text> </Text>
      <Text color="gray" dimColor>W/S to navigate  •  Enter to select</Text>
    </Box>
  );
};
