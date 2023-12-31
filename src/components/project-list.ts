import BaseComponent from "./base-component";
import { DragTarget } from "../models/drag-drop";
import { Binder } from "../decorators/autobind";
import { projectState } from "../state/project";
import * as ProjectModel from "../models/project";
import { ProjectItem } from "./project-item";

export class ProjectList
  extends BaseComponent<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: ProjectModel.Project[];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);

    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  @Binder
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event?.preventDefault();
      const listEl = this.element.querySelector("ul")!;
      listEl.classList.add("droppable");
    }
  }

  @Binder
  dropHandler(event: DragEvent) {
    const prjId = event.dataTransfer!.getData("text/plain");
    projectState.moveProject(
      prjId,
      this.type === "active"
        ? ProjectModel.ProjectStatus.Active
        : ProjectModel.ProjectStatus.Finished
    );
  }

  @Binder
  dragLeaveHandler(_: DragEvent) {
    const listEl = this.element.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }

  renderContent() {
    const listId = `${this.type}-projects-list`; //reach out to ul
    this.element.querySelector("ul")!.id = listId;

    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }

  configure() {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);
    this.element.addEventListener("drop", this.dropHandler);

    projectState.addListener((projects: ProjectModel.Project[]) => {
      const relevantProjects = projects.filter((prj) => {
        if (this.type === "active")
          return prj.status === ProjectModel.ProjectStatus.Active;
        return prj.status === ProjectModel.ProjectStatus.Finished;
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
