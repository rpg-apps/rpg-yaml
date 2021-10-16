import parsePlaybook from '../../parser/playbook'

describe('parsePlaybook creates a playbook that', () => {
  const parseValue = value => value

  const PLAYBOOK_NAME = 'playbook name',
        MECHANISM_1 = {
          globalFields: [{ name: 'field1', type: { parseValue }, value: 'global field value' }],
          playbookFields: [{ name: 'field2', type: { parseValue }, value: 'global field value', optional: true }],
          characterFields: [{ name: 'field5', type: { parseValue }, value: 'character field value' }]
        },
        MECHANISM_2 = {
          globalFields: [{ name: 'field3', type: { parseValue }, value: 'global field value' }],
          playbookFields: [{ name: 'field4', type: { parseValue }, value: 'global field value' }],
          characterFields: [{ name: 'field6', type: { parseValue }, value: 'character field value' }]
        },
        RULEBOOK = { mechanisms: [MECHANISM_1] },
        MECHANISM_PARSER = { parse: (name,mechanism) => Object.assign({}, mechanism, { name }) },
        RAW_PLAYBOOK = { mechanisms: { MECHANISM_2: MECHANISM_2 }, field2: 'value', field4: 'value4' },
        BAD_PLAYBOOK = { mechanisms: { MECHANISM_2: MECHANISM_2 }, field2: 'value' },
        GOOD_PLAYBOOK = { mechanisms: { MECHANISM_2: MECHANISM_2 }, field4: 'value' }

  test('contains the playbook name', () => {
    const playbook = parsePlaybook(PLAYBOOK_NAME, RAW_PLAYBOOK, RULEBOOK, MECHANISM_PARSER)
    expect(playbook.name).toBe(PLAYBOOK_NAME)
  })

  test('contains mechanisms including generic mechanisms', () => {
    const playbook = parsePlaybook(PLAYBOOK_NAME, RAW_PLAYBOOK, RULEBOOK, MECHANISM_PARSER)
    expect(playbook.mechanisms).toEqual(expect.arrayContaining(RULEBOOK.mechanisms))
  })

  test('contains mechanisms including mechanisms from the playbook', () => {
    const playbook = parsePlaybook(PLAYBOOK_NAME, RAW_PLAYBOOK, RULEBOOK, MECHANISM_PARSER)
    Object.keys(RAW_PLAYBOOK.mechanisms).forEach(mechanismName => {
      expect(playbook.mechanisms.some(mechanism => mechanism.name === mechanismName)).toBe(true)
    })
  })

  test('contains rules including all fields from mechanisms', () => {
    const playbook = parsePlaybook(PLAYBOOK_NAME, RAW_PLAYBOOK, RULEBOOK, MECHANISM_PARSER)
    Object.keys(MECHANISM_1).concat(Object.keys(MECHANISM_2)).forEach(field => {
      expect(Object.keys(playbook.rules).includes(field)).toBe(true)
    })
  })

  test('contains fields including global fields and their values', () => {
    const playbook = parsePlaybook(PLAYBOOK_NAME, RAW_PLAYBOOK, RULEBOOK, MECHANISM_PARSER)
    MECHANISM_1.globalFields.concat(MECHANISM_2.globalFields).forEach(field => {
      expect(Object.keys(playbook.fields).includes(field.name)).toBe(true)
    })
  })

  test('contains fields including playbook fields and their values', () => {
    const playbook = parsePlaybook(PLAYBOOK_NAME, RAW_PLAYBOOK, RULEBOOK, MECHANISM_PARSER)
    MECHANISM_1.playbookFields.concat(MECHANISM_2.playbookFields).forEach(field => {
      expect(Object.keys(playbook.fields).includes(field.name)).toBe(true)
    })
  })

  test('throws an error if playbook missing a mandatory playbook field', () => {
    expect(() => parsePlaybook(PLAYBOOK_NAME, BAD_PLAYBOOK, RULEBOOK, MECHANISM_PARSER)).toThrow()
  })

  test('does not throw an error if playbook missing an optional playbook field', () => {
    expect(() => parsePlaybook(PLAYBOOK_NAME, GOOD_PLAYBOOK, RULEBOOK, MECHANISM_PARSER)).not.toThrow()
  })

  test('contains character fields from mechanisms', () => {
    const playbook = parsePlaybook(PLAYBOOK_NAME, RAW_PLAYBOOK, RULEBOOK, MECHANISM_PARSER)
    MECHANISM_1.characterFields.concat(MECHANISM_2.characterFields).forEach(field => {
      expect(playbook.characterFields.some(characterField => characterField.name === field.name)).toBe(true)
    })
  })
})
