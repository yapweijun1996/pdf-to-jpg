export const stripPdfExtension = (fileName: string) => {
  return fileName.replace(/\.pdf$/i, '');
};

export const sanitizeBaseName = (value: string) => {
  return value
    .trim()
    .replace(/\.pdf$/i, '')
    .replace(/[^\w.-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
};

export const resolveOutputBaseName = (
  fileName: string,
  requestedBaseName: string,
  fileIndex: number,
  totalFiles: number
) => {
  const sourceBaseName = sanitizeBaseName(stripPdfExtension(fileName)) || `document-${fileIndex + 1}`;
  const requested = sanitizeBaseName(requestedBaseName);

  if (!requested) return sourceBaseName;
  if (totalFiles === 1) return requested;
  return `${requested}-${sourceBaseName}`;
};

export const buildImageFileName = (baseName: string, pageNumber: number, totalPages: number) => {
  const width = Math.max(String(totalPages).length, 2);
  return `${baseName}_page_${String(pageNumber).padStart(width, '0')}.jpg`;
};

export const buildZipFileName = (baseName: string) => {
  return `${baseName}_images.zip`;
};
