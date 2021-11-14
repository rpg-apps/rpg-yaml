import { Flag, Sentence, mapSmolJSON } from '../parsing-utils'
import MechanismFieldParser from './mechanism_field_parser'
import Choice from '../../models/rules/mechanism/choice'

export default class ChoiceParser extends MechanismFieldParser {

  parseDefinition (name, definition) {
    const choice = new Choice(name, this._generateChoiceType(definition))
    return this.save(choice)
  }

  _generateChoiceType (definition) {
    const [assignment, definitionWithoutAssignment] = ASSIGNMENT_CHOICE_FLAG.extract(definition)
    const [free, definitionAfterFreeCheck] = FREE_CHOICE_FLAG.extract(definitionWithoutAssignment)
    return CHOOSE_FROM_FLAG.execute(definitionAfterFreeCheck, {
      onTrue: from => ({ from, free, assignment: assignment ? mapSmolJSON(assignment, () => undefined) : undefined }),
      onFalse: () => this.context.typeParser.parseUsage(definitionAfterFreeCheck)
    })
  }
}

const ASSIGNMENT_CHOICE_FLAG = new Flag.Parameter('and assign')
const FREE_CHOICE_FLAG = new Flag.Prefix('freely')
const CHOOSE_FROM_FLAG = new Flag.Prefix('from')
