import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  createRef,
} from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { makeStyles, useTheme } from "@mui/styles";
import logo from "../../assests/images/app-logo.png";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { StartIcon, PauseIcon } from "../../assests/icons/SvgIcons";
import axiosInstance from "../../utils/axios-instance";

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

// const itemList = [
//   { name: "First project name", time: "12:42", icon: "" },
//   { name: "Second project name", time: "5:42", icon: "" },
//   { name: "Third project name", time: "10:42", icon: "start" },
//   { name: "Active project name", time: "15:24", icon: "pause" },
// ];

const CurrentProject = () => {
  const classes = useStyles();
  const ref = createRef(null);
  const [projects, setProjects] = useState([]);

  const initialState = 0;
  const [timer, setTimer] = React.useState(initialState);
  const [isActive, setIsActive] = React.useState({});
  const [isPaused, setIsPaused] = React.useState(false);
  const countRef = React.useRef(null);

  //project Active/deactive state
  const [totalActiveProjects, setTotalActiveProjects] = useState(0);
  const [totalInactiveProjects, setTotalInactiveProjects] = useState(0);

  useEffect(() => {
    axiosInstance
      .request({
        method: "GET",
        url: `${process.env.REACT_APP_API_BASE_URL}/projects?is_active=true&search=&batch_no=0`,
      })
      .then((res) => {
        const { data } = res;
        setProjects(data?.result || []);
      });
  }, []);

  const loadProjectActiveCounts = useCallback(async () => {
    try {
      const responseJSON = await axiosInstance.request({
        method: "GET",
        url: `${process.env.REACT_APP_API_BASE_URL}/api/projects/get/active_counts`,
      });

      if (responseJSON) {
        const { active, inactive } = responseJSON;
        setTotalActiveProjects(active);
        setTotalInactiveProjects(inactive);
      }
    } catch {}
  }, []);

  const formatTime = (timer) => {
    const getSeconds = `0${timer % 60}`.slice(-2);
    const minutes = `${Math.floor(timer / 60)}`;
    const getMinutes = `0${minutes % 60}`.slice(-2);
    const getHours = `0${Math.floor(timer / 3600)}`.slice(-2);

    return `${getHours} : ${getMinutes} : ${getSeconds}`;
  };

  const TimeLog = (timer) => {
    const getSeconds = `0${timer % 60}`.slice(-2);
    const minutes = `${Math.floor(timer / 60)}`;
    const getMinutes = `0${minutes % 60}`.slice(-2);
    const getHours = `0${Math.floor(timer / 3600)}`.slice(-2);

    return `${getHours} : ${getMinutes}`;
  };

  const handleStart = (projectId) => {
    setIsActive(projectId);
    let project = projects.filter((item, i) => item.id === projectId);
    console.log("project===>", project);
    if (project) {
      setIsPaused(true);
      countRef.current = setInterval(() => {
        setTimer((timer) => timer + 1);
      }, 1000);
    } else {
      return null;
    }
  };

  const handlePause = (ProjectId) => {
    let project = projects.filter((item, i) => item.id === ProjectId);
    if (project) {
      setIsPaused(false);
      setIsActive(false);
    } else {
      return null;
    }
  };

  // const handleResume = (e, i) => {
  //   // setIsPaused(true);
  //   countRef.current = setInterval(() => {
  //     setTimer((timer) => timer + 1);
  //   }, 1000);
  // };

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
              Current project
            </Typography>
            <Typography variant="body4" sx={{ marginBottom: "12px" }}>
              <Box>{formatTime(timer)}</Box>
            </Typography>
            <Typography variant="body5">
              <Box sx={{ marginBottom: "10px" }}>No daily limit</Box>
            </Typography>
            <Typography
              variant="body6"
              sx={{ marginTop: "10px", marginBottom: "32px" }}
            >
              Total today: 8:12
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

                {projects.map((project, index) => {
                  return (
                    <>
                      <ListItem
                        key={index}
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
                          {/* {project.icon === "start" ? (
                            <StartIcon />
                          ) : project.icon === "pause" ? (
                            <PauseIcon />
                          ) : (
                            ""
                          )} */}
                          {isActive !== project.id ? (
                            <Box onClick={() => handleStart(project.id)}>
                              {<StartIcon />}
                            </Box>
                          ) : (
                            <Box onClick={() => handlePause(project.id)}>
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
                          primary={TimeLog(timer)}
                          sx={{ textAlign: "right" }}
                        />
                      </ListItem>
                      <Divider light />
                    </>
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

export default CurrentProject;
