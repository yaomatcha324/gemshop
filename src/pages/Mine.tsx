import { useState } from 'react'
import type { FormEvent } from 'react'

import {
  Link,
  Navigate,
  useNavigate,
} from 'react-router-dom'

import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import './Mine.css'

function Mine() {
  const navigate = useNavigate()
  const { user, loading, isAdmin, signOut } = useAuth()

  const [currentPassword, setCurrentPassword] =
    useState('')

  const [newPassword, setNewPassword] =
    useState('')

  const [passwordMessage, setPasswordMessage] =
    useState<string | null>(null)

  const [changingPassword, setChangingPassword] =
    useState(false)

  if (loading) {
    return (
      <main className="mine-page">
        <p>Loading account...</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  async function handleChangePassword(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setPasswordMessage(null)

    if (newPassword.length < 8) {
      setPasswordMessage(
        'The new password must contain at least 8 characters.',
      )
      return
    }

    setChangingPassword(true)

    const { error } = await supabase.auth.updateUser({
      current_password: currentPassword,
      password: newPassword,
    })

    if (error) {
      setPasswordMessage(error.message)
      setChangingPassword(false)
      return
    }

    setCurrentPassword('')
    setNewPassword('')
    setPasswordMessage('Password updated successfully.')
    setChangingPassword(false)
  }

  return (
    <main className="mine-page">
      <header className="mine-header">
        <div>
          <p className="mine-eyebrow">
            My account
          </p>

          <h1>Mine</h1>

          <p className="mine-email">
            {user.email}
          </p>
        </div>

        <button
          type="button"
          className="mine-signout"
          onClick={handleSignOut}
        >
          Sign out
        </button>
      </header>

      <div className="mine-grid">
        {isAdmin && (
          <section className="mine-card mine-admin-card">
            <p className="mine-eyebrow">Administrator only</p>
            <h2>Admin Workspace</h2>
            <p>
              Add new gemstone listings and manage the current inventory.
            </p>
            <Link className="mine-primary-button" to="/admin">
              Open Admin
            </Link>
          </section>
        )}

        <section className="mine-card">
          <h2>My Favourites</h2>
          <p>
            Your saved gemstones will appear here.
          </p>
        </section>

        <section className="mine-card">
          <h2>Shopping Cart</h2>
          <p>
            Your shopping cart is currently empty.
          </p>
        </section>

        <section className="mine-card">
          <h2>My Account</h2>

          <dl className="mine-account-list">
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>

            <div>
              <dt>User ID</dt>
              <dd>{user.id}</dd>
            </div>
          </dl>
        </section>

        <section className="mine-card">
          <h2>Change Password</h2>

          <form
            className="mine-password-form"
            onSubmit={handleChangePassword}
          >
            <label htmlFor="current-password">
              Current password
            </label>

            <input
              id="current-password"
              type="password"
              value={currentPassword}
              autoComplete="current-password"
              required
              onChange={(event) =>
                setCurrentPassword(event.target.value)
              }
            />

            <label htmlFor="new-password">
              New password
            </label>

            <input
              id="new-password"
              type="password"
              value={newPassword}
              autoComplete="new-password"
              minLength={8}
              required
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
            />

            {passwordMessage && (
              <p className="mine-message">
                {passwordMessage}
              </p>
            )}

            <button
              type="submit"
              className="mine-primary-button"
              disabled={changingPassword}
            >
              {changingPassword
                ? 'Updating...'
                : 'Update password'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default Mine
