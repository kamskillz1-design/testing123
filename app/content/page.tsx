import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ContentPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: contents, error } = await supabase
    .from('content')
    .select('*')
    .order('required_tier')

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Content</h1>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>

      {error && <p className="text-red-500">Error loading content: {error.message}</p>}

      <div className="space-y-4">
        {contents && contents.length > 0 ? (
          contents.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold">{item.title}</h2>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded capitalize">
                  {item.required_tier}
                </span>
              </div>
              <p className="text-gray-700">{item.body}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No content available for your membership tier yet.</p>
        )}
      </div>
    </div>
  )
}
