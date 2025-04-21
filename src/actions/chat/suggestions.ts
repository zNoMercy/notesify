import { atom } from "jotai";
// import { nanoid } from "nanoid";
import { toast } from "sonner";

import {
  ChatSuggestion,
  chatSuggestionsAtom,
  editSuggestionDialogAtom,
} from "@/atoms/chat/chat-suggestions";

export const updateChatSuggestionAtom = atom(
  null,
  (get, set, suggestion: ChatSuggestion) => {
    const suggestions = get(chatSuggestionsAtom);
    const updatedSuggestions = suggestions.map((s) =>
      s.id === suggestion.id ? suggestion : s
    );
    set(chatSuggestionsAtom, updatedSuggestions);
    set(editSuggestionDialogAtom, undefined);
    toast.success("Quick action updated");
  }
);

// export const addChatSuggestionAtom = atom(
//   null,
//   (get, set, params: Omit<ChatSuggestion, "id">) => {
//     const newSuggestion: ChatSuggestion = {
//       id: nanoid(),
//       ...params,
//     };
//     set(chatSuggestionsAtom, (prev) => [...prev, newSuggestion]);
//     toast.success("Quick action added");
//   }
// );

// export const deleteChatSuggestionAtom = atom(null, (get, set, id: string) => {
//   const suggestions = get(chatSuggestionsAtom);
//   const updatedSuggestions = suggestions.filter((s) => s.id !== id);
//   set(chatSuggestionsAtom, updatedSuggestions);
//   toast.success("Quick action deleted");
// });
