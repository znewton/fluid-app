import { render } from "react-dom";
import { DataObject, DataObjectFactory } from "@fluidframework/aqueduct";
import { IFluidHTMLView } from "@fluidframework/view-interfaces";
import {
    IDirectory,
    IDirectoryValueChanged,
    SharedMap,
} from "@fluidframework/map";
import { CollaborativeNotebook } from "../components";

export class FluidView extends DataObject implements IFluidHTMLView {
    private internalMapDir: IDirectory | undefined;
    protected get mapDir(): IDirectory {
        return this.tryGetDds(this.internalMapDir, "mapDir");
    }

    public get IFluidHTMLView(): IFluidHTMLView {
        return this;
    }

    public static get Name(): string {
        return "fluid-app";
    }

    private static readonly factory = new DataObjectFactory(
        FluidView.Name,
        FluidView,
        [SharedMap.getFactory()],
        {}
    );

    public static getFactory(): DataObjectFactory<any, any, any, any> {
        return this.factory;
    }

    protected async initializingFirstTime(): Promise<void> {
        this.internalMapDir = this.root.createSubDirectory("map");
    }

    protected async initializingFromExisting(): Promise<void> {
        this.internalMapDir = this.root.getSubDirectory("map");
    }

    /**
     * Renders a new view into the provided div
     */
    public render(div: HTMLElement): HTMLElement {
        if (this.internalMapDir === undefined) {
            // throw new Error("The Map Directory was not initialized correctly");
        }
        const mapCreate = (name: string) =>
            SharedMap.create(this.runtime, name);
        const mapListen = (
            listener: (changed: IDirectoryValueChanged) => void
        ) => {
            this.root.on("valueChanged", (changed) => {
                if (changed.path !== this.mapDir.absolutePath) {
                    return;
                }
                listener(changed);
            });
        };
        render(
            <>
                <CollaborativeNotebook
                    mapDir={this.mapDir}
                    mapCreate={mapCreate}
                    listenValueChanged={mapListen}
                />
            </>,
            div
        );
        return div;
    }

    private tryGetDds<T>(dds: T | undefined, id: string): T {
        if (dds === undefined) {
            throw Error(`${id} must be initialized before being accessed.`);
        }
        return dds;
    }
}
