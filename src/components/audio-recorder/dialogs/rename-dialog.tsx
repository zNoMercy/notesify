import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Recording } from "@/db/schema";
import { renameRecordingAtom } from "@/actions/recording/audio-recorder";
import { useSetAtom } from "jotai";

export const RenameDialog = ({
  isOpen,
  onOpenChange,
  recording,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  recording: Recording | null;
}) => {
  const renameRecording = useSetAtom(renameRecordingAtom);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (recording && isOpen) {
      setNewName(recording.name);
    }
  }, [recording, isOpen]);

  const handleRename = () => {
    if (newName.trim()) {
      renameRecording(newName.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Rename Recording</DialogTitle>
          <DialogDescription>
            Enter a new name for your recording.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Recording name"
          className="mt-4"
          autoFocus
        />
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRename}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
