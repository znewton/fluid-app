import {
    IDirectory,
    IDirectoryValueChanged,
    SharedMap,
} from "@fluidframework/map";
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { performanceTracker } from "../../client-utils";
import { NotebookViewer } from "./NotebookViewer";
import { generateName } from "./utils";

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
    const [maps, setMaps] = useState<string[]>([]);
    const getMaps = useCallback(async () => {
        const sortedMaps = Array.from(props.mapDir.keys()).sort();
        setMaps(sortedMaps);
    }, [props.mapDir, setMaps]);
    useEffect(() => {
        getMaps();
        props.listenValueChanged(() => getMaps());
    }, [props.listenValueChanged, getMaps]);
    const handleAddSection = useCallback(async () => {
        const name = generateName();
        if (props.mapDir.get(name) === undefined) {
            const newSection = props.mapCreate(name);
            newSection.bindToContext();
            props.mapDir.set(name, newSection.handle);
        }
    }, [props.mapCreate]);

    useEffect(() => {
        performanceTracker.track("map-length-change", "CollabNotebook");
    }, [maps.length]);

    return (
        <div>
            <NotebookViewer
                maps={maps}
                mapDir={props.mapDir}
                onAddSection={handleAddSection}
            />
        </div>
    );
};
