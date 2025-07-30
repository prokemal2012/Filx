/**
 * Utility functions for handling user avatars
 */

// Generate initials from a name
export function getInitials(name: string): string {
  if (!name) return 'U';
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

// Generate a consistent color based on name
export function getAvatarColor(name: string): string {
  if (!name) return '#6B7280'; // gray-500
  
  const colors = [
    '#EF4444', // red-500
    '#F97316', // orange-500
    '#F59E0B', // amber-500
    '#EAB308', // yellow-500
    '#84CC16', // lime-500
    '#22C55E', // green-500
    '#10B981', // emerald-500
    '#14B8A6', // teal-500
    '#06B6D4', // cyan-500
    '#0EA5E9', // sky-500
    '#3B82F6', // blue-500
    '#6366F1', // indigo-500
    '#8B5CF6', // violet-500
    '#A855F7', // purple-500
    '#D946EF', // fuchsia-500
    '#EC4899', // pink-500
  ];
  
  // Use a simple hash to pick a consistent color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

// Get the appropriate avatar URL with fallbacks
export function getAvatarUrl(user: any): string {
  // If user has a custom avatar, use it
  if (user?.avatarUrl && user.avatarUrl !== '/placeholder.svg' && user.avatarUrl !== '/placeholder-user.jpg') {
    return user.avatarUrl;
  }
  
  // If user has an avatar field, use it
  if (user?.avatar && user.avatar !== '/placeholder.svg' && user.avatar !== '/placeholder-user.jpg') {
    return user.avatar;
  }
  
  // Fallback to default user placeholder
  return '/placeholder-user.jpg';
}

// Generate a data URL for a colored initial avatar
export function generateInitialAvatar(name: string, size: number = 40): string {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return '/placeholder-user.jpg';
  }
  
  const initials = getInitials(name);
  const color = getAvatarColor(name);
  
  try {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '/placeholder-user.jpg';
    
    // Draw background circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw initials
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${size * 0.4}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, size / 2, size / 2);
    
    return canvas.toDataURL();
  } catch (error) {
    console.error('Error generating avatar:', error);
    return '/placeholder-user.jpg';
  }
}

// React component-friendly avatar URL generator (for server-side)
export function getServerAvatarUrl(user: any): string {
  // If user has a custom avatar, use it
  if (user?.avatarUrl && user.avatarUrl !== '/placeholder.svg' && user.avatarUrl !== '/placeholder-user.jpg') {
    return user.avatarUrl;
  }
  
  // If user has an avatar field, use it
  if (user?.avatar && user.avatar !== '/placeholder.svg' && user.avatar !== '/placeholder-user.jpg') {
    return user.avatar;
  }
  
  // Fallback to default user placeholder
  return '/placeholder-user.jpg';
}
