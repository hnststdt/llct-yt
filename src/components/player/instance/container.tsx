import LLCTNativeAudio from '@/core/audio_stack/native'
import { RootState } from '@/store'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import * as player from '@/store/player/actions'
import { MusicPlayerState, PlayerLoadState } from '@/@types/state'
import LLCTAdvancedAudio from '@/core/audio_stack/advanced'
import LLCTSpotifyAudio from '@/core/audio_stack/spotify'
import LLCTYoutubeAudio from '@/core/audio_stack/youtube'

const PlayerInstanceContainer = () => {
  const dispatch = useDispatch()
  const instance = useSelector((state: RootState) => state.playing.instance)
  const useSpotify = useSelector((state: RootState) => state.spotify.use)
  const spotifySession = useSelector(
    (state: RootState) => state.spotify.session
  )
  const useYoutube = useSelector(
    (state: RootState) => state.settings.integrateYoutube.value as boolean
  )
  const audioAvailable = useSelector(
    (state: RootState) => state.playing.audioAvailable
  )
  const audioStack = useSelector(
    (state: RootState) => state.settings.audioStack.value
  )
  const playing = useSelector((state: RootState) => state.playing)

  useEffect(() => {
    if (instance) {
      instance.events.on(
        'end',
        () => {
          const end = playing.pointer >= playing.queue.length - 1

          if (playing.playlist && end) {
            dispatch(player.playPlaylist(null, ++playing.playlistPointer))

            requestAnimationFrame(() => {
              instance.play()
            })

            return
          }

          if (playing.pointer !== -1 && !end) {
            dispatch(player.play(null, ++playing.pointer))

            requestAnimationFrame(() => {
              instance.play()
            })

            return
          }

          dispatch(player.setPlayState(MusicPlayerState.Stopped))
        },
        'end'
      )

      return
    }

    const localInstance = useSpotify
      ? new LLCTSpotifyAudio(spotifySession)
      : useYoutube
      ? new LLCTYoutubeAudio()
      : audioStack === 'native'
      ? new LLCTNativeAudio()
      : new LLCTAdvancedAudio()

    localInstance.events.on('play', () =>
      dispatch(player.setPlayState(MusicPlayerState.Playing))
    )

    localInstance.events.on('pause', () =>
      dispatch(player.setPlayState(MusicPlayerState.Paused))
    )

    localInstance.events.on('metadata', () => {
      dispatch(player.setLoadState(PlayerLoadState.LoadedMetadata))
    })

    localInstance.events.on('load', () => {
      dispatch(player.setLoadState(PlayerLoadState.Done))
    })

    localInstance.events.on('requestPreviousTrack', () => {
      dispatch(player.skip(-1))

      requestAnimationFrame(() => {
        localInstance.play()
      })
    })

    localInstance.events.on('requestNextTrack', () => {
      if (
        playing.mode === 'queue' &&
        playing.pointer === playing.queue.length - 1 &&
        playing.playlist
      ) {
        dispatch(player.playPlaylist(null, playing.playlistPointer))

        return
      }

      dispatch(player.skip(1))

      requestAnimationFrame(() => {
        localInstance.play()
      })
    })

    dispatch(player.setInstance(localInstance))

    return () => {
      // ;(instance || localInstance).events.off('end', 'end')
    }
  }, [instance, playing])

  // HACK
  /*
  useEffect(() => {
    if (instance && instance.type !== audioStack) {
      instance.stop()

      let inst

      if (useSpotify) {
        inst = new LLCTSpotifyAudio(spotifySession)
      } else if (useYoutube) {
        inst = new LLCTYoutubeAudio()
      } else if (audioStack === 'native') {
        inst = new LLCTNativeAudio()
      } else if (audioStack === 'advanced') {
        inst = new LLCTAdvancedAudio()
      } else {
        throw new Error('??? why audioStack is not defined??????')
      }

      dispatch(player.setInstance(inst))
    }
  }, [audioStack, audioAvailable, useSpotify, useYoutube])
  */

  useEffect(() => {
    if (!instance || !instance.updateMetadata) {
      return
    }

    const play = playing.queue[playing.pointer]

    if (!play) {
      return
    }

    instance.updateMetadata(play.title, play.artist as string, play.image)
  }, [instance, playing.pointer])

  useEffect(() => {
    if (!instance || !instance.updateMetadata) {
      return
    }

    const play = playing.playlist?.items[playing.playlistPointer]

    if (!play) {
      return
    }

    instance.updateMetadata(play.title, play.artist as string, play.image)
  }, [instance, playing.playlist, playing.playlistPointer])

  return null
}

export default PlayerInstanceContainer
