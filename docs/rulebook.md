# Rulebook

A **rulebook** is a `yaml` file representing a bundle of rules. Those rules come in the forms of **mechanisms** and **playbooks**.

## Mechanisms
**Mechanisms** are the building block of a **rulebook**. Each one is an encapsulated set of rules, meant to work within itself (to a certain degree).
For more about the structure and content of a mechanism see [mechanism]().

## Playbooks
**Playbooks** are like mini-rulebooks for specific classes. They contain data corresponding to the **mechanisms** of the **rulebook**, as well as its own defined **mechanisms**.
