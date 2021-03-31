import { Container } from "@fluidframework/container-loader";
import { IPerformanceStats, ISessionResponse } from "../definitions";
import { getContainer, startFluidApp } from "../fluid";
import sillyname from "sillyname";

export const joinSessionContainer = async (
    rootId: string,
    forceNewSession = false
): Promise<Container | undefined> => {
    const sessionResponse: ISessionResponse | undefined = await fetch(
        `/api/session?action=open&forceNew=${forceNewSession}`
    )
        .then((response) => {
            if (!response.ok) {
                console.error("Call to retrieve session info failed");
                return undefined;
            }
            return response.json();
        })
        .catch((error) => {
            console.error(error);
            return undefined;
        });
    if (!sessionResponse) {
        console.error("Failed to join session");
        return undefined;
    }
    // TODO: replace with authentication
    const userId = `${(sillyname() as string)
        .split(" ")
        .join("")
        .toLowerCase()}@contoso.net`;
    console.log({
        createNew: sessionResponse.new,
        documentId: sessionResponse.id,
        userId,
    });
    let container: Container;
    try {
        container = await getContainer(
            sessionResponse.id,
            sessionResponse.new,
            userId
        );
        const clientId = await startFluidApp(rootId, container);
        console.log("Good to go 👌");
        console.log(`Client id: ${clientId}`);
    } catch (e) {
        console.error(e);
        void fetch(`/api/session?action=close`);
        return undefined;
    }
    window.addEventListener("beforeunload", () => {
        void fetch(`/api/session?action=close`);
    });
    return container;
};

export const retrieveSessionPerformance = (
    endpoint: string
): Promise<IPerformanceStats | undefined> =>
    fetch(endpoint)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Perf stats request failed");
            }
            return response.json();
        })
        .then((responseStats: IPerformanceStats) => {
            return responseStats;
        })
        .catch((error) => {
            console.error(error);
            return undefined;
        });
