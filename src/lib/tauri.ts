import { AsyncStorage } from "jotai/vanilla/utils/atomWithStorage";

export const isTauri = "isTauri" in window;

export const wrapNativeStorage = <Value>(storage: AsyncStorage<Value>) => {
  const memStorage: Record<string, Value> = {};
  return {
    async getItem(key: string, initialValue: Value) {
      if (!isTauri) {
        console.log("[mem] get item", key);
        return memStorage[key] ?? initialValue;
      }
      const value = await storage.getItem(key, initialValue);
      return value ?? initialValue;
    },
    async setItem(key: string, value: Value) {
      if (!isTauri) {
        console.log("[mem] set item", key, value);
        memStorage[key] = value;
        return;
      }
      await storage.setItem(key, value);
    },
    async removeItem(key: string) {
      if (!isTauri) {
        console.log("[mem] remove item", key);
        delete memStorage[key];
        return;
      }
      await storage.removeItem(key);
    },
  };
};
