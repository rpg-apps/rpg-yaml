import { shallowEqualArrays } from 'shallow-equal'

import MechanismParser from '../../parser/mechanism'

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

  describe('effect parsing', () => {
    
  })
})

function expectChoiceToBe (choice, { name, playbook }, typeTest) {
  expect(choice.name).toBe(name)
  expect(typeTest(choice.type)).toBe(true)
  expect(choice.playbook).toBe(playbook)
}
