import { useAtom } from "jotai";
import { useState } from "react";

import { editSuggestionDialogAtom } from "@/atoms/chat-suggestions";
import { updateChatSuggestionAtom } from "@/actions/chat-suggestions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/state/use-action";

export const EditSuggestionDialog = () => {
  const [suggestion, setSuggestion] = useAtom(editSuggestionDialogAtom);
  const [updateSuggestion] = useAction(updateChatSuggestionAtom);

  const [title, setTitle] = useState(suggestion?.title ?? "");
  const [prompt, setPrompt] = useState(suggestion?.prompt ?? "");

  const handleSave = () => {
    if (!suggestion) return;
    updateSuggestion({
      ...suggestion,
      title,
      prompt,
    });
  };

  return (
    <Dialog
      open={Boolean(suggestion)}
      onOpenChange={(open) => !open && setSuggestion(undefined)}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Quick Action</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quick action title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter the prompt to use"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={() => setSuggestion(undefined)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
