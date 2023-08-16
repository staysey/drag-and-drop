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

type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listener: Listener<T>) {
    this.listeners.push(listener);
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    return new ProjectState();
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

//Component Base Class - abstract because is used only for inheritance
//abstract methods - to show the idea behind this class

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLElement;
  element: HTMLElement;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateElement = <HTMLTemplateElement>(
      document.getElementById(templateId)!
    );
    this.hostElement = <T>document.getElementById(hostElementId)!; //where to insert our form

    const importedHtmlContent = document.importNode(
      this.templateElement.content,
      true //deep clone all children
    );
    this.element = <U>importedHtmlContent.firstElementChild;
    if (newElementId) this.element.id = newElementId;

    this.attach(insertAtStart);
  }

  private attach(insertAtStart: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtStart ? "afterbegin" : "beforeend",
      this.element
    );
  }

  //implementation will be in children classes
  abstract configure(): void;
  abstract renderContent(): void;
}

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> {
  private project: Project;

  get persons() {
    if (this.project.people === 1) {
      return "1 person";
    } else {
      return `${this.project.people} persons`;
    }
  }

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  configure() {}

  renderContent() {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent = this.persons + " assigned";
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProjects: Project[];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);

    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  renderContent() {
    const listId = `${this.type}-projects-list`; //reach out to ul
    this.element.querySelector("ul")!.id = listId;

    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }

  configure() {
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((prj) => {
        if (this.type === "active") return prj.status === ProjectStatus.Active;
        return prj.status === ProjectStatus.Finished;
      });

      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = "";
    for (const project of this.assignedProjects) {
      new ProjectItem(this.element.querySelector("ul")!.id, project);
    }
  }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

const prjInput = new ProjectInput();

const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
