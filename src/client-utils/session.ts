import { Container } from "@fluidframework/container-loader";
import { IPerformanceStats } from "../definitions";
import { getContainer, startFluidApp } from "../fluid";
import sillyname from "sillyname";

const checkDocumentExists = async (docId): Promise<boolean> => {
    const exists = await fetch(`/api/doc?docId=${docId}`).then((response) => {
        if (!response.ok) {
            throw new Error("Call to check doc exists failed");
        }
        return response.text();
    });
    return exists === "true";
};

export const getSessionContainer = async (
    rootId: string,
    docId: string
): Promise<Container | undefined> => {
    const userId = `${(sillyname() as string)
        .split(" ")
        .join("")
        .toLowerCase()}@contoso.net`;

    const createNew = !(await checkDocumentExists(docId));

    console.log({
        createNew: createNew,
        documentId: docId,
        userId,
    });
    let container: Container;
    try {
        container = await getContainer(docId, createNew, userId);
        const clientId = await startFluidApp(rootId, container);
        console.log("Good to go 👌");
        console.log(`Client id: ${clientId}`);
    } catch (e) {
        console.error(e);
        return undefined;
    }
    return container;
};

export const retrieveSessionPerformance = (
    endpoint: string,
    docId: string
): Promise<IPerformanceStats | undefined> =>
    fetch(`${endpoint}?id=${docId}`)
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
