import Head from "next/head";
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import type { Container } from "@fluidframework/container-loader";
import { ConnectedIndicator } from "../../components/ConnectedIndicator";
import { SessionPerformanceViewer } from "../../components";
import {
    getSessionContainer,
    retrieveSessionPerformance,
} from "../../client-utils";
import { IPerformanceStats } from "../../definitions";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import sillyname from "sillyname";

const rootId = "fluid-content";

interface IDocPageProps {
    docId: string;
}

const Doc: FunctionComponent<IDocPageProps> = ({ docId }) => {
    const [container, setContainer] = useState<Container | undefined>();
    const [perfStats, setPerfStats] = useState<IPerformanceStats | undefined>();
    const refreshSessionPerformance = useCallback(
        () => retrieveSessionPerformance("/api/perf", docId).then(setPerfStats),
        [setPerfStats]
    );
    useEffect(() => {
        const containerP = getSessionContainer(rootId, docId);
        containerP.then(setContainer).catch((error) => console.error(error));
    }, []);
    useEffect(() => {
        refreshSessionPerformance();
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
                <h4>Performance Stats</h4>
                <button onClick={refreshSessionPerformance}>Refresh</button>
                <SessionPerformanceViewer stats={perfStats} />
            </footer>
        </div>
    );
};

export function getServerSideProps(
    context: GetServerSidePropsContext
): GetServerSidePropsResult<IDocPageProps> {
    let docId = context.params?.docId;
    if (docId instanceof Array) {
        docId = docId[0];
    }
    if (!docId) {
        docId = (sillyname() as string).split(" ").join("-").toLowerCase();
    }
    return {
        props: { docId },
    };
}

export default Doc;
