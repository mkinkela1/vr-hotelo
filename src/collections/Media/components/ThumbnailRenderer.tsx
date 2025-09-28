'use client'
import { Media } from '@/payload-types'
import { useFormFields } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

const ThumbnailRenderer = ({ data }: { data: Media }) => {
  const [thumbnail, setThumbnail] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Watch the thumbnail field for changes
  const thumbnailField = useFormFields(([fields]) => fields.thumbnail)
  const thumbnailValue = thumbnailField?.value

  const fetchThumbnail = async (thumbnailId?: string | number) => {
    // Use the watched field value if available, otherwise fall back to data.thumbnail
    const thumbnailToFetch = thumbnailId ?? data?.thumbnail

    if (!thumbnailToFetch) {
      setThumbnail(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/thumbnails/${thumbnailToFetch}/v2`)
      if (!response.ok) {
        throw new Error('Failed to fetch thumbnail')
      }
      const thumbnailData = await response.json()
      setThumbnail(thumbnailData)
    } catch (err) {
      setError('Failed to load thumbnail')
      console.error('Error fetching thumbnail:', err)
    } finally {
      setLoading(false)
    }
  }

  // Re-fetch when the thumbnail field value changes
  useEffect(() => {
    fetchThumbnail(thumbnailValue as number)
  }, [thumbnailValue, data?.thumbnail])

  if (loading) {
    return (
      <div
        style={{
          padding: '16px',
          border: '1px dashed #ccc',
          borderRadius: '4px',
          textAlign: 'center',
          color: '#666',
        }}
      >
        Loading thumbnail...
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          padding: '16px',
          border: '1px dashed #f56565',
          borderRadius: '4px',
          textAlign: 'center',
          color: '#f56565',
        }}
      >
        {error}
      </div>
    )
  }

  if (!thumbnail) {
    return (
      <div
        style={{
          padding: '16px',
          border: '1px dashed #ccc',
          borderRadius: '4px',
          textAlign: 'center',
          color: '#666',
        }}
      >
        No thumbnail selected
      </div>
    )
  }

  // Get the thumbnail URL from the thumbnail data
  const thumbnailUrl = thumbnail?.url || thumbnail?.filename

  if (!thumbnailUrl) {
    return (
      <div
        style={{
          padding: '16px',
          border: '1px dashed #ccc',
          borderRadius: '4px',
          textAlign: 'center',
          color: '#666',
        }}
      >
        Thumbnail image not found
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '16px',
        border: '1px solid #e1e5e9',
        borderRadius: '8px',
        backgroundColor: '#f8f9fa',
      }}
    >
      <div
        style={{
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '8px',
          color: '#374151',
        }}
      >
        Thumbnail Preview
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '120px',
          backgroundColor: '#fff',
          border: '1px solid #e1e5e9',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <img
          src={thumbnailUrl}
          alt={thumbnail?.title || 'Thumbnail'}
          style={{
            maxWidth: '100%',
            maxHeight: '120px',
            objectFit: 'contain',
            borderRadius: '4px',
          }}
        />
      </div>
      {thumbnail?.title && (
        <div
          style={{
            marginTop: '8px',
            fontSize: '12px',
            color: '#6b7280',
            textAlign: 'center',
          }}
        >
          {thumbnail.title}
        </div>
      )}
    </div>
  )
}

export default ThumbnailRenderer
