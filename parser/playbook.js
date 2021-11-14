import merge from 'deepmerge'

import { uniq, join, mapify, ParsingError } from './parsing-utils'
import Playbook from '../models/rules/playbook'

export default function parsePlaybook (name, rawPlaybook, rulebook, mechanismParser) {
  const mechanisms = getMechanisms(rulebook, rawPlaybook, mechanismParser)
  const rules = merge.all(mechanisms)
  const globalFields = mapify(rules.globalFields, 'name', 'value')
  const fields = mapify(rules.playbookFields, 'name', getFieldValue, validateField, globalFields)
  return new Playbook({ name, mechanisms, fields, characterFields: rules.characterFields, choices: rules.choices, rules })
}

function getMechanisms (rulebook, rawPlaybook, mechanismParser) {
  const playbookMechanisms = Object.entries(rawPlaybook.mechanisms || {})
    .map(([rawMechanismName, rawMechanism]) => mechanismParser.parse(rawMechanismName, rawMechanism))
  return join(rulebook.mechanisms, playbookMechanisms).filter(uniq('name'))
}

function getFieldValue (fieldDefinition) {
  return fieldDefinition.type.parseValue(value)
}

function validateField (name, value, fieldDefinition) {
  if (!fieldDefinition.optional && !value) {
    throw new ParsingError(`Missing field ${name} in playbook ${this.name}`)
  }
}

const JOIN_FILTERS = {
  types: 'name',
  effects: effect => effect.pattern.raw,
  formulas: formula => formula.pattern.raw,
}
