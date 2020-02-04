class LLCTPlaylist {
  constructor (title, readOnly) {
    this.pointer = null
    this.lists = []
    this.title = title
    this.readOnly = readOnly || false

    this.nextFunc = () => {}
    this.prevFunc = () => {}
  }

  add (item) {
    this.lists.push(item)
  }
}

window.addEventListener('playlistReceive', ev => {
  if (!ev.detail || !ev.detail.lists) {
    return false
  }

  window.playlists =
    JSON.parse(localStorage.getItem('LLCTPlaylist') || '[]') || []

  let listsLen = ev.detail.lists.length
  for (var i = 0; i < listsLen; i++) {
    let list = ev.detail.lists[i]

    let pl = new LLCTPlaylist(list.Title, true)

    window.playlists.push(pl)
  }
})
