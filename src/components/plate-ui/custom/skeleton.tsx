import { createPlatePlugin, useEditorPlugin } from "@udecode/plate/react";
import { useAtomValue } from "jotai";
import { generatingNotesAtom } from "@/atoms/notes";
import { StatesPlugin } from "./states";
import { Skeleton } from "@/components/ui/skeleton";

export const SkeletonElement = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { getOption } = useEditorPlugin(StatesPlugin);
  const notesId = getOption("notesId");
  const generatingSignal = useAtomValue(generatingNotesAtom(notesId));

  if (!generatingSignal) {
    return;
  }

  return (
    <div className="space-y-2 my-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/3" />
      {children}
    </div>
  );
};

export const SkeletonPlugin = createPlatePlugin({
  key: "skeleton",
  node: {
    isElement: true,
    isVoid: true,
    isSelectable: false,
    type: "skeleton",
    component: SkeletonElement,
  },
});
