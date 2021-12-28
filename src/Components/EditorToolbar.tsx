import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import withStyles, { ClassNameMap } from '@material-ui/core/styles/withStyles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Tooltip from '@material-ui/core/Tooltip';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { EditorState } from 'draft-js';

import { getLinkAtCursor } from '../utils';
import editorStyles from '../styles/editorStyles';

interface EditorToolbarProps {
    classes: ClassNameMap;
    value: EditorState;
    toggleScroll: () => void;
    scroll: boolean;
}

const EditorToolbar = (props: EditorToolbarProps) => {
    const { classes, value, scroll } = props;
    const link = getLinkAtCursor(value);

    const [showTooltip, setShowTooltip] = useState(false);

    const toggleScroll = () => {
        props.toggleScroll();
        setShowTooltip(false);
    };

    return (
        <Toolbar className={classes.editorToolbar}>
            <Grid container spacing={4} alignItems="center" justifyContent="flex-start">
                <Grid item xs={3}>
                    <Typography variant="caption">
                        {`${value.getCurrentContent().getPlainText().length} Characters`}
                    </Typography>
                </Grid>
                <Grid item xs={9} className={classes.alignRight}>
                    {link && (
                        <span className={classes.toolbarLink}>
                            <Link target="_blank" href={link}>
                                {link}
                            </Link>
                        </span>
                    )}
                    <Tooltip title="Toggle Scrolling" open={showTooltip}>
                        <IconButton
                            disableRipple
                            onMouseDown={toggleScroll}
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                            classes={{ root: classes.editorIcon }}
                        >
                            {scroll ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                        </IconButton>
                    </Tooltip>
                </Grid>
            </Grid>
        </Toolbar>
    );
};

export default withStyles(editorStyles)(EditorToolbar);
