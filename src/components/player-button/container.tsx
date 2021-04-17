import { RootState } from '@/store'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import PlayerButtonComponent from './component'

import { MusicPlayerState } from '@/@types/state'
import * as ui from '@/store/ui/actions'

const PlayerButtonContainer = () => {
  const dispatch = useDispatch()

  const playing = useSelector((state: RootState) => state.playing)
  const showPlayer = useSelector((state: RootState) => state.ui.player.show)

  const clickHandler = () => {
    dispatch(ui.showPlayer(true))
  }

  const progressListener = () => {
    return playing.instance!.progress
  }

  return (
    <PlayerButtonComponent
      show={!showPlayer}
      music={playing.queue[playing.pointer]}
      progress={progressListener}
      state={playing.state.player}
      onClick={clickHandler}
    ></PlayerButtonComponent>
  )
}

export default PlayerButtonContainer
