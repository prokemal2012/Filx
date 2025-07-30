"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/authenticated-layout';
import { Profile } from '@/components/profile';
import { useDocumentViewer } from '@/context/DocumentViewerContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedAt: string;
  followers: number;
  following: number;
  documents: number;
  verified?: boolean;
}

interface Document {
  id: string;
  title: string;
  author: string;
  authorAvatar?: string;
  thumbnail?: string;
  category: string;
  type: string;
  pages: number;
  likes: number;
  downloads: number;
  verified?: boolean;
  createdAt: string;
}

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then((res) => res.json());

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params?.id as string;
  const { user: currentUser, isAuthenticated, isLoading } = useAuth();
  const { setSelectedDocument } = useDocumentViewer();
  
  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get profile user
        const userRes = await fetch(`/api/users/${profileId}`, { credentials: 'include' });
        if (userRes.ok) {
          const userData = await userRes.json();
          setProfileUser(userData);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (profileId) {
      fetchData();
    }
  }, [profileId]);

  const handleUpdateProfile = async (formData: any) => {
    if (!currentUser || !profileId || currentUser.id !== profileId) return;

    try {
      const res = await fetch(`/api/users/${profileId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        setProfileUser(result.user);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(result.error || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An unexpected error occurred.');
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User size={64} className="mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User not found</h1>
          <p className="text-gray-600">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profileId;

  return (
    <AuthenticatedLayout currentPage={isOwnProfile ? "profile" : "explore"}>
      <Profile 
        user={profileUser} 
        onViewDocument={setSelectedDocument} 
        onUpdateProfile={handleUpdateProfile} 
        isOwnProfile={isOwnProfile} 
      />
    </AuthenticatedLayout>
  );
}
