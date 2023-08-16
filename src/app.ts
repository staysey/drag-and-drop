enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

type Listener = (items: Project[]) => void;

class ProjectState {
  private listeners: Listener[] = [];
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    return new ProjectState();
  }

  addListener(listener: Listener) {
    this.listeners.push(listener);
  }

  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    );
    this.projects.push(newProject);

    for (const listener of this.listeners) {
      listener(this.projects.slice()); //copy of projects
    }
  }
}

//always work with the same instance -> singleton pattern
//global constant
const projectState = ProjectState.getInstance();

//Validation logic
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function Binder(_: any, _2: string, descriptor: PropertyDescriptor) {
  return {
    enumerable: false,
    configurable: true,
    get() {
      const bindedF = descriptor.value.bind(this);
      return bindedF;
    },
  };
}

class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProjects: Project[];

  constructor(private type: "active" | "finished") {
    this.assignedProjects = [];

    this.templateElement = <HTMLTemplateElement>(
      document.getElementById("project-list")!
    );
    this.hostElement = <HTMLDivElement>document.getElementById("app")!; //where to insert our form

    const importedHtmlContent = document.importNode(
      this.templateElement.content,
      true //deep clone all children
    );
    this.element = <HTMLElement>importedHtmlContent.firstElementChild;
    this.element.id = `${this.type}-projects`; //form tag id

    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((prj) => {
        if (this.type === "active") return prj.status === ProjectStatus.Active;
        return prj.status === ProjectStatus.Finished;
      });

      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });

    this.attach(); //attach to DOM
    this.renderContent();
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = "";
    for (const project of this.assignedProjects) {
      const listItem = document.createElement("li");
      listItem.textContent = project.title;
      listEl.appendChild(listItem);
    }
  }

  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.element);
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`; //reach out to ul
    this.element.querySelector("ul")!.id = listId;

    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }
}

class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = <HTMLTemplateElement>(
      document.getElementById("project-input")!
    );
    this.hostElement = <HTMLDivElement>document.getElementById("app")!; //where to insert our form

    const importedHtmlContent = document.importNode(
      this.templateElement.content,
      true //deep clone all children
    );
    this.element = <HTMLFormElement>importedHtmlContent.firstElementChild;
    this.element.id = "user-input"; //form tag id

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
    this.attach();
  }

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

  private configure() {
    //inside ob submitHandler will refer to the context of configure (look at this.element => refer to the class)
    this.element.addEventListener("submit", this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

const prjInput = new ProjectInput();

const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
