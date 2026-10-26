import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-16">
      <h1 className="font-display text-4xl">This plot is empty</h1>
      <p className="text-muted-foreground">That page is not on the hill. The coins that are dead are elsewhere.</p>
      <Link href="/" className="font-semibold underline-offset-4 hover:underline">
        Back to the gate
      </Link>
    </main>
  );
}
