import type { Observable } from './observable'
import { observable } from './observable'
import { _ } from './indeps-lookduck'

interface Idful { id: string | number }
// Note: Even if `T` has a numeric `id`, IdMap<T> always uses string keys.
type IdMap<T extends Idful> = Record<string, T>

const arrToIdMap = function <T extends Idful>(
  objList: T[]
): IdMap<T> {
  const objMap: IdMap<T> = {}
  _.each(objList, obj => { objMap[String(obj.id)] = obj })
  return objMap
}

interface ObservableIdMap<T extends Idful> extends Observable<IdMap<T>> {
  getById: (id: T['id']) => T | undefined
  updateObjects: (objs: T[]) => void
  popByIds: (ids: Array<T['id']>) => void
}
const observableIdMap = function <T extends Idful>(
  init: IdMap<T> | T[] = {}
): ObservableIdMap<T> {
  const initObjMap: IdMap<T> = _.arrayIs(init) ? arrToIdMap(init) : init
  const liveObjMap = observable(initObjMap)

  const getById = function (id: T['id']): T | undefined {
    const objMap = liveObjMap.get()
    return objMap[String(id)] // convert number ids to string for keying
  }

  const updateObjects = function (newObjs: T[]): void {
    const oldObjMap = liveObjMap.get()
    let changeDetected = false
    const objChangeMap: IdMap<T> = {}
    _.each(newObjs, function (newObj) {
      const oldObj = oldObjMap[String(newObj.id)]
      if (changeDetected || !_.deepEquals(oldObj, newObj)) {
        changeDetected = true
        objChangeMap[String(newObj.id)] = newObj
      }
    })
    if (changeDetected) {
      liveObjMap.set({ ...oldObjMap, ...objChangeMap })
    }
  }

  const popByIds = function (ids: Array<T['id']>): void {
    const idsToDelSet = new Set<string>(_.map(ids, String))
    const oldObjMap = liveObjMap.get()
    const newObjMap: IdMap<T> = {}
    let deleteDetected = false
    _.each(Object.entries(oldObjMap), function ([id, obj]) {
      if (idsToDelSet.has(String(id))) {
        deleteDetected = true
      } else {
        newObjMap[id] = obj
      }
    })
    if (deleteDetected) {
      liveObjMap.set(newObjMap)
    }
  }

  // Compose and return an ObservableIdMap<T>:
  return { ...liveObjMap, getById, updateObjects, popByIds }
}

export type { Idful, IdMap, ObservableIdMap }
export { observableIdMap }
