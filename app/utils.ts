

export function toPascalCaseAt(text: string): string {
  if (!text) return "@";

  const pascalCase = text
    .split(/[\s\-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
  return `@${pascalCase}`;
}

