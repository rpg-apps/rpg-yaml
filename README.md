# rpg.yaml

The *rpg.yaml* infrastructure is meant to be a source for containing and running open-source table-top role-playing-games.
In the heart of the infrastructure is the YAML language with which it's possible to encapsulate the rules and procedures of the game.

## Guidelines
There are a few ideas that guides us as we design the language and its rules:
**Simplicity**
It was important to us to make the rules as close as possible to the original rules of the game so it would be easy to transfer systems from written in human language to written in *rpg.yaml*. This is the main reason YAML was chosen as the base language. The hierarchy of the document is just complex enough to allow us to include English phrases and create complex mechanisms without breaking a sweat.
**Extendablity**
The ability to extends and change the game is important to anyone playing TTRPG, and to the community as a whole.
For this reason, the game language is completely extendable, and the parser is able to compile several YAML files at once.

## Game procedures
There are two main procedures in the game: character creation and gameplay.

**Character creation**
During character creation, the software will use a *playbook* to create a character object, which contains all the data of the character.
**Gameplay**
During gameplay, the software will change the data saved in the character object, through either direct change by the user or using *moves*.
In order for the direct change of data, the player must has direct engagment with the character object through the UI.
Moves on the other hand, are executable procedures (see effects) that can be triggered either automatically by changes of data or by the user. 

## Document structure
The document is built with three mandatory fields: mechanisms, moves and playbooks.

### Mechanisms
Mechanisms are the actual rules of the game. Each mechanism is a bundle of data, formulas and effects that can be used if the game requires them to. The division of the rules into mechanisms helps us replace specific aspects of the game using extensions or with a specific playbook.
The parts of a *mechanism* are (all is optional):

**global fields**
global fields are data that is stored globally, without reference to any specific playbook. This is the highest scope of data containment. In the rulebook they are defined with the value directly:
```yaml
mechanisms:
  <mechanism-name>:
    global fields:
      houses: 3
      bright: yes
```
All values acceptable by YAML are acceptable here, with the following additions:
- You can use three dots to convey an inclusive range `"1...3"`, which would be compiled into the matching array, i.e. `[1,2,3]`.

**playbook fields**
Playbook fields are fields that the mechanism require to be defined by playbooks implementing it. A playbook is considered to be implementing a mechanism only if it has all of the mechanism's *playbook fields*. In the rulebook they are defined with their required type.
```yaml
mechanisms:
  <mechanism-name>:
    playbook fields:
      name options: text array
```
See *types* field for acceptable types.

**character fields**
Character fields are fields that would be included in the final character, either by initializing them to a specific value, choosing their value or automatically calculating them on each change in other fields.
```yaml
mechanisms:
  <mechanism-name>:
    character fields:
      # This is an example of a field that initialized to a value and can change later.
      xp: start as 0
      # This is an example of an automatic field, that cannot be changed
      level: calculate xp/7
```

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

### Moves
Moves are the procedures within the games. PBTA games typically revolve around a conversation, in which RP actions trigger moves in the rulebook. Each move consists of a textual description, a trigger and an effect that occurs when the trigger fires.
```yaml
moves:
  <move-name>:
    text: When something happens, do something.
    trigger: something happens
    effect: do something
```
Like mechanisms, moves can be replaced in specific playbooks, and through extensions.

### Playbooks
playbooks are instructions for characters. They include the required fields to start with, additional mechanisms and moves specific to them, and are the prototype for the creation of new characters.
Unlike moves or mechanisms, the structure of a playbook is not preset, but rather defined by the mechanisms it implements.
