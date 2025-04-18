// Convert Blob to base64
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// Convert base64 to Blob
export function base64ToBlob(base64: string): Blob {
  const parts = base64.split(";base64,");
  const contentType = parts[0].split(":")[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

// Convert all nested blobs to base64
export const processForExport = async (data: any): Promise<any> => {
  if (data instanceof Blob) {
    return {
      _type: "Blob",
      data: await blobToBase64(data),
    };
  }

  if (Array.isArray(data)) {
    return Promise.all(data.map((item) => processForExport(item)));
  }

  if (data && typeof data === "object") {
    const processed: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      processed[key] = await processForExport(value);
    }
    return processed;
  }

  return data;
};

// Convert all base64 blobs to Blob
export const processForImport = (data: any): any => {
  if (!data || typeof data !== "object") {
    return data;
  }

  if (data._type === "Blob" && data.data) {
    return base64ToBlob(data.data);
  }

  if (Array.isArray(data)) {
    return data.map((item) => processForImport(item));
  }

  const processed: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    processed[key] = processForImport(value);
  }
  return processed;
};
