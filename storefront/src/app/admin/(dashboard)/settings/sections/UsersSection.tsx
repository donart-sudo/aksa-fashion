'use client'

import { Shield, Mail, Calendar } from 'lucide-react'
import type { AdminUser } from '../types'
import { SettingsCard } from '../components/SettingsUI'

export default function UsersSection({ users, loading }: {
  users: AdminUser[]
  loading: boolean
}) {
  return (
    <SettingsCard title="Users & permissions" description="Admin users who can access this dashboard.">
      {loading ? (
        <div className="py-8 text-center">
          <p className="text-[13px] text-[#8a8a8a]">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="py-8 text-center">
          <Shield className="w-8 h-8 text-[#d1d1d1] mx-auto mb-2" />
          <p className="text-[13px] text-[#8a8a8a]">No admin users found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map(user => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 rounded-[12px]"
              style={{ background: '#f9f9f9' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: '#eaf4ff' }}>
                  <span className="text-[13px] font-bold" style={{ color: '#005bd3' }}>
                    {user.email[0]?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#8a8a8a]" />
                    <span className="text-[13px] font-medium text-[#1a1a1a]">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize" style={{ background: '#ecfdf5', color: '#047b5d' }}>
                      {user.role || 'admin'}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-[#8a8a8a]">
                      <Calendar className="w-3 h-3" />
                      {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-[12px] text-[#8a8a8a] mt-4">Admin users are managed through the database. Contact the developer to add or remove users.</p>
    </SettingsCard>
  )
}
