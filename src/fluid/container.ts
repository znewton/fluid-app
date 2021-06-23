import { ContainerRuntimeFactoryWithDefaultDataStore } from "@fluidframework/aqueduct";
import { Container, Loader } from "@fluidframework/container-loader";
import { RouterliciousDocumentServiceFactory } from "@fluidframework/routerlicious-driver";
import { TelemetryLogger } from "./telemetryLogger";
import { TokenProvider } from "./tokenProvider";
import { UrlResolver } from "./urlResolver";
import { FluidView } from "./view";

export async function getContainer(
    documentId: string,
    createNew: boolean,
    userId: string
): Promise<Container> {
    const containerRuntimeFactory = new ContainerRuntimeFactoryWithDefaultDataStore(
        FluidView.getFactory(),
        [[FluidView.Name, Promise.resolve(FluidView.getFactory())]]
    );
    const tokenProvider = new TokenProvider("/api/token", userId);
    const urlResolver = new UrlResolver("/api/resolve", documentId, userId);
    const documentServiceFactory = new RouterliciousDocumentServiceFactory(
        tokenProvider,
        { enablePrefetch: true }
    );
    const logger = new TelemetryLogger("/api/log", documentId, 30);

    const module = { fluidExport: containerRuntimeFactory };
    const codeLoader = { load: async () => module };

    const loader = new Loader({
        urlResolver,
        documentServiceFactory,
        codeLoader,
        logger,
    });

    let container: Container;

    if (createNew) {
        container = await loader.createDetachedContainer({
            package: "no-dynamic-package",
            config: {},
        });
        await container.attach({ url: documentId });
    } else {
        container = await loader.resolve({ url: documentId });
        if (!container.existing) {
            throw new Error("Attempted to load a non-existing container");
        }
    }
    return container;
}
