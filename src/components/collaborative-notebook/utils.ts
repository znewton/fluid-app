import { IFluidHandle } from "@fluidframework/core-interfaces";
import { IDirectory, ISharedMap } from "@fluidframework/map";
import { LoremIpsum } from "lorem-ipsum";
import sillyname from "sillyname";

export const generateName = (): string =>
    (sillyname() as string).split(" ").join("-");

export const getMapFromDirectory = async (
    mapDir: IDirectory,
    name: string
): Promise<ISharedMap | undefined> => {
    const handle = await mapDir.wait<IFluidHandle<ISharedMap>>(name);
    if (handle !== undefined) {
        return await handle.get();
    }
};

const lorem = new LoremIpsum({
    sentencesPerParagraph: {
        max: 4,
        min: 2,
    },
    wordsPerSentence: { max: 16, min: 4 },
});

export const generatePageContents = (): string => {
    return lorem.generateParagraphs(2);
};
export const generatePageTitle = (): string => {
    return lorem.generateWords(2);
};
