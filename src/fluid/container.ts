import { ContainerRuntimeFactoryWithDefaultDataStore } from "@fluidframework/aqueduct";
import { Container, Loader } from "@fluidframework/container-loader";
import { RouterliciousDocumentServiceFactory } from "@fluidframework/routerlicious-driver";
import { TelemetryLogger } from "./telemetryLogger";
import { TokenProvider } from "./tokenProvider";
import { UrlResolver } from "./urlResolver";
import { FluidView } from "./view";

function getLoader(userId: string, documentId?: string): Loader {
    const containerRuntimeFactory =
        new ContainerRuntimeFactoryWithDefaultDataStore(
            FluidView.getFactory(),
            [[FluidView.Name, Promise.resolve(FluidView.getFactory())]]
        );
    const tokenProvider = new TokenProvider("/api/token", userId);
    const urlResolver = new UrlResolver("/api/resolve", documentId, userId);
    localStorage.FluidAggregateBlobs = "0";
    const documentServiceFactory = new RouterliciousDocumentServiceFactory(
        tokenProvider,
        { enablePrefetch: false }
    );
    const logger = new TelemetryLogger("/api/log", 100);
    if (documentId) {
        logger.setDocId(documentId);
    }

    const module = { fluidExport: containerRuntimeFactory };
    const codeLoader = { load: async () => module };

    return new Loader({
        urlResolver,
        documentServiceFactory,
        codeLoader,
        logger,
    });
}

export async function createContainer(userId: string): Promise<Container> {
    const loader = getLoader(userId);
    const container = await loader.createDetachedContainer({
        package: "no-dynamic-package",
        config: {},
    });
    await container.attach({ url: "" });
    return container;
}

export async function getContainer(
    documentId: string,
    userId: string
): Promise<Container> {
    const loader = getLoader(userId, documentId);

    return loader.resolve({ url: documentId });
}
