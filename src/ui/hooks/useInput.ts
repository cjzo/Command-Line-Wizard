import { useInput as useInkInput } from "ink";
import type { InputBuffer } from "../../core/engine/inputBuffer.js";

export function useGameInput(inputBuffer: InputBuffer): void {
  useInkInput((input, key) => {
    if (input === "w" || key.upArrow) inputBuffer.press("up");
    if (input === "s" || key.downArrow) inputBuffer.press("down");
    if (input === "a" || key.leftArrow) inputBuffer.press("left");
    if (input === "d" || key.rightArrow) inputBuffer.press("right");

    if (input === "j") inputBuffer.press("ability1");
    if (input === "k") inputBuffer.press("ability2");
    if (input === "l") inputBuffer.press("ultimate");
    if (input === " ") inputBuffer.press("dash");

    if (input === "q") inputBuffer.press("quit");
    if (key.return) inputBuffer.press("confirm");
  });

  useInkInput(
    (_input, key) => {
      if (!key.upArrow && !key.downArrow) {
        // No key.upArrow means w was released (approximation for terminal)
      }
    },
  );
}

export function mapKeyToAction(input: string, key: { upArrow?: boolean; downArrow?: boolean; leftArrow?: boolean; rightArrow?: boolean; return?: boolean }): string | null {
  if (input === "w" || key.upArrow) return "up";
  if (input === "s" || key.downArrow) return "down";
  if (input === "a" || key.leftArrow) return "left";
  if (input === "d" || key.rightArrow) return "right";
  if (input === "j") return "ability1";
  if (input === "k") return "ability2";
  if (input === "l") return "ultimate";
  if (input === " ") return "dash";
  if (input === "q") return "quit";
  if (key.return) return "confirm";
  return null;
}
