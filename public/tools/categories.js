import { TOOLS } from "./registry.js";

export const TOOL_GROUPS = Object.values(TOOLS).reduce((acc, tool) => {
  const key = tool.cat || "Other";
  if (!acc[key]) {
    acc[key] = [];
  }
  acc[key].push(tool);
  return acc;
}, {});
