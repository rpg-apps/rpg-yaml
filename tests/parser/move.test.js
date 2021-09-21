import parseMove from '../../parser/move'

describe('parseMove creates a move that', () => {
  const MOVE_NAME = 'move',
        TEXT_FIELD = { text: 'this is some text describing the move' },
        TYPE_FIELD = { type: 'this is the type of the move' },
        TRIGGER_FIELD = { trigger: 'when stuff happens' },
        AUTOMATIC_TRIGGER_FIELD = { trigger: 'on some event' },
        EFFECT_TEXT_FIELD = { effect: 'do something' },
        EFFECT_OBJECT_FIELD = { effect: { 'do something': { option1: 'do another thing', option2: 'do weird stuff' } } }

  test('contains the move name', () => {
    const move = parseMove(MOVE_NAME, {})
    expect(move.name).toBe(MOVE_NAME)
  })

  test('contains the move text if text field is included', () => {
    const move = parseMove(MOVE_NAME, raw(TEXT_FIELD))
    expect(move.text).toBe(TEXT_FIELD.text)
  })

  test('contains the move type if type field is included', () => {
    const move = parseMove(MOVE_NAME, raw(TYPE_FIELD))
    expect(move.type).toBe(TYPE_FIELD.type)
  })

  test('contains the move trigger if trigger field is included', () => {
    const move = parseMove(MOVE_NAME, raw(TRIGGER_FIELD))
    expect(move.trigger.text).toBe(TRIGGER_FIELD.trigger)
  })

  test('contains the move trigger if automatic trigger field is included', () => {
    const move = parseMove(MOVE_NAME, raw(AUTOMATIC_TRIGGER_FIELD))
    expect(move.trigger.formula).toBe(AUTOMATIC_TRIGGER_FIELD.trigger.replace('on ', ''))
  })

  test('contains the move effect if text effect field is included', () => {
    const move = parseMove(MOVE_NAME, raw(EFFECT_TEXT_FIELD))
    expect(move.effect).toBe(EFFECT_TEXT_FIELD.effect)
  })

  test('contains the move effect if object effect field is included', () => {
    const move = parseMove(MOVE_NAME, raw(EFFECT_OBJECT_FIELD))
    expect(move.effect).toBe(EFFECT_OBJECT_FIELD.effect)
  })

  test('contains all fields if all fields are included', () => {
    const move = parseMove(MOVE_NAME, raw(TEXT_FIELD, TYPE_FIELD, TRIGGER_FIELD, EFFECT_TEXT_FIELD))
    expect(move.name).toBe(MOVE_NAME)
    expect(move.text).toBe(TEXT_FIELD.text)
    expect(move.trigger.text).toBe(TRIGGER_FIELD.trigger)
    expect(move.effect).toBe(EFFECT_TEXT_FIELD.effect)
  })
})

function raw(...objects) {
  return Object.assign({}, ...objects)
}
