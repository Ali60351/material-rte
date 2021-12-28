import { EditorState, ContentState, SelectionState, RichUtils, Modifier, ContentBlock } from 'draft-js';
import { stateFromHTML } from 'draft-js-import-html';
import { stateToHTML } from 'draft-js-export-html';

import decorator from './decorator';
import { ERROR_MESSAGES, ENTITY_TYPES } from './constants';

interface Range {
    start: number;
    end: number;
}

interface BlockEntity {
    block: string;
    key: string;
    start: number;
    end: number;
    type: string;
    data: any;
}

interface Link {
    text: string;
    link: string;
}

interface LinkError {
    text?: string;
    link?: string;
}

export const snakeCaseToSentence = (text: string) => {
    let query = text.replace(/_/g, ' ');
    query = query.replace(/ ([a-z])/g, c => c.toUpperCase());
    return query.charAt(0).toUpperCase() + query.slice(1);
};

export const isStringEmpty = (value: string | any) => (value ? !value.trim() : true);

export const hasRangeIntersection = (rangeA: Range, rangeB: Range) => {
    let intersection = false;

    if (rangeA.start < rangeB.start && rangeA.end > rangeB.end) {
        intersection = true;
    }

    if (rangeA.start > rangeB.start && rangeA.start < rangeB.end) {
        intersection = true;
    }

    if (rangeA.end < rangeB.end && rangeA.end > rangeB.start) {
        intersection = true;
    }

    return intersection;
};

export const createEmptyEditor = () => EditorState.createEmpty(decorator);

export const isEditorEmpty = (content: EditorState) => isStringEmpty(content.getCurrentContent().getPlainText());

export const getLinksInsideBlock = (contentState: ContentState, contentBlock: ContentBlock) => {
    const links: { [key: string]: Range } = {};

    contentBlock.findEntityRanges(
        character => {
            const entityKey = character.getEntity();
            return entityKey !== null && contentState.getEntity(entityKey).getType() === ENTITY_TYPES.LINK;
        },
        (start, end) => {
            links[contentBlock.getEntityAt(start)] = { start, end };
        }
    );

    return links;
};

export const getAllEntites = (value: EditorState) => {
    const currentContent = value.getCurrentContent();
    const blockMap = currentContent.getBlockMap();
    const blockArray = Object.entries(blockMap.toObject());

    const entities: { [key: string]: Array<BlockEntity> } = {};

    blockArray.forEach(([key, currentContentBlock]) => {
        const blockEntities: { [key: string]: BlockEntity } = {};

        currentContentBlock.findEntityRanges(
            character => {
                const entityKey = character.getEntity();
                return entityKey !== null;
            },
            (start, end) => {
                const entityKey = currentContentBlock.getEntityAt(start);
                const selectedEntity = currentContent.getEntity(entityKey);

                blockEntities[currentContentBlock.getEntityAt(start)] = {
                    block: key,
                    key: entityKey,
                    start,
                    end,
                    type: selectedEntity.getType(),
                    data: selectedEntity.getData(),
                };
            }
        );

        entities[key] = Object.values(blockEntities);
    });

    return entities;
};

const getLinkPositions = (value: EditorState, selection: SelectionState) => {
    const currentContent = value.getCurrentContent();
    const blockArray = Object.entries(currentContent.getBlockMap().toObject());
    const entities: { [key: string]: Array<Range> } = {};

    const selectionState = selection || value.getSelection();
    const anchorKey = selectionState.getAnchorKey();
    const focusKey = selectionState.getFocusKey();

    let focus = false;

    /* ========= THE FILTER BELOW IS RESPONSIBLE FOR GETTING ONLY THOSE BLOCKS WHICH FALL WITHIN SELECTION ========== */
    blockArray
        .filter(([key]) => {
            let inside = false;

            if (key === anchorKey || key === focusKey) {
                if (focus) {
                    inside = true;
                    focus = false;
                } else {
                    focus = true;
                }
            }

            if (focus) {
                inside = true;
            }

            return inside;
        })
        .forEach(([key, currentContentBlock]) => {
            entities[key] = Object.values(getLinksInsideBlock(currentContent, currentContentBlock));
        });

    return entities;
};

export const linksInsideSelection = (value: EditorState, selection?: SelectionState) => {
    const selectionState = selection || value.getSelection();

    const linkPositions = getLinkPositions(value, selectionState);
    let selectionStart = selectionState.getAnchorOffset();
    let selectionEnd = selectionState.getFocusOffset();
    let anchorKey = selectionState.getAnchorKey();
    let focusKey = selectionState.getFocusKey();

    if (anchorKey === focusKey) {
        if (selectionStart > selectionEnd) {
            [selectionStart, selectionEnd] = [selectionEnd, selectionStart];
        }

        return linkPositions[anchorKey].some(linkPosition =>
            hasRangeIntersection(linkPosition, { start: selectionStart, end: selectionEnd })
        );
    }

    const blockKeyList = Object.keys(linkPositions);
    if (blockKeyList.indexOf(anchorKey) > blockKeyList.indexOf(focusKey)) {
        [anchorKey, focusKey] = [focusKey, anchorKey];
        [selectionStart, selectionEnd] = [selectionEnd, selectionStart];
    }

    let present = false;

    Object.entries(linkPositions).forEach(([key, entities]) => {
        if (key === anchorKey) {
            entities.forEach(entity => {
                if (entity.start >= selectionStart) {
                    present = true;
                }
            });
        } else if (key === focusKey) {
            entities.forEach(entity => {
                if (entity.end <= selectionEnd) {
                    present = true;
                }
            });
        } else {
            present = true;
        }
    });

    return present;
};

export const listAllEntities = (editorState: EditorState) => {
    // A FUNCTION USEFUL FOR DEBUGGING ONLY
    const entityKeyList: Array<string> = [];
    const contentBlockList = Object.values(
        editorState
            .getCurrentContent()
            .getBlockMap()
            .toObject()
    );

    contentBlockList.forEach(contentBlock =>
        contentBlock.findEntityRanges(
            charMetaData => {
                const entityKey = charMetaData.getEntity();
                entityKeyList.push(entityKey);
                return true;
            },
            () => {}
        )
    );

    return entityKeyList;
};

const transformTextToLink = (editorState: EditorState, url: string, selection: SelectionState) => {
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(ENTITY_TYPES.LINK, 'MUTABLE', { url });

    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });

    const linkSelection = selection || newEditorState.getSelection();
    const linkedState = RichUtils.toggleLink(newEditorState, linkSelection, entityKey);

    return linkedState;
};

const convertTextToLinks = (value: EditorState) => {
    let finalState = value;

    const currentContent = value.getCurrentContent();
    const blockMap = currentContent.getBlockMap();
    const contentBlocks = Object.values(blockMap.toObject());

    contentBlocks.forEach(contentBlock => {
        const key = contentBlock.getKey();
        const text = contentBlock.getText();
        const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gm;

        const urlMatches = Array.from(text.matchAll(urlRegex) || []);
        urlMatches.forEach(match => {
            const matchIndex = match.index || 0;

            const locationProps = {
                anchorKey: key,
                focusKey: key,
                anchorOffset: matchIndex,
                focusOffset: matchIndex + match[0].length,
            };

            let linkLocation = SelectionState.createEmpty(key);
            linkLocation = linkLocation.merge(locationProps);

            if (!linksInsideSelection(finalState, linkLocation)) {
                finalState = transformTextToLink(finalState, match[0], linkLocation);
            }
        });
    });

    EditorState.forceSelection(finalState, value.getSelection());
    return finalState;
};

const unWrapVariables = (value: EditorState) => {
    let proccessed = value.getCurrentContent();
    const entites = getAllEntites(value);

    Object.keys(entites).forEach(blockKey => {
        let offset = 0;

        entites[blockKey].forEach(({ start, end, data, type }) => {
            if (type !== ENTITY_TYPES.VARIABLE) {
                return;
            }

            let selection = SelectionState.createEmpty(blockKey);

            selection = selection.merge({
                anchorKey: blockKey,
                focusKey: blockKey,
                anchorOffset: start + offset,
                focusOffset: end + offset,
            });

            offset += data.encoded.length - (end - start);
            proccessed = Modifier.replaceText(proccessed, selection, data.encoded);
        });
    });

    return EditorState.set(value, { currentContent: proccessed });
};

export const hasInvalidVariables = (value: EditorState) => {
    const entites = getAllEntites(value);
    let invalidVariablesFound = false;

    Object.keys(entites).forEach(blockKey => {
        entites[blockKey].forEach(({ data, type }) => {
            if (type === ENTITY_TYPES.VARIABLE && data.blacklisted) {
                invalidVariablesFound = true;
            }
        });
    });

    return invalidVariablesFound;
};

export const preProcessContent = (value: EditorState) => {
    let processed = convertTextToLinks(value);
    processed = unWrapVariables(processed);
    return processed;
};

export const wrapVariables = (value: EditorState, blacklisted: Array<string> = []) => {
    let contentState = value.getCurrentContent();
    const blockMap = contentState.getBlockMap();
    const blockList = Object.entries(blockMap.toObject());

    blockList.forEach(([key, block]) => {
        const variableRegex = /{{[a-z_]+?}}/g;
        const text = block.getText();
        let offset = 0;

        Array.from(text.matchAll(variableRegex)).forEach(match => {
            const matchIndex = match.index || 0;

            const matchedString = match[0];
            const start = matchIndex;
            const end = matchIndex + matchedString.length;
            const snakeCased = matchedString.slice(2, matchedString.length - 2);
            const word = snakeCaseToSentence(snakeCased);

            let selection = SelectionState.createEmpty(key);
            selection = selection.merge({
                anchorKey: key,
                focusKey: key,
                anchorOffset: start + offset,
                focusOffset: end + offset,
            });

            contentState = contentState.createEntity(ENTITY_TYPES.VARIABLE, 'IMMUTABLE', {
                encoded: matchedString,
                blacklisted: blacklisted.includes(snakeCased),
            });

            const entityKey = contentState.getLastCreatedEntityKey();

            contentState = Modifier.replaceText(contentState, selection, word, undefined, entityKey);

            offset += word.length - matchedString.length;
        });
    });

    return EditorState.set(value, { currentContent: contentState });
};

export const exportEditor = (content: EditorState, preProcess = true) => {
    if (!content) return '';

    let finalContent = content;

    if (preProcess) {
        finalContent = preProcessContent(finalContent);
    }

    return escape(stateToHTML(finalContent.getCurrentContent()));
};

export const importEditor = (raw: string, processVariables = true, blacklisted = []) => {
    try {
        const editorState = EditorState.createWithContent(stateFromHTML(unescape(raw)), decorator);

        if (processVariables) {
            return wrapVariables(editorState, blacklisted);
        }

        return editorState;
    } catch (error) {
        if (error instanceof Error) {
            console.warn(error.message, '\nLoading Draft JS with plain text');
        } else {
            console.warn(error);
        }

        return EditorState.createWithContent(ContentState.createFromText(raw), decorator);
    }
};

export const validateLinkInsert = (values: Link) => {
    const errors: LinkError = {};
    const linkRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_+.~#?&//=]*)/;

    if (isStringEmpty(values.text)) {
        errors.text = ERROR_MESSAGES.FIELD_REQUIRED;
    }

    if (isStringEmpty(values.link) || !linkRegex.test(values.link)) {
        errors.link = ERROR_MESSAGES.FIELD_REQUIRED;
    }

    return errors;
};

export const updateSelection = (editorState: EditorState, selection = {}) => {
    const currentSelection = editorState.getSelection();
    const updatedState = EditorState.forceSelection(editorState, currentSelection.merge(selection));
    return updatedState;
};

export const getUrlFromEntity = (contentState: ContentState, entityKey: string, defaultValue: any = '') => {
    const urlEntity = contentState.getEntity(entityKey);
    let url = defaultValue;

    if (urlEntity.getType() === ENTITY_TYPES.LINK && urlEntity.getMutability() === 'MUTABLE') {
        ({ url } = urlEntity.getData());
    }

    return url;
};

export const getFirstLinkInRange = (range: Range, linkPositions: { [key: string]: any }) => {
    let key: string | undefined;
    const positionList: Array<any> = [];
    const selection = { ...range };

    Object.keys(linkPositions).forEach(entityKey => {
        positionList.push({ ...linkPositions[entityKey], key: entityKey });
    });

    const sortedLinksPositions = positionList.sort((a, b) => a.start - b.start);

    const setKeyIfNull = (value: any) => {
        if (key) {
            return;
        }

        key = value;
    };

    sortedLinksPositions.forEach(linkPosition => {
        let overlap = false;

        if (linkPosition.start >= range.start && linkPosition.start <= range.end) {
            // START IN RANGE
            setKeyIfNull(linkPosition.key);
            overlap = true;
        } else if (linkPosition.end >= range.start && linkPosition.end <= range.end) {
            // END IN RANGE
            setKeyIfNull(linkPosition.key);
            overlap = true;
        } else if (linkPosition.start <= range.start && linkPosition.end >= range.end) {
            // RANGE INSIDE LINK
            setKeyIfNull(linkPosition.key);
            overlap = true;
        }

        if (overlap) {
            if (selection.start > linkPosition.start) {
                selection.start = linkPosition.start;
            }

            if (selection.end < linkPosition.end) {
                selection.end = linkPosition.end;
            }
        }
    });

    return { key, selection };
};

export const isMultiLineSelection = (editorState: EditorState) => {
    const selection = editorState.getSelection();
    return selection.getAnchorKey() !== selection.getFocusKey();
};

export const getLinkAtCursor = (editorState: EditorState) => {
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    let link = null;

    if (selection.isCollapsed()) {
        const anchorOffset = selection.getAnchorOffset();
        const focusOffset = selection.getFocusOffset();

        const start = anchorOffset > focusOffset ? focusOffset : anchorOffset;

        const currentContentBlock = currentContent.getBlockForKey(selection.getAnchorKey());
        const selectedEntityKey = currentContentBlock.getEntityAt(start);

        if (selectedEntityKey) {
            link = getUrlFromEntity(currentContent, selectedEntityKey, null);
        }
    }

    return link;
};

export const insertText = (editorState: EditorState, text: string) => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    const pastedBlocks = ContentState.createFromText(text).getBlockMap();

    const newState = Modifier.replaceWithFragment(contentState, selectionState, pastedBlocks);

    return EditorState.push(editorState, newState, 'insert-fragment');
};

export const selectionToObject = (selection: SelectionState) => {
    const selectionObj: { [key: string]: any } = {};
    const selections = Object.entries(selection.toObject());

    selections.forEach(([key, value]) => {
        selectionObj[key] = value;
    });

    return selectionObj;
};

export const debugEditor = (value: EditorState) => ({
    entities: getAllEntites(value),
    selection: selectionToObject(value.getSelection()),
});
