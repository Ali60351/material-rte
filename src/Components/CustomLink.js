import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';

import editorStyles from '../editorStyles';

const CustomLink = props => {
    const { url } = props.contentState.getEntity(props.entityKey).getData();
    return (
        <a href={url} className={props.classes.link} rel="noopener noreferrer" target="_blank">
            {props.children}
        </a>
    );
};

CustomLink.propTypes = {
    children: PropTypes.array,
    classes: PropTypes.object.isRequired,
    contentState: PropTypes.object.isRequired,
    entityKey: PropTypes.string.isRequired
};

CustomLink.defaultProps = {
    children: null
};

export default withStyles(editorStyles)(CustomLink);
