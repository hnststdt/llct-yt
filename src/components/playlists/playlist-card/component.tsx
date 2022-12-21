import RoundyButtonComponent from '@/components/controls/roundy-button/component'
import MusicCardContainer from '@/components/music-card/container'
import '@/styles/components/playlists/playlist-card.scss'
import playlistUtils from '@/utils/playlists'
import { concatClass } from '@/utils/react'
import { songsDuration } from '@/utils/songs'
import { ReactNode } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { emptyCover } from '@/utils/cover'

import {
  SortableContainer,
  SortableElement,
  SortStartHandler,
  SortEndHandler,
} from 'react-sortable-hoc'

interface PlaylistCardComponentProps {
  item?: MusicPlaylist
  skeleton?: boolean
  editMode?: boolean
  editable?: boolean
  foldable?: boolean
  folded?: boolean
  onFoldStateChange?: () => void
  onEditStateChange?: () => void
  onDeleteClick?: () => void
  onValueChange?: (field: keyof MusicPlaylistBase, value: string) => void
  onItemAddClick?: () => void
  onItemRemoveClick?: (index: number) => void
  onItemMove?: (items: MusicMetadataWithID[]) => void
  onPlayClick?: () => void
}

interface PlaylistCardImageGroupProps {
  items: MusicMetadataWithID[]
}

const MAX_IMAGE_DISPLAY = 3

const PlaylistCardImageGroup = ({ items }: PlaylistCardImageGroupProps) => {
  const useAlbumCover = useSelector(
    (state: RootState) => state.settings.useAlbumCover.value
  )
  return (
    <div className='llct-playlist-image-group'>
      {items.slice(0, MAX_IMAGE_DISPLAY).map((v, i) => (
        <img key={v.id + i} src={useAlbumCover ? v.image : emptyCover} style={{ zIndex: 1000 - i }}></img>
      ))}
      <span className='text'>
        {items.length > MAX_IMAGE_DISPLAY &&
          `+${items.length - MAX_IMAGE_DISPLAY}`}
      </span>
    </div>
  )
}

const validateClickEvent = (ev: React.MouseEvent<HTMLDivElement>) => {
  return (
    (ev.target as HTMLElement).getAttribute('role') !== 'button' &&
    (ev.target as HTMLElement).tagName !== 'svg' &&
    (ev.target as HTMLElement).tagName !== 'path' &&
    (ev.target as HTMLElement).tagName !== 'INPUT'
  )
}

const EditIcon = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    width='24'
    height='24'
  >
    <path fill='none' d='M0 0h24v24H0z' />
    <path d='M12.9 6.858l4.242 4.243L7.242 21H3v-4.243l9.9-9.9zm1.414-1.414l2.121-2.122a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414l-2.122 2.121-4.242-4.242z' />
  </svg>
)

const DeleteIcon = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    width='24'
    height='24'
  >
    <path fill='none' d='M0 0h24v24H0z' />
    <path d='M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3zm-8 5v6h2v-6H9zm4 0v6h2v-6h-2zM9 4v2h6V4H9z' />
  </svg>
)

const ExportIcon = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    width='24'
    height='24'
  >
    <path fill='none' d='M0 0h24v24H0z' />
    <path d='M3 19h18v2H3v-2zm10-5.828L19.071 7.1l1.414 1.414L12 17 3.515 8.515 4.929 7.1 11 13.17V2h2v11.172z' />
  </svg>
)

const PlusIcon = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    width='24'
    height='24'
  >
    <path fill='none' d='M0 0h24v24H0z' />
    <path d='M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z' />
  </svg>
)

const PlayIcon = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    width='24'
    height='24'
  >
    <path fill='none' d='M0 0h24v24H0z' />
    <path d='M19.376 12.416L8.777 19.482A.5.5 0 0 1 8 19.066V4.934a.5.5 0 0 1 .777-.416l10.599 7.066a.5.5 0 0 1 0 .832z' />
  </svg>
)

const printExport = (item: MusicPlaylist) => {
  const str = playlistUtils.exportPlaylist(playlistUtils.idify(item))

  if ('share' in navigator) {
    navigator.share({
      text: str,
    })

    return
  }

  prompt(
    '아래 문자를 복사하고 다른 기기에서 플레이리스트 불러오기 버튼을 눌러 플레이리스트를 복사할 수 있습니다.',
    str
  )
}

const SortableItem = SortableElement(
  ({
    v,
    onItemClick,
  }: {
    v: MusicMetadataWithID
    onItemClick?: (id: string) => void
  }) => (
    <MusicCardContainer
      key={`music-metadata-${v.id}`}
      music={v}
      id={v.id}
      onClick={onItemClick}
    ></MusicCardContainer>
  )
)

const SortableMusicCards = SortableContainer(
  ({
    items,
    children,
    onItemClick,
  }: {
    items: MusicMetadataWithID[]
    children: ReactNode
    onItemClick?: (index: number) => void
  }) => {
    return (
      <div className='card-lists'>
        {items.map((value, index) => (
          <SortableItem
            key={`item-${value.id}-${index}`}
            index={index}
            onItemClick={() => onItemClick && onItemClick(index)}
            v={value}
          />
        ))}
        {children}
      </div>
    )
  }
)

type arrayMoveTypes = <T>(array: T[], from: number, to: number) => T[]
const arrayMove: arrayMoveTypes = (array, from, to) => {
  array = array.slice()
  array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0])

  return array
}

const traversal = (
  element: HTMLElement,
  className: string
): HTMLElement | null =>
  element.classList.contains(className)
    ? element
    : element.parentElement
    ? traversal(element.parentElement, className)
    : null

const SortableMusicLists = ({
  items,
  children,
  onItemMove,
  onItemClick,
}: {
  items: MusicMetadataWithID[]
  children?: ReactNode
  onItemMove?: (items: MusicMetadataWithID[]) => void
  onItemClick?: (index: number) => void
}) => {
  const sortStart: SortStartHandler = (_, event) => {
    traversal(event.target as HTMLElement, 'card-lists')?.classList.add(
      'sort-ongoing'
    )
  }

  const sortEnd = (
    {
      oldIndex,
      newIndex,
    }: {
      oldIndex: number
      newIndex: number
    },
    event: Parameters<SortEndHandler>[1]
  ) => {
    onItemMove && onItemMove(arrayMove(items, oldIndex, newIndex))

    requestAnimationFrame(() => {
      traversal(event.target as HTMLElement, 'card-lists')?.classList.remove(
        'sort-ongoing'
      )
    })
  }

  return (
    <SortableMusicCards
      items={items}
      onSortStart={sortStart}
      onSortEnd={sortEnd}
      pressDelay={100}
      onItemClick={onItemClick}
      axis='xy'
    >
      {children}
    </SortableMusicCards>
  )
}

const InputData = ({
  name,
  value = '',
  onChange,
}: {
  name: keyof MusicPlaylistBase
  value?: string
  onChange?: (field: keyof MusicPlaylistBase, value: string) => void
}) => {
  const [state, setState] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange && onChange(name, state)
    }, 300)

    return () => {
      clearTimeout(timeout)
    }
  }, [state])

  useEffect(() => {
    setState(value)
  }, [value])

  return (
    <input
      type='text'
      value={state}
      onChange={ev => setState(ev.target.value)}
    ></input>
  )
}

export const PlaylistCardComponent = ({
  item,
  skeleton = false,
  editMode = false,
  editable = true,
  folded = true,
  foldable = true,
  onFoldStateChange,
  onEditStateChange,
  onDeleteClick,
  onValueChange,
  onItemAddClick,
  onItemRemoveClick,
  onItemMove,
  onPlayClick,
}: PlaylistCardComponentProps) => {
  if (skeleton || !item) {
    return <div className='llct-playlist-card skeleton'></div>
  }

  const plusComponent = (
    <div className='empty-wrapper'>
      <RoundyButtonComponent onClick={() => onItemAddClick && onItemAddClick()}>
        {PlusIcon}
      </RoundyButtonComponent>
    </div>
  )

  return (
    <div
      className='llct-playlist-card'
      data-folded={folded}
      data-edit={editMode}
    >
      <div
        className='summary'
        onClick={ev =>
          foldable &&
          validateClickEvent(ev) &&
          onFoldStateChange &&
          onFoldStateChange()
        }
      >
        <div className='brief-summary'>
          <h3 className='title'>
            {editMode ? (
              <InputData
                name={'title'}
                value={item.title}
                onChange={onValueChange}
              ></InputData>
            ) : (
              item.title
            )}
          </h3>
          <span className='description'>
            {editMode ? (
              <InputData
                name={'description'}
                value={item.description}
                onChange={onValueChange}
              ></InputData>
            ) : (
              item.description
            )}
          </span>
        </div>
        <div className='rich-summary'>
          <div className='section length'>
            <span>총 {(songsDuration(item.items) / 60).toFixed(1)}분</span>
          </div>

          {(folded && (
            <div className='section musics'>
              <PlaylistCardImageGroup
                items={item.items}
              ></PlaylistCardImageGroup>
            </div>
          )) ||
            (editable && (
              <>
                {
                  <div
                    className='section button'
                    onClick={() => onEditStateChange && onEditStateChange()}
                  >
                    <span>{EditIcon}</span>
                  </div>
                }
                <div
                  className='section button'
                  onClick={() => onDeleteClick && onDeleteClick()}
                >
                  <span>{DeleteIcon}</span>
                </div>
                <div
                  className='section button'
                  onClick={() => printExport(item)}
                >
                  <span>{ExportIcon}</span>
                </div>
              </>
            ))}
          {
            <div
              className='section button'
              onClick={() => onPlayClick && onPlayClick()}
            >
              <RoundyButtonComponent>{PlayIcon}</RoundyButtonComponent>
            </div>
          }
        </div>
      </div>
      <div className={concatClass('contents', !folded && 'show')}>
        {editMode ? (
          <SortableMusicLists
            items={item.items}
            onItemClick={item => onItemRemoveClick && onItemRemoveClick(item)}
            onItemMove={items => onItemMove && onItemMove(items)}
          >
            {editable && plusComponent}
          </SortableMusicLists>
        ) : (
          <div className='card-lists'>
            {item.items.map((v, i) => (
              <MusicCardContainer
                key={`${i}-${v.id}`}
                music={v}
                id={v.id}
              ></MusicCardContainer>
            ))}
            {editable && plusComponent}
          </div>
        )}
      </div>
    </div>
  )
}

export default PlaylistCardComponent
