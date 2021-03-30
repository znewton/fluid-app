import Head from "next/head";
import { FunctionComponent, useEffect, useState } from "react";
import { getContainer, startFluidApp } from "../fluid";
import sillyname from "sillyname";
import type { Container } from "@fluidframework/container-loader";
import { ConnectedIndicator } from "../components/ConnectedIndicator";
import { ISessionResponse } from "../definitions";
import { SessionPerformanceViewer } from "../components";

const rootId = "fluid-content";

const joinSessionContainer = async (): Promise<Container | undefined> => {
    const sessionResponse: ISessionResponse | undefined = await fetch(
        `/api/session?action=open`
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

const Home: FunctionComponent = () => {
    const [container, setContainer] = useState<Container | undefined>();
    useEffect(() => {
        const containerP = joinSessionContainer();
        containerP.then(setContainer).catch((error) => console.error(error));
    }, []);
    return (
        <div>
            <Head>
                <title>Home - fluid-app</title>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="initial-scale=1.0, width=device-width"
                />
            </Head>
            <header>
                <h1>Fluid App</h1>
                <ConnectedIndicator container={container} />
            </header>

            <main>
                <div id={rootId}>Loading...</div>
            </main>

            <footer>
                <SessionPerformanceViewer endpoint="/api/perf" />
            </footer>
        </div>
    );
};

export default Home;
