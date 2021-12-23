import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import withStyles from '@material-ui/core/styles/withStyles';
import CloseIcon from '@material-ui/icons/Close';

import utilsStyles from '../utilsStyles';

const MaterialModal = props => {
    const {
        classes,
        show,
        name,
        title,
        keepMounted,
        maxWidth,
        fullScreen,
        actionChildren,
        children,
        fullWidth,
        scroll,
        overFlowYVisible
    } = props;

    const modalLabel = `${name}-label`;
    const modalDescription = `${name}-description`;

    const customClasses = { ...props.customClasses };

    const paperClasses = {
        [classes.minWidth]: true,
        [classes.yOverflowVisible]: overFlowYVisible
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
                    [classes.dialogContent]: true
                })}
            >
                {children}
            </DialogContent>
            {actionChildren && <DialogActions>{actionChildren}</DialogActions>}
        </Dialog>
    );
};

MaterialModal.propTypes = {
    classes: PropTypes.object.isRequired,
    customClasses: PropTypes.object,
    children: PropTypes.oneOfType([PropTypes.object, PropTypes.node, PropTypes.array]).isRequired,
    actionChildren: PropTypes.oneOfType([PropTypes.object, PropTypes.node, PropTypes.array]),
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    name: PropTypes.string.isRequired,
    scroll: PropTypes.string,
    show: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    keepMounted: PropTypes.bool,
    fullWidth: PropTypes.bool,
    maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
    fullScreen: PropTypes.bool,
    overFlowYVisible: PropTypes.bool
};

MaterialModal.defaultProps = {
    keepMounted: false,
    fullWidth: false,
    actionChildren: null,
    maxWidth: 'sm',
    customClasses: {},
    scroll: 'body',
    fullScreen: false,
    overFlowYVisible: false
};

export default withStyles(utilsStyles)(MaterialModal);
