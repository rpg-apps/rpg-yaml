import { noCase } from 'change-case'

export function parseFields (obj, parsers, additionalParams) {
  return Object.entries(parsers).reduce((result, [field, parser]) => {
    const rawField = noCase(field)
    if (obj[rawField]) {
      result[field] = parser(obj[rawField], additionalParams)
    }

    return result
  }, { })
}

export class Flag {
  constructor (value, options) {
    Object.assign(this, { value }, options)
  }

  extract (raw) {
    if (raw.constructor !== String) {
      return [false, raw]
    }
    return this._test(raw)
  }

  execute (text, { onTrue, onFalse }) {
    const params = this.extract(text)
    const match = params.shift()
    return match ? onTrue(...params) : onFalse(text)
  }
}

Flag.Prefix = class PrefixFlag extends Flag {
  _test (raw) {
    const match = raw.startsWith(`${this.value} `)
    return [match, raw.replace(new RegExp(`^${this.value} `), '')]
  }
}

Flag.Suffix = class SuffixFlag extends Flag {
  _test (raw) {
    const match = raw.endsWith(` ${this.value}`)
    return [match, raw.replace(new RegExp(` ${this.value}$`), '')]
  }
}

Flag.Parameter = class ParameterFlag extends Flag {
  _test (raw) {
    const seperator = ` ${this.value} `
    return raw.includes(seperator) ? raw.split(seperator).reverse() : [undefined, raw]
  }
}

export function mapValues (object, mapping) {
  return Object.entries(object)
    .reduce((types, [key, value]) => ({ ...types, [key]: mapping(value, key, object) }), { })
}

export function mapSmolJSON (raw, map) {
  return raw
    .substring(1, raw.length - 1)
    .split(',')
    .reduce((obj, part) => {
      const [key, value] = part.includes(':') ? part.split(':') : [part, part]
      return { ...obj, [key]: map(key, value) }
    }, { })
}

export const Sentence = {
  words: sentence => sentence.split(' '),
  firstWord: sentence => Sentence.wordAt(sentence, 0),
  lastWord: sentence => {
    const words = Sentence.words(sentence)
    return words[words.length - 1]
  },
  wordAt: (sentence, index) => Sentence.words(sentence)[index]
}

export function uniq (comparation) {
  if (comparation) {
    if (comparation.constructor === String) {
      const key = comparation
      comparation = item => item[key]
    }

    return (original, index, array) => array.findIndex(other => comparation(other) === comparation(original)) === index
  } else {
    return (value, index, array) => array.indexOf(value) === index
  }
}

export function join (...arrays) {
  return arrays.reduce((all, array) => all.concat(array), [])
}

export function mapify (array, keyFunction, valueFunction, validation=()=>{}, startingValue={}) {
  if (!(keyFunction instanceof Function)) {
    const keyField = keyFunction
    keyFunction = item => item[keyField]
  }
  if (!(valueFunction instanceof Function)) {
    const valueField = valueFunction
    valueFunction = item => item[valueField]
  }
  return array.reduce((result, item) => {
    const key = keyFunction(item)
    const value = valueFunction(item)
    validation(key, value, item)
    return ({ ...result, [key]: value })
  }, startingValue)
}

export class ParsingError extends Error {}
