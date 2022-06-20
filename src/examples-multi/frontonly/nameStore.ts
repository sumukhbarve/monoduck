import { lookduck } from './indeps-frontonly'

export const f = lookduck.observable('john')
export const l = lookduck.observable('doe')
export const fl = lookduck.computed(() => f.get() + ' ' + l.get())
export const lf = lookduck.computed(() => l.get() + ' ' + f.get())
export const fllf = lookduck.computed(() => fl.get() + ' ' + lf.get())

// const ONE = 1;
