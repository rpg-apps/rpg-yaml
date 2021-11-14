import TypeParser from './type'
import { GlobalFieldParser, PlaybookFieldParser, CharacterFieldParser } from './field'
import ChoiceParser from './choice'
import FormulaParser from './formula'
import EffectParser from './effect'

import Mechanism from '../../models/rules/mechanism'

import { parseFields, mapValues } from '../parsing-utils'

export default class MechanismParser {
  constructor (rawRules) {
    this.rawRules = rawRules
  }

  parse (name, rawMechanism) {
    this._reset()
    parseFields(rawMechanism, this._parsers(), this)
    return new Mechanism({ name, ...this._data() })
  }

  _reset () {
    this.parsers = {
      types: new TypeParser(this),
      formulas: new FormulaParser(this),
      effects: new EffectParser(this),
      choices: new ChoiceParser(this),
      globalFields: new GlobalFieldParser(this),
      playbookFields: new PlaybookFieldParser(this),
      characterFields: new CharacterFieldParser(this)
    }
  }

  _parsers () {
    return mapValues(this.parsers, (parser, field) => this._collectionObjectParser(field))
  }

  _data () {
    return mapValues(this.parsers, parser => parser.data)
  }

  _collectionObjectParser (name) {
    const parser = this.parsers[name]
    return (collection, context) => {
      return Object.entries(collection).map(([key, value]) => parser.parseDefinition(key, value))
    }
  }
}
