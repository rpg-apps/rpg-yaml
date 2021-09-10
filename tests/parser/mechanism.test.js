import { shallowEqualArrays } from 'shallow-equal'

import MechanismParser from '../../parser/mechanism'
import Choice from '../../models/rules/mechanism/choice'
import Type from '../../models/rules/mechanism/type'

let parser

const RAW_RULES = {}
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

    test('parses a complex type', () => {
      const mechanism = parser.parse(MECHANISM_NAME, { types: { [TYPE1_NAME]: TYPE1 } })
      expect(mechanism.types.length).toBe(Type.PRESETS.length + 1)
      const type = mechanism.types.find(type => type.name === TYPE1_NAME)
      expectTypeToMatchDefinition(type, TYPE1)
    })

    test('parses a complex type based on another complex type', () => {
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

    test('parses a text choice', () => {
      const mechanism = parser.parse(MECHANISM_NAME, { choices: { [TEXT_CHOICE_NAME]: TEXT_CHOICE } })
      expect(mechanism.choices.length).toBe(1)
      expectChoiceToBe(mechanism.choices[0], { name: TEXT_CHOICE_NAME, playbook: ALL_PLAYBOOK }, ({ name }) => name === TEXT_CHOICE)
    })

    test('parses a long text choice', () => {
      const mechanism = parser.parse(MECHANISM_NAME, { choices: { [LONG_TEXT_CHOICE_NAME]: LONG_TEXT_CHOICE } })
      expect(mechanism.choices.length).toBe(1)
      expectChoiceToBe(mechanism.choices[0], { name: LONG_TEXT_CHOICE_NAME, playbook: ALL_PLAYBOOK }, ({ name }) => name === LONG_TEXT_CHOICE)
    })

    describe('parses a field choice', () => {
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
    test('parses a formula', () => {
      
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
