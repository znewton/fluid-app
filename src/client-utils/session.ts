import { Container } from "@fluidframework/container-loader";
import { IPerformanceStats } from "../definitions";
import { createContainer, getContainer, startFluidApp } from "../fluid";
import sillyname from "sillyname";

const generateUserId = () =>
    `${(sillyname() as string).split(" ").join("").toLowerCase()}@contoso.net`;

const checkDocumentExists = async (docId): Promise<boolean> => {
    const exists = await fetch(`/api/doc?docId=${docId}`).then((response) => {
        if (!response.ok) {
            throw new Error("Call to check doc exists failed");
        }
        return response.text();
    });
    return exists === "true";
};

export const createNewSessionContainer = async (): Promise<Container> => {
    const userId = generateUserId();

    const container: Container = await createContainer(userId);
    console.log("Document created 👊");
    console.log(container);
    return container;
};

export const getSessionContainer = async (
    rootId: string,
    documentId: string
): Promise<Container | undefined> => {
    const userId = generateUserId();

    if (!(await checkDocumentExists(documentId))) {
        throw new Error("Document does not exist");
    }

    console.log({
        documentId,
        userId,
    });
    let container: Container;
    try {
        container = await getContainer(documentId, userId);
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
