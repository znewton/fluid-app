import {
    DataObject,
    getDefaultObjectFromContainer,
} from "@fluidframework/aqueduct";
import type { Container } from "@fluidframework/container-loader";
import type { IFluidHTMLView } from "@fluidframework/view-interfaces";

interface FluidHtmlViewDataObject extends DataObject, IFluidHTMLView {}

export async function startFluidApp<
    FluidAppView extends FluidHtmlViewDataObject
>(rootElementId: string, container: Container): Promise<string> {
    // Attach container listeners
    const containerConnectedP = new Promise<string>((resolve, reject) => {
        if (container.connected) {
            resolve(container.clientId || "unknown");
        } else if (container.closed) {
            reject();
        } else {
            container.addListener("connected", (clientId) => {
                console.log(`Container: ${clientId} connected`);
                resolve(clientId);
            });
            container.addListener("closed", (error) => {
                console.warn("Container: closed");
                if (error) {
                    console.error(error);
                }
                reject(error);
            });
        }
    });

    // Get the Default Object from the Container
    const defaultObject = await getDefaultObjectFromContainer<FluidAppView>(
        container
    );

    // For now we will just reach into the FluidObject to render it
    const rootElement = document.getElementById(rootElementId);
    if (rootElement !== null) {
        defaultObject.render(rootElement);
    } else {
        console.error(`Can't find root element with id ${rootElementId}`);
        return Promise.reject();
    }
    return containerConnectedP;
}
