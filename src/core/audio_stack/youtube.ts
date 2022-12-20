import eventBus from "@/core/eventbus"

import { LLCTAudioStack, LLCTExternalMetadata } from "@/@types/audio"
import { LLCTAudioStackEventMap } from "@/@types/audio"
import YouTube, { YouTubePlayer, YouTubeEvent } from "react-youtube"

export default class LLCTYoutubeAudio implements LLCTAudioStack {
  src?: string
  player?: YouTubePlayer
  supportEffects = false

  notSiteSong = false
  type = "youtube"
  events = new eventBus<LLCTAudioStackEventMap>()

  external = true

  destroy() { }

  setPlayer = (player: YouTubePlayer) => {
    this.player = player
    this.player?.loadVideoById(this.src, 0, "small")
  }

  updateState = (event: YouTubeEvent) => {
    if (event.data === YouTube.PlayerState.PLAYING) {
      this.events.runAll("play")
    } else if (event.data === YouTube.PlayerState.PAUSED) {
      this.events.runAll("pause")
    } else if (event.data === YouTube.PlayerState.ENDED) {
      this.events.runAll("end")
    } else if (event.data === YouTube.PlayerState.CUED) {
      this.events.runAll("metadata")
      this.events.runAll("load")
    }
  }

  play = () => this.player?.playVideo()
  pause = () => this.player?.pauseVideo()
  stop = () => this.player?.stopVideo()
  load = (src: string) => {
    this.src = src
    this.player?.loadVideoById(src, 0, "small")
  }

  get volume() {
    return this.player?.getVolume() / 100
  }
  set volume(vol: number) {
    this.player?.setVolume(vol * 100)
  }

  get current() {
    return this.player?.getCurrentTime()
  }
  set current(seek: number) {
    this.player.seekTo(seek, true)
  }

  get duration() {
    return this.player?.getDuration()
  }

  get progress() {
    return this.current / this.duration
  }
  set progress(seek: number) {
    this.current = (this.duration || 1) * seek
  }

  get timecode() {
    return ~~(this.current * 100)
  }

  get speed() {
    return this.player?.getPlaybackRate()
  }
  set speed(speed: number) {
    this.player.setPlaybackRate(speed)
  }
}