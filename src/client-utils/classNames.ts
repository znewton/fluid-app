export class ClassNameBuilder {
    private readonly classList: string[] = [];

    constructor(initialClassName?: string) {
        if (initialClassName) {
            this.classList.push(initialClassName);
        }
    }

    public add(
        className: string,
        condition: boolean | (() => boolean)
    ): ClassNameBuilder {
        if (typeof condition === "function" ? condition() : condition) {
            this.classList.push(className);
        }
        return this;
    }

    public toString(): string {
        return this.classList.join(" ");
    }
}
