import Valuable from './base/valuable'

export default class Choice extends Valuable {
  constructor (name, type) {
    super()
    Object.assign(this, { name, type })
  }

  match (raw) {
    return raw === this.name
  }

  async getValue (character) {
    return character.creationChoices[this.name]
  }
}
