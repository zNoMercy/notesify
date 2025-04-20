import { Atom, useAtomValue } from "jotai";
import { Loadable } from "jotai/vanilla/utils/loadable";

export const useLoadable = <Value>(loadable: Atom<Loadable<Value>>) => {
  const loadableValue = useAtomValue(loadable);
  if (loadableValue.state !== "hasData") {
    return;
  }

  return loadableValue.data;
};
