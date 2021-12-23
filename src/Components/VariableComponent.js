import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Tooltip from '@material-ui/core/Tooltip';
import withStyles from '@material-ui/core/styles/withStyles';

import editorStyles from '../editorStyles';

const VariableComponent = props => {
    const { contentState, entityKey, classes, children } = props;
    const entity = contentState.getEntity(entityKey);

    const data = entity.getData();
    const { blacklisted = false } = data;

    const baseComponent = (
        <span
            className={classNames({
                [classes.variable]: true,
                [classes.blacklistedVariable]: blacklisted
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

VariableComponent.propTypes = {
    children: PropTypes.array,
    classes: PropTypes.object.isRequired,
    contentState: PropTypes.object.isRequired,
    entityKey: PropTypes.string.isRequired
};

VariableComponent.defaultProps = {
    children: null
};

export default withStyles(editorStyles)(VariableComponent);
