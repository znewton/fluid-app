import { IDirectory, ISharedMap } from "@fluidframework/map";
import { FunctionComponent, useCallback, useState } from "react";
import { useTrackLoad } from "../../client-utils";
import { SectionViewer } from "./SectionViewer";
import { getMapFromDirectory } from "./utils";

interface INotebookViewerProps {
    mapDir: IDirectory;
    maps: string[];
    onAddSection: () => Promise<void>;
    onAddPage: (parentSection: ISharedMap) => Promise<void>;
}

export const NotebookViewer: FunctionComponent<INotebookViewerProps> = (
    props
) => {
    useTrackLoad("NoteBookViewer");
    const [openSectionName, setOpenSectionName] = useState<string>("");
    const handleSectionSelect = useCallback(
        (name: string) => {
            setOpenSectionName(name);
        },
        [setOpenSectionName]
    );
    const addManySections = useCallback(() => {
        for (let i = 0; i < 100; i++) {
            props.onAddSection();
        }
    }, [props.onAddSection]);
    const addPagesToAllSections = useCallback(async () => {
        const addPagesToMap = async (mapName: string) => {
            const map = await getMapFromDirectory(props.mapDir, mapName);
            if (map === undefined) return;
            for (let i = 0; i < 5; i++) {
                console.log("add page");
                props.onAddPage(map);
            }
        };
        for (const mapName of props.maps) {
            void addPagesToMap(mapName);
            // Rate Limiting: wait 500ms between maps
            await new Promise<void>((resolve) => {
                setTimeout(resolve, 500);
            });
        }
    }, [props.mapDir, props.maps]);

    return (
        <>
            <div className="notebook-viewer-toolbar">
                <button onClick={props.onAddSection}>+ Add Section</button>
                <button onClick={addManySections}>+ Add Many Sections</button>
                <button onClick={addPagesToAllSections}>
                    + Add Pages To All Sections
                </button>
            </div>
            <div className="notebook-viewer">
                <div className="section-list">
                    <div className="section-list-header">
                        <span className="section-count">
                            Sections: {props.maps.length}
                        </span>
                    </div>
                    <ul>
                        {props.maps.map((name) => (
                            <li
                                key={name}
                                onClick={() => handleSectionSelect(name)}
                                className={
                                    openSectionName === name ? "open" : "closed"
                                }
                            >
                                <span className="section-list-name">
                                    {name}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* This is intentionally efficient.
                    It only fuly loads the section viewer that is selected. */}
                <section>
                    {!openSectionName ? null : (
                        <SectionViewer
                            mapDir={props.mapDir}
                            name={openSectionName}
                            onAddPage={props.onAddPage}
                        />
                    )}
                </section>

                {/* This is intentionally inefficient.
                    It fully loads all section viewers, even when they are not visible.
                    However, if we want to measure "full page load", this is a great way to do it.
                    TODO: find a way to do this efficiently when we want, and inefficiently when we don't want, more easily. */}
                {/* {props.maps.map((name) => (
                    <section
                        key={name}
                        className={openSectionName === name ? "open" : "closed"}
                    >
                        <SectionViewer mapDir={props.mapDir} name={name} />
                    </section>
                ))} */}

                <style jsx>{`
                    .notebook-viewer-toolbar {
                        display: flex;
                    }
                    .notebook-viewer-toolbar button:not(:last-child) {
                        margin-right: 1rem;
                    }
                    .notebook-viewer {
                        display: flex;
                        padding: 0.5em;
                        background-color: var(--background);
                        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
                            0 5px 10px -5px rgba(0, 0, 0, 0.04);
                        border-radius: 0.1em;
                    }
                    section {
                        flex-grow: 1;
                    }
                    section.closed {
                        display: none;
                    }
                    .section-list ul {
                        list-style: none;
                        padding: 0;
                        max-height: 27em;
                        overflow-y: auto;
                    }
                    .section-list li {
                        padding: 1em 0.5em;
                        border-bottom: 1px solid var(--midbackground);
                        display: flex;
                        justify-content: space-between;
                    }
                    .section-list li:hover {
                        background-color: var(--primary-midbackground);
                        cursor: pointer;
                    }
                    li.open {
                        background-color: var(--midbackground);
                    }
                    .section-list-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 0.3em;
                    }
                    .section-count {
                        opacity: 0.5;
                    }
                    .section-list-page-count {
                        opacity: 0.3;
                    }
                `}</style>
            </div>
        </>
    );
};
