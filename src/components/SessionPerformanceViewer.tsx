import {
    ChangeEvent,
    FunctionComponent,
    useCallback,
    useMemo,
    useState,
} from "react";
import { IPerformanceStats } from "../definitions";
import { Table } from "./Table";

interface ISessionPerformanceViewerProps {
    stats: IPerformanceStats | undefined;
}

const convertStatKeyToHeaderStr = (statKey: string) =>
    statKey
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .replace("In Ms", "(ms)");
const convertRawValueToDisplayValue = (value: string | number) =>
    typeof value === "number" ? Math.floor(value) : value;

export const SessionPerformanceViewer: FunctionComponent<ISessionPerformanceViewerProps> =
    (props) => {
        const [filter, setFilter] = useState<string>("");
        const filteredStatsArr: (IPerformanceStats & {
            eventName: string;
        })[] = useMemo(
            () =>
                props.stats
                    ? Object.entries(props.stats)
                          .filter(([key]) =>
                              key.toLowerCase().includes(filter.toLowerCase())
                          )
                          .map(([key, stat]) => ({
                              eventName: key.replace("fluid:telemetry:", ""),
                              ...stat,
                          }))
                    : [],
            [props.stats, filter]
        );
        const handleFilterChange = useCallback(
            (e: ChangeEvent<HTMLInputElement>) => {
                setFilter(e.currentTarget.value || "");
            },
            [setFilter]
        );
        return (
            <div className="session-performance-viewer">
                <label>
                    <span>Filter</span>
                    <input
                        type="text"
                        name="filter"
                        value={filter}
                        onInput={handleFilterChange}
                    />
                </label>
                <Table
                    data={Object.fromEntries(
                        filteredStatsArr.map((stat) => [
                            stat.eventName,
                            stat as unknown as Record<string, string | number>,
                        ])
                    )}
                    convertKeyToHeader={convertStatKeyToHeaderStr}
                    convertValueToDisplayValue={convertRawValueToDisplayValue}
                />
                <style jsx>{`
                    .session-performance-viewer {
                        margin-top: 1rem;
                    }
                    label {
                        display: flex;
                        flex-grow: 1;
                        background-color: var(--background);
                        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
                            0 5px 10px -5px rgba(0, 0, 0, 0.04);
                        border-radius: 0.1em;
                        align-items: center;
                        position: relative;
                    }
                    label span {
                        padding: 1em;
                        font-weight: 700;
                        text-transform: uppercase;
                        font-size: 0.7em;
                        text-shadow: 0 1px 0 rgb(0, 0, 0, 0.1);
                    }
                    label input {
                        position: relative;
                        border: none;
                        line-height: 100%;
                        flex-grow: 1;
                        padding: 0.3em;
                        font: inherit;
                        font-weight: 400;
                    }
                `}</style>
            </div>
        );
    };
