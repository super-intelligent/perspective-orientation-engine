import { Suspense } from 'react'
import { Metadata } from 'next'
import OrientationViewer from '@/components/OrientationViewer'

export const metadata: Metadata = {
  title: 'Orientation — Perspective Orientation Engine',
}

export default function OrientationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--poe-bg)] flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-[var(--poe-accent)] animate-pulse" style={{ animationDuration: '2s' }} />
      </div>
    }>
      <OrientationViewer paramsPromise={params} />
    </Suspense>
  )
}
