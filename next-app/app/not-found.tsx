// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
        <p className="text-zinc-400">Sorry, the page you’re looking for doesn’t exist.</p>
        <a href="/" className="text-blue-400 hover:underline">Go Home</a>
      </div>
    </div>
  )
}
