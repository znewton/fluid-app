import { ISharedMap } from "@fluidframework/map";

export interface IMap {
    name: string;
    map: ISharedMap;
}
