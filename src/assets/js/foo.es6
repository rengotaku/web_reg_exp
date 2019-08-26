class Person {
  constructor(name) {
    this.name = name;
  }
  sayHello() {
    console.log("Hello, I'm " + this.getName());
  }
  getName() {
    return this.name;
  }
}