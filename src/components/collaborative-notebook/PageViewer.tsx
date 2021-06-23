import { ISharedMap } from "@fluidframework/map";
import {
    ChangeEvent,
    FunctionComponent,
    useCallback,
    useEffect,
    useState,
} from "react";
import { useTrackLoad } from "../../client-utils";

interface IPageViewerProps {
    map: ISharedMap;
    mapKey: string;
}

export const PageViewer: FunctionComponent<IPageViewerProps> = (props) => {
    useTrackLoad("PageViewer");
    const [mapValue, setMapValue] = useState<string>(
        props.map.get(props.mapKey) ?? ""
    );
    useEffect(() => {
        const handleChange = (changed) => {
            if (changed.key === props.mapKey) {
                setMapValue(props.map.get(props.mapKey) ?? "");
            }
        };
        props.map.on("valueChanged", handleChange);
        return () => {
            props.map.off("valueChanged", handleChange);
        };
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
                    font-size: 0.85em;
                }
            `}</style>
        </div>
    );
};
