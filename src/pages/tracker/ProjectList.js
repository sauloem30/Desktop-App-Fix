import React, { useEffect } from 'react'
import { sx, useStyles } from './styles'
import { getHourMin } from '../../utils';
import TrackerContext from './TrackerContext';
import { PauseIcon, StartIcon } from '../../assests/icons/SvgIcons';
import { List, ListItem, ListItemText, Box, Divider, Typography } from '@mui/material'

export default function ProjectList() {
    const classes = useStyles();

    const {
        projects,
        activeProjectId,
        setActiveProjectId,
        isLimitReached
    } = React.useContext(TrackerContext);

    useEffect(() => {
        if (isLimitReached && activeProjectId > 0) {
            setActiveProjectId(0);
        }
    }, [isLimitReached]);

    const handleProjectStart = async (project) => {
        if (isLimitReached) return;
        // start the project
        setActiveProjectId(project.id);
    }

    const handlePause = async (project) => {
        if (isLimitReached) return;
        // pause the project
        setActiveProjectId(0);
    }

    return (
        <div>
            <List className={classes.style} component='nav' aria-label='mailbox folders'>
                <ListItem
                    button
                    style={{ pointerEvents: 'none' }}
                    sx={{ backgroundColor: '#F2F3F7', padding: '17px 24px' }}>
                    <ListItemText>
                        <Typography variant='subheading1'>Projects:</Typography>
                    </ListItemText>
                </ListItem>

                <div className={classes.projectContainer}>
                    {projects.length ? (
                        projects.map((project, index) => {
                            const isActive = activeProjectId === project.id;
                            return (
                                <div key={project.id}>
                                    <ListItem
                                        button
                                        className={classes.ListItem}
                                        sx={{
                                            height: 54,
                                            background: isActive ? '#E1F7F1' : 'inherit',
                                            '&:hover': {
                                                background: isActive ? '#E1F7F1' : '#F7F9FA',
                                            },
                                        }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginLeft: '8px',
                                            }}>
                                            {!isActive ? (
                                                <Box onClick={async () => {
                                                        await handleProjectStart(project);
                                                    }}>
                                                    {<StartIcon />}
                                                </Box>
                                            ) : (
                                                <Box onClick={async () => {
                                                        await handlePause(project);
                                                    }}>
                                                    {<PauseIcon />}
                                                </Box>
                                            )}
                                            <ListItemText
                                                primary={project.name}
                                                sx={{
                                                    marginLeft: '8px',
                                                    '& span':
                                                        project.name === 'start'
                                                            ? { color: '#2A41E7' }
                                                            : { color: '#000000' },
                                                }}
                                            />
                                        </Box>
                                        <ListItemText
                                            primary={
                                                project.time
                                                    ? getHourMin(parseInt(project.time))
                                                    : '00:00'
                                            }
                                            sx={{ textAlign: 'right' }}
                                        />
                                    </ListItem>
                                    <Divider light />
                                </div>
                            );
                        })
                    ) : (
                        <Box
                            sx={{
                                marginTop: '35px',
                            }}>
                            <Typography variant='subheading3'>
                                No active project available!
                            </Typography>
                        </Box>
                    )}
                </div>
            </List>
        </div>
    )
}