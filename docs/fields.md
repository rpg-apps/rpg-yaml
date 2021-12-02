# Fields
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
