import { uniq, join } from './parsing-utils'
import Playbook from '../models/rules/playbook'

export default function parsePlaybook (name, rawPlaybook, rulebook, mechanismParser) {
  const rulebookMechanisms = rulebook.mechanisms
  const playbookMechanisms = Object.entries(rawPlaybook.mechanisms || {})
      .map(([rawMechanismName, rawMechanism]) => mechanismParser.parse(rawMechanismName, rawMechanism))

  const mechanisms = join(rulebookMechanisms, playbookMechanisms).filter(uniq('name'))

  const rules = mechanisms.reduce((rules, mechanism) => {
    Object.keys(mechanism)
      .filter(field => !MECHANISMS_FILEDS_NOT_IN_RULES.includes(field))
      .forEach(field => { rules[field] = join(rules[field], mechanism[field]).filter(uniq(JOIN_FILTERS[field])) })
    return rules
  }, { types: [], formulas: [], effects: [], choices: [], globalFields: [], playbookFields: [], characterFields: [] })

  const globalFields = rules.globalFields
    .reduce((fields, field) => ({ ...fields, [field.name]: field.value }), { })

  const fields = rules.playbookFields.reduce((fields, fieldDefinition) => {
    const value = rawPlaybook[fieldDefinition.name]
    if (!fieldDefinition.optional && !value) {
      throw new Error(`Missing field ${fieldDefinition.name} in playbook ${this.name}`)
    }

    return { ...fields, [fieldDefinition.name]: fieldDefinition.type.parseValue(value) }
  }, globalFields)

  return new Playbook({ name, mechanisms, fields, characterFields: rules.characterFields, choices: rules.choices, rules })
}

const MECHANISMS_FILEDS_NOT_IN_RULES = ['name']

const JOIN_FILTERS = {
  types: 'name',
  effects: effect => effect.pattern.raw,
  formulas: formula => formula.pattern.raw,
}
