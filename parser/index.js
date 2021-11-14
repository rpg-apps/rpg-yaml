import merge from 'deepmerge'

import MechanismParser from './mechanism'
import parsePlaybook from './playbook'

import { ParsingError } from './parsing-utils'

import Rulebook from '../models/rules'

const PARSER_VERSION = 1.0

export default function parse (rulebooks, log=console.log) {
  validateRulebooks(rulebooks)
  const rawRules = merge.all(rulebooks)
  const mechanismParser = new MechanismParser(rawRules)
  const rulebook = new Rulebook(Object.entries(rawRules.mechanisms).map(([name, raw]) => mechanismParser.parse(name, raw)))
  rulebook.playbooks = Object.entries(rawRules.playbooks).map(([name, raw]) => parsePlaybook(name, raw, rulebook, mechanismParser))
  return rulebook
}

function validateRulebooks (rulebooks) {
  if (rulebooks.some(rulebook => rulebook.parser < PARSER_VERSION)) throw new ParsingError('An outdated rulebook found. Please make sure all rulebooks are up to date.')

  const coreRulebooksCount = rulebooks.filter(rulebook => rulebook.rulebook === 'core').length
  if (coreRulebooksCount === 0) throw new ParsingError('No core rulebook found. Please use a core rulebook in your game.')
  if (coreRulebooksCount > 1)   throw new ParsingError('Multiple core rulebooks found. Only one core rulebook is allowed.')
}

/*
# TODO modifiers, complex types operations, inputs, history, value choices -> merge the calculator and executioner into UI object for the models, with the ability to print output, get textual input of various types, getting choice input, displaying roll results, etc.
# TODO map formulas (see "modifier for stat" for an example), "assign from" choice, list comprehension formulas
# TODO handle roll miss: add XP and allow GM to act
# Fallback effect: show
# TODO what about moves that describe the choices in the start of the game? Create "instant" trigger, can a move have a character-choice and another trigger? It should.
# TODO roll options as different ranges (1..2, [1,2], >10)
# TODO create a single standard for modifiers, difference between "take x ..." to "modify x ..."? Do we need both or should "take" be the standard?
# TODO Effects or (choose first that exists)
# TODO automatic triggers
# TODO add the basic effect "die"
# TODO fields changing: set vs change vs reduce/add
# TODO constant sentencing: where do we use capital letters? Points? Question marks?
# TODO Negative choices
# TODO hirelings mechanism
# TODO dynamic choices (choices where options are an array of arrays)
# TODO first moves moves (override "moves" mechanism in ranger)
# TODO enumeration types: using arrays
# TODO add hooks: effect that happen on the character lifecycle: before/after character creation, before/after choice, before/after opening a character, before/after value change
# calc?
# Think about hooks - should they exist? What should they be?
*/
