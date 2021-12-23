import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import withStyles from '@material-ui/core/styles/withStyles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Tooltip from '@material-ui/core/Tooltip';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { getLinkAtCursor } from '../utils';
import editorStyles from '../editorStyles';

const EditorToolbar = props => {
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
                <Grid item xs={9} align="right">
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

EditorToolbar.propTypes = {
    classes: PropTypes.object.isRequired,
    value: PropTypes.object.isRequired,
    toggleScroll: PropTypes.func.isRequired,
    scroll: PropTypes.bool.isRequired
};

export default withStyles(editorStyles)(EditorToolbar);
