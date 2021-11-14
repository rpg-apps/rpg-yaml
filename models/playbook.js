export default class Playbook {
  constructor (mechanisms, data) {
    this.mechanisms = mechanisms
    Object.assign(this, data)
  }
}
