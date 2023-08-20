namespace App {
  //Component Base Class - abstract because is used only for inheritance
  //abstract methods - to show the idea behind this class

  export abstract class Component<
    T extends HTMLElement,
    U extends HTMLElement
  > {
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
}
