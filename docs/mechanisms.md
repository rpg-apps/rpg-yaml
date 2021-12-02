
# Mechanisms
Mechanisms are the actual rules of the game. Each mechanism is a bundle of data, formulas and effects that can be used if the game requires them to. The division of the rules into mechanisms helps us replace specific aspects of the game using extensions or with a specific playbook.
The parts of a *mechanism* are (all is optional):

**choices**
These are choices the player must make when first creating the character. Each choice gets a name and can be referenced later in fields and calculations.

Choices types:
**choose type**
**choose from global or playbook field**
**assign from global or playbook field**

**formulas and effect**
Formulas and effects are both important concepts of rulebook writing. Formulas are meant to signify calculable values, and effect are meant to signify executable procedures. The *formulas* and *effects* fields in a mechanism allow you to add your own formulas and effects to the existing pool that can be used in moves and other mechanisms.

**types**
In formulas and playbook fields definitions we sometimes need to use more complex types then those which can be anticipated.
For that there is a special field that allows you to create your own type definitions.
```yaml
mechanisms:
  <mechanism-name>:
    types:
      box:
        height: number
        width: number
        length: number
    playbook fields:
      crate: box
```
You can then use the dot operation to get and set certain fields inside the complex type:
```yaml
mechanisms:
  <mechanism-name>:
    types:
      box:
        height: number
        width: number
        length: number
    playbook fields:
      crate: box
    character fields:
      width: calculate crate.width
```
For now only one-level complex types are implemented. If there is a need for more we'll create them, but it's also important to keep the rulebook simple.
The available preset types are:
- boolean
- text
- long text
- number
- range
- formula
- move
- effect
- an array of each type, including a nested array.
- a map of each type. A map is a type which contained named values, i.e. you can give it a name and get its value.

### Playbooks
playbooks are instructions for characters. They include the required fields to start with, additional mechanisms and moves specific to them, and are the prototype for the creation of new characters.
Unlike moves or mechanisms, the structure of a playbook is not preset, but rather defined by the mechanisms it implements.
