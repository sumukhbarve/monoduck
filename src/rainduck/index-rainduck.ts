import { _ } from './indeps-rainduck'
import { interpolate, html, tapHtml, component } from './rainHtml'
import {
  emitDataOnAttr, onClick, onChange, onSubmit, onInput, onKeyUp
} from './rainEvent'
import { render } from './rainRender'

export type { TappableHtml, FC } from './rainHtml'

// TODO: FC work on

export const rainduck = {
  // rainHtml:
  escape: _.escape,
  interpolate,
  html,
  tapHtml,
  tap: tapHtml, // alias
  component,
  // rainEvent:
  onEvent: emitDataOnAttr,
  onClick,
  onChange,
  onSubmit,
  onInput,
  onKeyUp,
  // rainRender:
  render
}
