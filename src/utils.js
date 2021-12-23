import { EditorState, ContentState, SelectionState, RichUtils, Modifier } from 'draft-js';
import { stateFromHTML } from 'draft-js-import-html';
import { stateToHTML } from 'draft-js-export-html';

import decorator from './decorator';
import { ERROR_MESSAGES, ENTITY_TYPES } from './constants';

export const snakeCaseToSentence = text => {
    let query = text.replace(/_/g, ' ');
    query = query.replace(/ ([a-z])/g, c => c.toUpperCase());
    return query.charAt(0).toUpperCase() + query.slice(1);
};

export const isStringEmpty = value => (value ? !value.trim() : true);

export const hasRangeIntersection = (rangeA, rangeB) => {
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

export const isEditorEmpty = content => isStringEmpty(content.getCurrentContent().getPlainText());

export const getLinksInsideBlock = (contentState, contentBlock) => {
    const links = {};

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

export const getAllEntites = value => {
    const currentContent = value.getCurrentContent();
    const blockArray = Array.from(currentContent.getBlockMap());
    const entities = {};

    blockArray.forEach(([key, currentContentBlock]) => {
        const blockEntities = {};

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
                    data: selectedEntity.getData()
                };
            }
        );

        entities[key] = Object.values(blockEntities);
    });

    return entities;
};

const getLinkPositions = (value, selection) => {
    const currentContent = value.getCurrentContent();
    const blockArray = Array.from(currentContent.getBlockMap());
    const entities = {};

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

export const linksInsideSelection = (value, selection) => {
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

export const listAllEntities = editorState => {
    // A FUNCTION USEFUL FOR DEBUGGING ONLY
    const entityKeyList = [];
    const contentBlockList = Array.from(editorState.getCurrentContent().getBlockMap().values());
    contentBlockList.forEach(contentBlock =>
        contentBlock.findEntityRanges(charMetaData => {
            const entityKey = charMetaData.getEntity();
            entityKeyList.push(entityKey);
        })
    );

    return entityKeyList;
};

const transformTextToLink = (editorState, url, selection) => {
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(ENTITY_TYPES.LINK, 'MUTABLE', { url });

    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });

    const linkSelection = selection || newEditorState.getSelection();
    const linkedState = RichUtils.toggleLink(newEditorState, linkSelection, entityKey);

    return linkedState;
};

const convertTextToLinks = value => {
    let finalState = value;

    const currentContent = value.getCurrentContent();
    const blockMap = currentContent.getBlockMap();
    const contentBlocks = Array.from(blockMap.values());

    contentBlocks.forEach(contentBlock => {
        const key = contentBlock.getKey();
        const text = contentBlock.getText();
        // eslint-disable-next-line max-len
        const urlRegex =
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gm;

        const urlMatches = Array.from(text.matchAll(urlRegex) || []);
        urlMatches.forEach(match => {
            const locationProps = {
                anchorKey: key,
                focusKey: key,
                anchorOffset: match.index,
                focusOffset: match.index + match[0].length
            };

            let linkLocation = SelectionState.createEmpty();
            linkLocation = linkLocation.merge(locationProps);

            if (!linksInsideSelection(finalState, linkLocation)) {
                finalState = transformTextToLink(finalState, match[0], linkLocation);
            }
        });
    });

    EditorState.forceSelection(finalState, value.getSelection());
    return finalState;
};

const unWrapVariables = value => {
    let proccessed = value.getCurrentContent();
    const entites = getAllEntites(value);

    Object.keys(entites).forEach(blockKey => {
        let offset = 0;

        entites[blockKey].forEach(({ start, end, data, type }) => {
            if (type !== ENTITY_TYPES.VARIABLE) {
                return;
            }

            let selection = SelectionState.createEmpty();

            selection = selection.merge({
                anchorKey: blockKey,
                focusKey: blockKey,
                anchorOffset: start + offset,
                focusOffset: end + offset
            });

            offset += data.encoded.length - (end - start);
            proccessed = Modifier.replaceText(proccessed, selection, data.encoded);
        });
    });

    return EditorState.set(value, { currentContent: proccessed });
};

export const hasInvalidVariables = value => {
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

export const preProcessContent = value => {
    let processed = convertTextToLinks(value);
    processed = unWrapVariables(processed);
    return processed;
};

export const wrapVariables = (value, blacklisted = []) => {
    let contentState = value.getCurrentContent();
    const blockMap = contentState.getBlockMap();
    const blockList = Array.from(blockMap);

    blockList.forEach(([key, block]) => {
        const variableRegex = /{{[a-z_]+?}}/g;
        const text = block.getText();
        let offset = 0;

        Array.from(text.matchAll(variableRegex)).forEach(match => {
            const matchedString = match[0];
            const start = match.index;
            const end = match.index + matchedString.length;
            const snakeCased = matchedString.slice(2, matchedString.length - 2);
            const word = snakeCaseToSentence(snakeCased);

            let selection = SelectionState.createEmpty();
            selection = selection.merge({
                anchorKey: key,
                focusKey: key,
                anchorOffset: start + offset,
                focusOffset: end + offset
            });

            contentState = contentState.createEntity(ENTITY_TYPES.VARIABLE, 'IMMUTABLE', {
                encoded: matchedString,
                blacklisted: blacklisted.includes(snakeCased)
            });

            const entityKey = contentState.getLastCreatedEntityKey();

            contentState = Modifier.replaceText(contentState, selection, word, undefined, entityKey);

            offset += word.length - matchedString.length;
        });
    });

    return EditorState.set(value, { currentContent: contentState });
};

export const exportEditor = (content, preProcess = true) => {
    if (!content) return '';

    let finalContent = content;

    if (preProcess) {
        finalContent = preProcessContent(finalContent);
    }

    return escape(stateToHTML(finalContent.getCurrentContent()));
};

export const importEditor = (raw, processVariables = true, blacklisted = []) => {
    try {
        const editorState = EditorState.createWithContent(stateFromHTML(unescape(raw)), decorator);

        if (processVariables) {
            return wrapVariables(editorState, blacklisted);
        }

        return editorState;
    } catch (error) {
        console.warn(error.toString(), '\nLoading Draft JS with plain text');
        return EditorState.createWithContent(ContentState.createFromText(raw), decorator);
    }
};

export const validateLinkInsert = values => {
    const errors = {};

    const linkRegex =
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_+.~#?&//=]*)/;

    if (isStringEmpty(values.text)) {
        errors.text = ERROR_MESSAGES.FIELD_REQUIRED;
    }

    if (isStringEmpty(values.link) || !linkRegex.test(values.link)) {
        errors.link = ERROR_MESSAGES.FIELD_REQUIRED;
    }

    return errors;
};

export const updateSelection = (editorState, selection = {}) => {
    const currentSelection = editorState.getSelection();
    const updatedState = EditorState.forceSelection(editorState, currentSelection.merge(selection));
    return updatedState;
};

export const getUrlFromEntity = (contentState, entityKey, defaultValue = '') => {
    const urlEntity = contentState.getEntity(entityKey);
    let url = defaultValue;

    if (urlEntity.type === ENTITY_TYPES.LINK && urlEntity.mutability === 'MUTABLE') {
        ({ url } = urlEntity.data);
    }

    return url;
};

export const getFirstLinkInRange = (range, linkPositions) => {
    let key = null;
    const positionList = [];
    const selection = { ...range };

    Object.keys(linkPositions).forEach(entityKey => {
        positionList.push({ ...linkPositions[entityKey], key: entityKey });
    });

    const sortedLinksPositions = positionList.sort((a, b) => a.start - b.start);

    const setKeyIfNull = value => {
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

export const isMultiLineSelection = editorState => {
    const selection = editorState.getSelection();
    return selection.getAnchorKey() !== selection.getFocusKey();
};

export const getLinkAtCursor = editorState => {
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

export const insertText = (editorState, text) => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    const pastedBlocks = ContentState.createFromText(text).blockMap;

    const newState = Modifier.replaceWithFragment(contentState, selectionState, pastedBlocks);

    return EditorState.push(editorState, newState, 'insert-fragment');
};

export const selectionToObject = selection => {
    const selectionObj = {};

    [...selection.entries()].forEach(([key, value]) => {
        selectionObj[key] = value;
    });

    return selectionObj;
};

export const debugEditor = value => ({
    entities: getAllEntites(value),
    selection: selectionToObject(value.getSelection())
});
