import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import logo from "../../assests/images/app-logo.png";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { StartIcon, PauseIcon } from "../../assests/icons/SvgIcons";
import { getHourMin, getHourMinSec } from "../../utils/index";
import { handleUpdateTimeLog, getProjects, handlePostTimeLog } from "../../api";
import { useStyles } from "./useStyles";
import axiosInstance from "../../utils/axios-instance";
import moment from "moment";

var interval;
const TimeTracker = () => {
  const classes = useStyles();
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(-1);
  const [isStopRender, setStopRender] = useState(false);
  const [totalToday, setTotalToday] = useState(0);
  const [projectName, setProjectName] = useState('Select a project');
  const [currentTimer, setCurrentTimer] = useState(0);
  const [noEvents, setNoEvents] = useState(0);
  const [returnId, setReturnId] = useState('');
  const [activeTimelogId, setActiveTimelogId] = useState(-1);
  const [dailyLimit, setDailyLimit] = useState("No Daily Limit")
  const [isLimitReached, setIsLimitReached] = useState(false);

  useEffect(() => {
    window.electronApi.send("paused")
    getProjects().then(res => {
      if (res) {
        setProjects(res);
        let totalTime = 0
        res.map(project => totalTime += parseInt(project.time / 60));

        setTotalToday(totalTime * 60);
      }
    }).catch(err => {
    })

  }, []);

  const handleProjectStart = async (project) => {
    const { id, name, time, daily_limit_by_minute } = project;
    setIsLimitReached(false);
    setDailyLimit(`Today's Limit ${getHourMin(daily_limit_by_minute * 60)}`);
    const returned_data = await handlePostTimeLog(time, id);
    setActiveTimelogId(returned_data.data.id);
    document.title = `${name}-Thriveva`
    setActiveProjectId(id);
    setProjectName(name);
    setCurrentTimer(0);
    clearInterval(interval);
    window.electronApi.send("paused")
    window.electronApi.send("project-started");
    setStopRender(!isStopRender)
    let filteredProject = projects.filter((item, i) => item.id === id);
    if (filteredProject) {

      interval = setInterval(() => {
        setTotalToday(state => state += 1)
        setCurrentTimer(state => state += 1);
        filteredProject[0].time += 1;
        setTotalToday(state => state++);

      }
        , 1000
      )

    } else {
      return null;
    }
  };

  const handlePause = (projectId) => {
    setCurrentTimer(0)
    setDailyLimit("No Daily Limit")
    document.title = "Thriveva"
    setProjectName("Select a project")
    clearInterval(interval)
    let project = projects.filter((item) => item.id === projectId);
    if (project) {
      setActiveProjectId(false);
      handleUpdateTimeLog(...project, activeTimelogId)
      clearInterval(interval)
      window.electronApi.send('paused');
    } else {
      return null;
    }
  };

  useEffect(
    () => {
      let data = []
      if (noEvents < 6) {
        if (activeProjectId >= 0 && JSON.parse(localStorage.getItem('screenshot'))) {
          data = JSON.parse(localStorage.getItem('screenshot'));
          let newArr = data.map(val => {
            if (val.keyboard === 0 && val.mouse === 0) {
              setNoEvents(state => state + 1)
            } else {
              setNoEvents(0)
            }
            if (val.loggedTime) {
              return { ...val }
            } else {
              return {
                ...val,
                generated_at: moment().utc("YYYY-MM-DD hh:mm:ss"),
                project_id: activeProjectId

              }
            }
          })
          postSsData(newArr);
        }
      } else {
        handlePause(activeProjectId);
      }
   // eslint-disable-next-line
    }, [localStorage.getItem('screenshot')]
  )


  const postSsData = (newArr) => {


    let failedSs = []
    let onComplete = []
    if (newArr && newArr.length) {
      let failSsToSend = []
      if (JSON.parse(localStorage.getItem('failedSS'))) {
        failSsToSend = JSON.parse(localStorage.getItem('failedSS'))
      }
      let arrayToFetch = [...failSsToSend, ...newArr]
      arrayToFetch.map(async item => {
        let res = {}
        if (item.second_screenshot) {
          try {
            res = await axiosInstance.post('/screenshots/upload', item, returnId)
            setReturnId(res?.data?.return_id)
            onComplete.push(res)
          }
          catch (err) {
            onComplete.push(err)
            failedSs.push(item);
          }
        } else {
          try {
            res = await axiosInstance.post('/screenshots/upload', item);
            setReturnId(res?.data?.return_id);
            onComplete.push(res)
          }
          catch (err) {
            onComplete.push(err)
            failedSs.push(item);
          }
          if (newArr.length === onComplete.length) {
            localStorage.setItem('screenshot', JSON.stringify([]));
            localStorage.setItem('failedSS', JSON.stringify(failedSs));
          }
        }

      })
    }
  }

  const handleLimitReached = () => {
    setIsLimitReached(true)
    setTimeout(() => setIsLimitReached(false), 4000);

  }

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
            <Typography variant="h4" sx={{ marginTop: "32px", pointerEvents: "none" }}>
              {projectName}
            </Typography>
            <Typography variant="body4" sx={{ marginBottom: "12px" }}>
              <Box>{getHourMinSec(currentTimer)}</Box>
            </Typography>
            <Typography variant="body5">
              <Box sx={{ marginBottom: "10px" }}>{dailyLimit}</Box>
            </Typography>

            <Typography
              variant="body6"
              sx={{ marginTop: "10px", marginBottom: "32px" }}
            >
              Total today: {getHourMin(totalToday)}
            </Typography>
            <Typography variant="body5">
              <Box style={isLimitReached ? { display: 'block' } : { display: 'none' }} sx={{ position: 'absolute', left: "50%", color: 'red', transform: 'translate(-50%)' }}>Project Limit Is Reached</Box>
            </Typography>
            <div className={classes.loginContent}>
              <List className={classes.style} component="nav" aria-label="mailbox folders">
                <ListItem
                  button
                  style={{ pointerEvents: "none" }}
                  sx={{ backgroundColor: "#F2F3F7", padding: "17px 24px" }}
                >
                  <ListItemText >
                    <Typography variant="subheading1">Projects:</Typography>
                  </ListItemText>
                </ListItem>
                <div className="active_projects" >
                  {projects.length? projects.map((project, index) => {
                    // setTotalToday(state=> state++)
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
                            {activeProjectId !== project.id ? (
                              <Box onClick={() => {
                                project.time / 60 >= project.daily_limit_by_minute ?
                                  handleLimitReached() : handleProjectStart(project);
                              }}>
                                {<StartIcon />}
                              </Box>
                            ) : (
                              <Box onClick={() => {
                                handlePause(project.id)
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
                            primary={project.time ? getHourMin(parseInt(project.time)) : "No Limit"}
                            sx={{ textAlign: "right" }}
                          />
                        </ListItem>
                        <Divider light />
                      </div>
                    );
                  }
                ):  <Box sx={{
                  marginTop: "35px",
                }}>
                  <Typography variant="subheading3">No active project available!</Typography>
                </Box>
                }
                </div>
              </List>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TimeTracker;
