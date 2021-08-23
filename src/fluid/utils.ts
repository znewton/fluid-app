import { IDocumentStorageService } from "@fluidframework/driver-definitions";
import {
    ISnapshotTree,
    ISnapshotTreeEx,
} from "@fluidframework/protocol-definitions";

function getBlobCountCore(
    snapshotTree: ISnapshotTree,
    path: string,
    blobs: string[],
    secondaryBlobs: string[]
) {
    for (const blobKey of Object.keys(snapshotTree.blobs)) {
        const blob = snapshotTree.blobs[blobKey];
        if (
            blobKey.startsWith(".") ||
            blobKey === "header" ||
            blobKey.startsWith("quorum")
        ) {
            if (blob !== null) {
                blobs.push(`${path}/${blob}`);
            }
        } else if (!blobKey.startsWith("deltas")) {
            if (blob !== null) {
                secondaryBlobs.push(`${path}/${blob}`);
            }
        }
    }

    for (const subTree of Object.keys(snapshotTree.trees)) {
        getBlobCountCore(
            snapshotTree.trees[subTree],
            `${path}/${subTree}`,
            blobs,
            secondaryBlobs
        );
    }
}

export async function getBlobCount(
    documentStorage: IDocumentStorageService
): Promise<number> {
    const snapshotTree =
        (await documentStorage.getSnapshotTree()) as ISnapshotTreeEx | null;
    const secondaryBlobs: string[] = [];
    const blobs: string[] = [];

    if (snapshotTree === null) return 0;

    getBlobCountCore(snapshotTree, "", blobs, secondaryBlobs);

    // console.log(blobs);
    // console.log(secondaryBlobs);

    return blobs.length + secondaryBlobs.length;
}
