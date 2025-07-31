'use client'

import React, { useEffect, useState } from 'react'

interface MediaItem {
  id: string
  filename: string
  alt: string
  isShared: boolean
  url: string
  sizes?: {
    thumbnail?: string
    card?: string
    tablet?: string
  }
}

interface TenantMediaGalleryProps {
  title?: string
  showShared?: boolean
  limit?: number
}

export const TenantMediaGallery: React.FC<TenantMediaGalleryProps> = ({
  title = 'Media Gallery',
  showShared = true,
  limit = 20,
}) => {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/media?limit=${limit}`)

        if (!response.ok) {
          throw new Error('Failed to fetch media')
        }

        const result = await response.json()

        if (result.success) {
          // Filter out shared media if not requested
          const filteredMedia = showShared
            ? result.data
            : result.data.filter((item: MediaItem) => !item.isShared)

          setMedia(filteredMedia)
        } else {
          throw new Error(result.error || 'Failed to fetch media')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchMedia()
  }, [limit, showShared])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading media...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-600">Error: {error}</div>
      </div>
    )
  }

  if (media.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">No media found</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {media.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-square relative">
              <img
                src={item.sizes?.thumbnail || item.url}
                alt={item.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Overlay with info */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-end">
                <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="font-medium truncate">{item.alt}</p>
                  {item.isShared && (
                    <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded mt-1">
                      Shared
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3">
              <p className="text-sm text-gray-600 truncate">{item.filename}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-500 text-center">
        Showing {media.length} media items
        {showShared && ' (including shared media)'}
      </div>
    </div>
  )
}

export default TenantMediaGallery
