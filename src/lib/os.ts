export enum OS {
  Windows = "Windows",
  MacOS = "MacOS",
  Linux = "Linux",
  iOS = "iOS",
  Android = "Android",
  Unknown = "Unknown",
}

export const getOS = (): OS => {
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes("win")) return OS.Windows;
  if (userAgent.includes("mac")) return OS.MacOS;
  if (userAgent.includes("linux")) return OS.Linux;
  if (userAgent.includes("iphone")) return OS.iOS;
  if (userAgent.includes("android")) return OS.Android;

  return OS.Unknown;
};
