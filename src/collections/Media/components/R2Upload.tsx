'use client'
import { useField } from '@payloadcms/ui'
import { useState } from 'react'

const R2Upload = () => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null)

  // Get field setters for updating form fields
  const filenameField = useField<string>({ path: 'filename' })
  const r2KeyField = useField<string>({ path: 'r2Key' })
  const urlField = useField<string>({ path: 'url' })
  const mimeTypeField = useField<string>({ path: 'mimeType' })
  const filesizeField = useField<number>({ path: 'filesize' })
  const widthField = useField<number | null>({ path: 'width' })
  const heightField = useField<number | null>({ path: 'height' })
  const titleField = useField<string>({ path: 'title' })

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const presign = await fetch('/api/media/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
        }),
      }).then((r) => {
        if (!r.ok) throw new Error('Failed to get presigned URL', { cause: r.statusText })
        return r.json()
      })

      await fetch(presign.uploadUrl, {
        method: 'PUT',
        body: file,
      })

      if (filenameField.setValue) filenameField.setValue(file.name)
      if (r2KeyField.setValue) r2KeyField.setValue(presign.key)
      if (urlField.setValue) urlField.setValue(presign.publicUrl)
      if (mimeTypeField.setValue) mimeTypeField.setValue(file.type)
      if (filesizeField.setValue) filesizeField.setValue(file.size)
      if (widthField.setValue) widthField.setValue(null)
      if (heightField.setValue) heightField.setValue(null)

      setUploadedFilename(file.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      style={{
        padding: '1rem',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        marginBottom: '1rem',
      }}
    >
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
        Upload Media File
      </label>
      <input
        type="file"
        onChange={handleFileSelect}
        disabled={uploading}
        style={{ marginBottom: '0.5rem' }}
      />
      {uploading && <p style={{ color: '#3b82f6' }}>Uploading...</p>}
      {error && <p style={{ color: '#ef4444' }}>Error: {error}</p>}
      {uploadedFilename && !uploading && (
        <p style={{ color: '#10b981', marginTop: '0.5rem' }}>✓ File uploaded: {uploadedFilename}</p>
      )}
    </div>
  )
}

export default R2Upload
