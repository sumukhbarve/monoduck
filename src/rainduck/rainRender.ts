import { _, lookduck } from './indeps-rainduck'
import type { TappableHtml } from './rainHtml'
import { tapHtml } from './rainHtml'
import { autoAttachListeners, flushListeners } from './rainEvent'

interface CapturedFocus {
  focusedId: string
  selectionStart: number
  selectionEnd: number
}

const captureFocus = function (): CapturedFocus | undefined {
  const focusedId = document.activeElement?.id
  if (!_.bool(focusedId)) { return undefined }
  const el = document.getElementById(focusedId)
  if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
    return undefined
  }
  const { selectionStart, selectionEnd } = el
  if (selectionStart === null || selectionEnd === null) { return undefined }
  return { focusedId, selectionStart, selectionEnd }
}

const restoreFocus = function (captured?: CapturedFocus): void {
  if (_.not(captured)) { return undefined }
  const el = document.getElementById(captured.focusedId)
  if (_.not(el)) { return undefined }
  el.focus()
  if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
    return undefined
  }
  el.setSelectionRange(captured.selectionStart, captured.selectionEnd)
}

export const render = function (
  appComponent: () => TappableHtml,
  rootElement: Element
): void {
  const computeHtml = (): string => tapHtml(appComponent())
  const renderCycle = function (): void {
    console.log('RENDERING ...')
    const capturedFocus = captureFocus()
    // Before running computeHtml(), we flush all events
    // This way, all old html` ... ${onClick(() => foo())} ...` are flushed out
    flushListeners()
    rootElement.innerHTML = computeHtml()
    autoAttachListeners(rootElement)
    restoreFocus(capturedFocus)
  }
  // A lookduck.computed() is used _only_ to set up the subscription
  lookduck.computed(computeHtml).subscribe(renderCycle)
  // Along with the 1st render cycle, we set up event listerns on rootElement
  // _.each(_.values(eventRegistryBox), evtReg => evtReg.bindRoot(rootElement))
  renderCycle() // 1st render cycle
}
