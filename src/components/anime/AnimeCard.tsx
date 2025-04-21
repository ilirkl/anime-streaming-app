'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BookmarkPlus, Play, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { slugify } from "@/lib/utils"
import { createClient } from "@/lib/client"
import { toast } from "sonner"

interface AnimeCardProps {
  anime: {
    id: string
    title: string
    coverImage: string
    episodeNumber?: number
    episodeId?: string
    synopsis?: string
    airDate?: string
    status?: string
    rating?: string
    episodeCount?: number
  }
  showEpisodeInfo?: boolean
}

export function AnimeCard({ anime, showEpisodeInfo = false }: AnimeCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Create a slug from the anime title
  const animeSlug = slugify(anime.title)

  const linkHref = showEpisodeInfo && anime.episodeNumber
    ? `/watch/${animeSlug || anime.id}/s1/e${anime.episodeNumber}`
    : `/anime/${animeSlug || anime.id}`

  const handleAddToWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        // Redirect to login if not authenticated
        window.location.href = `/login?next=${encodeURIComponent(linkHref)}`
        return
      }

      // Add to watchlist
      const { error } = await supabase
        .from('watchlist')
        .insert({
          user_id: session.user.id,
          anime_id: anime.id
        })

      if (error) {
        if (error.code === '23505') { // Unique violation
          toast.info('This anime is already in your watchlist')
        } else {
          throw error
        }
      } else {
        toast.success('Added to watchlist')
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error)
      toast.error('Failed to add to watchlist')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card
      className="overflow-hidden relative group p-0 shadow-none gap-0 max-w-full w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={linkHref} className="relative block">
        <div className="aspect-[2/3] relative">
          <Image
            src={anime.coverImage || '/images/placeholder-cover.jpg'}
            alt={anime.title}
            fill
            className="object-cover rounded-xl"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 16vw, (max-width: 1536px) 13vw, 12vw"
          />
          {/* Rating badge */}
          {anime.rating && (
            <div className="absolute top-1 right-1 flex items-center gap-0.5 bg-yellow-500/90 text-black px-1.5 py-0.5 rounded text-xs font-semibold z-10">
              <Star className="h-3 w-3 fill-current" />
              <span>{anime.rating}</span>
            </div>
          )}
          {/* Hover overlay */}
          <div className={`absolute inset-0 bg-black/85 transition-opacity duration-200 rounded-xl ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
  <div className="p-3 flex flex-col h-full overflow-hidden">
    <h3 className="text-sm font-bold mb-1.5 text-white line-clamp-2">{anime.title}</h3>
    {/* Show rating on hover if available */}
    {anime.rating && (
      <div className="flex items-center gap-1 text-yellow-400 text-xs font-semibold mb-1.5">
        <Star className="h-3 w-3 fill-current" />
        <span>{anime.rating}</span>
      </div>
    )}
    {/* Show synopsis on hover if available */}
    {anime.synopsis && (
      <p className="text-xs text-gray-300 line-clamp-4 mb-1.5">{anime.synopsis}</p>
    )}
    {showEpisodeInfo && anime.episodeNumber && (
      <div className="text-xs text-white mb-1.5">Episode {anime.episodeNumber}</div>
    )}
    {!showEpisodeInfo && anime.episodeCount && (
      <div className="text-xs text-white mb-1.5">{anime.episodeCount} Episodes</div>
    )}
    {anime.airDate && (
      <div className="text-xs text-gray-400 mt-auto">
        Aired: {new Date(anime.airDate).toLocaleDateString()}
      </div>
    )}
    {anime.status && (
      <div className="text-xs text-gray-400">Status: {anime.status}</div>
    )}
    <div className="mt-auto flex gap-2">
      <Button
        variant="secondary"
        size="sm"
        className="w-full"
        onClick={(e) => {
          e.preventDefault()
          window.location.href = linkHref
        }}
      >
        <Play className="h-4 w-4 mr-1" />
        {showEpisodeInfo ? 'Watch' : 'View'}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleAddToWatchlist}
        disabled={isLoading}
      >
        <BookmarkPlus className="h-4 w-4" />
      </Button>
    </div>
  </div>
</div>
        </div>
      </Link>
    </Card>
  )
}
