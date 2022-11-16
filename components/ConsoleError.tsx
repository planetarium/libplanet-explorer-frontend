export default function ConsoleError({ children }: { children?: unknown }) {
  console.error(children);
  return null;
}
