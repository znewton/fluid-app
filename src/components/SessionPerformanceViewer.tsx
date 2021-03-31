import { FunctionComponent, useCallback, useMemo, useState } from "react";
import { IPerformanceStats } from "../definitions";

interface ISessionPerformanceViewerProps {
    stats: IPerformanceStats | undefined;
}

export const SessionPerformanceViewer: FunctionComponent<ISessionPerformanceViewerProps> = (
    props
) => {
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
        (e) => {
            setFilter(e.target.value || "");
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
            <table>
                <thead>
                    {filteredStatsArr.length > 0 ? (
                        <tr>
                            {Object.entries(filteredStatsArr[0]).map(
                                ([key]) => (
                                    <th key={key}>
                                        {key
                                            .replace(/([A-Z])/g, " $1")
                                            .replace(/^./, (str) =>
                                                str.toUpperCase()
                                            )
                                            .replace("In Ms", "(ms)")}
                                    </th>
                                )
                            )}
                        </tr>
                    ) : (
                        <tr>
                            <th colSpan={0}>No results</th>
                        </tr>
                    )}
                </thead>
                <tbody>
                    {filteredStatsArr.map((stat) => (
                        <tr key={stat.eventName}>
                            {Object.entries(stat).map(([key, value]) => (
                                <td key={key}>
                                    {typeof value === "number"
                                        ? Math.floor(value)
                                        : value}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <style jsx>{`
                .session-performance-viewer {
                    margin-top: 1rem;
                }
                table {
                    border-collapse: collapse;
                    margin-top: 1rem;
                    background-color: var(--background);
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
                        0 5px 10px -5px rgba(0, 0, 0, 0.04);
                    border-radius: 0.1em;
                }
                tr:nth-child(even) {
                    background-color: var(--midbackground);
                }
                th {
                    padding: 0.7rem;
                    text-align: left;
                    font-weight: 700;
                    text-transform: uppercase;
                    font-size: 0.7em;
                    text-shadow: 0 1px 0 rgb(0, 0, 0, 0.1);
                }
                td {
                    padding: 0.7rem;
                    font-weight: 300;
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
