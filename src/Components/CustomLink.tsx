import React, { ReactNode } from 'react';
import withStyles, { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { ContentState } from 'draft-js';

import editorStyles from '../styles/editorStyles';

interface CustomLinkProps {
    children: null | Array<ReactNode>;
    classes: ClassNameMap;
    contentState: ContentState;
    entityKey: string;
}

const CustomLink = (props: CustomLinkProps) => {
    const { url } = props.contentState.getEntity(props.entityKey).getData();
    return (
        <a href={url} className={props.classes.link} rel="noopener noreferrer" target="_blank">
            {props.children}
        </a>
    );
};

CustomLink.defaultProps = {
    children: null,
};

export default withStyles(editorStyles)(CustomLink);
