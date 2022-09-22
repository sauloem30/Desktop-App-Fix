import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import moment from "moment";
import React, { useEffect, useState, useRef } from "react";
import { getProjects, handlePostTimeLog, handleUpdateTimeLog, handleLogout } from "../../api";
import { PauseIcon, StartIcon, MenuIcon } from "../../assests/icons/SvgIcons";
import logo from "../../assests/images/app-logo.png";
import axiosInstance from "../../utils/axios-instance";
import { getHourMin, getHourMinSec } from "../../utils/index";
import { useStyles } from "./useStyles";
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { useNavigate } from "react-router-dom";

let interval;
const TimeTracker = () => {
  const classes = useStyles();
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(false); //should be numeric but to make it faster, will retain false for the meantime
  const [isLoading, setIsLoading] = useState(false);
  const [isReloadApp, setIsReloadApp] = useState(false);
  const [totalToday, setTotalToday] = useState(0);
  const [projectName, setProjectName] = useState('Select a project');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentTimer, setCurrentTimer] = useState(0);
  const [noEvents, setNoEvents] = useState(0);
  const [returnId, setReturnId] = useState('');
  const [activeTimelogId, setActiveTimelogId] = useState(-1);
  const [dailyLimit, setDailyLimit] = useState("No Daily Limit")
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [isClearScreenshots, setIsClearScreenshots] = useState(false);
  const [userId, setUserId] = useState(0);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const navigate = useNavigate();

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
        }
        setIsClearScreenshots(true);
        localStorage.setItem('screenshot', JSON.stringify([]));
        localStorage.setItem('failedSS', JSON.stringify(failedSs));
        setIsClearScreenshots(false);
      })
    }
  }

  async function getProjectData() {
    const user = localStorage.getItem("userId")

    const res = await getProjects(user)
    const { result } = res
    if(res.err_msg?.length === 0) {
      setProjects(result);
      let totalTime = 0

      result.map(project => totalTime += parseInt(project.time) / 60);
      setTotalToday(totalTime * 60);
      return result
    } else {
      setErrorMessage("Error loading projects")
    }
  }

  const handleProjectStart = async (project, isMidnight) => {
    setErrorMessage('')
    const userId = parseInt(localStorage.getItem("userId"))
    if(isLoading === false) {
      // Log out first if clocked in to another project
      if(project.id !== activeProjectId && activeProjectId !== false) {
        const response = await handleUpdateTimeLog( activeProjectId, activeTimelogId, userId )
        if(response.data?.error_message.length > 0) {
          setErrorMessage(response.data.error_message)
        }
      }

      setIsLoading(true)
      const { id, name, daily_limit_by_minute } = project;
      setIsLimitReached(false);
      const returned_data = await handlePostTimeLog(id, userId, isMidnight);
      if(returned_data.data?.success) {
        // activate idle timer
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
          const startTime = moment().utc().format('YYYY-MM-DD HH:mm:ss')
          let subtotalToday = totalToday
          let filteredProjectTimeTotal = parseInt(filteredProject[0].time)
          interval = setInterval(() => {
            // handle auto out when midnight is reached
            if (moment().format("Hms") === "000") {
              setTotalToday(0)
              filteredProject[0].time = 0;
              subtotalToday = 0;
              filteredProjectTimeTotal = 0;
              setIsReloadApp(true);
            } else if((parseInt(filteredProject[0].time) / 60 !== filteredProject[0].daily_limit_by_minute) || filteredProject[0].daily_limit_by_minute === 0) {             
              // get total today
              const timeNow = moment().utc().format('YYYY-MM-DD HH:mm:ss')
              const timeDiff = moment(timeNow).diff(startTime, 'seconds')
              setCurrentTimer(filteredProjectTimeTotal + timeDiff)
              setTotalToday(subtotalToday + timeDiff)
              filteredProject[0].time = filteredProjectTimeTotal + timeDiff;
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

  const handlePause = async(projectId, timelogId, isMidnight = false, isIdle = false ) => {
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
      const response = await handleUpdateTimeLog( ...project, timelogId || activeTimelogId, userId, isMidnight, isIdle )
      if(response.data?.success) {
        clearInterval(interval)
        window.electronApi.send('paused');
      } else {
        setErrorMessage(response.data.error_message)
        clearInterval(interval)
        window.electronApi.send('paused');
      }
    }

    if (isMidnight) {
      setTimeout(async() => {
        setCurrentTimer(0);
        setTotalToday(0);
        // Update limit here
        const projectData = await getProjectData();
        const newProjectData = projectData.filter((item, i) => item.id === projectId);
        await handleProjectStart({ id: projectId, name: newProjectData[0].name, daily_limit_by_minute: newProjectData[0].daily_limit_by_minute}, true);
      }, 1000);}
  };

  useEffect(() => {
    if(isReloadApp) {
      handlePause(activeProjectId, activeTimelogId, true);
      setIsReloadApp(false);
    }
  }, [isReloadApp])

  useEffect(() => {
    window.electronApi.send("paused")
    const user = localStorage.getItem("userId")

    getProjectData()
    setUserId(parseInt(user))
    setErrorMessage('')
  }, []);

  useEffect(() => {
    if(!isClearScreenshots && activeProjectId) {
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
    }

  }, [localStorage.getItem('screenshot'), isClearScreenshots])

  useEffect(() => {
    const auto = async () => {
      const isLogout = JSON.parse(localStorage.getItem('autoLoad'));
      if(isLogout && isLogout.is_auto) {
        if(userId !== null) {
          localStorage.removeItem('autoLoad');
          await handlePause(activeProjectId, activeTimelogId, false, true);
          setErrorMessage('The system detected that you have been idle for more than 20 minutes. You were automatically logged out');
          // reload data
          await getProjectData();
        }
      }
    }
    auto();
  }, [localStorage.getItem('autoLoad')])

  const handleLimitReached = () => {
    setIsLimitReached(true)
    setTimeout(() => setIsLimitReached(false), 4000);
  }

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleUserLogout = async() => {
    const response = await handleLogout();
    if (activeProjectId) {
      await handlePause(activeProjectId);
    }
    if(response.data?.success) {
      localStorage.removeItem('isRemember');
      localStorage.removeItem('userId');
      navigate("/");
    } else {
      setErrorMessage(response.data.error_message)
    }
  }

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <Box sx={{ height: "fit-content" }}>
      <Grid
        container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Grid item lg={5} md={4} sm={12} xs={12}>
          <Paper
            className={classes.loginContainer}
            style={{ boxShadow: "none", position: 'relative' }}
          >
              <div
                ref={anchorRef}
                style={{
                  position: 'absolute',
                  width: '100%',
                  textAlign: 'right',
                  top: 10,
                  right: 10,
                  cursor: 'pointer'
                }}
                onClick={handleToggle} 
              >
                <MenuIcon style={{position: 'absolute', top: 20, right: 20}} />
              </div>
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
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-start"
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom-start' ? 'left top' : 'left bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  autoFocusItem={open}
                  id="composition-menu"
                  aria-labelledby="composition-button"
                  onKeyDown={handleListKeyDown}
                >
                  <MenuItem onClick={handleUserLogout}>Logout</MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
  );
};

export default TimeTracker;
