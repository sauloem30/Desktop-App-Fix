import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import logo from "../../assests/images/app-logo.png";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { StartIcon, PauseIcon } from "../../assests/icons/SvgIcons";
import axiosInstance from "../../utils/axios-instance";
import { getTime, getTimeLog } from "../../utils/index";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.white,
    height: "100vh",
    overflow: "hidden",
  },
  loginContainer: {
    padding: "0px 0px",
    textAlign: "center",
  },
  ListItem: {
    display: "flex",
    justifyContent: "space-between",
  },
  loginContent: {
    [theme.breakpoints.down("sm")]: {
      padding: "24px 0px 0px 0px",
    },
  },
  formContent: {
    marginTop: 10,
    "& > *": {
      marginBottom: 10,
    },
    width: "100%",
  },
}));

const style = {
  width: "100%",
  maxWidth: 360,
  bgcolor: "background.paper",
};


var interval;
const  TimeTracker = () => {
  const classes = useStyles();
  const [projects, setProjects] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [isStopRender, setStopRender] = useState(false);
  const [totalToday, setTotalToday] = useState(0);
  const [isTimeLogData, setTimeLogData] = useState(false);
  const [projectName, setProjectName] = useState('Select a project');
  const [currentTimer, setCurrentTimer] = useState(0);

  useEffect(() => {
    axiosInstance
      .request({
        method: "GET",
        url: `${process.env.REACT_APP_API_BASE_URL}/projects/lookup/active`,

      })
      .then((res) => {
        const { data } = res;
        let arr = data?.result?.map((val) => {
          return { ...val, time: 0 }
        }) || []

        setProjects(arr || []);
      });
  }, []);

  const handlePostTimeLog = async (project_time, project_id) => {
    const obj = {
      user_id: "3",
      time_in: `2022-06-14 ${getTime(project_time)}`,
      project_id: project_id
    }
    let res;
    try {
      res = await axiosInstance.post(`${process.env.REACT_APP_API_BASE_URL}/timelog`, obj)
      return setTimeLogData(res.data?.id)
    }
    catch (err) {
      console.log(err)
    }
  }

  const handleUpdateTimeLog = async (project) => {
    const { id , time } = project;
    handlePause(id);
    const obj = {
      user_id: "3",
      time_in: `2022-06-14 ${getTime(time)}`,
      project_id: id,
      id: isTimeLogData
    }
    try {
      await axiosInstance.put(`${process.env.REACT_APP_API_BASE_URL}/timelog`, obj)
    }
    catch (err) {
      console.log(err)
    }

  }


  const handleProjectStart = (project) => {
    const { id , name, time } =  project;
    handlePostTimeLog(time, id)
    document.title = `${name}-Thriveva`
    setIsActive(id);
    setProjectName(name);
    setCurrentTimer(0);
    clearInterval(interval);
    window.ProjectRunning.send("paused", { someData: "Hello" })
    window.ProjectRunning.send("project-started", { someData: "Hello" });
    setStopRender(!isStopRender)
    let filteredProject = projects.filter((item, i) => item.id === id);
    if (filteredProject) {

      interval = setInterval(() => {
        setTotalToday(state => state += 1)
        setCurrentTimer(state => state += 1);
        filteredProject[0].time += 1
      }
        , 1000
      )

    } else {
      return null;
    }
  };

  const handlePause = (ProjectId) => {
    setCurrentTimer(0);
    document.title = "Thriveva"
    setProjectName("Select a project")
    clearInterval(interval)
    let project = projects.filter((item, i) => item.id === ProjectId);
    if (project) {
      setIsActive(false);
      clearInterval(interval)
      window.ProjectRunning.send('paused');
    } else {
      return null;
    }
  };
  return (
    <Box sx={{ height: "fit-content" }}>
      <Grid
        container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          // height: "100vh",
        }}
      >
        <Grid item lg={5} md={4} sm={12} xs={12}>
          <Paper
            className={classes.loginContainer}
            style={{ boxShadow: "none" }}
          >
            <img
              src={logo}
              style={{
                maxHeight: 30,
                width: "162px",
                marginBottom: "20px",
                marginTop: "20px",
              }}
              alt="logo"
            />
            <Box sx={{ border: "1px solid #F2F3F7" }} />
            <Typography variant="h4" sx={{ marginTop: "32px" }}>
              {projectName}
            </Typography>
            <Typography variant="body4" sx={{ marginBottom: "12px" }}>
              <Box>{getTime(currentTimer)}</Box>
            </Typography>
            <Typography variant="body5">
              <Box sx={{ marginBottom: "10px" }}>No daily limit</Box>
            </Typography>
            <Typography
              variant="body6"
              sx={{ marginTop: "10px", marginBottom: "32px" }}
            >
              Total today: {getTime(totalToday).slice(0, 5)}
            </Typography>
            <div className={classes.loginContent}>
              <List sx={style} component="nav" aria-label="mailbox folders">
                <ListItem
                  button
                  sx={{ backgroundColor: "#F2F3F7", padding: "17px 24px" }}
                >
                  <ListItemText>
                    <Typography variant="subheading1">Projects:</Typography>
                  </ListItemText>
                </ListItem>

                {projects?.map((project, index) => {
                  return (
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
                          {isActive !== project.id ? (
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
                          primary={getTimeLog(project.time)}
                          sx={{ textAlign: "right" }}
                        />
                      </ListItem>
                      <Divider light />
                    </div>
                  );
                })}
              </List>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TimeTracker;
