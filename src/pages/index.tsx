import { useRouter } from "next/dist/client/router";
import { FunctionComponent, useEffect, useState } from "react";
import { createNewSessionContainer } from "../client-utils";

export const Home: FunctionComponent = () => {
    const router = useRouter();
    const [error, setError] = useState<Error | undefined>();
    useEffect(() => {
        createNewSessionContainer()
            .then((container) => {
                router.push(`/doc/${container.id}`);
            })
            .catch((error) => {
                setError(
                    error instanceof Error
                        ? error
                        : new Error(
                              `Failed to create container: ${JSON.stringify(
                                  error
                              )}`
                          )
                );
            });
    }, []);
    return error === undefined ? (
        <div>Redirecting to new document...</div>
    ) : (
        <div>
            <b>{error.name}</b>
            <pre>
                <code>{error.message}</code>
            </pre>
        </div>
    );
};

export default Home;
