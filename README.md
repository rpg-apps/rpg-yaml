# rpg.yaml

The *rpg.yaml* infrastructure is meant to be a source for containing and running open-source table-top role-playing-games.
In the heart of the infrastructure is the YAML language with which it's possible to encapsulate the rules and procedures of the game.

## Guidelines
There are a two ideas that guides us as we design the language and its rules:
**Simplicity**
It was important to us to make the rules as close as possible to the original rules of the game so it would be easy to transfer systems from written in human language to written in *rpg.yaml*. This is the main reason YAML was chosen as the base language. The hierarchy of the document is just complex enough to allow us to include English phrases and create complex mechanisms without breaking a sweat.
**Extendablity**
The ability to extends and change the game is important to anyone playing TTRPG, and to the community as a whole.
For this reason, the game language is completely extendable, and the parser is able to compile several YAML files at once, allowing them to override each other in the order of your choice.
