// * file convention not-found.tsx in root folder of app allows custom notFound() page w/ use of "next/navigation" notFound() func

export default function notFound() {
  return (
    <main className="mx-auto max-w-7xl space-y-5 px-5 py-10 text-center">
      <h1 className="text-3xl font-bold">Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </main>
  );
}
