import type { TappableHtml } from './rainHtml'
import { _ } from './indeps-rainduck'
import { html } from './rainHtml'

type Listener<E extends Event> = (event: E) => void

const SEP = '|'
const DATA_RAINDUCK_ON = 'data-rainduck-on'

// Internal Two-Way Maps:
// ----------------------

const idCbMap: Map<string, Listener<Event>> = new Map()
const cbIdMap: Map<Listener<Event>, string> = new Map()

// Externally exported event-handlering helpers:
// --------------------------------------------

const emitDataOnAttr = function<E extends Event = Event> (
  eventName: string, listener: Listener<E>
): TappableHtml {
  const cb = listener as Listener<Event>
  _.assert(idCbMap.size === cbIdMap.size, 'assert both maps have same size')
  _.assert(_.not(eventName.includes(SEP)), 'assert eventName excludes SEP')
  if (_.not(cbIdMap.has(cb))) {
    const id = `${eventName}${SEP}${idCbMap.size + 1}`
    _.assert(id === _.escape(id), 'assert id is invariable under _.escape')
    idCbMap.set(id, cb)
    cbIdMap.set(cb, id)
  }
  return html`${DATA_RAINDUCK_ON}=${cbIdMap.get(cb)}`
}

const autoAttachListeners = function (rootEl: Element): void {
  rootEl.querySelectorAll(`[${DATA_RAINDUCK_ON}]`).forEach(function (el) {
    if (!(el instanceof HTMLElement)) { return undefined }
    const id = el.getAttribute(DATA_RAINDUCK_ON)
    if (_.not(id)) { return undefined }
    const eventName = id.split(SEP)[0]
    if (_.not(eventName)) { return undefined }
    const cb = idCbMap.get(id)
    if (_.not(cb)) { return undefined }
    el.addEventListener(eventName, cb)
  })
}

const flushListeners = function (): void {
  idCbMap.clear()
  cbIdMap.clear()
}

// Strongly typed helpers:
// ----------------------

// document.addEventListener('click', (evt) => {}), // infers evt: MouseEvent
const onClick = function (listener: Listener<MouseEvent>): TappableHtml {
  return emitDataOnAttr('click', listener)
}

// document.addEventListener('change', (evt) => {}), // infers evt: Event
const onChange = function (listener: Listener<Event>): TappableHtml {
  return emitDataOnAttr('change', listener)
}

// document.addEventListener('submit', (evt) => {}), // infers evt: SubmitEvent
const onSubmit = function (listener: Listener<SubmitEvent>): TappableHtml {
  return emitDataOnAttr('submit', listener)
}

// document.addEventListener('input', (evt) => {}), // infers evt: Event
const onInput = function (listener: Listener<SubmitEvent>): TappableHtml {
  return emitDataOnAttr('input', listener)
}

// document.addEventListener('keyup', (evt) => {}), // infers evt: KeyboardEvent
const onKeyUp = function (listener: Listener<KeyboardEvent>): TappableHtml {
  return emitDataOnAttr('keyup', listener)
}

// TODO: Add more strongly typed helpers.

export type { Listener }
export {
  emitDataOnAttr, autoAttachListeners, flushListeners,
  onClick, onChange, onSubmit, onInput, onKeyUp
}
