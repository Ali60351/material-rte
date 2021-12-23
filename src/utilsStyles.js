const primaryColor = '#0F1439';
const galleryrio = '#F0F0F0';

export default theme => ({
    modalHeading: {
        fontSize: '1.5rem',
        fontWeight: '500',
        overflow: 'hidden',
        textAlign: 'left',
        margin: '0',
        padding: '0',
        wordBreak: 'break-all',
        [theme.breakpoints.down('sm')]: {
            fontSize: '1.3rem'
        }
    },
    modalTitle: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    dialogContent: {
        // padding: '1rem 1.5rem',
    },
    yOverflowVisible: {
        overflowY: 'visible !important'
    },
    minWidth: {
        minWidth: '300px'
    },
    videoWrapper: {
        paddingBottom: '56.25%',
        height: '0',
        position: 'relative'
    },
    videoContainer: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%'
    },
    pT20: {
        paddingTop: '20px'
    },
    p10: {
        padding: '10px'
    },
    paginationBtn: {
        color: 'rgba(0, 0, 0, 0.87)',
        height: '32px',
        margin: '0 1px',
        padding: '0 6px',
        fontSize: '0.875rem',
        minWidth: '32px',
        boxSizing: 'border-box',
        textAlign: 'center',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: '400',
        lineHeight: '1.43',
        letterSpacing: '0.01071em'
    },
    paginationBtnSelected: {
        border: `1px solid ${primaryColor}77`,
        borderRadius: '4px'
    },
    paginationBtnDisabled: {
        color: 'rgba(0, 0, 0, 0.26)'
    },
    blackStar: {
        fill: '#626262'
    },
    errorStar: {
        fill: '#D32F2F'
    },
    helpIcon: {
        color: theme.palette.secondary.main,
        fontSize: '1rem !important',
        marginBottom: '-1px !important',
        marginLeft: '2px !important'
    },
    customExpansionSummary: {
        borderRadius: '6px',
        background: galleryrio,
        minHeight: 'auto !important'
    },
    tagChip: {
        padding: '5px',
        borderRadius: '4px',
        display: 'inline-block',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        maxWidth: '100%'
    },
    circleRoot: {
        flexGrow: 1,
        marginTop: '5px'
    },
    rankingCircleDiv: {
        position: 'relative'
    },
    rankingCircleText: {
        fontSize: '10px',
        position: 'relative',
        top: '-2px'
    },
    bottomCircle: {
        position: 'absolute',
        color: 'silver'
    },
    summaryContentPadding: {
        margin: '5px 0 !important'
    },
    disabledCustomExpansion: {
        backgroundColor: 'transparent !important'
    },
    disabledCustomExpansionSummary: {
        opacity: '1 !important'
    },
    alert: {
        display: 'flex',
        padding: '6px 16px',
        fontSize: '0.875rem',
        fontFamily: 'Roboto',
        fontWeight: 400,
        lineHeight: 1.43,
        borderRadius: 4,
        alignItems: 'center',
        color: 'white'
    },
    alertIcon: {
        display: 'flex',
        opacity: 0.9,
        padding: '7px 0',
        fontSize: '22px',
        marginRight: '12px'
    },
    selectedDisableColor: {
        color: 'grey'
    },
    stretch: {
        color: 'rgb(29, 40, 124)',
        minHeight: '517px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 47px',
        [theme.breakpoints.down('sm')]: {
            padding: '57px 0 0',
            minHeight: 'inherit'
        }
    },
    welcomeHeading: {
        fontWeight: 'bold',
        marginBottom: '30px',
        [theme.breakpoints.down('sm')]: {
            fontSize: '3.5rem'
        }
    },
    blankLine: {
        height: '22px',
        width: '100%'
    },
    primaryColor: {
        color: 'rgb(29, 40, 124)'
    },
    secondaryColor: {
        color: 'rgba(29, 40, 124, 0.7)'
    },
    textFieldColor: {
        color: 'rgba(0, 0, 0, 0.87)'
    }
});
