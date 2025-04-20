import { WritableAtom, useSetAtom } from "jotai";
import { useState } from "react";
import { toast } from "sonner";

export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

export const useAction = <Value, Args extends unknown[], Result>(
  atom: WritableAtom<Value, Args, Result>,
  messages?: (...args: Args) => {
    loading?: string;
    success?: string;
    error?: string;
  }
) => {
  const actionFn = useSetAtom(atom);
  const [isRunning, setIsRunning] = useState(false);

  const actionFnWrapped = async (
    ...args: Args
  ): Promise<Result | undefined> => {
    try {
      setIsRunning(true);
      if (messages) {
        const { loading, success, error } = messages(...args);
        const result = toast.promise(actionFn(...args) as Promise<Result>, {
          loading,
          success,
          error,
        });
        return await result.unwrap();
      }
      return await actionFn(...args);
    } catch (error) {
      console.error("Action error:", error);
      const message =
        messages?.(...args)?.error ||
        (error instanceof ActionError
          ? error.message
          : "An unexpected error occurred");
      toast.error(message);
    } finally {
      setIsRunning(false);
    }
  };

  return [actionFnWrapped, isRunning] as const;
};
