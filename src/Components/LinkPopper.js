import React from 'react';
import PropTypes from 'prop-types';
import Popper from '@material-ui/core/Popper';
import Fade from '@material-ui/core/Fade';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import withStyles from '@material-ui/core/styles/withStyles';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { Formik } from 'formik';

import editorStyles from '../editorStyles';
import { validateLinkInsert } from '../utils';

const LinkPopper = props => {
    const { classes, show, anchorEl, handleClose, submit, initialValues } = props;

    const closeModal = resetForm => {
        resetForm();
        handleClose();
    };

    const onClickAway = (e, resetForm) => {
        if (props.anchorEl.contains(e.target)) return;

        closeModal(resetForm);
    };

    const handleFormSubmit = (values, { resetForm }) => {
        submit(values.text, values.link);
        closeModal(resetForm);
    };

    return (
        <Popper open={show} anchorEl={anchorEl} transition disablePortal className={classes.zIndex9}>
            {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={250}>
                    <Card className={classes.linkCard}>
                        <Formik
                            enableReinitialize
                            onSubmit={handleFormSubmit}
                            initialValues={initialValues}
                            validate={validateLinkInsert}
                        >
                            {({ values, handleChange, resetForm, handleSubmit, errors, submitCount }) => (
                                <ClickAwayListener onClickAway={e => onClickAway(e, resetForm)}>
                                    <CardContent className={classes.linkCardContent}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    value={values.text}
                                                    fullWidth
                                                    label="Text"
                                                    name="text"
                                                    error={submitCount && errors.text}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    value={values.link}
                                                    fullWidth
                                                    label="Link"
                                                    name="link"
                                                    error={submitCount && errors.link}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Button fullWidth color="primary" onClick={() => closeModal(resetForm)}>
                                                    Cancel
                                                </Button>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Button fullWidth color="primary" onClick={handleSubmit}>
                                                    Apply
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </ClickAwayListener>
                            )}
                        </Formik>
                    </Card>
                </Fade>
            )}
        </Popper>
    );
};

LinkPopper.propTypes = {
    classes: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    anchorEl: PropTypes.object,
    handleClose: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    initialValues: PropTypes.object.isRequired
};

LinkPopper.defaultProps = {
    anchorEl: null
};

export default withStyles(editorStyles)(LinkPopper);
