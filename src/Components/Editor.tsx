import React from 'react';
import classNames from 'classnames';
import withStyles from '@material-ui/core/styles/withStyles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import LinkIcon from '@material-ui/icons/Link';
import LinkOffIcon from '@material-ui/icons/LinkOff';
import AddIcon from '@material-ui/icons/Add';
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import FormatBoldIcon from '@material-ui/icons/FormatBold';
import FormatItalicIcon from '@material-ui/icons/FormatItalic';
import FormatUnderlinedIcon from '@material-ui/icons/FormatUnderlined';
import FormatListBulletedIcon from '@material-ui/icons/FormatListBulleted';
import { Editor, RichUtils, EditorState, Modifier, SelectionState, getDefaultKeyBinding } from 'draft-js';

import editorStyles from '../styles/editorStyles';
import MaterialModal from './MaterialModal';
import LinkPopper from './LinkPopper';
import {
    snakeCaseToSentence,
    linksInsideSelection,
    getLinksInsideBlock,
    updateSelection,
    getUrlFromEntity,
    getFirstLinkInRange,
    isMultiLineSelection,
    insertText,
    selectionToObject,
} from '../utils';
import 'draft-js/dist/Draft.css';
import {
    linkPopperInitialValues,
    ENTITY_TYPES,
    BLOCK_BUTTON_GROUP,
    EDITOR_BLOCK_TYPES,
    EDITOR_INLINE_STYLES,
    EDITOR_KEYBOARD_STATUS,
} from '../constants';
import EditorToolbar from './EditorToolbar';
import BlockButton from './BlockButton';

interface CustomEditorState {
    showVariableModal: boolean;
    anchorEl?: any;
    showPopper: boolean;
    linkInitialValues: typeof linkPopperInitialValues;
    removeScroll: boolean;
    ref: React.RefObject<any>;
}

interface EditorVariable {
    id: number;
    key: string;
}

type CustomEditorProps = typeof CustomEditor.defaultProps & {
    classes: any;
    value: EditorState;
    onChange?: (arg0: EditorState) => void;
    onBlur?: (e: React.SyntheticEvent) => void;
    maxLength?: number;
    readOnly?: boolean;
    className?: string;
    name?: string;
    variables?: Array<EditorVariable>;
    error?: any;
    removeScroll?: boolean;
    showHeadingButtons?: boolean;
    borderLess?: boolean;
};

class CustomEditor extends React.Component<CustomEditorProps, CustomEditorState> {
    static defaultProps = {
        maxLength: -1,
        readOnly: false,
        className: undefined,
        onChange: () => {},
        onBlur: () => {},
        name: '',
        variables: [] as Array<EditorVariable>,
        error: false,
        removeScroll: false,
        showHeadingButtons: false,
        borderLess: false,
    };

    constructor(props: CustomEditorProps) {
        super(props);

        this.state = {
            showVariableModal: false,
            anchorEl: null,
            showPopper: false,
            linkInitialValues: linkPopperInitialValues,
            removeScroll: this.props.removeScroll,
            ref: React.createRef(),
        };
    }

    handleBeforeInput = (chars: string) => {
        if (this.props.maxLength === -1) return EDITOR_KEYBOARD_STATUS.NotHandled;
        const totalLength = this.props.value.getCurrentContent().getPlainText().length + chars.length;

        if (totalLength > this.props.maxLength) {
            return EDITOR_KEYBOARD_STATUS.Handled;
        } else {
            return EDITOR_KEYBOARD_STATUS.NotHandled;
        }
    };

    handlePastedText = (text: string) => {
        const currentLength = this.props.value.getCurrentContent().getPlainText().length;
        const isNotOverflowing = currentLength + text.length < this.props.maxLength;

        if (this.props.maxLength === -1 || isNotOverflowing) {
            this.props.onChange(insertText(this.props.value, text));
        }

        return EDITOR_KEYBOARD_STATUS.Handled;
    };

    customKeyBinding = (e: React.KeyboardEvent) => {
        if (e.keyCode === 9) {
            this.onTab(e);
            return null;
        }

        const defaultBinding: string | null = getDefaultKeyBinding(e);
        return defaultBinding;
    };

    onTab = (event: React.KeyboardEvent<{}>) => this.props.onChange(RichUtils.onTab(event, this.props.value, 1));

    handleKeyCommand = (command: string, editorState: EditorState) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);

        if (newState) {
            this.props.onChange(newState);
            return EDITOR_KEYBOARD_STATUS.Handled;
        }

        return EDITOR_KEYBOARD_STATUS.NotHandled;
    };

    onBoldClick = (e: React.MouseEvent) => {
        e.preventDefault();
        this.props.onChange(RichUtils.toggleInlineStyle(this.props.value, EDITOR_INLINE_STYLES.Bold));
    };

    onItalicClick = (e: React.MouseEvent) => {
        e.preventDefault();
        this.props.onChange(RichUtils.toggleInlineStyle(this.props.value, EDITOR_INLINE_STYLES.Italic));
    };

    onUnderlineClick = (e: React.MouseEvent) => {
        e.preventDefault();
        this.props.onChange(RichUtils.toggleInlineStyle(this.props.value, EDITOR_INLINE_STYLES.Underline));
    };

    onUnorderedListClick = (e: React.MouseEvent) => {
        e.preventDefault();
        this.props.onChange(RichUtils.toggleBlockType(this.props.value, EDITOR_BLOCK_TYPES.UnorderedList));
    };

    onOrderedListClick = (e: React.MouseEvent) => {
        e.preventDefault();
        this.props.onChange(RichUtils.toggleBlockType(this.props.value, EDITOR_BLOCK_TYPES.OrderedList));
    };

    onLinkClicked = (e: React.MouseEvent) => {
        e.preventDefault();
        const { currentTarget } = e;
        const selectionState = this.props.value.getSelection();

        let url = '';
        let text = '';

        const anchorKey = selectionState.getAnchorKey();
        const focusKey = selectionState.getFocusKey();
        let anchorOffset = selectionState.getAnchorOffset();
        let focusOffset = selectionState.getFocusOffset();

        const currentContent = this.props.value.getCurrentContent();
        const currentContentBlock = currentContent.getBlockForKey(anchorKey);

        const selectedEntityKey = currentContentBlock.getEntityAt(anchorOffset);
        const linksInsideBlock = getLinksInsideBlock(currentContent, currentContentBlock);

        if (anchorKey === focusKey) {
            if (!selectionState.isCollapsed()) {
                /* ========== SELECTION EXISTS ========== */
                if (anchorOffset > focusOffset) {
                    [anchorOffset, focusOffset] = [focusOffset, anchorOffset];
                }

                const intersection = getFirstLinkInRange({ start: anchorOffset, end: focusOffset }, linksInsideBlock);
                text = currentContentBlock.getText().substring(anchorOffset, focusOffset);

                if (intersection.key) {
                    url = getUrlFromEntity(currentContent, intersection.key);

                    const selectedState = updateSelection(this.props.value, {
                        anchorOffset: intersection.selection.start,
                        focusOffset: intersection.selection.end,
                    });

                    text = currentContentBlock
                        .getText()
                        .substring(intersection.selection.start, intersection.selection.end);

                    this.props.onChange(selectedState);
                }
            } else {
                /* ========== NO SELECTION ========== */
                const blockPosition = linksInsideBlock[selectedEntityKey];

                if (selectedEntityKey) {
                    /* ========== CURSOR ON LINK ========== */
                    url = getUrlFromEntity(currentContent, selectedEntityKey);
                    text = currentContentBlock.getText().substring(blockPosition.start, blockPosition.end);

                    const selectedState = updateSelection(this.props.value, {
                        anchorOffset: blockPosition.start,
                        focusOffset: blockPosition.end,
                    });

                    this.props.onChange(selectedState);
                }
            }
        }

        this.setState(state => ({
            anchorEl: currentTarget,
            showPopper: !state.showPopper,
            linkInitialValues: { text, link: url },
        }));
    };

    onRemoveLinkClicked = (e: React.MouseEvent) => {
        e.preventDefault();
        const selection = this.props.value.getSelection();
        this.props.onChange(RichUtils.toggleLink(this.props.value, selection, null));
    };

    isBold = () => this.props.value.getCurrentInlineStyle().has(EDITOR_INLINE_STYLES.Bold);

    isItalic = () => this.props.value.getCurrentInlineStyle().has(EDITOR_INLINE_STYLES.Italic);

    isUnderline = () => this.props.value.getCurrentInlineStyle().has(EDITOR_INLINE_STYLES.Underline);

    isBlockType = (type: string) => this.props.value.getCurrentInlineStyle().has(type);

    setBlockType = (type: string) => this.props.onChange(RichUtils.toggleBlockType(this.props.value, type));

    insertVariable = (text: string) => {
        this.state.ref.current.focus();

        const contentState = this.props.value.getCurrentContent();
        const currentSelection = selectionToObject(this.props.value.getSelection());

        let contentStateWithEntity = contentState.createEntity(ENTITY_TYPES.VARIABLE, 'IMMUTABLE', {
            encoded: `{{${text}}}`,
        });

        const targetString = snakeCaseToSentence(text);
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        contentStateWithEntity = Modifier.insertText(
            contentStateWithEntity,
            this.props.value.getSelection(),
            targetString,
            undefined,
            entityKey
        );

        let newEditorState = EditorState.set(this.props.value, { currentContent: contentStateWithEntity });
        newEditorState = updateSelection(newEditorState, {
            anchorOffset: currentSelection.anchorOffset + targetString.length,
            focusOffset: currentSelection.anchorOffset + targetString.length,
        });

        this.setState({ showVariableModal: false }, () => {
            this.props.onChange(newEditorState);
        });
    };

    openAddModal = (e: React.MouseEvent) => {
        e.preventDefault();
        this.setState({ showVariableModal: true });
    };

    moveCursorToEnd = (editorState: EditorState) => {
        const content = editorState.getCurrentContent();
        const blockMap = content.getBlockMap();
        const key = blockMap.last().getKey();

        let selection = SelectionState.createEmpty(key);
        selection = selection.merge({
            anchorKey: key,
            anchorOffset: blockMap.last().getLength(),
            focusKey: key,
            focusOffset: blockMap.last().getLength(),
        });

        return EditorState.forceSelection(editorState, selection);
    };

    insertLink = (text: string, link: string) => {
        this.setState({
            anchorEl: null,
            showPopper: false,
        });

        this.state.ref.current.focus();

        const contentState = this.props.value.getCurrentContent();
        let contentStateWithEntity = contentState.createEntity(ENTITY_TYPES.LINK, 'MUTABLE', { url: link });

        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        contentStateWithEntity = Modifier.replaceText(
            contentStateWithEntity,
            this.props.value.getSelection(),
            text,
            undefined,
            entityKey
        );

        let newEditorState = EditorState.set(this.props.value, { currentContent: contentStateWithEntity });

        const newEditorStateSelection = newEditorState.getSelection();
        const anchorOffset = newEditorStateSelection.getAnchorOffset();
        const focusOffset = newEditorStateSelection.getFocusOffset();
        const targetOffset = anchorOffset > focusOffset ? focusOffset : anchorOffset;

        newEditorState = updateSelection(newEditorState, {
            anchorOffset: targetOffset,
            focusOffset: targetOffset,
        });

        this.props.onChange(newEditorState);
    };

    render() {
        const { classes, error, onBlur, showHeadingButtons, borderLess } = this.props;
        const { removeScroll } = this.state;

        const classList = [];

        classList.push(classNames({ [classes.editor]: !borderLess }, this.props.className, classes.editorRoot));

        if (error) {
            classList.push(classes.error);
        }

        if (removeScroll) {
            classList.push(classes.removeScroll);
        }

        const selectionState = this.props.value.getSelection();
        const anchorKey = selectionState.getAnchorKey();

        const currentContent = this.props.value.getCurrentContent();
        const currentContentBlock = currentContent.getBlockForKey(anchorKey);

        const selectedBlockType = currentContentBlock.getType();

        return (
            // @ts-expect-error
            <div className={classList.join(' ')} name={this.props.name} id="editor-root">
                {!this.props.readOnly ? (
                    <React.Fragment>
                        <Tooltip title="Bold">
                            <IconButton
                                disableRipple
                                onMouseDown={e => this.onBoldClick(e)}
                                classes={{ root: this.isBold() ? classes.enabled : classes.editorIcon }}
                            >
                                <FormatBoldIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Italic">
                            <IconButton
                                disableRipple
                                onMouseDown={e => this.onItalicClick(e)}
                                classes={{ root: this.isItalic() ? classes.enabled : classes.editorIcon }}
                            >
                                <FormatItalicIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Underline">
                            <IconButton
                                disableRipple
                                onMouseDown={e => this.onUnderlineClick(e)}
                                classes={{ root: this.isUnderline() ? classes.enabled : classes.editorIcon }}
                            >
                                <FormatUnderlinedIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Unordered List">
                            <IconButton
                                disableRipple
                                onMouseDown={e => this.onUnorderedListClick(e)}
                                classes={{ root: classes.editorIcon }}
                            >
                                <FormatListBulletedIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Ordered List">
                            <IconButton
                                disableRipple
                                onMouseDown={e => this.onOrderedListClick(e)}
                                classes={{ root: classes.editorIcon }}
                            >
                                <FormatListNumberedIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Insert Link">
                            <IconButton
                                disableRipple
                                onMouseDown={e => this.onLinkClicked(e)}
                                disabled={isMultiLineSelection(this.props.value)}
                                classes={{ root: classes.editorIcon }}
                            >
                                <LinkIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove Link">
                            <div className={classes.inlineBlock}>
                                <IconButton
                                    disableRipple
                                    onMouseDown={e => this.onRemoveLinkClicked(e)}
                                    classes={{ root: classes.editorIcon }}
                                    disabled={
                                        this.props.value.getSelection().isCollapsed() ||
                                        linksInsideSelection(this.props.value)
                                    }
                                >
                                    <LinkOffIcon />
                                </IconButton>
                            </div>
                        </Tooltip>
                        {this.props.variables.length ? (
                            <Tooltip title="Insert Variable">
                                <IconButton
                                    disableRipple
                                    onMouseDown={e => this.openAddModal(e)}
                                    classes={{ root: classes.editorIcon }}
                                    disabled={!this.props.value.getSelection().isCollapsed()}
                                >
                                    <AddIcon />
                                </IconButton>
                            </Tooltip>
                        ) : null}
                        {Boolean(showHeadingButtons) &&
                            BLOCK_BUTTON_GROUP.map((blockButton, index) => (
                                <BlockButton
                                    key={index}
                                    type={blockButton.type}
                                    tooltip={blockButton.tooltip}
                                    text={blockButton.text}
                                    setBlockType={this.setBlockType}
                                    selectedBlockType={selectedBlockType}
                                />
                            ))}
                    </React.Fragment>
                ) : null}
                <Editor
                    ref={this.state.ref}
                    onBlur={onBlur}
                    keyBindingFn={this.customKeyBinding}
                    handleKeyCommand={this.handleKeyCommand}
                    editorState={this.props.value}
                    onChange={this.props.onChange}
                    handleBeforeInput={this.handleBeforeInput}
                    handlePastedText={this.handlePastedText}
                    readOnly={this.props.readOnly}
                    handleDrop={() => EDITOR_KEYBOARD_STATUS.NotHandled}
                    spellCheck
                />
                {!this.props.readOnly ? (
                    <EditorToolbar
                        value={this.props.value}
                        toggleScroll={() => this.setState(state => ({ removeScroll: !state.removeScroll }))}
                        scroll={!removeScroll}
                    />
                ) : null}
                <LinkPopper
                    initialValues={this.state.linkInitialValues}
                    show={this.state.showPopper}
                    anchorEl={this.state.anchorEl}
                    submit={this.insertLink}
                    handleClose={() => {
                        this.setState({
                            showPopper: false,
                            anchorEl: null,
                        });
                        this.state.ref.current.focus();
                    }}
                />
                <MaterialModal
                    title="Select Variable"
                    name="variable-select"
                    show={this.state.showVariableModal}
                    handleClose={() => this.setState({ showVariableModal: false })}
                >
                    <List>
                        {this.props.variables.map(variable => (
                            <ListItem button key={variable.id} onClick={() => this.insertVariable(variable.key)}>
                                {snakeCaseToSentence(variable.key)}
                            </ListItem>
                        ))}
                    </List>
                </MaterialModal>
            </div>
        );
    }
}

export default withStyles(editorStyles)(CustomEditor);
