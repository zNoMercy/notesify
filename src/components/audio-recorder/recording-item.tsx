import { format } from "date-fns";
import { MoreVertical, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDuration } from "../../lib/audio/utils";
import { AudioPlayer } from "./audio-player";
import { useAtom, useSetAtom } from "jotai";
import { selectedRecordingAtom } from "@/atoms/audio-recorder";
import { playRecordingAtom } from "@/actions/audio-recorder";
import { useState } from "react";
import { RenameDialog } from "./dialogs/rename-dialog";
import { DeleteDialog } from "./dialogs/delete-dialog";
import { Recording } from "./audio-recorder";

export const RecordingItem = ({ recording }: { recording: Recording }) => {
  const [selectedRecording, setSelectedRecording] = useAtom(
    selectedRecordingAtom
  );
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const playRecording = useSetAtom(playRecordingAtom);

  const isSelected = selectedRecording?.id === recording.id;
  return (
    <div className={cn("flex flex-col", isSelected && "bg-neutral-50")}>
      <div
        className="flex items-center justify-between p-3 hover:bg-neutral-100 cursor-pointer"
        onClick={() => playRecording(recording)}
      >
        <div className="flex items-center gap-3">
          <div>
            <div className="font-medium">{recording.name}</div>
            <div className="text-xs text-slate-500 flex gap-2">
              <span>{formatDuration(recording.duration)}</span>
              <span>•</span>
              <span>{format(recording.createdAt, "MMM d, yyyy")}</span>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRecording(recording);
                setIsRenameDialogOpen(true);
              }}
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRecording(recording);
                setIsDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isSelected && <AudioPlayer duration={recording.duration} />}
      {isSelected && isRenameDialogOpen && (
        <RenameDialog
          isOpen={isRenameDialogOpen}
          onOpenChange={setIsRenameDialogOpen}
          recording={recording}
        />
      )}
      {isSelected && isDeleteDialogOpen && (
        <DeleteDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        />
      )}
    </div>
  );
};
