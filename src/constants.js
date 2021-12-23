export const EDITOR_BLOCK_TYPES = {
    UnorderedList: 'unordered-list-item',
    OrderedList: 'ordered-list-item',
    Paragraph: 'unstyled',
    HeadingOne: 'header-one',
    HeadingTwo: 'header-two',
    HeadingThree: 'header-three',
    HeadingFour: 'header-four',
    HeadingFive: 'header-five',
    HeadingSix: 'header-six'
};

export const linkPopperInitialValues = {
    text: '',
    link: ''
};

export const EDITOR_INLINE_STYLES = {
    Bold: 'BOLD',
    Italic: 'ITALIC',
    Underline: 'UNDERLINE'
};

export const EDITOR_KEYBOARD_STATUS = {
    Handled: 'handled',
    NotHandled: 'not-handled'
};

export const ENTITY_TYPES = {
    LINK: 'LINK',
    VARIABLE: 'VARIABLE'
};

export const BLOCK_BUTTON_GROUP = [
    {
        type: EDITOR_BLOCK_TYPES.Paragraph,
        text: 'P',
        tooltip: 'Paragraph'
    },
    {
        type: EDITOR_BLOCK_TYPES.HeadingOne,
        text: 'H1',
        tooltip: 'Heading One'
    },
    {
        type: EDITOR_BLOCK_TYPES.HeadingTwo,
        text: 'H2',
        tooltip: 'Heading Two'
    },
    {
        type: EDITOR_BLOCK_TYPES.HeadingThree,
        text: 'H3',
        tooltip: 'Heading Three'
    },
    {
        type: EDITOR_BLOCK_TYPES.HeadingFour,
        text: 'H4',
        tooltip: 'Heading Four'
    },
    {
        type: EDITOR_BLOCK_TYPES.HeadingFive,
        text: 'H5',
        tooltip: 'Heading Five'
    },
    {
        type: EDITOR_BLOCK_TYPES.HeadingSix,
        text: 'H6',
        tooltip: 'Heading Six'
    }
];

export const ERROR_MESSAGES = {
    FIELD_REQUIRED: 'Required'
};
