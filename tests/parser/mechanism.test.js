// TODO test types of instances for all instances
// TODO add test for subfield choice character field

import { shallowEqualArrays } from 'shallow-equal'

import MechanismParser from '../../parser/mechanism'
import Type from '../../models/rules/mechanism/type'
import Choice from '../../models/rules/mechanism/choice'
import Formula from '../../models/rules/mechanism/formula'
import Effect from '../../models/rules/mechanism/effect'

let parser

const LARGE_FIELD_NAME = 'global field name'
const LARGE_FIELD_VALUE = ['val1', 'val2']
const RAW_RULES = { [LARGE_FIELD_NAME]: LARGE_FIELD_VALUE }
const MECHANISM_NAME = 'mechanism'
const ALL_PLAYBOOK = 'all'

describe('MechanismParser', () => {
  beforeEach(() => {
    parser = new MechanismParser(RAW_RULES)
  })

  test('parses mechanism and keeps its name', () => {
    const mechanism = parser.parse(MECHANISM_NAME, {})
    expect(mechanism.name).toBe(MECHANISM_NAME)
  })

  describe('type parsing', () => {
    const TYPE1 = { field1: 'long text', field2: 'move' },
          TYPE1_NAME = 'type1',
          TYPE2 = { field1: TYPE1_NAME, field2: 'formula' },
          TYPE2_NAME = 'type2',
          INVALID_COMPLEX_TYPE = { field: 'unreal type' },
          INVALID_COMPLEX_TYPE_NAME = 'invalid type'

    test('contains all preset types with no complex types', () => {
      const mechanism = parser.parse(MECHANISM_NAME, {})
      expect(mechanism.types).toEqual(Type.PRESETS)
    })

    test('contains all preset types with complex types', () => {
      const mechanism = parser.parse(MECHANISM_NAME, { types: { [TYPE1_NAME]: TYPE1 } })
      expect(mechanism.types).toEqual(expect.arrayContaining(Type.PRESETS))
    })

    test('contains a complex type', () => {
      const mechanism = parser.parse(MECHANISM_NAME, { types: { [TYPE1_NAME]: TYPE1 } })
      expect(mechanism.types.length).toBe(Type.PRESETS.length + 1)
      const type = mechanism.types.find(type => type.name === TYPE1_NAME)
      expectTypeToMatchDefinition(type, TYPE1)
    })

    test('contains a complex type based on another complex type', () => {
      const mechanism = parser.parse(MECHANISM_NAME, { types: { [TYPE1_NAME]: TYPE1, [TYPE2_NAME]: TYPE2 } })
      expect(mechanism.types.length).toBe(Type.PRESETS.length + 2)
      const type = mechanism.types.find(type => type.name === TYPE2_NAME)
      expectTypeToMatchDefinition(type, TYPE2)
    })

    test('throws error if field type in a complex type doesn\'t exist', () => {
      expect(() => {
        parser.parse(MECHANISM_NAME, { types: { [INVALID_COMPLEX_TYPE_NAME]: INVALID_COMPLEX_TYPE } })
      }).toThrow()
    })
  })

  describe('choice parsing', () => {
    const TEXT_CHOICE = 'long text',
          TEXT_CHOICE_NAME = 'text choice',
          LONG_TEXT_CHOICE = 'text',
          LONG_TEXT_CHOICE_NAME = 'long text choice',
          FIELD_CHOICE = 'from field',
          FIELD_CHOICE_FROM = 'field',
          FIELD_CHOICE_NAME = 'field choice',

          FREE_CHOICE_PREFIX = 'freely ',
          ASSIGNMENT_TEXT = ' and assign {key1,key2}',
          ASSIGNMENT_OBJECT_KEYS = ['key1', 'key2']

    test('contains a text choice', () => {
      const mechanism = parser.parse(MECHANISM_NAME, { choices: { [TEXT_CHOICE_NAME]: TEXT_CHOICE } })
      expect(mechanism.choices.length).toBe(1)
      expectChoiceToBe(mechanism.choices[0], { name: TEXT_CHOICE_NAME, playbook: ALL_PLAYBOOK }, ({ name }) => name === TEXT_CHOICE)
    })

    test('contains a long text choice', () => {
      const mechanism = parser.parse(MECHANISM_NAME, { choices: { [LONG_TEXT_CHOICE_NAME]: LONG_TEXT_CHOICE } })
      expect(mechanism.choices.length).toBe(1)
      expectChoiceToBe(mechanism.choices[0], { name: LONG_TEXT_CHOICE_NAME, playbook: ALL_PLAYBOOK }, ({ name }) => name === LONG_TEXT_CHOICE)
    })

    describe('contains a field choice', () => {
      test('with no flags', () => {
        const mechanism = parser.parse(MECHANISM_NAME, { choices: { [FIELD_CHOICE_NAME]: FIELD_CHOICE } })
        expectChoiceToBe(mechanism.choices[0], { name: FIELD_CHOICE_NAME, playbook: ALL_PLAYBOOK }, ({ free, from, assignment }) => from === FIELD_CHOICE_FROM && !free && assignment === undefined)
      })

      test('with a free flag', () => {
        const mechanism = parser.parse(MECHANISM_NAME, { choices: { [FIELD_CHOICE_NAME]: FREE_CHOICE_PREFIX + FIELD_CHOICE } })
        expectChoiceToBe(mechanism.choices[0], { name: FIELD_CHOICE_NAME, playbook: ALL_PLAYBOOK }, ({ free, from, assignment }) => from === FIELD_CHOICE_FROM && free && assignment === undefined)
      })

      test('with an assignment', () => {
        const mechanism = parser.parse(MECHANISM_NAME, { choices: { [FIELD_CHOICE_NAME]: FIELD_CHOICE + ASSIGNMENT_TEXT } })
        expectChoiceToBe(mechanism.choices[0], { name: FIELD_CHOICE_NAME, playbook: ALL_PLAYBOOK }, ({ free, from, assignment }) => from === FIELD_CHOICE_FROM && !free && shallowEqualArrays(Object.keys(assignment), ASSIGNMENT_OBJECT_KEYS))
      })

      test('with a free flag and an assignment', () => {
        const mechanism = parser.parse(MECHANISM_NAME, { choices: { [FIELD_CHOICE_NAME]: FREE_CHOICE_PREFIX + FIELD_CHOICE + ASSIGNMENT_TEXT } })
        expectChoiceToBe(mechanism.choices[0], { name: FIELD_CHOICE_NAME, playbook: ALL_PLAYBOOK }, ({ free, from, assignment }) => from === FIELD_CHOICE_FROM && free && shallowEqualArrays(Object.keys(assignment), ASSIGNMENT_OBJECT_KEYS))
      })
    })

    test('parses multiple choices', () => {
      const mechanism = parser.parse(MECHANISM_NAME, { choices: { [TEXT_CHOICE_NAME]: TEXT_CHOICE, [LONG_TEXT_CHOICE_NAME]: LONG_TEXT_CHOICE, [FIELD_CHOICE_NAME]: FIELD_CHOICE } })
      expect(mechanism.choices.length).toBe(3)
      expectChoiceToBe(mechanism.choices[0], { name: TEXT_CHOICE_NAME, playbook: ALL_PLAYBOOK }, ({ name }) => name === TEXT_CHOICE)
      expectChoiceToBe(mechanism.choices[1], { name: LONG_TEXT_CHOICE_NAME, playbook: ALL_PLAYBOOK }, ({ name }) => name === LONG_TEXT_CHOICE)
      expectChoiceToBe(mechanism.choices[2], { name: FIELD_CHOICE_NAME, playbook: ALL_PLAYBOOK }, ({ from, free }) => from === FIELD_CHOICE_FROM && !free)
    })
  })

  describe('formula parsing', () => {
    const FORMULA1_PATTERN = 'pattern',
          FORMULA1_FORMULA_CALL = 'call',
          FORMULA2_PATTERN = 'pattern2',
          FORMULA2_FORMULA_CALL = 'call2'

    test('contains all preset formulas with no complex formulas', () => {
      const mechanism = parser.parse(MECHANISM_NAME, {})
      expect(mechanism.formulas).toEqual(Formula.PRESETS)
    })

    test('contains all preset formulas with complex formulas', () => {
      const mechanism = parser.parse(MECHANISM_NAME, { formulas: { [FORMULA1_PATTERN]: FORMULA1_FORMULA_CALL } })
      expect(mechanism.formulas).toEqual(expect.arrayContaining(Formula.PRESETS))
    })

    test('contains a complex formula', () => {
      const mechanism = parser.parse(MECHANISM_NAME, { formulas: { [FORMULA1_PATTERN]: FORMULA1_FORMULA_CALL } })
      expect(mechanism.formulas.length).toBe(Formula.PRESETS.length + 1)
      expect(mechanism.formulas[0].pattern.raw).toEqual(FORMULA1_PATTERN)
      expect(mechanism.formulas[0].formulaCall).toEqual(FORMULA1_FORMULA_CALL)
    })

    test('contains multiple complex formulas', () => {
      const mechanism = parser.parse(MECHANISM_NAME, { formulas: { [FORMULA1_PATTERN]: FORMULA1_FORMULA_CALL, [FORMULA2_PATTERN]: FORMULA2_FORMULA_CALL } })
      expect(mechanism.formulas.length).toBe(Formula.PRESETS.length + 2)
      expect(mechanism.formulas[0].pattern.raw).toEqual(FORMULA2_PATTERN)
      expect(mechanism.formulas[0].formulaCall).toEqual(FORMULA2_FORMULA_CALL)
      expect(mechanism.formulas[1].pattern.raw).toEqual(FORMULA1_PATTERN)
      expect(mechanism.formulas[1].formulaCall).toEqual(FORMULA1_FORMULA_CALL)
    })
  })

  describe('effect parsing', () => {
    const EFFECT1_PATTERN = 'pattern',
          EFFECT1_FORMULA_CALL = 'call',
          EFFECT2_PATTERN = 'pattern2',
          EFFECT2_FORMULA_CALL = 'call2'

    test('contains all preset effects with no complex effects', () => {
      const mechanism = parser.parse(MECHANISM_NAME, {})
      expect(mechanism.effects).toEqual(Effect.PRESETS)
    })

    test('contains all preset effects with complex effects', () => {
      const mechanism = parser.parse(MECHANISM_NAME, { effects: { [EFFECT1_PATTERN]: EFFECT1_FORMULA_CALL } })
      expect(mechanism.effects).toEqual(expect.arrayContaining(Effect.PRESETS))
    })

    test('contains a complex formula', () => {
      const mechanism = parser.parse(MECHANISM_NAME, { effects: { [EFFECT1_PATTERN]: EFFECT1_FORMULA_CALL } })
      expect(mechanism.effects.length).toBe(Effect.PRESETS.length + 1)
      expect(mechanism.effects[0].pattern.raw).toEqual(EFFECT1_PATTERN)
      expect(mechanism.effects[0].effectCall).toEqual(EFFECT1_FORMULA_CALL)
    })

    test('contains multiple complex effects', () => {
      const mechanism = parser.parse(MECHANISM_NAME, { effects: { [EFFECT1_PATTERN]: EFFECT1_FORMULA_CALL, [EFFECT2_PATTERN]: EFFECT2_FORMULA_CALL } })
      expect(mechanism.effects.length).toBe(Effect.PRESETS.length + 2)
      expect(mechanism.effects[0].pattern.raw).toEqual(EFFECT2_PATTERN)
      expect(mechanism.effects[0].effectCall).toEqual(EFFECT2_FORMULA_CALL)
      expect(mechanism.effects[1].pattern.raw).toEqual(EFFECT1_PATTERN)
      expect(mechanism.effects[1].effectCall).toEqual(EFFECT1_FORMULA_CALL)
    })
  })

  describe('global field parsing', () => {
    const SMALL_FIELD_NAME = 'small field',
          SMALL_FIELD_VALUE = [1,2,3,4,5,6]

    test('contains a small global field', () => {
      const mechanism = parser.parse(MECHANISM_NAME, { 'global fields': { [SMALL_FIELD_NAME]: SMALL_FIELD_VALUE } })
      expect(mechanism.globalFields.length).toBe(1)
      expect(mechanism.globalFields[0].name).toEqual(SMALL_FIELD_NAME)
      expect(mechanism.globalFields[0].value).toEqual(SMALL_FIELD_VALUE)
    })

    test('contains a large global field', () => {
      const mechanism = parser.parse(MECHANISM_NAME, { 'global fields': { [LARGE_FIELD_NAME]: 'large' } })
      expect(mechanism.globalFields.length).toBe(1)
      expect(mechanism.globalFields[0].name).toEqual(LARGE_FIELD_NAME)
      expect(mechanism.globalFields[0].value).toEqual(LARGE_FIELD_VALUE)
    })

    test('contains multiple global fields', () => {
      const mechanism = parser.parse(MECHANISM_NAME, { 'global fields': { [SMALL_FIELD_NAME]: SMALL_FIELD_VALUE, [LARGE_FIELD_NAME]: 'large' } })
      expect(mechanism.globalFields.length).toBe(2)
      expect(mechanism.globalFields[0].name).toEqual(SMALL_FIELD_NAME)
      expect(mechanism.globalFields[0].value).toEqual(SMALL_FIELD_VALUE)
      expect(mechanism.globalFields[1].name).toEqual(LARGE_FIELD_NAME)
      expect(mechanism.globalFields[1].value).toEqual(LARGE_FIELD_VALUE)
    })
  })

  describe('playbook field parsing', () => {
    const FIELD1_NAME = 'field',
          FIELD1_TYPE = 'text',
          FIELD2_NAME = 'field2',
          FIELD2_TYPE = 'long text'

    test('contains a playbook field', () => {
      const mechanism = parser.parse(MECHANISM_NAME, { 'playbook fields': { [FIELD1_NAME]: FIELD1_TYPE } })
      expect(mechanism.playbookFields.length).toBe(1)
      expect(mechanism.playbookFields[0].name).toEqual(FIELD1_NAME)
      expect(mechanism.playbookFields[0].type.name).toEqual(FIELD1_TYPE)
    })

    test('contains multiple playbook fields', () => {
      const mechanism = parser.parse(MECHANISM_NAME, { 'playbook fields': { [FIELD1_NAME]: FIELD1_TYPE, [FIELD2_NAME]: FIELD2_TYPE } })
      expect(mechanism.playbookFields.length).toBe(2)
      expect(mechanism.playbookFields[0].name).toEqual(FIELD1_NAME)
      expect(mechanism.playbookFields[0].type.name).toEqual(FIELD1_TYPE)
      expect(mechanism.playbookFields[1].name).toEqual(FIELD2_NAME)
      expect(mechanism.playbookFields[1].type.name).toEqual(FIELD2_TYPE)
    })
  })

  describe('character field parsing', () => {
    const CHOICE_FIELD_NAME = 'choice field',
          CHOICE_FIELD_VALUE = 'choose long text',
          CHOICE_FIELD_TYPE = 'long text',
          FORMULA_FIELD_NAME = 'formula field',
          FORMULA_FIELD_VALUE = 'auto formula',
          FORMULA_FIELD_FORMULA = 'formula',
          VALUE_FIELD_NAME = 'value field',
          VALUE_FIELD_VALUE = 'value'

    test('contains a choice field', () => {
      const mechanism = parser.parse(MECHANISM_NAME, { 'character fields': { [CHOICE_FIELD_NAME]: CHOICE_FIELD_VALUE } })
      expect(mechanism.characterFields.length).toBe(1)
      expect(mechanism.characterFields[0].name).toEqual(CHOICE_FIELD_NAME)
      expect(mechanism.characterFields[0].choiceUsage.choice.type.name).toEqual(CHOICE_FIELD_TYPE)
    })

    test('contains a formula field', () => {
      const mechanism = parser.parse(MECHANISM_NAME, { 'character fields': { [FORMULA_FIELD_NAME]: FORMULA_FIELD_VALUE } })
      expect(mechanism.characterFields.length).toBe(1)
      expect(mechanism.characterFields[0].name).toEqual(FORMULA_FIELD_NAME)
      expect(mechanism.characterFields[0].calculationFormula).toEqual(FORMULA_FIELD_FORMULA)
    })

    test('contains a value field', () => {
      const mechanism = parser.parse(MECHANISM_NAME, { 'character fields': { [VALUE_FIELD_NAME]: VALUE_FIELD_VALUE } })
      expect(mechanism.characterFields.length).toBe(1)
      expect(mechanism.characterFields[0].name).toEqual(VALUE_FIELD_NAME)
      expect(mechanism.characterFields[0].initializationFormula).toEqual(VALUE_FIELD_VALUE)
    })

    test('contains multiple fields', () => {
      const mechanism = parser.parse(MECHANISM_NAME, { 'character fields': { [CHOICE_FIELD_NAME]: CHOICE_FIELD_VALUE, [FORMULA_FIELD_NAME]: FORMULA_FIELD_VALUE, [VALUE_FIELD_NAME]: VALUE_FIELD_VALUE } })
      expect(mechanism.characterFields.length).toBe(3)
      expect(mechanism.characterFields[0].name).toEqual(CHOICE_FIELD_NAME)
      expect(mechanism.characterFields[0].choiceUsage.choice.type.name).toEqual(CHOICE_FIELD_TYPE)
      expect(mechanism.characterFields[1].name).toEqual(FORMULA_FIELD_NAME)
      expect(mechanism.characterFields[1].calculationFormula).toEqual(FORMULA_FIELD_FORMULA)
      expect(mechanism.characterFields[2].name).toEqual(VALUE_FIELD_NAME)
      expect(mechanism.characterFields[2].initializationFormula).toEqual(VALUE_FIELD_VALUE)
    })
  })
})

function expectTypeToMatchDefinition(type, definition) {
  expect(type).toBeDefined()
  expect(type).toBeInstanceOf(Type.ComplexType)
  Object.keys(definition).forEach(field => expect(type.fieldTypes).toHaveProperty(field))
}

function expectChoiceToBe (choice, { name, playbook }, typeTest) {
  expect(choice).toBeDefined()
  expect(choice).toBeInstanceOf(Choice)
  expect(choice.name).toBe(name)
  expect(typeTest(choice.type)).toBe(true)
  expect(choice.playbook).toBe(playbook)
}
