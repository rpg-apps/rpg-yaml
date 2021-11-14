import { Flag } from '../parsing-utils'
import MechanismFieldParser from './mechanism_field_parser'

import Field from '../../models/rules/mechanism/field'

export class GlobalFieldParser extends MechanismFieldParser {
  parseDefinition (name, value) {
    if (value === 'large') {
      value = this.context.rawRules[name]
    }

    return this.save(new Field.GlobalField(name, value))
  }
}

export class PlaybookFieldParser extends MechanismFieldParser {
  parseDefinition (name, value) {
    const type = this.context.typeParser.parseUsage(value)
    return this.save(new Field.PlaybookField(name, type))
  }
}

export class CharacterFieldParser extends MechanismFieldParser {
  parseDefinition (name, value) {
    const field = INITIALIZATION_FLAG.execute(value, {
      onTrue: formula => new Field.ManualField(name, formula),
      onFalse: () => new Field.AutomaticField(name, value)
    })

    return this.save(field)
  }
}

const INITIALIZATION_FLAG = new Flag.Prefix('start as')
