import React from 'react';
import classNames from 'classnames';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import withStyles, { ClassNameMap } from '@material-ui/core/styles/withStyles';
import CloseIcon from '@material-ui/icons/Close';

import utilsStyles from '../styles/utilsStyles';

interface MaterialModalProps {
    classes: ClassNameMap;
    customClasses?: any;
    children: React.ReactNode;
    actionChildren?: React.ReactNode;
    title: React.ReactNode | string;
    name: string;
    scroll?: 'paper' | 'body';
    show: boolean;
    handleClose: () => void;
    keepMounted?: boolean;
    fullWidth?: boolean;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    fullScreen?: boolean;
    overFlowYVisible?: boolean;
}

const MaterialModal = (props: MaterialModalProps) => {
    const {
        classes,
        show,
        name,
        title,
        keepMounted = false,
        maxWidth = 'sm',
        fullScreen = false,
        actionChildren = null,
        children,
        fullWidth = false,
        scroll = 'body',
        overFlowYVisible = false,
    } = props;

    const modalLabel = `${name}-label`;
    const modalDescription = `${name}-description`;

    const customClasses = { ...(props.customClasses || {}) };

    const paperClasses = {
        [classes.minWidth]: true,
        [classes.yOverflowVisible]: overFlowYVisible,
    };

    if (customClasses?.paper) {
        paperClasses[customClasses.paper] = true;
    }

    customClasses.paper = classNames(paperClasses);

    return (
        <Dialog
            open={show}
            fullScreen={fullScreen}
            maxWidth={maxWidth}
            classes={customClasses}
            onClose={props.handleClose}
            keepMounted={keepMounted}
            scroll={scroll}
            fullWidth={fullWidth}
            aria-labelledby={modalLabel}
            aria-describedby={modalDescription}
        >
            <DialogTitle id={modalLabel} className={classes.modalTitle} disableTypography>
                <h2 className={classes.modalHeading}>{title}</h2>
                <IconButton onClick={props.handleClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent
                id={modalDescription}
                className={classNames({
                    [classes.yOverflowVisible]: overFlowYVisible,
                    [classes.dialogContent]: true,
                })}
            >
                {children}
            </DialogContent>
            {actionChildren && <DialogActions>{actionChildren}</DialogActions>}
        </Dialog>
    );
};

export default withStyles(utilsStyles)(MaterialModal);
