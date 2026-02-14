export default function isStringArray(arr: any[]): arr is string[] {
  return Array.isArray(arr) && arr.every((element) => typeof element === "string");
}
