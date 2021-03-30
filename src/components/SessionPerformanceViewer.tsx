import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { IPerformanceStats } from "../definitions";

interface ISessionPerformanceViewerProps {
    endpoint: string;
}

export const SessionPerformanceViewer: FunctionComponent<ISessionPerformanceViewerProps> = (
    props
) => {
    const [perfStats, setPerfStats] = useState<IPerformanceStats>();
    const refreshSessionPerformance = useCallback(() => {
        fetch(props.endpoint)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Perf stats request failed");
                }
                return response.json();
            })
            .then((responseStats: IPerformanceStats) => {
                setPerfStats(responseStats);
            })
            .catch((error) => console.error(error));
    }, [props.endpoint, setPerfStats]);
    useEffect(() => {
        refreshSessionPerformance();
    }, []);
    return (
        <div>
            <h4>Performance Stats</h4>
            <button onClick={refreshSessionPerformance}>Refresh</button>
            {perfStats ? <pre>{JSON.stringify(perfStats, null, 2)}</pre> : null}
        </div>
    );
};
