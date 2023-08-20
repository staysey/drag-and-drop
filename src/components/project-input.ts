import { Component } from "./base-component.js";
import { Validatable } from "../utils/validation.js";
import { Binder } from "../decorators/autobind.js";
import { projectState } from "../state/project.js";

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");
    this.titleInputElement = <HTMLInputElement>(
      this.element.querySelector("#title")!
    );
    this.descriptionInputElement = <HTMLInputElement>(
      this.element.querySelector("#description")!
    );
    this.peopleInputElement = <HTMLInputElement>(
      this.element.querySelector("#people")!
    );

    this.configure();
  }

  configure() {
    //inside ob submitHandler will refer to the context of configure (look at this.element => refer to the class)
    this.element.addEventListener("submit", this.submitHandler);
  }

  renderContent(): void {}

  private validate(configuration: Validatable): boolean {
    const { value } = configuration;
    if (configuration.required) {
      if (value.toString().trim().length === 0) {
        return false;
      }
    }
    if (configuration.minLength && typeof value === "string") {
      if (value.trim().length < configuration.minLength) {
        return false;
      }
    }
    if (configuration.maxLength && typeof value === "string") {
      if (value.trim().length > configuration.maxLength) {
        return false;
      }
    }
    if (configuration.min && typeof value === "number") {
      if (value < configuration.min) {
        return false;
      }
    }

    if (configuration.max && typeof value === "number") {
      if (value > configuration.max) {
        return false;
      }
    }

    return true;
  }

  private getUserInputData(): [string, string, number] | void {
    const title = this.titleInputElement.value;
    const description = this.descriptionInputElement.value;
    const people = this.peopleInputElement.value;

    if (
      !this.validate({ value: title, required: true }) ||
      !this.validate({ value: +people, required: true, max: 6 }) ||
      !this.validate({ value: title, required: true })
    ) {
      alert("Invalid input!");
      return;
    } else return [title, description, +people];
  }

  private clearInput() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  @Binder
  private submitHandler(event: Event) {
    event.preventDefault();
    const userData = this.getUserInputData();

    if (Array.isArray(userData)) {
      const [title, description, people] = userData;
      projectState.addProject(title, description, people);
      this.clearInput();
    }
  }
}
