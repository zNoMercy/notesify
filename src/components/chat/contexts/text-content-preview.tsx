import { CgClose } from "react-icons/cg";
import { VscGoToFile } from "react-icons/vsc";

import { jumpToContextAtom, removeContextAtom } from "@/actions/contexts";
import { Context } from "@/atoms/contexts";
import { useAction } from "@/hooks/state/use-action";

interface TextContextPreviewProps {
  context: Context;
  removable?: boolean;
  onJump: () => void;
  onRemove: () => void;
}

const TextContextPreview = ({
  context,
  removable,
  onJump,
  onRemove,
}: TextContextPreviewProps) => {
  return (
    <div className="flex flex-row justify-between items-center">
      <blockquote className="border-l-2 pl-2 italic line-clamp-2">
        {context.content}
      </blockquote>
      <div className="flex flex-row gap-1 opacity-50">
        <VscGoToFile
          className="cursor-pointer min-w-4 min-h-4"
          onClick={onJump}
        />
        {removable && (
          <CgClose
            className="cursor-pointer min-w-4 min-h-4"
            onClick={onRemove}
          />
        )}
      </div>
    </div>
  );
};

export const TextContextsPreview = ({
  contexts,
  removable,
}: {
  contexts?: Context[];
  removable?: boolean;
}) => {
  const [removeContext] = useAction(removeContextAtom);
  const [jumpToContext] = useAction(jumpToContextAtom);
  if (!contexts || contexts.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {contexts
        .filter((context) => context.type === "text")
        .map((context: Context) => (
          <TextContextPreview
            key={context.id}
            context={context}
            removable={removable}
            onJump={() => jumpToContext(context)}
            onRemove={() => removeContext(context.id)}
          />
        ))}
    </div>
  );
};
