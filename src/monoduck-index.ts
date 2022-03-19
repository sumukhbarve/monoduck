import * as lookduck from './lookduck/lookduck-index'
import * as tapiduck from './tapiduck/index-tapiduck'

const quack = function (): string {
  return 'Quack!'
}

export {
  quack,
  lookduck,
  tapiduck
}
