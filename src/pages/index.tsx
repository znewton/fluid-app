import { useRouter } from "next/dist/client/router";
import { FunctionComponent, useEffect } from "react";
import sillyname from "sillyname";

export const Home: FunctionComponent = () => {
    const router = useRouter();
    useEffect(() => {
        const newDocId = (sillyname() as string)
            .split(" ")
            .join("-")
            .toLowerCase();
        router.push(`/doc/${newDocId}`);
    }, []);
    return <div>Redirecting to new document...</div>;
};

export default Home;
