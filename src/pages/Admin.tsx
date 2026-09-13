import { useCallback, useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import './Admin.css'

type AdminGem = {
  id: number
  name: string
  gemType: string
  price: number
  image: string | null
  images: string[] | null
}

type GemForm = {
  name: string
  gemType: string
  colour: string
  origin: string
  carat: string
  price: string
  certificate: string
  certificateId: string
  description: string
}

type StatusMessage = {
  type: 'success' | 'error'
  text: string
}

const EMPTY_FORM: GemForm = {
  name: '',
  gemType: '',
  colour: '',
  origin: '',
  carat: '',
  price: '',
  certificate: '',
  certificateId: '',
  description: '',
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === 'object'
    && error !== null
    && 'message' in error
    && typeof error.message === 'string'
  ) {
    return error.message
  }

  return 'An unexpected error occurred.'
}

function getPhotoExtension(file: File) {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }

  return extensions[file.type] ?? null
}

function getImageUrl(path: string) {
  const { data } = supabase.storage.from('photos').getPublicUrl(path)
  return data.publicUrl
}

function Admin() {
  const { user } = useAuth()

  const [form, setForm] = useState<GemForm>({ ...EMPTY_FORM })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [formResetKey, setFormResetKey] = useState(0)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<StatusMessage | null>(null)

  const [gems, setGems] = useState<AdminGem[]>([])
  const [gemsLoading, setGemsLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [gemPendingDelete, setGemPendingDelete] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const loadGems = useCallback(async () => {
    setGemsLoading(true)
    setListError(null)

    const { data, error } = await supabase
      .from('gems')
      .select('id, name, gemType, price, image, images')
      .order('id', { ascending: false })

    if (error) {
      setListError(error.message)
      setGemsLoading(false)
      return
    }

    setGems(data ?? [])
    setGemsLoading(false)
  }, [])

  useEffect(() => {
    void loadGems()
  }, [loadGems])

  function handleTextChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const fieldName = event.target.name as keyof GemForm

    setForm((currentForm) => ({
      ...currentForm,
      [fieldName]: event.target.value,
    }))
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    setImageFiles(Array.from(event.target.files ?? []))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus(null)

    if (imageFiles.length === 0) {
      setStatus({ type: 'error', text: 'Please choose at least one product image.' })
      return
    }

    if (imageFiles.length > 8) {
      setStatus({ type: 'error', text: 'Please choose no more than 8 product images.' })
      return
    }

    const imageExtensions = imageFiles.map(getPhotoExtension)

    if (imageExtensions.some((extension) => extension === null)) {
      setStatus({
        type: 'error',
        text: 'Please use only JPG, PNG, or WebP images.',
      })
      return
    }

    const carat = Number(form.carat)
    const price = Number(form.price)

    if (!Number.isFinite(carat) || carat <= 0) {
      setStatus({ type: 'error', text: 'Carat must be greater than zero.' })
      return
    }

    if (!Number.isFinite(price) || price < 0) {
      setStatus({ type: 'error', text: 'Price cannot be negative.' })
      return
    }

    setSaving(true)

    const { data: newGem, error: insertError } = await supabase
      .from('gems')
      .insert({
        name: form.name.trim(),
        gemType: form.gemType.trim(),
        colour: form.colour.trim(),
        origin: form.origin.trim() || null,
        carat,
        price,
        certificate: form.certificate.trim() || null,
        certificateId: form.certificateId.trim() || null,
        description: form.description.trim() || null,
        image: '',
      })
      .select('id')
      .single()

    if (insertError || !newGem) {
      setStatus({
        type: 'error',
        text: insertError?.message ?? 'The gemstone could not be created.',
      })
      setSaving(false)
      return
    }

    const gemNumber = String(newGem.id).padStart(5, '0')
    const photoPaths = imageFiles.map((_, index) => {
      const imageNumber = String(index + 1).padStart(2, '0')
      return `${gemNumber}/${gemNumber}-${imageNumber}.${imageExtensions[index]}`
    })
    const uploadedPhotoPaths: string[] = []

    try {
      for (const [index, imageFile] of imageFiles.entries()) {
        const photoPath = photoPaths[index]
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(photoPath, imageFile, {
            cacheControl: '3600',
            contentType: imageFile.type,
            upsert: false,
          })

        if (uploadError) throw uploadError
        uploadedPhotoPaths.push(photoPath)
      }

      const { error: updateError } = await supabase
        .from('gems')
        .update({
          image: photoPaths[0],
          images: photoPaths,
        })
        .eq('id', newGem.id)

      if (updateError) throw updateError

      setForm({ ...EMPTY_FORM })
      setImageFiles([])
      setFormResetKey((currentKey) => currentKey + 1)
      setStatus({
        type: 'success',
        text: `${form.name.trim()} was added successfully.`,
      })

      await loadGems()
    } catch (error) {
      if (uploadedPhotoPaths.length > 0) {
        await supabase.storage.from('photos').remove(uploadedPhotoPaths)
      }
      await supabase.from('gems').delete().eq('id', newGem.id)

      setStatus({ type: 'error', text: getErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(gem: AdminGem) {
    setDeletingId(gem.id)
    setStatus(null)

    const { error: deleteError } = await supabase
      .from('gems')
      .delete()
      .eq('id', gem.id)

    if (deleteError) {
      setStatus({ type: 'error', text: deleteError.message })
      setDeletingId(null)
      return
    }

    let storageWarning = ''

    const photoPaths = [...new Set([
      ...(gem.images ?? []),
      ...(gem.image ? [gem.image] : []),
    ])]

    if (photoPaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove(photoPaths)

      if (storageError) {
        storageWarning = ' The database row was deleted, but its image could not be removed.'
      }
    }

    setGemPendingDelete(null)
    setDeletingId(null)
    setStatus({
      type: storageWarning ? 'error' : 'success',
      text: `${gem.name} was deleted.${storageWarning}`,
    })

    await loadGems()
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Private workspace</p>
          <h1>Gem Administration</h1>
          <p>Signed in as {user?.email}</p>
        </div>

        <Link className="admin-view-shop" to="/shop">
          View public shop
        </Link>
      </header>

      {status && (
        <p className={`admin-message admin-message--${status.type}`} role="status">
          {status.text}
        </p>
      )}

      <div className="admin-layout">
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <p>New listing</p>
            <h2>Add a gemstone</h2>
          </div>

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <label>
                Gem name
                <input name="name" value={form.name} required onChange={handleTextChange} />
              </label>

              <label>
                Gem type
                <input name="gemType" value={form.gemType} required onChange={handleTextChange} />
              </label>

              <label>
                Colour
                <input name="colour" value={form.colour} required onChange={handleTextChange} />
              </label>

              <label>
                Origin
                <input name="origin" value={form.origin} onChange={handleTextChange} />
              </label>

              <label>
                Carat
                <input
                  name="carat"
                  type="number"
                  min="0.001"
                  step="0.001"
                  value={form.carat}
                  required
                  onChange={handleTextChange}
                />
              </label>

              <label>
                Price (NZD)
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  required
                  onChange={handleTextChange}
                />
              </label>

              <label>
                Certificate laboratory
                <input name="certificate" value={form.certificate} onChange={handleTextChange} />
              </label>

              <label>
                Certificate ID
                <input name="certificateId" value={form.certificateId} onChange={handleTextChange} />
              </label>
            </div>

            <label>
              Description
              <textarea
                name="description"
                rows={6}
                value={form.description}
                onChange={handleTextChange}
              />
            </label>

            <label>
              Product images
              <input
                key={formResetKey}
                className="admin-file-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                required
                onChange={handleImageChange}
              />
              <span className="admin-field-help">
                Choose up to 8 images. The first image will be used as the shop cover.
              </span>
              {imageFiles.length > 0 && (
                <span className="admin-field-help">
                  {imageFiles.length} {imageFiles.length === 1 ? 'image' : 'images'} selected.
                </span>
              )}
            </label>

            <button className="admin-primary-button" type="submit" disabled={saving}>
              {saving ? 'Adding gemstone...' : 'Add gemstone'}
            </button>
          </form>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading">
            <p>Current inventory</p>
            <h2>Manage gemstones</h2>
          </div>

          {gemsLoading && <p className="admin-muted">Loading gemstones...</p>}
          {listError && <p className="admin-message admin-message--error">{listError}</p>}

          {!gemsLoading && !listError && gems.length === 0 && (
            <p className="admin-muted">No gemstones have been added yet.</p>
          )}

          {!gemsLoading && !listError && gems.length > 0 && (
            <div className="admin-gem-list">
              {gems.map((gem) => (
                <article className="admin-gem-row" key={gem.id}>
                  <div className="admin-gem-preview">
                    {gem.image ? (
                      <img src={getImageUrl(gem.image)} alt="" />
                    ) : (
                      <div className="admin-no-image">No image</div>
                    )}

                    <div>
                      <p>#{String(gem.id).padStart(5, '0')} · {gem.gemType}</p>
                      <h3>{gem.name}</h3>
                      <strong>NZ${gem.price.toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="admin-gem-actions">
                    <Link to={`/gems/${gem.id}`}>View</Link>

                    {gemPendingDelete === gem.id ? (
                      <div className="admin-delete-confirmation">
                        <button
                          type="button"
                          onClick={() => setGemPendingDelete(null)}
                          disabled={deletingId === gem.id}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="admin-delete-button"
                          onClick={() => void handleDelete(gem)}
                          disabled={deletingId === gem.id}
                        >
                          {deletingId === gem.id ? 'Deleting...' : 'Confirm delete'}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="admin-delete-button"
                        onClick={() => setGemPendingDelete(gem.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default Admin
