import { atom } from "jotai";

import {
  Model,
  ModelType,
  ProviderSettings,
  availableModelsAtom,
  openSettingsDialogAtom,
  providerRegistryAtom,
  selectedModelsAtom,
} from "@/atoms/setting/providers";
import { ActionError } from "@/hooks/state/use-action";

export const verifySettingsAtom = atom(
  null,
  async (get, set, settings: ProviderSettings, providerId: string) => {
    const { apiKey, baseURL } = settings;
    const endpoint = `${
      baseURL ||
      (providerId === "openai"
        ? "https://api.openai.com/v1"
        : "https://api.mistral.ai/v1")
    }/models`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });
    const { data } = await response.json();

    // Convert to Model format
    const models = data.map(
      (model: any) =>
        ({
          id: model.id,
          name: model.id,
          provider: providerId,
          types: ["Chat"],
        } as Model)
    );

    // Update available models for this provider
    set(availableModelsAtom, {
      ...get(availableModelsAtom),
      [providerId]: models,
    });
    return true;
  }
);

export const getSelectedModelAtom = atom(
  null,
  (get, set, modelType: ModelType) => {
    const registry = get(providerRegistryAtom);
    const selectedModel = get(selectedModelsAtom)[modelType];
    if (!registry || !selectedModel) {
      set(openSettingsDialogAtom, true);
      throw new ActionError("Please provide API key and select a model");
    }
    return registry.languageModel(
      `${selectedModel.provider}:${selectedModel.id}`
    );
  }
);
