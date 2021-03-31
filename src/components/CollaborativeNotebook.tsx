import { IFluidHandle } from "@fluidframework/core-interfaces";
import {
    IDirectory,
    IDirectoryValueChanged,
    ISharedMap,
    SharedMap,
} from "@fluidframework/map";
import {
    ChangeEvent,
    FunctionComponent,
    useCallback,
    useEffect,
    useState,
} from "react";
import sillyname from "sillyname";
import { LoremIpsum } from "lorem-ipsum";

const lorem = new LoremIpsum({
    sentencesPerParagraph: {
        max: 4,
        min: 2,
    },
    wordsPerSentence: { max: 16, min: 4 },
});

interface IMap {
    name: string;
    map: ISharedMap;
}

interface IPageViewerProps {
    map: ISharedMap;
    mapKey: string;
}

const PageViewer: FunctionComponent<IPageViewerProps> = (props) => {
    const [mapValue, setMapValue] = useState<string>(
        props.map.get(props.mapKey) ?? ""
    );
    useEffect(() => {
        props.map.on("valueChanged", (changed) => {
            if (changed.key === props.mapKey) {
                setMapValue(props.map.get(props.mapKey) ?? "");
            }
        });
    }, [props.map, props.mapKey]);

    const handleChangeValue = useCallback(
        (e: ChangeEvent<HTMLTextAreaElement>) => {
            props.map.set(props.mapKey, e.currentTarget.value);
        },
        [props.map, props.mapKey]
    );

    return (
        <div className="page-viewer">
            <textarea value={mapValue} onChange={handleChangeValue} />
            <style jsx>{`
                .page-viewer {
                    height: 100%;
                    display: flex;
                    padding: 0.5em;
                    background-color: var(--background);
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
                        0 5px 10px -5px rgba(0, 0, 0, 0.04);
                    border-radius: 0.1em;
                }
                textarea {
                    box-sizing: border-box;
                    height: 100%;
                    flex-grow: 1;
                    border: none;
                    font: inherit;
                    font-weight: 300;
                    font-size: 0.75em;
                }
            `}</style>
        </div>
    );
};

type ISectionViewerProps = IMap;

const SectionViewer: FunctionComponent<ISectionViewerProps> = (props) => {
    const [openPageName, setOpenPageName] = useState<string>("");
    const [keys, setKeys] = useState(Array.from(props.map.keys()));
    const refresh = useCallback(() => {
        setKeys(Array.from(props.map.keys()).sort());
    }, [setKeys, props.map]);
    useEffect(() => {
        props.map.on("valueChanged", (changed) => {
            // add
            if (changed.previousValue === undefined) {
                refresh();
                return;
            }

            // delete
            const newValue = props.map.get(changed.key);
            if (newValue === undefined) {
                refresh();
            }
        });
    }, [props.map, setKeys]);

    const addPage = useCallback(() => {
        const key = (sillyname() as string).split(" ").join("-");
        const value = lorem.generateParagraphs(2);
        props.map.set(key, value);
    }, [props.map]);

    const handlePageSelect = useCallback(
        (key: string) => {
            setOpenPageName(key);
        },
        [setOpenPageName]
    );

    return (
        <div className="section-viewer">
            <div className="page-list">
                <button onClick={addPage}>+ Add Page</button>
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
            {keys.map((key) => (
                <article
                    key={key}
                    className={openPageName === key ? "open" : "closed"}
                >
                    <PageViewer map={props.map} mapKey={key} />
                </article>
            ))}
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
            `}</style>
        </div>
    );
};

interface INotebookViewerProps {
    maps: IMap[];
    onAddSection: () => void;
}

const NotebookViewer: FunctionComponent<INotebookViewerProps> = (props) => {
    const [openSectionName, setOpenSectionName] = useState<string>("");
    const handleSectionSelect = useCallback(
        (name: string) => {
            setOpenSectionName(name);
        },
        [setOpenSectionName]
    );
    return (
        <div className="notebook-viewer">
            <div className="section-list">
                <button onClick={props.onAddSection}>+ Add Section</button>
                <ul>
                    {props.maps.map(({ name }) => (
                        <li
                            key={name}
                            onClick={() => handleSectionSelect(name)}
                            className={
                                openSectionName === name ? "open" : "closed"
                            }
                        >
                            {name}
                        </li>
                    ))}
                </ul>
            </div>

            {props.maps.map(({ map, name }) => (
                <section
                    key={name}
                    className={openSectionName === name ? "open" : "closed"}
                >
                    <SectionViewer map={map} name={name} />
                </section>
            ))}
            <style jsx>{`
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
                }
                .section-list li {
                    padding: 1em 0.5em;
                    border-bottom: 1px solid var(--midbackground);
                }
                .section-list li:hover {
                    background-color: var(--primary-midbackground);
                    cursor: pointer;
                }
                li.open {
                    background-color: var(--midbackground);
                }
            `}</style>
        </div>
    );
};

interface ICollaborativeNotebookProps {
    mapDir: IDirectory;
    mapCreate: (name: string) => SharedMap;
    listenValueChanged: (
        listener: (changed: IDirectoryValueChanged) => void
    ) => void;
}
export const CollaborativeNotebook: FunctionComponent<ICollaborativeNotebookProps> = (
    props
) => {
    const [maps, setMaps] = useState<IMap[]>([]);
    const getMaps = useCallback(async () => {
        const maps: IMap[] = [];
        await Promise.all(
            Array.from(props.mapDir.keys()).map(async (name) => {
                const handle = await props.mapDir.wait<
                    IFluidHandle<ISharedMap>
                >(name);
                if (handle !== undefined) {
                    const map = await handle.get();
                    maps.push({ name, map });
                }
            })
        ).catch(console.error);
        const sortedMaps = maps.sort((a, b) => a.name.localeCompare(b.name));
        setMaps(sortedMaps);
    }, [props.mapDir, setMaps]);
    useEffect(() => {
        getMaps();
        props.listenValueChanged(() => getMaps());
    }, [props.listenValueChanged, getMaps]);
    const handleAddSection = useCallback(() => {
        const name = (sillyname() as string).split(" ").join("-");
        if (props.mapDir.get(name) === undefined) {
            const newSection = props.mapCreate(name);
            newSection.bindToContext();
            props.mapDir.set(name, newSection.handle);
        }
    }, [props.mapCreate]);
    return (
        <div>
            <NotebookViewer maps={maps} onAddSection={handleAddSection} />
        </div>
    );
};
