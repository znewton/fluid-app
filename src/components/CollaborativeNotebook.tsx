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
        max: 8,
        min: 4,
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
        <div>
            <textarea value={mapValue} onChange={handleChangeValue} />
        </div>
    );
};

type ISectionViewerProps = IMap;

const SectionViewer: FunctionComponent<ISectionViewerProps> = (props) => {
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

    return (
        <div>
            <button onClick={addPage}>+ Add Page</button>
            {keys.map((key) => (
                <PageViewer key={key} map={props.map} mapKey={key} />
            ))}
        </div>
    );
};

interface INotebookViewerProps {
    maps: IMap[];
    onAddSection: () => void;
}

const NotebookViewer: FunctionComponent<INotebookViewerProps> = (props) => {
    return (
        <div>
            <button onClick={props.onAddSection}>+ Add Section</button>
            {props.maps.map(({ map, name }) => (
                <SectionViewer key={name} map={map} name={name} />
            ))}
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
