# Mechanisms
A **mechanism** contains everything needed for its logic to run. This includes any choices the player needs to make during **character creation**, fields that contain the data of the game, **formulas** and **procedures**, and **hooks** that allow them to run automatically. The mechanism can also define its own **types** to use in the rules.

An example mechanism might look something like this:
```yaml
mechanisms:
  shapes:
    types:
      shape:
        name: text
        edges: number
    global fields:
      pi: 3.14
    playbook fields:
      possible shapes: shape array
    choices:
      shape: from possible shapes
    character fields:
      radius: 1
    formulas:
      circle perimeter with radius <number:radius>: 2*pi*radius
    procedure:
      increase radius: add 1 to radius
      decrease radius: remove 1 from radius
    hooks:
      on change:
        add 1 to radius
```

## Data fields
The data about the game, the playbook, and the character, is saved in **fields**. There are three scopes to the fields:
 - Global fields are saved for the entire game, and are global constants.
 - Playbook fields are saved for each playbook, and are constant of that said playbook.
 - Character fields are save for each character, and may change along the course of the game.

### global fields
There are two ways to define global fields: `inline` and `large`.
Inline global field is the basic way. The fields is put as any other `yaml` key-value pair within the `global fields` parameter of the mechanism.
```yaml
mechanisms:
  shapes:
    global fields:
      pi: 3.14
```
Sometimes thought, the field is too large for it to be comfortable to be stored in such a way. In this case, we can add it to the root of the document, and access it by giving the value `large` in the **mechanism** definition.
```yaml
mechanisms:
  shapes:
    global fields:
      shapes: large
...
shapes:
  - triangle
  - square
  - hexagon
```

### Playbook fields
Playbook fields are fields that the mechanism requires from a playbook to have. The parser will throw a `ParseError` if a playbook is found with a missing field. The definition in the **mechanism** defined the field's **type**. For more information see [types]().
```yaml
mechanisms:
  walk:
    playbook fields:
      paces per day: number
```

### Character fields
Character fields are fields that are meant to store information about the character. The mechanism explains how to initialize them using a **formula**. For more information see [formulas]().
```yaml
mechanisms:
  walk:
    character fields:
      paces so far: 0
```

## Character creation
The character creation process is built out of a series of **choices**. Each choice allows the player to select data that will be added to his characters. The **mechanism** defines those choices in the **choices** portion.
Please notice that each choice would become its own step in the character creation process, so do think about how you want to combine them, if it makes sense for some of the to be in the same screen.
There are currently supported three kinds of choices: choices from a given array field, choices of a type, with recommendations from a field, or choices in which the player assigns all the values in a array field into a new object.

### Field choices
A field choice is a character creation choice in which the player picks from a predetermined set of options, saved in a global or playbooks field. To define a field choice, one must define a global or playbook field from which the player must chose. The field must be an array. The field choice definition always starts with `from`:
```yaml
mechanisms:
  roll:
    global fields:
      initial stats: [8, 9, 12, 13, 15 ,16]
    choices:
      strength: from initial stats
```

### Type choices
A type choice allows the player to fill out a form or an input matching the a certain type, without restrictions to a predetermined set of values. This choice definition does have a recommendations option, to allow to recommend options from a field, the same as in a field choice, using the `with recommendations` syntax.
```yaml
mechanisms:
  roll:
    global fields:
      initial stats: [8, 9, 12, 13, 15 ,16]
    choices:
      strength: number
      dexterity: number with recommendations from initial stats
```

### Assignment choice
An assignment choice is the most complicated. It is made to make use of the entire of the predetermined options, and to make sure there are no overlaps. It uses the `assign` syntax.
```yaml
mechanisms:
  roll:
    global fields:
      initial stats: [8, 9, 12, 13, 15 ,16]
    choices:
      stats: assign initial stats each to strength, dexterity, constitution, intelligence, wisdom, charisma
```
In the above example, all stats appear in the same screen in the character creation process, and are each assigned a unique value from the `initial stats` global field.

## Data interactions
After character creation, there are two ways to interact with the character's data. It is possible to read the data, using formulas, and execute procedures upon it.

## Formulas
**formulas** are a built in extendable syntax for reading complex, logic based information from the fields.
Formulas are defined using a pattern, their type, and the calculation of the result using preexisting formulas.
The key of the formula is its pattern with parentheses in the end containing the returned type.
```yaml
mechanisms:
  walk:
    formulas:
      <number:meters> in kilometers (number): meters / 1000
```
For a full rundown of the formula definition pattern see [pattern](). For a full list of preexisting formulas see [formulas]().

## Procedures
**procedures** are a built in extendable syntax for executing complex logic that will change the fields and interact with the player.
Procedures are defined using a pattern, and a set of direction to execute using preexisting formulas.
```yaml
mechanisms:
  roll:
    procedure:
      roll check +<number> greater then <number:threshold>:
        - define result = 1d20 + number
        - is result > threshold:
          yes: show success
          no: show failure
```
For a full rundown of the procedure definition pattern see [pattern](). For a full list of preexisting procedures see [procedures]().

## Types
**types** are used to defined reusable types (similar to structs in C). These are later usable in defining fields and formulas. They are defined using a simple yarn structure the defined the structure of the type.
```yaml
mechanisms:
  shapes:
    types:
      shape:
        name: text
        edges: number
```
In order to create an object of that type all the is needed to be done is using the object formula syntax:
```yaml
mechanisms:
  shapes:
    types:
      shape:
        name: text
        edges: number
    global fields:
      square: { name: square, edges: 4 }
```

## Hooks
While it is possible to call **procedures** manually upon player interaction, it is sometimes desired to call them without prompting, upon certain events in the character life cycle. A mechanism may define hooks that will call procedures at those events.
```yaml
mechanisms:
  shapes:
    character fields:
      radius: 0
    hooks:
      on initialization over: add 1 to raidus
```
the available hooks are:
 - initialization over: after character creation
 - death
 - revival
 - change start: before changing a character field
 - change over: after changing a character field
 - get start: before getting a value
 - get over: after getting a value
 - execution start: before starting execution of a procedure
 - execution over: after starting execution of a procedure
