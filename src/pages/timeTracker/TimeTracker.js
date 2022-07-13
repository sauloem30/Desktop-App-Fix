import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { getProjects, handlePostTimeLog, handleUpdateTimeLog } from "../../api";
import { PauseIcon, StartIcon } from "../../assests/icons/SvgIcons";
import logo from "../../assests/images/app-logo.png";
import axiosInstance from "../../utils/axios-instance";
import { getHourMin, getHourMinSec } from "../../utils/index";
import { useStyles } from "./useStyles";

let interval;
const TimeTracker = () => {
  const classes = useStyles();
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(false); //should be numeric but to make it faster, will retain false for the meantime
  const [isLoading, setIsLoading] = useState(false);
  const [totalToday, setTotalToday] = useState(0);
  const [projectName, setProjectName] = useState('Select a project');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentTimer, setCurrentTimer] = useState(0);
  const [noEvents, setNoEvents] = useState(0);
  const [returnId, setReturnId] = useState('');
  const [activeTimelogId, setActiveTimelogId] = useState(-1);
  const [dailyLimit, setDailyLimit] = useState("No Daily Limit")
  const [isLimitReached, setIsLimitReached] = useState(false);

  useEffect(() => {
    window.electronApi.send("paused")
    async function getProjectData() {
      const res = await getProjects()
      const { result } = res
      if(res.err_msg?.length === 0) {
        setProjects(result);
        let totalTime = 0

        result.map(project => totalTime += parseInt(project.time) / 60);
        setTotalToday(totalTime * 60);
      } else {
        setErrorMessage("Error loading projects")
      }
    }
    getProjectData()
    setErrorMessage('')
  }, []);

  const handleProjectStart = async (project) => {
    setErrorMessage('')
    if(isLoading === false) {
      // Log out first if clocked in to another project
      if(project.id !== activeProjectId && activeProjectId !== false) {
        const response = await handleUpdateTimeLog( activeProjectId, activeTimelogId )
        if(response.data?.error_message.length > 0) {
          setErrorMessage(response.data.error_message)
        }
      }

      setIsLoading(true)
      const { id, name, daily_limit_by_minute } = project;
      setIsLimitReached(false);
      const returned_data = await handlePostTimeLog(id);
      if(returned_data.data?.success) {
        setCurrentTimer(0)
        setDailyLimit(`Today's Limit : ${daily_limit_by_minute === 0 ? "No Daily Limit" : getHourMin(daily_limit_by_minute * 60)}`);
        setActiveTimelogId(returned_data.data.id)
        document.title = `${name}-Thriveva`
        setActiveProjectId(id);
        localStorage.setItem('projectData', JSON.stringify([{id: returned_data.data.id, projectId: id, userId: returned_data.data.userId}]))
        setProjectName(name);
        clearInterval(interval);
        window.electronApi.send("paused")
        window.electronApi.send("project-started");
        let filteredProject = projects.filter((item, i) => item.id === id);
        if (filteredProject) {
          setCurrentTimer(state => state += parseInt(filteredProject[0].time));
          interval = setInterval(async() => {
            if((parseInt(filteredProject[0].time) / 60 !== filteredProject[0].daily_limit_by_minute) || filteredProject[0].daily_limit_by_minute === 0) {             
              setTotalToday(state => state += 1)
              setCurrentTimer(state => state += 1 );
              filteredProject[0].time = parseInt(filteredProject[0].time) + 1;
              setTotalToday(state => state++);
            } else {
              setIsLimitReached(true)
              handlePause(filteredProject[0].id)
            }
          }, 1000)
        } else {
          return null;
        }
      } else {
        setErrorMessage(returned_data.data.error_message)
      }

      setIsLoading(false)
    }
  };

  const handlePause = async(projectId) => {
    setErrorMessage('')
    setCurrentTimer(0)
    setDailyLimit("No Daily Limit")
    document.title = "Thriveva"
    setProjectName("Select a project")
    clearInterval(interval)
    localStorage.setItem('projectData', JSON.stringify([]))
    let project = projects.filter((item) => item.id === projectId);
    if (project) {
      setActiveProjectId(false);
      const response = await handleUpdateTimeLog( ...project, activeTimelogId )
      if(response.data?.success) {
        clearInterval(interval)
        window.electronApi.send('paused');
      } else {
        setErrorMessage(response.data.error_message)
        clearInterval(interval)
        window.electronApi.send('paused');
      }
    }
  };

  useEffect(() => {
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
              generated_at: moment().utc(),
              project_id: activeProjectId
            }
          }
        })
        postSsData(newArr);
      }
    } else {
      handlePause(activeProjectId);
    }
  }, [localStorage.getItem('screenshot')])

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
            setErrorMessage(err)
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
            setErrorMessage(err)
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
            <div style={{textAlign: 'center', minHeight: 25}}>
              {
                isLimitReached && (
                    <Typography variant="body5" style={{color: 'red'}}>
                      Project Limit Reached
                    </Typography>
                )
              }
              {
                errorMessage.length > 0 && (
                    <Typography variant="body5" style={{color: 'red'}}>
                      {errorMessage}
                    </Typography>
                )
              }
            </div>
            <div>
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
                <div className={classes.projectContainer} >
                  {projects.length? projects.map((project, index) => {
                    return (
                      <div key={project.id} >
                        <ListItem
                          button
                          className={classes.ListItem}
                          sx={{
                            height: 54,
                            background: project.is_active ? "#E1F7F1" : "inherit",
                            "&:hover": {
                              background: project.is_active ? "#E1F7F1" : "#F7F9FA",
                            },
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
                              <Box onClick={async() => {
                                (project.time / 60 >= project.daily_limit_by_minute && project.daily_limit_by_minute !== 0) ?
                                  handleLimitReached() : await handleProjectStart(project);
                              }}>
                                {<StartIcon />}
                              </Box>
                            ) : (
                              <Box onClick={async() => {
                                await handlePause(project.id)
                              }}>
                                {<PauseIcon />}
                              </Box>
                            )}
                            <ListItemText
                              primary={project.name}
                              sx={{
                                marginLeft: "8px",
                                "& span":
                                  project.name === "start" ? { color: "#2A41E7" } : { color: "#000000" },
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
