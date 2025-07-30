"use client"

import { Avatar, AvatarImage, AvatarFallback } from './avatar'
import { getAvatarUrl, getInitials, getAvatarColor } from '@/lib/avatar'

interface UserAvatarProps {
  user: any
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-16 w-16',
  xl: 'h-32 w-32'
}

export function UserAvatar({ user, className = '', size = 'md' }: UserAvatarProps) {
  const avatarUrl = getAvatarUrl(user)
  const initials = getInitials(user?.name || '')
  const color = getAvatarColor(user?.name || '')

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage 
        src={avatarUrl} 
        alt={user?.name || 'User avatar'} 
      />
      <AvatarFallback 
        className="text-white font-bold"
        style={{ backgroundColor: color }}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
