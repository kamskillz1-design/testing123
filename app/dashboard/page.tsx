import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <form action="/auth/signout" method="post">
          <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Sign out
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Welcome, {profile?.email || user.email}</h2>
        <p className="text-gray-600">Membership tier: <span className="font-bold capitalize">{membership?.tier || 'free'}</span></p>
        <p className="text-gray-600">Status: <span className="font-bold capitalize">{membership?.status || 'active'}</span></p>
        {membership?.expires_at && (
          <p className="text-gray-600">Expires: {new Date(membership.expires_at).toLocaleDateString()}</p>
        )}
      </div>

      <Link href="/content" className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        View Content
      </Link>
    </div>
  )
}
