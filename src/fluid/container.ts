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
    const containerRuntimeFactory =
        new ContainerRuntimeFactoryWithDefaultDataStore(
            FluidView.getFactory(),
            [[FluidView.Name, Promise.resolve(FluidView.getFactory())]]
        );
    const tokenProvider = new TokenProvider("/api/token", userId, false);
    const urlResolver = new UrlResolver("/api/resolve", documentId, userId);
    const url = new URL(window.location.toString());
    const querySettings = {
        enableBlobAggregation:
            url.searchParams.get("enableBlobAggregation") !== null,
        disablePrefetch: url.searchParams.get("disablePrefetch") !== null,
        disableRateLimiting: url.searchParams.get("disableRateLimit") !== null,
    };
    console.log("Driver Settings:", querySettings);
    localStorage.FluidAggregateBlobs = querySettings.enableBlobAggregation
        ? "1"
        : "0";
    const documentServiceFactory = new RouterliciousDocumentServiceFactory(
        tokenProvider,
        {
            enablePrefetch: querySettings.disablePrefetch ? false : true,
            maxConcurrentStorageRequests: querySettings.disableRateLimiting
                ? 1000000
                : 100,
            maxConcurrentOrdererRequests: querySettings.disableRateLimiting
                ? 1000000
                : 100,
            aggregateBlobsSmallerThanBytes: querySettings.enableBlobAggregation
                ? 2048
                : undefined,
        }
    );
    const logger = new TelemetryLogger("/api/log", documentId, 100);

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
    }
    return container;
}
