import { defineStore } from 'pinia'
import type { Track } from '~/types/catalog'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    current: null as Track | null,
    playlist: [] as Track[],
    playing: false,
  }),
  actions: {
    setTrack(track: Track, playlist: Track[] = []) {
      if (this.current?.id === track.id) {
        this.playing = !this.playing
        return
      }
      this.current = track
      this.playlist = playlist.length ? playlist : [track]
      this.playing = true
    },
    toggle() {
      if (this.current) this.playing = !this.playing
    },
    pause() {
      this.playing = false
    },
    next() {
      if (!this.current || !this.playlist.length) return
      const i = this.playlist.findIndex((t) => t.id === this.current!.id)
      const n = this.playlist[i + 1]
      if (n) {
        this.current = n
        this.playing = true
      } else {
        this.playing = false
      }
    },
    prev() {
      if (!this.current || !this.playlist.length) return
      const i = this.playlist.findIndex((t) => t.id === this.current!.id)
      const p = this.playlist[i - 1]
      if (p) {
        this.current = p
        this.playing = true
      }
    },
    close() {
      this.current = null
      this.playlist = []
      this.playing = false
    },
  },
})
