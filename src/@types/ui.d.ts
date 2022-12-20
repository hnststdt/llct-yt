interface LLCTTab {
  name: string
  page?: string
}

interface Settings {
  useDarkMode: boolean
  useTranslatedTitle: boolean
  usePlayerColorScheme: boolean
  matchSystemAppearance: boolean
  integrateSpotify: void
  integrateYoutube: boolean
  useAutoScroll: boolean
  useLyrics: boolean
  useAlbumCover: boolean
  audioStack: 'native' | 'advanced'
  useServiceWorker: boolean
}

interface SettingsLists {
  name: string
  id: string
}

interface ListsDropboxItems {
  name: string
  id: string
}

interface LLCTSetting<T> {
  name: string
  description: string
  default: T
  value: T
  hidden?: boolean
  enable?: (
    state: Record<keyof Settings, LLCTSetting<Settings[keyof Settings]>>
  ) => boolean
  disabled?: boolean
  type: 'checkbox' | 'lists' | 'text' | 'no-control' | 'button'
  buttonText?: string
  lists?: SettingsLists[]
  onChange?: (value: T) => void
  onInitial?: (value: T) => void
}

interface SettingsReducerAction {
  type: string
  data: Settings[keyof Settings]
  name: keyof Settings
}

interface UIReducerAction {
  type: string
  data: unknown
}

interface LLCTPlayerRelatedComponentProps {
  showPlayer: boolean
}

interface LLCTTabProps {
  show: boolean
}

interface SliderColor {
  background?: string | null
  track?: string | null
  thumb?: string | null
  backgroundDark?: string | null
  trackDark?: string | null
  thumbDark?: string | null
}
