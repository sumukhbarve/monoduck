import { lookduck } from './indeps-frontonly'

const store = {
  f: lookduck.observable('john'),
  l: lookduck.observable('doe'),
  fl: lookduck.computed((): string => store.f.get() + ' ' + store.l.get()),
  lf: lookduck.computed((): string => store.l.get() + ' ' + store.f.get()),
  fllf: lookduck.computed((): string => store.fl.get() + ' ' + store.lf.get())
}

export { store as nameStore }
