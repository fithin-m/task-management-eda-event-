import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-app flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-brand mb-4">404</h1>
        <p className="text-lg text-text-secondary mb-6">Page not found</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand-dark transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
