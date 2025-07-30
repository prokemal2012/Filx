"use client"

import { useState } from "react"
import useSWR from "swr"
import { MapPin, Calendar, LinkIcon, Users, FileText, Heart, Settings, UserPlus, UserMinus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditProfileModal } from "@/components/EditProfileModal"
import { UserAvatar } from "@/components/ui/user-avatar"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

// SWR fetcher function
const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then((res) => res.json())

interface ProfileProps {
  user: any
  onViewDocument: (doc: any) => void
  onUpdateProfile?: (data: any) => void
  isOwnProfile: boolean
}

export function Profile({ user, onViewDocument, onUpdateProfile, isOwnProfile }: ProfileProps) {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("documents")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  // Don't make API calls with undefined user ID
  const shouldFetch = user?.id
  const { data: userDocsData, error: userDocsError } = useSWR(shouldFetch ? `/api/users/${user.id}/documents` : null, fetcher)
  const { data: connectionsData = {}, error: connectionsError } = useSWR(shouldFetch ? `/api/interactions/connections?userId=${user.id}` : null, fetcher)
  const { data: likedDocsData = [], error: likedDocsError } = useSWR(shouldFetch ? `/api/interactions/likes` : null, fetcher)

  // Use real profile data from user object with calculated counts
  const profileData = {
    name: user?.name || 'User Name',
    username: user?.email?.split('@')[0] || 'username',
    bio: user?.bio || 'This user hasn\'t added a bio yet.',
    location: user?.location || 'Location not specified',
    website: user?.website || '#',
    joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    }) : 'Recently',
    avatar: user?.avatarUrl || '/placeholder.svg',
    coverImage: user?.coverUrl || '/placeholder.svg',
    verified: user?.verified || false,
    followers: connectionsData.followerCount || 0,
    following: connectionsData.followingCount || 0,
    documents: Array.isArray(userDocsData) ? userDocsData.length : (userDocsData?.documents?.length || 0), 
    likes: likedDocsData?.length || 0
  }
  
  // Ensure userDocs is always an array - handle both array and object responses
  let userDocs = []
  if (Array.isArray(userDocsData)) {
    userDocs = userDocsData
  } else if (userDocsData && Array.isArray(userDocsData.documents)) {
    userDocs = userDocsData.documents
  } else if (userDocsError) {
    console.log('Error loading user documents:', userDocsError)
  }
  
  const followers = connectionsData.followers || []
  const following = connectionsData.following || []

  const tabs = [
    { id: "documents", label: "Documents", count: profileData.documents },
    { id: "liked", label: "Liked", count: profileData.likes },
    { id: "followers", label: "Followers", count: profileData.followers },
    { id: "following", label: "Following", count: profileData.following },
  ]
  
  const handleFollow = async () => {
    if (!currentUser) {
      console.log('No current user');
      return;
    }
    
    setFollowLoading(true);
    try {
      const res = await fetch(`/api/interactions/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ targetUserId: user.id }),
      });

      const result = await res.json();
      
      if (res.ok) {
        setIsFollowing(result.following);
        // Manually update followers count
        profileData.followers += result.following ? 1 : -1;
      } else {
        console.error('Failed to follow/unfollow:', result);
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      {/* Cover Image */}
      <div className="relative mb-6">
        <img
          src={profileData.coverImage || "/placeholder.svg"}
          alt="Cover"
          className="w-full h-48 object-cover rounded-2xl"
        />
        {isOwnProfile && (
          <div className="absolute top-4 right-4">
            <Button 
              onClick={() => setIsEditModalOpen(true)}
              className="bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white px-4 py-2 rounded-xl"
            >
              <Settings size={16} className="mr-2" />
              Edit Profile
            </Button>
          </div>
        )}
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
        <div className="flex items-start space-x-6">
          <div className="relative">
              <UserAvatar 
                user={{ name: profileData.name, avatarUrl: profileData.avatar }}
                size="xl"
                className="border-4 border-white shadow-lg"
              />
            {profileData.verified && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-4 border-white">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{profileData.name}</h1>
                <p className="text-gray-600">@{profileData.username}</p>
              </div>
              <div className="flex space-x-3">
                {isOwnProfile ? (
                  <Button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-xl font-medium"
                  >
                    <Settings size={16} className="mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleFollow}
                      disabled={followLoading}
                      className={`px-6 py-2 rounded-xl font-medium transition-colors ${
                        isFollowing
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {followLoading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : isFollowing ? (
                        <>
                          <UserMinus size={16} className="mr-2" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} className="mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                    <Button className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-xl">
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>

            <p className="text-gray-700 mb-4 leading-relaxed">{profileData.bio}</p>

            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <MapPin size={16} />
                <span>{profileData.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <LinkIcon size={16} />
                <a href="#" className="text-blue-600 hover:underline">
                  {profileData.website}
                </a>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar size={16} />
                <span>Joined {profileData.joinDate}</span>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-gray-900">{profileData.followers.toLocaleString()}</span>
                <span className="text-gray-600">Followers</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-gray-900">{profileData.following.toLocaleString()}</span>
                <span className="text-gray-600">Following</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-gray-900">{profileData.documents}</span>
                <span className="text-gray-600">Documents</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>{tab.label}</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {tab.count.toLocaleString()}
                  </span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "documents" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => onViewDocument(doc)}
                >
                  <img
                    src={doc.thumbnail || "/placeholder.svg"}
                    alt={doc.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg">
                        {doc.category}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                        {doc.type}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{doc.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{doc.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{doc.createdAt}</span>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Heart size={14} />
                          <span>{doc.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText size={14} />
                          <span>{doc.downloads}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "followers" && (
            <div className="space-y-4">
              {followers.map((follower, index) => (
                <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                  <UserAvatar 
                    user={follower}
                    size="medium"
                  />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{follower.name}</h3>
                        {follower.verified && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">@{follower.username}</p>
                    </div>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl">Follow</Button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "liked" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {likedDocsData.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => onViewDocument(doc)}
                >
                  <img
                    src={doc.thumbnail || "/placeholder.svg"}
                    alt={doc.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg">
                        {doc.category}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                        {doc.type}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{doc.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{doc.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{doc.createdAt}</span>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Heart size={14} />
                          <span>{doc.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText size={14} />
                          <span>{doc.downloads}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "following" && (
            <div className="space-y-4">
              {following.map((followedUser, index) => (
                <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <UserAvatar 
                      user={followedUser}
                      size="medium"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{followedUser.name}</h3>
                        {followedUser.verified && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">@{followedUser.email?.split('@')[0] || 'username'}</p>
                    </div>
                  </div>
                  <Button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-xl">Following</Button>
                </div>
              ))}
              {following.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Not following anyone yet</h3>
                  <p className="text-gray-500">People you follow will appear here</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSave={onUpdateProfile || (() => {})}
      />
    </div>
  )
}

