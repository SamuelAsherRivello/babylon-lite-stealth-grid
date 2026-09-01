const LOCAL_EDITOR_VERSION = "v0.0.0";
const EDITOR_VERSION_PATTERN = /^[vV][0-9]+[.][0-9]+[.][0-9]+$/;

const fetchEnvironment = (url, init) => fetch(url, init);

export function resolveEditorVersion(releaseVersion) {
  if (
    typeof releaseVersion !== "string"
    || !EDITOR_VERSION_PATTERN.test(releaseVersion)
  ) {
    return LOCAL_EDITOR_VERSION;
  }

  return releaseVersion.replace(/^V/, "v");
}

export function formatDownloadSize(downloadSize) {
  if (typeof downloadSize === "string" && downloadSize.trim() !== "") {
    downloadSize = Number(downloadSize);
  }

  if (
    typeof downloadSize !== "number"
    || !Number.isFinite(downloadSize)
    || downloadSize < 0
  ) {
    return "";
  }

  return `${(downloadSize / 1_000_000).toFixed(1)}Mb`;
}

export async function loadEditorConfig(
  baseUrl,
  fetcher = fetchEnvironment,
) {
  try {
    const response = await fetcher(
      `${baseUrl}environment.json`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      throw new Error("Editor config request failed");
    }

    const environment = await response.json();
    if (!environment || typeof environment !== "object") {
      throw new TypeError("Editor config must be an object");
    }

    return {
      releaseVersion: resolveEditorVersion(environment.releaseVersion),
      downloadSize: formatDownloadSize(environment.downloadSize),
    };
  } catch {
    return {
      releaseVersion: LOCAL_EDITOR_VERSION,
      downloadSize: "",
    };
  }
}
