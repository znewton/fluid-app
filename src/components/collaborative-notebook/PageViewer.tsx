import { IFluidHandle } from "@fluidframework/core-interfaces";
import { ISharedMap, SharedMap } from "@fluidframework/map";
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
    const [pageMap, setPageMap] = useState<SharedMap | undefined>();
    const [pageTitle, setPageTitle] = useState<string | undefined>();
    const [pageContents, setPageContents] = useState<string | undefined>();
    useEffect(() => {
        const loadPage = async () => {
            setPageMap(
                await props.map
                    .get<IFluidHandle<SharedMap>>(props.mapKey)
                    ?.get()
            );
        };
        loadPage();
    }, [props.map, props.mapKey, setPageMap]);
    useEffect(() => {
        setPageTitle(pageMap?.get<string>("title") ?? "");
        setPageContents(pageMap?.get<string>("content") ?? "");
        const handleChange = async (changed) => {
            if (changed.key === "title") {
                setPageTitle(pageMap?.get("title"));
            } else if (changed.key === "content") {
                setPageContents(pageMap?.get("content"));
            }
        };
        pageMap?.on("valueChanged", handleChange);
        return () => {
            pageMap?.off("valueChanged", handleChange);
        };
    }, [pageMap]);

    const handleChangeTitleValue = useCallback(
        (e: ChangeEvent<HTMLTextAreaElement>) => {
            pageMap?.set("title", e.currentTarget.value);
        },
        [pageMap]
    );
    const handleChangeContentsValue = useCallback(
        (e: ChangeEvent<HTMLTextAreaElement>) => {
            pageMap?.set("content", e.currentTarget.value);
        },
        [pageMap]
    );

    return (
        <div className="page-viewer">
            <textarea
                className="title-textarea"
                value={pageTitle}
                onChange={handleChangeTitleValue}
            />
            <textarea
                className="content-textarea"
                value={pageContents}
                onChange={handleChangeContentsValue}
            />
            <style jsx>{`
                .page-viewer {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
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
                }
                textarea.title-textarea {
                    height: 3rem;
                    font-weight: 600;
                    font-size: 1.5rem;
                }
                textarea.content-textarea {
                    font-weight: 300;
                    font-size: 0.85em;
                }
            `}</style>
        </div>
    );
};
