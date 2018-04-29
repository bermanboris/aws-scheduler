const normalizeText = text =>
  text
    .split(" ")
    .join("_")
    .toUpperCase();

export { normalizeText };
