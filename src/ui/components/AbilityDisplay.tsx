import React from "react";
import { Text, Box } from "ink";

interface AbilityInfo {
  key: string;
  name: string;
  cooldownRemaining: number;
  cooldownMax: number;
}

interface AbilityDisplayProps {
  slot1: AbilityInfo;
  slot2: AbilityInfo;
  ultimate: { key: string; name: string; ready: boolean };
}

function renderCooldownName(name: string, cooldownRemaining: number, cooldownMax: number): React.ReactNode {
  if (cooldownRemaining <= 0 || cooldownMax <= 0) {
    return <Text color="whiteBright">{name}</Text>;
  }

  const progress = Math.max(0, Math.min(1, 1 - cooldownRemaining / cooldownMax));
  const brightChars = Math.floor(name.length * progress);
  const bright = name.slice(0, brightChars);
  const dim = name.slice(brightChars);

  return (
    <>
      {bright ? <Text color="whiteBright">{bright}</Text> : null}
      {dim ? <Text color="gray">{dim}</Text> : null}
    </>
  );
}

export const AbilityDisplay: React.FC<AbilityDisplayProps> = ({
  slot1,
  slot2,
  ultimate,
}) => {
  const renderSlot = (info: AbilityInfo) => {
    const onCooldown = info.cooldownRemaining > 0;
    return (
      <Text>
        <Text color="whiteBright">{info.key}: </Text>
        {renderCooldownName(info.name, info.cooldownRemaining, info.cooldownMax)}
        {onCooldown ? <Text color="gray"> ({info.cooldownRemaining})</Text> : null}
      </Text>
    );
  };

  return (
    <Box flexDirection="column">
      {renderSlot(slot1)}
      {renderSlot(slot2)}
      <Text color={ultimate.ready ? "yellowBright" : "white"} bold={ultimate.ready}>
        {ultimate.key}: {ultimate.name} {ultimate.ready ? "(READY)" : ""}
      </Text>
    </Box>
  );
};
