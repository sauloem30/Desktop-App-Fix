import React, { useState, useRef } from "react";
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
const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.white,
    height: "100vh",
    overflow: "hidden",
  },

  loginContainer: {
    padding: "40px 0px",
    textAlign: "center",
  },

  ListItem: {
    display: "flex",
    justifyContent: "space-between",
  },
  loginContent: {
    [theme.breakpoints.down("sm")]: {
      padding: "24px 0px 20px 0px",
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

const CurrentProject = () => {
  const classes = useStyles();

  return (
    <Box>
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
              style={{ maxHeight: 30, width: "203px", marginBottom: "20px" }}
              alt="logo"
            />
            <Divider sx={{ border: "2px solid #F2F3F7" }} />
            <Typography variant="h4" sx={{ marginTop: "32px" }}>
              Current project
            </Typography>
            <Typography variant="body4" sx={{ marginBottom: "22px" }}>
              00:00:15
            </Typography>
            <br></br>
            <Typography
              variant="body5"
              sx={{ marginTop: "10px", marginBottom: "32px" }}
            >
              No weekly limit
            </Typography>
            <br></br>
            <Typography
              variant="body6"
              sx={{ marginTop: "20px", marginBottom: "32px" }}
            >
              Total today: 8:12
            </Typography>
            <div className={classes.loginContent}>
              <List sx={style} component="nav" aria-label="mailbox folders">
                <ListItem button>
                  <ListItemText>
                    <Typography variant="subheading">Projects:</Typography>
                  </ListItemText>
                </ListItem>
                <ListItem button className={classes.ListItem}>
                  <ListItemText primary="First project name" />
                  <ListItemText primary="12:42" sx={{ textAlign: "right" }} />
                </ListItem>
                <Divider />
                <ListItem button divider className={classes.ListItem}>
                  <ListItemText primary="Second project name" />
                  <ListItemText primary="12:42" sx={{ textAlign: "right" }} />
                </ListItem>
                <ListItem button className={classes.ListItem}>
                  <ListItemText primary="Third project name" />
                  <ListItemText primary="12:42" sx={{ textAlign: "right" }} />
                </ListItem>
                <Divider light />
                <ListItem button className={classes.ListItem}>
                  <ListItemText primary="Active project name" />
                  <ListItemText primary="12:42" sx={{ textAlign: "right" }} />
                </ListItem>
              </List>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CurrentProject;
