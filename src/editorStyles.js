export default theme => ({
    editor: {
        backgroundColor: '#fff',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        borderRadius: '4px',
        transition: 'box-shadow 750ms',
        '& .public-DraftStyleDefault-ol': {
            marginLeft: '16px'
        }
    },
    zIndex9: {
        zIndex: '9'
    },
    error: {
        boxShadow: '0px 0px 0px 2px #f44336'
    },
    editorIcon: {
        borderRadius: '0%',
        [theme.breakpoints.down('sm')]: {
            padding: '5px 7px'
        }
    },
    blockIcon: {
        padding: '12px',
        minWidth: 'auto',
        borderRadius: '0%',
        [theme.breakpoints.down('sm')]: {
            padding: '5px 7px'
        },
        color: 'rgba(0, 0, 0, 0.54)'
    },
    blockIconText: {
        display: 'inline-block'
    },
    enabled: {
        borderRadius: '0%',
        backgroundColor: 'rgba(0, 0, 0, 0.17)'
    },
    link: {
        color: '#3b5998',
        textDecoration: 'underline'
    },
    linkCard: {
        maxWidth: '300px'
    },
    linkCardContent: {
        paddingBottom: '16px !important'
    },
    editorToolbar: {
        minHeight: '48px',
        padding: '0 0 0 5px',
        borderTop: '1px solid rgba(0, 0, 0, 0.12)'
    },
    toolbarLink: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        display: 'inline-block',
        verticalAlign: 'middle',
        maxWidth: '250px',
        overflow: 'hidden'
    },
    inlineBlock: {
        display: 'inline-block'
    },
    variable: {
        border: '1px #25aae1 solid',
        backgroundColor: '#25aae1',
        color: 'white',
        padding: '0 10px',
        borderRadius: '15px'
    },
    blacklistedVariable: {
        border: '1px #ff9800 solid',
        backgroundColor: '#ff9800'
    },
    removeScroll: {
        '& .DraftEditor-editorContainer > div': {
            maxHeight: 'none'
        }
    },
    editorRoot: {
        '& .DraftEditor-root': {
            backgroundColor: 'white'
        },

        '& .DraftEditor-editorContainer': {
            padding: '0 15px'
        },

        '& .DraftEditor-editorContainer>div': {
            fontSize: '13px',
            lineHeight: '27px'
        },

        '@media screen and (min-width: 960px)': {
            '& .DraftEditor-editorContainer>div': {
                fontSize: '16px',
                lineHeight: '32px'
            }
        },

        '@media (max-width: 600px)': {
            '& .DraftEditor-editorContainer button': {
                padding: 9
            }
        },

        '& .DraftEditor-editorContainer > div': {
            margin: '20px',
            marginLeft: '0px',
            marginRight: '0px',

            minHeight: '50px',
            maxHeight: '150px',

            color: '#172b4d',
            lineHeight: 'normal',
            fontFamily: "'Open Sans', sans-serif'",
            overflowY: 'auto',
            border: 'none',
            padding: '0px'
        }
    }
});
