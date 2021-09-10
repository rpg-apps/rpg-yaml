import { Flag, parseEntries, ParsingError } from '../parsing-utils'
import MechanismFieldParser from './mechanism_field_parser'
import Type from '../../models/rules/mechanism/type'

export default class TypeParser extends MechanismFieldParser {
  constructor(context) {
    super(context, Type.PRESETS)
  }

  parseDefinition (name, definition) {
    const fieldTypes = parseEntries(definition, (typeDef, field) => (typeDef.constructor === String) ? this.parseUsage(typeDef) : this.parseDefinition(field, typeDef))
    const type = new Type.ComplexType(name, fieldTypes)
    return this.save(type)
  }

  parseUsage (name) {
    return ARRAY_FLAG.execute(name, {
      onTrue: childTypeName => new Type.Array(this.parseUsage(childTypeName)),
      onFalse: () => {
        const subtype = this.data.find(type => type.name === name)
        if (!subtype) {
          throw new ParsingError(`Unknown type ${name}`)
        }
        return subtype
      }
    })
  }
}

const ARRAY_FLAG = new Flag.Suffix('array')
