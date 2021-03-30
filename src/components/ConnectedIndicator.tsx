import type { Container } from "@fluidframework/container-loader";
import {
    IClient,
    ISequencedClient,
} from "@fluidframework/protocol-definitions";
import { FunctionComponent, useEffect, useState } from "react";
import { colorMap, ClassNameBuilder as CNB } from "../client-utils";

interface ICollaborator {
    clientIds: string[];
    clientDetails: IClient[];
    userId: string;
    color: string;
    isUser: boolean;
}

interface IConnectedIndicatorProps {
    container: Container | undefined;
}

const getCollaboratorAbbrev = (userId: string) => {
    if (!userId) return "--";
    if (userId.length < 2) return `${userId[0]}.`;
    return `${userId[0].toUpperCase()}${userId[1]}`;
};
const CollaboratorCircle: FunctionComponent<ICollaborator> = (props) => (
    <div
        className={new CNB("collaborator")
            .add("is-user", props.isUser)
            .toString()}
        title={props.userId}
        style={{ backgroundColor: props.color }}
    >
        <span>{getCollaboratorAbbrev(props.userId)}</span>
        <style jsx>{`
            .collaborator {
                border-radius: 100%;
                height: 2.5em;
                width: 2.5em;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }
            .collaborator.is-user span {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 80%;
                height: 80%;
                border-radius: 100%;
                border: 2px solid white;
            }
            .collaborator:not(:last-child) {
                margin-right: 0.2em;
            }
        `}</style>
    </div>
);

export const ConnectedIndicator: FunctionComponent<IConnectedIndicatorProps> = ({
    container,
}) => {
    const [members, setMembers] = useState(new Map<string, ISequencedClient>());
    useEffect(() => {
        if (!container || !container.connected) return;
        const quorum = container.getQuorum();
        setMembers(quorum.getMembers());
        quorum
            .on("addMember", (clientId, details) => {
                console.log("Member joined", { clientId, details });
                setMembers(quorum.getMembers());
            })
            .on("removeMember", (clientId) => {
                console.log("Member left", { clientId });
                setMembers(quorum.getMembers());
            });
    }, [container]);
    const collaboratorMap: Map<string, ICollaborator> = new Map();
    members.forEach((sequencedClient, clientId) => {
        const userId = sequencedClient.client.user.id;
        const existingCollaborator = collaboratorMap.get(userId);
        if (!existingCollaborator) {
            collaboratorMap.set(userId, {
                clientIds: [clientId],
                clientDetails: [sequencedClient.client],
                userId,
                color: colorMap.getOrSet(userId, 0xffffff / 2) || "#030303",
                isUser: clientId === container?.clientId,
            });
        } else {
            existingCollaborator.clientIds.push(clientId);
            existingCollaborator.clientDetails.push(sequencedClient.client);
            existingCollaborator.isUser =
                existingCollaborator.isUser || clientId === container?.clientId;
        }
    });
    const collaboratorList: ICollaborator[] = [];
    collaboratorMap.forEach((collaborator) => {
        collaboratorList.push(collaborator);
    });
    return (
        <div className="connected-indicator">
            <ul className="connected-collaborators">
                {collaboratorList.map((collaborator) => (
                    <CollaboratorCircle
                        key={collaborator.userId}
                        {...collaborator}
                    />
                ))}
            </ul>
            <style jsx>{`
                .connected-collaborators {
                    padding-left: 0;
                    display: flex;
                }
            `}</style>
        </div>
    );
};
