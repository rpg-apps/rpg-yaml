import axios from 'axios'
import yaml from 'yaml'

import parse from './parser'

const load = async url => {
  const rulesInYaml = await axios.get(url)
  const rulesJson = yaml.parse(rulesInYaml)
  const rules = parse(rulesJson)
  return rules
}

export default load
