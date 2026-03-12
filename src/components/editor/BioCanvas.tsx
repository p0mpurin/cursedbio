'use client'

/**
 * BioCanvas - The central visual page builder area
 * Implements an 8-handle unconstrained resize system and rotation
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { PageElement, PageLayout } from '@/lib/db'

const NITRO_BADGE_IMG =
  'https://cdn.jsdelivr.net/gh/merlinfuchs/discord-badges@main/SVG/nitro.svg'

function DiscordBadgeIcon({ badge }: { badge: string }) {
  const getBadgeDetails = (b: string): { color: string; path: string; title: string; imageUrl?: string } | null => {
    switch (b) {
      case 'staff': return { color: '#5865F2', path: 'M14.5 10c0-1.4-1.1-2.5-2.5-2.5S9.5 8.6 9.5 10s1.1 2.5 2.5 2.5 2.5-1.1 2.5-2.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z', title: 'Discord Staff' }
      case 'partner': return { color: '#5865F2', path: 'M21.5 9.5l-2.5-1 .5-2.5-2.5-.5-1-2.5-2.5.5-2-1.5-2 1.5-2.5-.5-1 2.5-2.5.5.5 2.5-2.5 1 1.5 2-1.5 2 2.5 1-.5 2.5 2.5.5 1 2.5 2.5-.5 2 1.5 2-1.5 2.5.5 1-2.5 2.5-.5-.5-2.5 2.5-1-1.5-2 1.5-2zm-5.5 5.5l-4 4-4-4v-5l4-3 4 3v5z', title: 'Partnered Server Owner' }
      case 'hypesquad': return { color: '#F8A532', path: 'M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5zM12 10v4h-1v-4h1zm0 6v-1h-1v1h1z', title: 'HypeSquad Events' }
      case 'bug_hunter_1': return { color: '#43B581', path: 'M20 13h-2v-2h-2v2h-2v-2h-2v2h-2v-2H8v2H6v-2H4v3h16v-3h-2zm-6-4H8v2h6V9zm0-3H8v2h6V6z', title: 'Discord Bug Hunter' }
      case 'bug_hunter_2': return { color: '#FAA61A', path: 'M20 13h-2v-2h-2v2h-2v-2h-2v2h-2v-2H8v2H6v-2H4v3h16v-3h-2zm-6-4H8v2h6V9zm0-3H8v2h6V6z', title: 'Discord Bug Hunter' }
      case 'hypesquad_bravery': return { color: '#9B84EE', path: 'M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4zm0 16.5c-3.55 0-6.5-3.37-6.5-7.5S8.45 3.5 12 3.5s6.5 3.37 6.5 7.5-2.95 7.5-6.5 7.5zm-3-8h6v2H9v-2z', title: 'HypeSquad Bravery' }
      case 'hypesquad_brilliance': return { color: '#F47B67', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zM9 9h6v2H9z', title: 'HypeSquad Brilliance' }
      case 'hypesquad_balance': return { color: '#45DDCA', path: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', title: 'HypeSquad Balance' }
      case 'early_supporter': return { color: '#7289DA', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2V7z', title: 'Early Supporter' }
      case 'verified_dev': return { color: '#3BA55D', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z', title: 'Verified Bot Developer' }
      case 'certified_mod': return { color: '#3BA55D', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2.83 14.41l-2.83-2.83 2.83-2.83 1.41 1.42-1.42 1.41 1.42 1.42-1.41 1.41zm5.66-5.66L14.41 12l2.83-2.83-1.41-1.41-2.83 2.83-2.83-2.83-1.42 1.41 2.83 2.83-2.83 2.83 1.41 1.41 2.83-2.83 1.42-1.42z', title: 'Certified Moderator' }
      case 'active_developer': return { color: '#3BA55D', path: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14L7 12l1.41-1.41L12 14.17l5.59-5.59L19 10l-7 7z', title: 'Active Developer' }
      case 'nitro': return { color: '#ff73fa', path: '', title: 'Nitro', imageUrl: NITRO_BADGE_IMG }
      case 'nitro_classic': return { color: '#ff73fa', path: '', title: 'Nitro Classic', imageUrl: NITRO_BADGE_IMG }
      case 'nitro_basic': return { color: '#ff73fa', path: '', title: 'Nitro Basic', imageUrl: NITRO_BADGE_IMG }
      default: return null
    }
  }

  const details = getBadgeDetails(badge)
  if (!details) return null

  if (details.imageUrl) {
    return (
      <div title={details.title} style={{ display: 'inline-flex', cursor: 'pointer' }}>
        <img src={details.imageUrl} alt={details.title} width={22} height={22} style={{ display: 'block' }} />
      </div>
    )
  }

  return (
    <div title={details.title} style={{ display: 'inline-flex', cursor: 'pointer' }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill={details.color}>
        <path d={details.path} />
      </svg>
    </div>
  )
}

/** Official Discord status icons (public/discord-status/*.png) – online, idle, dnd, offline */
const DISCORD_STATUS_ICON_URL: Record<string, string> = {
  online: '/discord-status/online.png',
  idle: '/discord-status/idle.png',
  dnd: '/discord-status/dnd.png',
  offline: '/discord-status/offline.png',
}

function DiscordStatusIcon({
  status,
  size,
  borderColor,
}: {
  status: 'online' | 'idle' | 'dnd' | 'offline'
  size: number
  borderColor: string
}) {
  const src = DISCORD_STATUS_ICON_URL[status] ?? DISCORD_STATUS_ICON_URL.offline
  const borderW = Math.max(1, size / 6)
  const inner = size - borderW * 2
  return (
    <div
      style={{
        width: size,
        height: size,
        boxSizing: 'border-box',
        border: `${borderW}px solid ${borderColor}`,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <img
        src={src}
        alt={status}
        width={inner}
        height={inner}
        style={{ display: 'block' }}
      />
    </div>
  )
}

const LANYARD_API = 'https://api.lanyard.rest/v1/users'

/** Discord Profile element - fetches /api/discord/me and Lanyard for live status/custom status */
function DiscordProfileDisplay({
  el,
  isEditMode,
}: {
  el: PageElement
  isEditMode: boolean
}) {
  const [data, setData] = useState<{
    id: string
    avatar_url: string
    global_name: string
    username: string
    badges: string[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [lanyard, setLanyard] = useState<{
    status: 'online' | 'idle' | 'dnd' | 'offline'
    customStatus: string
  } | null>(null)

  useEffect(() => {
    fetch('/api/discord/me')
      .then((r) => r.json())
      .then((d) => {
        setData(d.discord)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!data?.id) return
    const ac = new AbortController()
    fetch(`${LANYARD_API}/${data.id}`, { signal: ac.signal })
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (!json?.success || !json?.data) return
        const d = json.data
        const status = (d.discord_status === 'online' || d.discord_status === 'idle' || d.discord_status === 'dnd' || d.discord_status === 'offline')
          ? d.discord_status
          : 'offline'
        let customStatus = ''
        const activities = d.activities as Array<{ type?: number; name?: string; state?: string }> | undefined
        if (activities?.length) {
          const custom = activities.find((a) => a.type === 4 || a.name === 'Custom Status')
          if (custom?.state) customStatus = custom.state
        }
        setLanyard({ status, customStatus })
      })
      .catch(() => {})
    return () => ac.abort()
  }, [data?.id])

  const showAvatar = (el.props.showAvatar as boolean) !== false
  const showUsername = (el.props.showUsername as boolean) !== false
  const showBadges = (el.props.showBadges as boolean) !== false
  const avatarSize = (el.props.avatarSize as number) ?? 48
  const fontSize = (el.props.fontSize as number) ?? 14
  const color = (el.props.color as string) ?? '#e5e5e5'
  const opacity = (el.props.opacity as number) ?? 1
  const fallbackStatus = ((el.props.status as string) ?? 'offline') as 'online' | 'idle' | 'dnd' | 'offline'
  const fallbackCustomStatus = (el.props.customStatus as string) ?? ''
  const status = lanyard?.status ?? fallbackStatus
  const customStatus = (lanyard?.customStatus?.trim() || fallbackCustomStatus.trim()) || ''

  if (isEditMode && !data) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: 12,
          background: 'rgba(88,101,242,0.1)',
          borderRadius: 12,
          border: '1px dashed rgba(88,101,242,0.4)',
          opacity,
        }}
      >
        <div style={{ position: 'relative', flexShrink: 0, width: avatarSize, height: avatarSize }}>
          <div
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: '50%',
              background: 'rgba(88,101,242,0.3)',
            }}
          />
          <div style={{ position: 'absolute', right: 0, bottom: 0 }}>
            <DiscordStatusIcon status={status} size={Math.max(12, avatarSize * 0.28)} borderColor="rgba(88,101,242,0.2)" />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <span style={{ fontSize, color: 'rgba(255,255,255,0.5)' }}>Loading Discord…</span>
          ) : (
            <span style={{ fontSize, color: 'rgba(255,255,255,0.6)' }}>
              Connect Discord on the dashboard to show your profile
            </span>
          )}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize,
          color: 'rgba(255,255,255,0.4)',
          opacity,
        }}
      >
        Connect Discord to display
      </div>
    )
  }

  const containerBg = (el.props.containerBackground as string) ?? 'rgba(88,101,242,0.12)'
  const containerBorder = (el.props.containerBorder as string) ?? '1px solid rgba(88,101,242,0.3)'
  const containerRadius = (el.props.containerRadius as string) ?? '12px'

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: 12,
        gap: 12,
        opacity,
        backgroundColor: containerBg,
        border: containerBorder,
        borderRadius: containerRadius,
        boxSizing: 'border-box',
      }}
    >
      {showAvatar && (
        <div
          style={{
            position: 'relative',
            flexShrink: 0,
            width: avatarSize,
            height: avatarSize,
          }}
        >
          <img
            src={data.avatar_url}
            alt=""
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
          <div style={{ position: 'absolute', right: 0, bottom: 0 }} title={status}>
            <DiscordStatusIcon status={status} size={Math.max(12, avatarSize * 0.28)} borderColor={containerBg} />
          </div>
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {showUsername && (
            <span style={{ fontSize, fontWeight: 600, color }}>{data.global_name || data.username}</span>
          )}
          {showBadges && data.badges.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {data.badges.slice(0, 8).map((b) => (
                <DiscordBadgeIcon key={b} badge={b} />
              ))}
            </div>
          )}
        </div>
        {customStatus && (
          <span style={{ fontSize: Math.max(10, fontSize - 2), color: 'rgba(255,255,255,0.65)' }}>
            {customStatus}
          </span>
        )}
      </div>
    </div>
  )
}

export type MusicTrack = { src: string; title?: string; albumArtUrl?: string }

/** Music player: playlist support, album art, title, progress bar, prev/play/next. */
function MusicPlayer({
  tracks: tracksProp,
  src,
  trackTitle,
  albumArtUrl,
  autoplay,
  color = '#E0DAC9',
}: {
  tracks?: MusicTrack[]
  src?: string
  trackTitle?: string
  albumArtUrl?: string
  autoplay?: boolean
  color?: string
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const tracks: MusicTrack[] = tracksProp?.length
    ? tracksProp.filter((t) => t.src)
    : src
      ? [{ src, title: trackTitle ?? 'Track', albumArtUrl }]
      : []
  const [trackIndex, setTrackIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const currentTrack = tracks[trackIndex]

  const wasPlayingRef = useRef(false)
  const shouldPlayNextRef = useRef(false)

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const onTimeUpdate = () => setCurrentTime(el.currentTime)
    const onDurationChange = () => setDuration(el.duration)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnded = () => {
      wasPlayingRef.current = true
      if (tracks.length <= 1) return
      shouldPlayNextRef.current = true
      setTrackIndex((i) => (i + 1) % tracks.length)
    }
    el.addEventListener('timeupdate', onTimeUpdate)
    el.addEventListener('durationchange', onDurationChange)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('ended', onEnded)
    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate)
      el.removeEventListener('durationchange', onDurationChange)
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('ended', onEnded)
    }
  }, [tracks.length])

  useEffect(() => {
    if (!currentTrack) return
    const el = audioRef.current
    if (el) el.src = currentTrack.src
    setCurrentTime(0)
    setDuration(0)
    if (shouldPlayNextRef.current && wasPlayingRef.current) {
      shouldPlayNextRef.current = false
      wasPlayingRef.current = false
      if (el) el.play().catch(() => {})
      setPlaying(true)
    } else {
      setPlaying(false)
    }
  }, [trackIndex, currentTrack?.src])

  useEffect(() => {
    const handler = () => audioRef.current?.play().catch(() => {})
    if (autoplay && currentTrack?.src) window.addEventListener('cursedbio-enter', handler)
    return () => window.removeEventListener('cursedbio-enter', handler)
  }, [autoplay, currentTrack?.src])

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (tracks.length > 1) {
      setTrackIndex((i) => (i - 1 + tracks.length) % tracks.length)
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }
  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (tracks.length > 1) {
      setTrackIndex((i) => (i + 1) % tracks.length)
    }
  }

  const format = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

  if (!currentTrack) {
    return (
      <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]" style={{ fontSize: 14 }}>
        Add tracks in the Properties panel
      </div>
    )
  }

  return (
    <div className="w-full h-full flex items-center gap-3 p-3 select-none" style={{ color }}>
      <div className="shrink-0 w-12 h-12 shadow-sm rounded-md overflow-hidden bg-black/40">
        {currentTrack.albumArtUrl ? (
          <img src={currentTrack.albumArtUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
        <div className="text-[13px] font-semibold truncate tracking-wider mb-2 text-white/90">{currentTrack.title || 'Track'}</div>
        <div className="flex flex-col w-full gap-1.5">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => {
              const t = parseFloat(e.target.value)
              if (audioRef.current) audioRef.current.currentTime = t
              setCurrentTime(t)
            }}
            className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-[var(--messmer-copper)]"
          />
          <div className="flex justify-between text-[10px] font-medium opacity-50 tracking-widest uppercase mt-0.5">
            <span>{format(currentTime)}</span>
            <span>{duration ? format(duration) : '0:00'}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0 ml-1">
        <button
          type="button"
          onClick={goPrev}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
          title="Previous"
          disabled={tracks.length <= 1}
          style={{ opacity: tracks.length <= 1 ? 0.3 : 0.8 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            if (playing) audioRef.current?.pause()
            else audioRef.current?.play().catch(() => {})
          }}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>
        <button
          type="button"
          onClick={goNext}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
          title="Next"
          disabled={tracks.length <= 1}
          style={{ opacity: tracks.length <= 1 ? 0.3 : 0.8 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm2-6l4.67 3.33L8 18V6zm8-6v12h2V6h-2z" /></svg>
        </button>
      </div>
      <audio ref={audioRef} src={currentTrack.src} playsInline preload="auto" />
    </div>
  )
}

/** Minimal audio: icon, hover = volume to the right, click = mute. No progress/skip. */
function MinimalAudio({ src, autoplay, color = '#E0DAC9' }: { src: string; autoplay?: boolean; color?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.35)
  const [hover, setHover] = useState(false)

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    el.muted = muted
    el.volume = volume
  }, [muted, volume])

  // Don't try to autoplay on mount - browsers block it. Rely on cursedbio-enter.

  useEffect(() => {
    const onEnter = () => {
      if (autoplay && audioRef.current && src) audioRef.current.play().catch(() => {})
    }
    window.addEventListener('cursedbio-enter', onEnter)
    return () => window.removeEventListener('cursedbio-enter', onEnter)
  }, [autoplay, src])

  if (!src) {
    return (
      <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]" style={{ fontSize: 24 }}>
        No audio
      </div>
    )
  }

  return (
    <div
      className="w-full h-full flex items-center justify-center select-none"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <audio ref={audioRef} src={src} loop playsInline preload="auto" data-autoplay={autoplay ? '1' : undefined} />
      <div className="flex flex-row items-center gap-2">
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMuted((m) => !m) }}
          className="p-1 rounded hover:bg-white/10 transition shrink-0"
          title={muted ? 'Unmute' : 'Mute'}
          style={{ color: muted ? '#666' : color }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="block">
          {muted ? (
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
          ) : (
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          )}
          </svg>
        </button>
        {hover && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => { setVolume(parseFloat(e.target.value)); setMuted(false) }}
              className="w-16 h-1 accent-[var(--messmer-copper)]"
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Handles for resizing
const HANDLES = [
  'nw', 'n', 'ne',
  'w', 'e',
  'sw', 's', 'se'
]

const SNAP_THRESHOLD = 8

function snapToTargets(value: number, targets: number[], threshold: number): number {
  let best = value
  let bestDist = threshold + 1
  for (const t of targets) {
    const d = Math.abs(value - t)
    if (d <= threshold && d < bestDist) {
      bestDist = d
      best = t
    }
  }
  return best
}

function getGuidePositions(cw: number, ch: number): { xs: number[]; ys: number[] } {
  const margin = Math.min(24, cw * 0.05, ch * 0.05)
  return {
    xs: [0, margin, cw / 3, cw / 2, (2 * cw) / 3, cw - margin, cw],
    ys: [0, margin, ch / 3, ch / 2, (2 * ch) / 3, ch - margin, ch],
  }
}

/** Build snap targets for left edge: guides, container inner guides, and center/right snap (so center or right of element can align). */
function buildSnapTargets(
  canvasW: number,
  canvasH: number,
  otherElements: Array<{ x: number; y: number; width: number; height: number; type: PageElement['type'] }>,
  elW: number,
  elH: number,
  isContainer?: boolean
): { xs: number[]; ys: number[] } {
  const { xs: guideXs, ys: guideYs } = getGuidePositions(canvasW, canvasH)
  const snapXs = new Set<number>(guideXs)
  const snapYs = new Set<number>(guideYs)
  otherElements.forEach((o) => {
    snapXs.add(o.x)
    snapXs.add(o.x + o.width)
    snapXs.add(o.x + o.width / 2)
    snapXs.add(o.x + o.width / 3)
    snapXs.add(o.x + (2 * o.width) / 3)
    snapYs.add(o.y)
    snapYs.add(o.y + o.height)
    snapYs.add(o.y + o.height / 2)
    snapYs.add(o.y + o.height / 3)
    snapYs.add(o.y + (2 * o.height) / 3)
    if (o.type === 'div') {
      const cx = o.x
      const cy = o.y
      const cw = o.width
      const ch = o.height
      ;[0, 1 / 3, 1 / 2, 2 / 3, 1].forEach((t) => {
        snapXs.add(cx + cw * t)
        snapYs.add(cy + ch * t)
      })
      // Inner padding snap (for elements inside container)
      ;[8, 16, 24].forEach((pad) => {
        if (pad < cw / 2) {
          snapXs.add(cx + pad)
          snapXs.add(cx + cw - pad)
        }
        if (pad < ch / 2) {
          snapYs.add(cy + pad)
          snapYs.add(cy + ch - pad)
        }
      })
    }
  })
  const outXs = Array.from(snapXs)
  const outYs = Array.from(snapYs)
  if (!isContainer) {
    guideXs.forEach((g) => {
      outXs.push(g - elW)
      outXs.push(g - elW / 2)
    })
    guideYs.forEach((g) => {
      outYs.push(g - elH)
      outYs.push(g - elH / 2)
    })
    otherElements.forEach((o) => {
      outXs.push(o.x - elW, o.x + o.width - elW, o.x + o.width / 2 - elW / 2)
      outYs.push(o.y - elH, o.y + o.height - elH, o.y + o.height / 2 - elH / 2)
      if (o.type === 'div') {
        const cw = o.width
        const ch = o.height
        ;[0, 1 / 3, 1 / 2, 2 / 3, 1].forEach((t) => {
          outXs.push(o.x + cw * t - elW / 2)
          outXs.push(o.x + cw * t - elW)
          outYs.push(o.y + ch * t - elH / 2)
          outYs.push(o.y + ch * t - elH)
        })
        ;[8, 16, 24].forEach((pad) => {
          if (pad < cw / 2) {
            outXs.push(o.x + pad - elW / 2, o.x + cw - pad - elW, o.x + cw - pad - elW / 2)
          }
          if (pad < ch / 2) {
            outYs.push(o.y + pad - elH / 2, o.y + ch - pad - elH, o.y + ch - pad - elH / 2)
          }
        })
      }
    })
  }
  return { xs: outXs, ys: outYs }
}

/** 3D tilt effect - container reacts to mouse position */
function TiltContainer({ children, intensity = 12, style: outerStyle }: { children: React.ReactNode; intensity?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState('')
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    const ry = x * intensity
    const rx = -y * intensity
    setTransform(`perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`)
  }, [intensity])
  const onMouseLeave = useCallback(() => setTransform(''), [])
  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        width: '100%',
        height: '100%',
        perspective: 800,
        transformStyle: 'preserve-3d',
        ...outerStyle,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          transform,
          transition: transform ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out',
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </div>
  )
}

/** Typewriter text effect - types out, then deletes, loops */
function TypewriterText({ text, speed = 80, deleteSpeed, pauseAtEnd = 1500, pauseAtStart = 500, loop = true, ...style }: { text: string; speed?: number; deleteSpeed?: number; pauseAtEnd?: number; pauseAtStart?: number; loop?: boolean; [k: string]: unknown }) {
  const delSpeed = deleteSpeed ?? speed
  const [visible, setVisible] = useState(0)
  const [phase, setPhase] = useState<'start' | 'typing' | 'endPause' | 'deleting' | 'startPause'>('start')

  useEffect(() => {
    if (!text) return
    let t: ReturnType<typeof setTimeout>

    if (phase === 'start') {
      t = setTimeout(() => setPhase('typing'), pauseAtStart)
      return () => clearTimeout(t)
    }
    if (phase === 'typing') {
      if (visible >= text.length) {
        setPhase('endPause')
        return
      }
      t = setTimeout(() => setVisible((v) => v + 1), speed)
      return () => clearTimeout(t)
    }
    if (phase === 'endPause') {
      t = setTimeout(() => setPhase('deleting'), pauseAtEnd)
      return () => clearTimeout(t)
    }
    if (phase === 'deleting') {
      if (visible <= 0) {
        if (loop) {
          setPhase('startPause')
        }
        return
      }
      t = setTimeout(() => setVisible((v) => v - 1), delSpeed)
      return () => clearTimeout(t)
    }
    if (phase === 'startPause') {
      t = setTimeout(() => {
        setPhase('typing')
        setVisible(0)
      }, pauseAtStart)
      return () => clearTimeout(t)
    }
  }, [phase, visible, text.length, speed, delSpeed, pauseAtEnd, pauseAtStart, loop])

  useEffect(() => {
    setVisible(0)
    setPhase('start')
  }, [text])

  const showCursor = phase === 'typing' || phase === 'deleting' || (phase === 'endPause' && visible > 0)
  return <span style={style as React.CSSProperties}>{text.slice(0, visible)}{showCursor && <span style={{ opacity: 0.7 }}>|</span>}</span>
}

// Render actual contents of elements
function ElementContent({ el, isEditMode }: { el: PageElement; isEditMode: boolean }) {
  switch (el.type) {
    case 'text': {
      const content = (el.props.content as string) ?? ''
      const legacyEffect = (el.props.textEffect as string) ?? 'none'
      const effectsArray = (el.props.textEffects as string[]) ?? (legacyEffect !== 'none' ? [legacyEffect] : [])
      
      const baseStyle: React.CSSProperties = {
        width: '100%', height: '100%',
        fontSize: (el.props.fontSize as number) ?? 16,
        fontFamily: (el.props.fontFamily as string) ?? 'sans-serif',
        color: (el.props.color as string) ?? '#E0DAC9',
        fontWeight: (el.props.fontWeight as string) ?? 'normal',
        textShadow: (el.props.textShadow as string) ?? undefined,
        WebkitTextStroke: (el.props.webkitTextStroke as string) ?? undefined,
        lineHeight: (el.props.lineHeight as number) ?? 1.5,
        letterSpacing: (el.props.letterSpacing as number) ?? 0,
        textAlign: (el.props.textAlign as any) ?? 'left',
        opacity: (el.props.opacity as number) ?? 1,
        overflow: 'hidden',
      }
      
      let animations: string[] = []
      if (!isEditMode) {
        if (effectsArray.includes('fade')) animations.push('textFadeIn 0.8s ease-out forwards')
        if (effectsArray.includes('glitch')) animations.push('textGlitch 2s ease-in-out infinite')
        if (effectsArray.includes('glow')) animations.push('textGlow 2s ease-in-out infinite')
        if (effectsArray.includes('glowParticles')) animations.push('textGlow 2.5s ease-in-out infinite')
      }

      const effectStyle: React.CSSProperties = animations.length > 0
        ? { animation: animations.join(', ') }
        : {}

      const hasParticles = !isEditMode && effectsArray.includes('glowParticles')
      const effectClass = hasParticles ? 'text-effect-glow-particles' : ''
      
      // If we have particles, wrap the content in an inline-block span to tightly fit the text dimensions instead of expanding to the container boundaries
      const innerContent = effectsArray.includes('typewriter') && !isEditMode ? (
        <TypewriterText
          text={content}
          speed={(el.props.typewriterSpeed as number) ?? 80}
          deleteSpeed={(el.props.typewriterDeleteSpeed as number) ?? undefined}
          pauseAtEnd={(el.props.typewriterPauseAtEnd as number) ?? 1500}
          loop={(el.props.typewriterLoop as boolean) !== false}
        />
      ) : (
        content
      )

      return (
        <div style={{ ...baseStyle, ...effectStyle }}>
          {hasParticles ? (
            <span style={{ display: 'inline-block', position: 'relative' }} className={effectClass}>
              {innerContent}
            </span>
          ) : (
            innerContent
          )}
        </div>
      )
    }
    case 'image': {
      const radius = (el.props.borderRadius as string) ?? '0'
      const clickAction = (el.props.imageClickAction as string) ?? 'none'
      const href = (el.props.href as string) ?? ''
      const imgEl = (
        <img
          src={(el.props.src as string) ?? ''}
          alt=""
          draggable={false}
          style={{
            width: '100%', height: '100%',
            objectFit: (el.props.objectFit as any) ?? 'cover',
            opacity: (el.props.opacity as number) ?? 1,
            filter: `
              brightness(${(el.props.filterBrightness as number) ?? 100}%)
              contrast(${(el.props.filterContrast as number) ?? 100}%)
              saturate(${(el.props.filterSaturate as number) ?? 100}%)
              blur(${(el.props.filterBlur as number) ?? 0}px)
            `
          }}
        />
      )
      const wrapperStyle: React.CSSProperties = {
        width: '100%', height: '100%',
        borderRadius: radius,
        overflow: 'hidden',
        border: (el.props.border as string) ?? undefined,
        boxShadow: (el.props.boxShadow as string) ?? undefined,
      }
      const interactiveStyle: React.CSSProperties = !isEditMode && (clickAction === 'link' || clickAction === 'copy')
        ? { ...wrapperStyle, cursor: 'pointer', transition: 'transform 0.15s ease' }
        : wrapperStyle
      const handleImageClick = (e: React.MouseEvent) => {
        if (isEditMode) return
        if (clickAction === 'copy') {
          e.preventDefault()
          navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : '')
        }
      }
      const content = clickAction === 'link' && href && !isEditMode
        ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ width: '100%', height: '100%', display: 'block' }}>{imgEl}</a>
        : clickAction === 'copy' && !isEditMode
          ? <div role="button" tabIndex={0} onClick={handleImageClick} onKeyDown={(k) => k.key === 'Enter' && handleImageClick(k as any)} style={{ width: '100%', height: '100%' }}>{imgEl}</div>
          : imgEl
      return (
        <div style={interactiveStyle}>
          {content}
        </div>
      )
    }
    case 'shape': {
      const bgColor = (el.props.backgroundColor as string) ?? '#737373'
      const bgGradient = (el.props.background as string) || ''
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            minWidth: 8,
            minHeight: 8,
            ...(bgGradient
              ? { background: bgGradient }
              : { backgroundColor: bgColor }),
            borderRadius: (el.props.borderRadius as string) ?? '0',
            border: (el.props.border as string) ?? undefined,
            boxShadow: (el.props.boxShadow as string) ?? undefined,
            opacity: (el.props.opacity as number) ?? 1,
          }}
        />
      )
    }
    case 'button': {
      const href = el.props.href as string | undefined
      const copyUrl = !!el.props.copyUrl
      const icon = el.props.icon as string | undefined
      const label = (el.props.label as string) ?? ''
      const sharedStyle: React.CSSProperties = {
        width: '100%', height: '100%',
        backgroundColor: (el.props.backgroundColor as string) ?? '#B66E41',
        color: (el.props.color as string) ?? '#fff',
        borderRadius: (el.props.borderRadius as string) ?? '8px',
        fontSize: (el.props.fontSize as number) ?? 16,
        boxShadow: (el.props.boxShadow as string) ?? undefined,
        opacity: (el.props.opacity as number) ?? 1,
        border: 'none',
        cursor: isEditMode ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8,
      }
      const handleClick = (e: React.MouseEvent) => {
        if (isEditMode) return
        if (copyUrl) {
          e.preventDefault()
          navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : '')
        }
      }
      const iconPos = (el.props.iconPosition as string) ?? 'left'
      const iconSize = (el.props.iconSize as number) ?? Math.min(24, Math.min(el.width || 40, el.height || 40) * 0.6)
      const showLabel = iconPos !== 'only' && (label || !icon)
      const iconEl = icon ? <img src={icon} alt="" draggable={false} style={{ width: iconSize, height: iconSize, objectFit: 'contain', flexShrink: 0 }} /> : null
      const content = (
        <>
          {iconPos === 'left' && iconEl}
          {showLabel ? label : null}
          {iconPos === 'right' && iconEl}
        </>
      )
      if (!isEditMode && href && !copyUrl) {
        return (
          <a
            href={href}
            target={href.startsWith('#') ? undefined : '_blank'}
            rel={href.startsWith('#') ? undefined : 'noopener noreferrer'}
            style={sharedStyle}
          >
            {content}
          </a>
        )
      }
      return (
        <button onClick={handleClick} style={sharedStyle}>
          {content}
        </button>
      )
    }
    case 'div': {
      const bf = (el.props.backdropFilter as string) ?? ''
      const bg = (el.props.backgroundColor as string) ?? 'transparent'
      const mouseTilt = !!(el.props.mouseTilt as boolean)
      const tiltIntensity = (el.props.tiltIntensity as number) ?? 12
      const isOpaque = !bg || bg === 'transparent' || bg === 'rgba(0,0,0,0)' || /^#[0-9a-fA-F]{6}$/.test(bg) || /^#[0-9a-fA-F]{8}$/.test(bg)
      const effectiveBg = bf && isOpaque ? 'rgba(255,255,255,0.08)' : bg
      const innerStyle: React.CSSProperties = {
        width: '100%', height: '100%',
        backgroundColor: effectiveBg,
        background: (el.props.background as string) ?? undefined,
        backgroundImage: (el.props.backgroundImage as string) ? `url(${el.props.backgroundImage})` : undefined,
        backgroundSize: (el.props.backgroundSize as string) ?? 'cover',
        backgroundPosition: (el.props.backgroundPosition as string) ?? 'center',
        borderRadius: (el.props.borderRadius as string) ?? '0',
        border: (el.props.border as string) ?? undefined,
        boxShadow: (el.props.boxShadow as string) ?? undefined,
        backdropFilter: bf || undefined,
        WebkitBackdropFilter: bf || undefined,
        opacity: (el.props.opacity as number) ?? 1,
        ...(bf ? { isolation: 'isolate' as const, transform: 'translateZ(0)' } : {}),
      }
      const inner = <div style={innerStyle} />
      return !isEditMode && mouseTilt ? (
        <TiltContainer intensity={tiltIntensity}>{inner}</TiltContainer>
      ) : (
        inner
      )
    }
    case 'video': {
      const radius = (el.props.borderRadius as string) ?? '0'
      return (
        <div style={{ width: '100%', height: '100%', borderRadius: radius, overflow: 'hidden', opacity: (el.props.opacity as number) ?? 1 }}>
          <video
            src={(el.props.src as string) ?? ''}
            poster={(el.props.poster as string) ?? undefined}
            controls={!!el.props.controls}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onClick={(e) => isEditMode && e.preventDefault()}
          />
        </div>
      )
    }
    case 'audio':
      if (isEditMode) {
        return (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (el.props.opacity as number) ?? 1, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
            <span className="text-xs text-[var(--text-muted)]">{(el.props.displayMode as string) === 'musicPlayer' ? 'Music' : 'Audio'}</span>
          </div>
        )
      }
      if ((el.props.displayMode as string) === 'musicPlayer') {
        const tracksRaw = el.props.tracks as Array<{ src: string; title?: string; albumArtUrl?: string }> | undefined
        const tracks = Array.isArray(tracksRaw) ? tracksRaw : undefined
        return (
          <div style={{ width: '100%', height: '100%', opacity: (el.props.opacity as number) ?? 1 }}>
            <MusicPlayer
              tracks={tracks}
              src={(el.props.src as string) ?? ''}
              trackTitle={(el.props.trackTitle as string) ?? 'Track'}
              albumArtUrl={(el.props.albumArtUrl as string) ?? ''}
              autoplay={!!el.props.autoplay}
              color={(el.props.color as string) ?? '#E0DAC9'}
            />
          </div>
        )
      }
      return (
        <div style={{ width: '100%', height: '100%', opacity: (el.props.opacity as number) ?? 1 }}>
          <MinimalAudio
            src={(el.props.src as string) ?? ''}
            autoplay={!!el.props.autoplay}
            color={(el.props.color as string) ?? '#E0DAC9'}
          />
        </div>
      )
    case 'embed': {
      const radius = (el.props.borderRadius as string) ?? '0'
      return (
        <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: radius, overflow: 'hidden', opacity: (el.props.opacity as number) ?? 1 }}>
          <iframe
            src={(el.props.url as string) ?? ''}
            title="embed"
            style={{ width: '100%', height: '100%', border: 'none', pointerEvents: isEditMode ? 'none' : 'auto' }}
          />
          {isEditMode && <div className="absolute inset-0 z-10" />}
        </div>
      )
    }
    case 'discordProfile': {
      return (
        <DiscordProfileDisplay
          el={el}
          isEditMode={isEditMode}
        />
      )
    }
    case 'profileViews': {
      const count = (el.props.count as number) ?? 0
      const fontSize = (el.props.fontSize as number) ?? 14
      const color = (el.props.color as string) ?? '#9a958c'
      const showIcon = (el.props.icon as string) !== 'none'
      const EyeIcon = () => (
        <svg width={fontSize} height={fontSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
      const formatted = count >= 1000000 ? `${(count / 1000000).toFixed(1)}M` : count >= 1000 ? `${(count / 1000).toFixed(1)}K` : String(count)
      return (
        <div
          style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize, color,
            opacity: (el.props.opacity as number) ?? 1,
          }}
        >
          {showIcon && <EyeIcon />}
          <span><strong>{formatted}</strong></span>
        </div>
      )
    }
    default:
      return null
  }
}

/** Get effective canvas position for an element (accounting for pinnedTo). */
function getEffectivePosition(el: PageElement, layout: PageLayout): { x: number; y: number } {
  if (!el.pinnedTo) return { x: el.x, y: el.y }
  const container = layout.elements.find((e) => e.id === el.pinnedTo)
  if (!container) return { x: el.x, y: el.y }
  return { x: container.x + el.x, y: container.y + el.y }
}

function InteractiveNode({
  el,
  layout,
  isSelected,
  onSelect,
  onUpdate,
  scale,
  canvasW,
  canvasH,
  otherElements,
}: {
  el: PageElement
  layout: PageLayout
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<PageElement>) => void
  scale: number
  canvasW: number
  canvasH: number
  otherElements: Array<{ x: number; y: number; width: number; height: number; type: PageElement['type'] }>
}) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const container = el.pinnedTo ? layout.elements.find((e) => e.id === el.pinnedTo) : null
  const { x: dispX, y: dispY } = getEffectivePosition(el, layout)

  // Transform State - use display coords for positioning (canvas space)
  const [isEditingText, setIsEditingText] = useState(false)
  const [internalBox, setInternalBox] = useState({ x: dispX, y: dispY, w: el.width, h: el.height, r: el.rotation || 0 })
  const isDragging = useRef(false)
  const isResizing = useRef(false)
  const isRotating = useRef(false)

  // Sync from props if not currently interacting
  useEffect(() => {
    if (!isDragging.current && !isResizing.current && !isRotating.current) {
      const { x, y } = getEffectivePosition(el, layout)
      setInternalBox({ x, y, w: el.width, h: el.height, r: el.rotation || 0 })
    }
  }, [el.x, el.y, el.width, el.height, el.rotation, el.pinnedTo, layout])

  // Move element
  const handlePointerDownMove = (e: React.PointerEvent) => {
    if (el.locked || isEditingText) return
    e.stopPropagation()
    e.preventDefault()
    onSelect()

    // Only allow drag if clicking on the main element, not handles
    if ((e.target as HTMLElement).closest('.resize-handle') || (e.target as HTMLElement).closest('.rotate-handle')) {
      return
    }

    isDragging.current = true
    const startX = e.clientX
    const startY = e.clientY
    const initX = internalBox.x
    const initY = internalBox.y
    const w = internalBox.w
    const h = internalBox.h
    const { xs: snapXs, ys: snapYs } = buildSnapTargets(canvasW, canvasH, otherElements, w, h, el.type === 'div')

    const captureEl = e.currentTarget as HTMLElement
    try {
      captureEl.setPointerCapture(e.pointerId)
    } catch (_) {}

    const onPointerMove = (ev: PointerEvent) => {
      const dx = (ev.clientX - startX) / scale
      const dy = (ev.clientY - startY) / scale
      let newX = snapToTargets(initX + dx, snapXs, SNAP_THRESHOLD)
      let newY = snapToTargets(initY + dy, snapYs, SNAP_THRESHOLD)
      setInternalBox(prev => ({ ...prev, x: newX, y: newY }))
    }

    const onPointerUp = () => {
      isDragging.current = false
      try {
        captureEl.releasePointerCapture(e.pointerId)
      } catch (_) {}
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      setInternalBox((curr) => {
        const pos = container
          ? { x: curr.x - container.x, y: curr.y - container.y }
          : { x: curr.x, y: curr.y }
        onUpdate(pos)
        return curr
      })
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  // Handle Resize
  const handleResizeDown = (e: React.PointerEvent, handle: string) => {
    e.stopPropagation()
    e.preventDefault()
    isResizing.current = true

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    } catch (_) {}

    const startX = e.clientX
    const startY = e.clientY
    const { x, y, w, h } = internalBox

    const { xs: snapXs, ys: snapYs } = buildSnapTargets(canvasW, canvasH, otherElements, 0, 0, false)

    const onPointerMove = (ev: PointerEvent) => {
      const dx = (ev.clientX - startX) / scale
      const dy = (ev.clientY - startY) / scale

      let newW = w
      let newH = h
      let newX = x
      let newY = y

      if (handle.includes('e')) newW = w + dx
      if (handle.includes('s')) newH = h + dy
      if (handle.includes('w')) { newW = w - dx; newX = x + dx }
      if (handle.includes('n')) { newH = h - dy; newY = y + dy }

      // Keep minimum size
      if (newW < 10) { newX += newW - 10; newW = 10 }
      if (newH < 10) { newY += newH - 10; newH = 10 }

      // Snap edges during resize
      newX = snapToTargets(newX, snapXs, SNAP_THRESHOLD)
      newY = snapToTargets(newY, snapYs, SNAP_THRESHOLD)
      const rightSnapped = snapToTargets(newX + newW, snapXs, SNAP_THRESHOLD)
      const bottomSnapped = snapToTargets(newY + newH, snapYs, SNAP_THRESHOLD)
      newW = Math.max(10, rightSnapped - newX)
      newH = Math.max(10, bottomSnapped - newY)

      setInternalBox(prev => ({ ...prev, x: newX, y: newY, w: newW, h: newH }))
    }

    const onPointerUp = () => {
      isResizing.current = false
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      setInternalBox(curr => {
        const pos = container
          ? { x: curr.x - container.x, y: curr.y - container.y }
          : { x: curr.x, y: curr.y }
        onUpdate({ ...pos, width: curr.w, height: curr.h })
        return curr
      })
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  // Handle Rotate
  const handleRotateDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    e.preventDefault()
    isRotating.current = true

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    } catch (_) {}

    const rect = nodeRef.current?.getBoundingClientRect()
    if (!rect) return

    // Center of element in screen space
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI
    const initRot = internalBox.r

    const onPointerMove = (ev: PointerEvent) => {
      const angle = Math.atan2(ev.clientY - centerY, ev.clientX - centerX) * 180 / Math.PI
      let diff = angle - startAngle
      let newR = initRot + diff
      // Snap to 45 deg intervals if holding shift
      if (ev.shiftKey) {
        newR = Math.round(newR / 45) * 45
      }
      setInternalBox(prev => ({ ...prev, r: newR }))
    }

    const onPointerUp = () => {
      isRotating.current = false
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      setInternalBox(curr => {
        onUpdate({ rotation: curr.r })
        return curr
      })
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  // Double click to inline edit text
  const handleDoubleClick = () => {
    if (el.type === 'text' && !el.locked) setIsEditingText(true)
  }

  const isContainer = el.type === 'div'
  // Containers: fill has pointer-events none so we can click elements beneath; border frame is hit area
  const containerFrameWidth = 8

  return (
    <div
      ref={nodeRef}
      data-element-id={el.id}
      data-element-type={el.type}
      onPointerDown={isContainer ? undefined : handlePointerDownMove}
      onDoubleClick={handleDoubleClick}
      style={{
        position: 'absolute',
        left: internalBox.x,
        top: internalBox.y,
        width: internalBox.w,
        height: internalBox.h,
        transform: `rotate(${internalBox.r}deg)`,
        zIndex: el.zIndex,
        outline: isSelected && !isContainer ? '1px solid var(--messmer-copper)' : 'none',
        pointerEvents: el.visible === false ? 'none' : 'auto',
        opacity: el.visible === false ? 0.3 : 1,
        touchAction: 'none',
        userSelect: 'none',
      }}
      className={`group ${el.locked ? 'cursor-not-allowed' : 'cursor-move'}`}
    >
      {isContainer ? (
        <>
          {/* Fill: passes pointer events through so elements beneath can be clicked */}
          <div
            className="absolute pointer-events-none"
            style={{ inset: containerFrameWidth }}
          >
            <ElementContent el={el} isEditMode={true} />
          </div>
          {/* Hit frame: 8px border ring for selection/drag; center passes through */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ borderRadius: (el.props.borderRadius as string) || '0' }}
          >
            <div
              className="absolute left-0 right-0 h-[8px] top-0 pointer-events-auto cursor-move"
              style={{ background: isSelected ? 'rgba(182,110,65,0.3)' : 'rgba(255,255,255,0.05)' }}
              onPointerDown={handlePointerDownMove}
            />
            <div
              className="absolute left-0 right-0 h-[8px] bottom-0 pointer-events-auto cursor-move"
              style={{ background: isSelected ? 'rgba(182,110,65,0.3)' : 'rgba(255,255,255,0.05)' }}
              onPointerDown={handlePointerDownMove}
            />
            <div
              className="absolute left-0 top-[8px] bottom-[8px] w-[8px] pointer-events-auto cursor-move"
              style={{ background: isSelected ? 'rgba(182,110,65,0.3)' : 'rgba(255,255,255,0.05)' }}
              onPointerDown={handlePointerDownMove}
            />
            <div
              className="absolute right-0 top-[8px] bottom-[8px] w-[8px] pointer-events-auto cursor-move"
              style={{ background: isSelected ? 'rgba(182,110,65,0.3)' : 'rgba(255,255,255,0.05)' }}
              onPointerDown={handlePointerDownMove}
            />
          </div>
        </>
      ) : null}
      {/* Content (non-container) */}
      {!isContainer && (
        isEditingText ? (
          <textarea
            autoFocus
            value={el.props.content as string}
            onChange={(e) => onUpdate({ props: { ...el.props, content: e.target.value } })}
            onBlur={() => setIsEditingText(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsEditingText(false)
              e.stopPropagation() // prevent global shortcuts
            }}
            style={{
              width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', border: 'none', resize: 'none',
              outline: 'none', color: el.props.color as string, fontSize: el.props.fontSize as number,
              fontFamily: el.props.fontFamily as string, fontWeight: el.props.fontWeight as string,
              lineHeight: el.props.lineHeight as number, textAlign: el.props.textAlign as any
            }}
          />
        ) : (
          <ElementContent el={el} isEditMode={true} />
        )
      )}

      {/* Resize & Rotate UI - only if selected and not locked */}
      {isSelected && !el.locked && !isEditingText && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Rotate handle */}
          <div
            className="rotate-handle absolute -top-8 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border border-[var(--messmer-copper)] rounded-full cursor-pointer pointer-events-auto flex items-center justify-center hover:bg-[var(--messmer-copper)] transition-colors"
            onPointerDown={handleRotateDown}
          >
            <div className="w-1 h-3 bg-white opacity-0"></div>
          </div>
          {/* Connector line for rotation */}
          <div className="absolute -top-4 left-1/2 w-px h-4 bg-[var(--messmer-copper)]"></div>

          {/* Scale Handles */}
          {HANDLES.map((h) => {
            const getPos = () => {
              if (h === 'nw') return "top-[-5px] left-[-5px] cursor-nwse-resize"
              if (h === 'n') return "top-[-5px] left-[calc(50%-5px)] cursor-ns-resize"
              if (h === 'ne') return "top-[-5px] right-[-5px] cursor-nesw-resize"
              if (h === 'w') return "top-[calc(50%-5px)] left-[-5px] cursor-ew-resize"
              if (h === 'e') return "top-[calc(50%-5px)] right-[-5px] cursor-ew-resize"
              if (h === 'sw') return "bottom-[-5px] left-[-5px] cursor-nesw-resize"
              if (h === 's') return "bottom-[-5px] left-[calc(50%-5px)] cursor-ns-resize"
              if (h === 'se') return "bottom-[-5px] right-[-5px] cursor-nwse-resize"
              return ""
            }
            return (
              <div
                key={h}
                onPointerDown={(e) => handleResizeDown(e, h)}
                className={`resize-handle absolute w-[10px] h-[10px] bg-white border border-[var(--messmer-copper)] shadow-sm pointer-events-auto ${getPos()}`}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function CanvasGuides({ width: gw, height: gh }: { width: number; height: number }) {
  const positions = {
    v: [gw / 2] as number[],
    h: [gh / 2] as number[],
  }
  return (
    <div className="absolute inset-0 z-[100] pointer-events-none">
      {positions.v.map((x) => (
        <div
          key={`v-${x}`}
          className="absolute top-0 bottom-0 w-px bg-[var(--messmer-copper)]/40 border-l border-dashed border-[var(--messmer-copper)]/60"
          style={{ left: x, transform: 'translateX(-50%)' }}
        />
      ))}
      {positions.h.map((y) => (
        <div
          key={`h-${y}`}
          className="absolute left-0 right-0 h-px bg-[var(--messmer-copper)]/40 border-t border-dashed border-[var(--messmer-copper)]/60"
          style={{ top: y, transform: 'translateY(-50%)' }}
        />
      ))}
    </div>
  )
}

function StaticNode({ el, layout }: { el: PageElement; layout?: PageLayout }) {
  if (el.visible === false) return null
  const isContainer = el.type === 'div'
  const isContainerWithTilt = isContainer && !!(el.props.mouseTilt as boolean)
  const pinned = layout?.elements.filter((e) => e.pinnedTo === el.id) ?? []

  if (isContainer && pinned.length > 0) {
    return isContainerWithTilt
      ? <StaticContainerWithTiltAndPinned container={el} pinned={pinned} />
      : <StaticContainerWithPinned container={el} pinned={pinned} />
  }

  return (
    <div
      data-element-id={el.id}
      data-element-type={el.type}
      style={{
        position: 'absolute',
        left: el.x,
        top: el.y,
        width: el.width,
        height: el.height,
        transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
        zIndex: el.zIndex,
        opacity: (el.props.opacity as number) ?? 1,
      }}
    >
      <ElementContent el={el} isEditMode={false} />
    </div>
  )
}

/** Simple container that renders its pinned children (no tilt). Used for main content area. */
function StaticContainerWithPinned({ container, pinned }: { container: PageElement; pinned: PageElement[] }) {
  const innerStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backgroundColor: (container.props.backgroundColor as string) ?? 'transparent',
    background: (container.props.background as string) || undefined,
    backgroundImage: (container.props.backgroundImage as string) ? `url(${container.props.backgroundImage})` : undefined,
    backgroundSize: (container.props.backgroundSize as string) ?? 'cover',
    backgroundPosition: (container.props.backgroundPosition as string) ?? 'center',
    borderRadius: (container.props.borderRadius as string) ?? '0',
    border: (container.props.border as string) ?? undefined,
    boxShadow: (container.props.boxShadow as string) ?? undefined,
    backdropFilter: (container.props.backdropFilter as string) ?? undefined,
    WebkitBackdropFilter: (container.props.backdropFilter as string) ?? undefined,
    opacity: (container.props.opacity as number) ?? 1,
  }
  return (
    <div
      data-element-id={container.id}
      data-element-type="div"
      style={{
        position: 'absolute',
        left: container.x,
        top: container.y,
        width: container.width,
        height: container.height,
        zIndex: container.zIndex,
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div style={innerStyle} />
        {pinned.map((child) => (
          <div
            key={child.id}
            data-element-id={child.id}
            data-element-type={child.type}
            style={{
              position: 'absolute',
              left: child.x,
              top: child.y,
              width: child.width,
              height: child.height,
              transform: child.rotation ? `rotate(${child.rotation}deg)` : undefined,
              zIndex: child.zIndex,
              opacity: (child.props.opacity as number) ?? 1,
            }}
          >
            <ElementContent el={child} isEditMode={false} />
          </div>
        ))}
      </div>
    </div>
  )
}

function StaticContainerWithTiltAndPinned({ container, pinned }: { container: PageElement; pinned: PageElement[] }) {
  const bf = (container.props.backdropFilter as string) ?? ''
  const bg = (container.props.backgroundColor as string) ?? 'transparent'
  const isOpaque = !bg || bg === 'transparent' || bg === 'rgba(0,0,0,0)' || /^#[0-9a-fA-F]{6}$/.test(bg) || /^#[0-9a-fA-F]{8}$/.test(bg)
  const effectiveBg = bf && isOpaque ? 'rgba(255,255,255,0.08)' : bg
  const innerStyle: React.CSSProperties = {
    position: 'absolute', inset: 0,
    backgroundColor: effectiveBg,
    background: (container.props.background as string) ?? undefined,
    backgroundImage: (container.props.backgroundImage as string) ? `url(${container.props.backgroundImage})` : undefined,
    backgroundSize: (container.props.backgroundSize as string) ?? 'cover',
    backgroundPosition: (container.props.backgroundPosition as string) ?? 'center',
    borderRadius: (container.props.borderRadius as string) ?? '0',
    border: (container.props.border as string) ?? undefined,
    boxShadow: (container.props.boxShadow as string) ?? undefined,
    backdropFilter: bf || undefined,
    WebkitBackdropFilter: bf || undefined,
    opacity: (container.props.opacity as number) ?? 1,
    ...(bf ? { isolation: 'isolate' as const, transform: 'translateZ(0)' } : {}),
  }
  const intensity = (container.props.tiltIntensity as number) ?? 12
  return (
    <div
      data-element-id={container.id}
      data-element-type="div"
      style={{
        position: 'absolute',
        left: container.x,
        top: container.y,
        width: container.width,
        height: container.height,
        zIndex: container.zIndex,
      }}
    >
      <TiltContainer intensity={intensity}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div style={innerStyle} />
          {pinned.map((child) => (
            <div
              key={child.id}
              data-element-id={child.id}
              data-element-type={child.type}
              style={{
                position: 'absolute',
                left: child.x,
                top: child.y,
                width: child.width,
                height: child.height,
                transform: child.rotation ? `rotate(${child.rotation}deg)` : undefined,
                zIndex: child.zIndex,
                opacity: (child.props.opacity as number) ?? 1,
              }}
            >
              <ElementContent el={child} isEditMode={false} />
            </div>
          ))}
        </div>
      </TiltContainer>
    </div>
  )
}

export default function BioCanvas({
  layout,
  selectedId,
  onSelect,
  onUpdateElement,
  scale = 1,
  isEditMode = true,
  showGuides = false,
}: {
  layout: PageLayout
  selectedId?: string | null
  onSelect?: (id: string | null) => void
  onUpdateElement?: (id: string, updates: Partial<PageElement>) => void
  scale?: number
  isEditMode?: boolean
  showGuides?: boolean
}) {
  const c = layout.canvas

  const bgStyle: React.CSSProperties = c.backgroundType === 'gradient'
    ? { backgroundImage: c.backgroundGradient }
    : c.backgroundType === 'image' && c.backgroundImage
      ? {
          backgroundImage: `url(${c.backgroundImage})`,
          backgroundSize: c.backgroundImageSize || 'cover',
          backgroundPosition: c.backgroundImagePosition || 'center',
        }
      : { backgroundColor: c.backgroundColor || '#0a0908' }

  return (
    <div
      className={`relative ${isEditMode ? 'shadow-2xl rounded-sm ring-1 ring-white/10' : ''}`}
      style={{
        width: c.width,
        height: c.height,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        isolation: 'isolate',
        overflow: 'hidden',
      }}
      onPointerDown={isEditMode ? (e) => {
        if (e.target === e.currentTarget && onSelect) onSelect(null)
      } : undefined}
    >
      {/* Background layer */}
      <div
        className="absolute inset-0 z-0"
        style={{
          ...bgStyle,
          filter: c.backgroundBlur ? `blur(${c.backgroundBlur}px)` : undefined,
        }}
      />
      {c.backgroundType === 'video' && c.backgroundVideo && (
        <video
          autoPlay
          loop
          muted={c.backgroundVideoMuted !== false}
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-[1]"
          src={c.backgroundVideo}
        />
      )}
      {c.customCss && <style dangerouslySetInnerHTML={{ __html: c.customCss }} />}
      {showGuides && isEditMode && <CanvasGuides width={c.width} height={c.height} />}
      <div className="relative z-10 w-full h-full" style={{ isolation: 'isolate' }}>
      {layout.elements.map((el) =>
        isEditMode ? (
          <InteractiveNode
            key={el.id}
            el={el}
            layout={layout}
            isSelected={selectedId === el.id}
            onSelect={() => onSelect?.(el.id)}
            onUpdate={(updates) => onUpdateElement?.(el.id, updates)}
            scale={scale}
            canvasW={c.width}
            canvasH={c.height}
            otherElements={layout.elements
              .filter((e) => e.id !== el.id)
              .map((e) => {
                const { x, y } = getEffectivePosition(e, layout)
                return { x, y, width: e.width, height: e.height, type: e.type }
              })}
          />
        ) : el.pinnedTo ? null : (
          <StaticNode key={el.id} el={el} layout={layout} />
        )
      )}
      </div>
    </div>
  )
}
