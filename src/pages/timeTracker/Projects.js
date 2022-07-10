import { Box, Divider } from '@mui/material';
import React from 'react';
import { PauseIcon, StartIcon } from '../../assests/icons/SvgIcons';
import { getHourMin  } from '../../utils';

function Projects({project , classes, ListItem , activeProjectId, handleProjectStart , handleUpdateTimeLog , ListItemText}) {
  return (
    <div>
      <div key={project.id} >
        <ListItem
          button
          className={classes.ListItem}
          sx={{
            height: 54,
            // "&:focus": {
            background: project.is_active ? "#E1F7F1" : "inherit",
            "&:hover": {
              background: project.is_active
                ? "#E1F7F1"
                : "#F7F9FA",
            },
            // },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: "8px",
            }}
          >
            {activeProjectId !== project.id ? (
              <Box onClick={() => {
                handleProjectStart(project);

              }}>
                {<StartIcon />}
              </Box>
            ) : (
              <Box onClick={() => {
                handleUpdateTimeLog(project)
              }

              }>
                {<PauseIcon />}
              </Box>
            )}

            <ListItemText
              primary={project.name}
              sx={{
                marginLeft: "8px",
                "& span":
                  project.name === "start"
                    ? { color: "#2A41E7" }
                    : { color: "#000000" },
              }}
            />
          </Box>
          <ListItemText
            primary={getHourMin(project.time)}
            sx={{ textAlign: "right" }}
          />
        </ListItem>
        <Divider light />
      </div>
    </div>
  )
}

export default Projects