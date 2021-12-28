import React, { memo } from 'react';
import classNames from 'classnames';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import withStyles from '@material-ui/core/styles/withStyles';

import editorStyles from '../styles/editorStyles';

interface BlockButtonProps {
    classes: any;
    selectedBlockType: string;
    setBlockType: (arg0: string) => void;
    type: string;
    text: string;
    tooltip: string;
}

const BlockButton = ({ classes, text, type, selectedBlockType, setBlockType, tooltip }: BlockButtonProps) => (
    <Tooltip title={tooltip}>
        <Button
            variant="text"
            className={classNames({
                [classes.blockIcon]: true,
                [classes.enabled]: selectedBlockType === type,
            })}
            classes={{
                label: classes.blockIconText,
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

export default withStyles(editorStyles)(memo(BlockButton));
