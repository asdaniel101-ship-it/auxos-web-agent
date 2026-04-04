'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { TeamMember } from '@/types'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const roleColors: Record<TeamMember['role'], string> = {
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
  manager: 'bg-blue-100 text-blue-700 border-blue-200',
  member: 'bg-slate-100 text-slate-700 border-slate-200',
}

const avatarColors = [
  'bg-blue-600',
  'bg-green-600',
  'bg-violet-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-cyan-600',
]

export function TeamTab() {
  const teamMembers = useStore((s) => s.teamMembers)
  const addTeamMember = useStore((s) => s.addTeamMember)
  const { toast } = useToast()

  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('member')

  function handleInvite() {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      toast({ title: 'Missing fields', description: 'Please enter a name and email.', variant: 'destructive' })
      return
    }
    addTeamMember({ name: inviteName.trim(), email: inviteEmail.trim(), role: inviteRole, avatar: '' })
    toast({ title: 'Invitation sent', description: `${inviteName} has been invited to the team.` })
    setInviteName('')
    setInviteEmail('')
    setInviteRole('member')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>{teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''} in your workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-slate-100">
            {teamMembers.map((member, idx) => (
              <li key={member.id} className="flex items-center gap-4 py-3">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold select-none shrink-0 ${avatarColors[idx % avatarColors.length]}`}
                >
                  {getInitials(member.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{member.name}</p>
                  <p className="text-xs text-slate-500 truncate">{member.email}</p>
                </div>
                <Badge
                  className={`capitalize text-xs border ${roleColors[member.role]}`}
                  variant="outline"
                >
                  {member.role}
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Invite Form */}
      <Card>
        <CardHeader>
          <CardTitle>Invite Member</CardTitle>
          <CardDescription>Add a new member to your team.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="invite-name">Full Name</Label>
            <Input
              id="invite-name"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="Alex Johnson"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Email Address</Label>
            <Input
              id="invite-email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="alex@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-role">Role</Label>
            <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as TeamMember['role'])}>
              <SelectTrigger id="invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleInvite} aria-label="Invite team member">Invite</Button>
        </CardContent>
      </Card>
    </div>
  )
}
