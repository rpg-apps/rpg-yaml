import parsePlaybook from '../../parser/playbook'

describe('parsePlaybook creates a playbook that', () => {
  const PLAYBOOK_NAME = 'playbook name',
        RULEBOOK = { mechanisms: [] },
        MECHANISM_PARSER = () => { }, // TODO MOCK HERE
        RAW_PLAYBOOK1 = { mechanisms: [] }

  test('contains the playbook name', () => {
    const playbook = parsePlaybook(PLAYBOOK_NAME, RAW_PLAYBOOK1, RULEBOOK, MECHANISM_PARSER)
    expect(playbook.name).toBe(PLAYBOOK_NAME)
  })
})
