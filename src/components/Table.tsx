import { FunctionComponent } from "react";

interface ITableProps {
    data: Record<string, Record<string, string | number>>;
    convertKeyToHeader?: (key: string) => string;
    convertValueToDisplayValue?: (value: string | number) => string | number;
}

export const Table: FunctionComponent<ITableProps> = ({
    data,
    convertKeyToHeader = (key: string) => key,
    convertValueToDisplayValue = (value: string | number) => value,
}) => {
    const primaryKeys = Object.keys(data);
    const columnHeaders =
        primaryKeys.length > 0
            ? Object.keys(data[primaryKeys[0]]).map((key) => [
                  key,
                  convertKeyToHeader(key),
              ])
            : [];
    return (
        <>
            <table>
                <thead>
                    {primaryKeys.length > 0 ? (
                        <tr>
                            {columnHeaders.map(([key, header]) => (
                                <th key={key}>{header}</th>
                            ))}
                        </tr>
                    ) : (
                        <tr>
                            <th colSpan={0}>No results</th>
                        </tr>
                    )}
                </thead>
                <tbody>
                    {primaryKeys.map((primaryKey) => (
                        <tr key={primaryKey}>
                            {Object.entries(data[primaryKey]).map(
                                ([key, value]) => (
                                    <td key={key}>
                                        {convertValueToDisplayValue(value)}
                                    </td>
                                )
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            <style jsx>{`
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
            `}</style>
        </>
    );
};
