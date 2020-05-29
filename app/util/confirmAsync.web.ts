export default async function confirmAsync({ message }: { message: string }) {
  return window.confirm(message);
}
