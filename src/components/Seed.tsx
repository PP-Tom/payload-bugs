'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@payloadcms/ui'

export const Seed = () => {
  const router = useRouter()

  const [loading, setIsLoading] = useState(false)
  const [seeded, setIsSeeded] = useState(false)

  const handleOnClick = async () => {
    setIsLoading(true)
    const data = await fetch('/api/projects/seed', { method: 'post' }).then((r) => r.json())
    setIsLoading(false)
    if (data.success) router.refresh()
  }

  return (
    <Button buttonStyle="pill" onClick={handleOnClick}>
      {loading ? 'Seeding...' : 'Seed'}
    </Button>
  )
}
