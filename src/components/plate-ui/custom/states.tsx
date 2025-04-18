import { createPlatePlugin } from "@udecode/plate/react";

export const StatesPlugin = createPlatePlugin({
  key: "states",
  node: {
    isElement: false,
    isVoid: true,
    isSelectable: false,
    type: "states",
  },
  options: {
    notesId: "",
  },
});
