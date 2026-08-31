export function formatReleaseMetadataText({ releaseVersion, downloadSize }) {
  return downloadSize ? `${releaseVersion} ${downloadSize}` : releaseVersion;
}

export function createReleaseMetadataUi({
  host,
  metadata,
  documentRef = globalThis.document,
}) {
  const element = documentRef.createElement("p");
  element.className = "release-metadata";
  element.textContent = formatReleaseMetadataText(metadata);
  host.append(element);
  return element;
}
