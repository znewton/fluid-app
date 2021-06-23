import { IDirectory, ISharedMap, IValueChanged } from "@fluidframework/map";
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { useTrackLoad } from "../../client-utils";
import { PageViewer } from "./PageViewer";
import { addPageToMap, getMapFromDirectory } from "./utils";

interface ISectionViewerProps {
    name: string;
    mapDir: IDirectory;
}

export const SectionViewer: FunctionComponent<ISectionViewerProps> = (
    props
) => {
    useTrackLoad("SectionViewer");
    const [openPageName, setOpenPageName] = useState<string>("");
    const [map, setMap] = useState<ISharedMap>();
    const [keys, setKeys] = useState<string[]>([]);
    useEffect(() => {
        const getMap = async () => {
            const map = await getMapFromDirectory(props.mapDir, props.name);
            setMap(map);
        };
        getMap();
    }, [props.mapDir, props.name]);
    useEffect(() => {
        if (map === undefined) return;
        const refresh = () => {
            setKeys(Array.from(map.keys()).sort());
        };
        const handleChange = (changed: IValueChanged) => {
            // add
            if (changed.previousValue === undefined) {
                refresh();
                return;
            }

            // delete
            const newValue = map.get(changed.key);
            if (newValue === undefined) {
                refresh();
            }
        };
        refresh();
        map.on("valueChanged", handleChange);
        return () => {
            if (map !== undefined) {
                map.off("valueChanged", handleChange);
            }
        };
    }, [map]);
    const handlePageSelect = useCallback(
        (key: string) => {
            setOpenPageName(key);
        },
        [setOpenPageName]
    );

    const addManyPages = useCallback(() => {
        if (map === undefined) return;

        for (let i = 0; i < 100; i++) {
            addPageToMap(map);
        }
    }, [map]);

    const addPage = useCallback(() => {
        if (map === undefined) return;

        addPageToMap(map);
    }, [map]);

    if (map === undefined) return <div>Loading...</div>;

    return (
        <div className="section-viewer">
            <div className="page-list">
                <div className="page-list-header">
                    <button onClick={addPage}>+ Add Page</button>
                    <button onClick={addManyPages}>+ Add Many Pages</button>
                </div>
                <ul>
                    {keys.map((key) => (
                        <li
                            key={key}
                            onClick={() => handlePageSelect(key)}
                            className={openPageName === key ? "open" : "closed"}
                        >
                            {key}
                        </li>
                    ))}
                </ul>
            </div>

            {/* This is intentionally efficient.
                It only fuly loads the page viewer that is selected. */}
            <article>
                <PageViewer map={map} mapKey={openPageName} />
            </article>

            {/* This is intentionally inefficient.
                It fully loads all page viewers, even when they are not visible.
                However, if we want to measure "full page load", this is a great way to do it.
                The downside is that this will add event listeners for all the pages at once.
                TODO: find a way to do this efficiently when we want, and inefficiently when we don't want, more easily. */}
            {/* {keys.map((key) => (
                <article
                    key={key}
                    className={openPageName === key ? "open" : "closed"}
                >
                    <PageViewer map={map} mapKey={key} />
                </article>
            ))} */}

            <style jsx>{`
                .section-viewer {
                    display: flex;
                    height: 100%;
                    padding: 0.5em;
                    background-color: var(--background);
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
                        0 5px 10px -5px rgba(0, 0, 0, 0.04);
                    border-radius: 0.1em;
                }
                article {
                    flex-grow: 1;
                }
                article.closed {
                    display: none;
                }
                .page-list ul {
                    list-style: none;
                    padding: 0;
                    max-height: 27em;
                    overflow-y: auto;
                }
                .page-list li {
                    padding: 1em 0.5em;
                    border-bottom: 1px solid var(--midbackground);
                }
                .page-list li:hover {
                    background-color: var(--primary-midbackground);
                    cursor: pointer;
                }
                li.open {
                    background-color: var(--midbackground);
                }
                .page-list-header {
                    padding: 0.3em;
                }
            `}</style>
        </div>
    );
};
