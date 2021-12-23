import React, { memo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import withStyles from '@material-ui/core/styles/withStyles';

import editorStyles from '../editorStyles';

const BlockButton = ({ classes, text, type, selectedBlockType, setBlockType, tooltip }) => (
    <Tooltip title={tooltip}>
        <Button
            variant="text"
            className={classNames({
                [classes.blockIcon]: true,
                [classes.enabled]: selectedBlockType === type
            })}
            classes={{
                label: classes.blockIconText
            }}
            onMouseDown={e => {
                e.preventDefault();
                setBlockType(type);
            }}
        >
            {text}
        </Button>
    </Tooltip>
);

BlockButton.propTypes = {
    classes: PropTypes.object.isRequired,
    selectedBlockType: PropTypes.string.isRequired,
    setBlockType: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    tooltip: PropTypes.string.isRequired
};

export default withStyles(editorStyles)(memo(BlockButton));
