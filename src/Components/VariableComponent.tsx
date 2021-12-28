import React from 'react';
import classNames from 'classnames';
import Tooltip from '@material-ui/core/Tooltip';
import withStyles, { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { ContentState } from 'draft-js';

import editorStyles from '../styles/editorStyles';

interface VariableComponentProps {
    children?: React.ReactNode;
    classes: ClassNameMap;
    contentState: ContentState;
    entityKey: string;
}

const VariableComponent = (props: VariableComponentProps) => {
    const { contentState, entityKey, classes, children = null } = props;
    const entity = contentState.getEntity(entityKey);

    const data = entity.getData();
    const { blacklisted = false } = data;

    const baseComponent = (
        <span
            className={classNames({
                [classes.variable]: true,
                [classes.blacklistedVariable]: blacklisted,
            })}
        >
            {children}
        </span>
    );

    if (blacklisted) {
        return <Tooltip title="Variable not available">{baseComponent}</Tooltip>;
    }

    return baseComponent;
};

export default withStyles(editorStyles)(VariableComponent);
