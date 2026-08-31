const LOCAL_DEVELOPMENT_VERSION = "v0.0.0";
const RELEASE_VERSION_PATTERN = /^[vV][0-9]+[.][0-9]+[.][0-9]+$/;

const fetchEnvironment = (url, init) => fetch(url, init);

export function resolveReleaseVersion(releaseVersion) {
  if (
    typeof releaseVersion !== "string"
    || !RELEASE_VERSION_PATTERN.test(releaseVersion)
  ) {
    return LOCAL_DEVELOPMENT_VERSION;
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

export async function loadReleaseMetadata(
  baseUrl,
  fetcher = fetchEnvironment,
) {
  try {
    const response = await fetcher(
      `${baseUrl}environment.json`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      throw new Error("Release metadata request failed");
    }

    const environment = await response.json();
    if (!environment || typeof environment !== "object") {
      throw new TypeError("Release metadata must be an object");
    }

    return {
      releaseVersion: resolveReleaseVersion(environment.releaseVersion),
      downloadSize: formatDownloadSize(environment.downloadSize),
    };
  } catch {
    return {
      releaseVersion: LOCAL_DEVELOPMENT_VERSION,
      downloadSize: "",
    };
  }
}
