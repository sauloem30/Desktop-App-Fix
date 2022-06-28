import React, { useRef, useState } from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import CustomFieldInput from "../../../components/CustomField";
import { makeStyles } from "@mui/styles";
import logo from "../../../assests/images/app-logo.png";
import CustomButton from "../../../components/common/Button";
import Box from "@mui/material/Box";
import Signin from "../signin/Signin";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.white,
    height: "100vh",
    overflow: "hidden",
    width: "900px",
  },
  loginContainer: {
    padding: "40px 20px",
    textAlign: "center",
  },
  loginContent: {
    [theme.breakpoints.down("sm")]: {
      padding: "80px 20px 20px 20px",
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

const PasswordInstruction = () => {
  const classes = useStyles();
  const textRef = useRef(null);
  let navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <Box>
      <Grid
        container
        sx={{
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Grid item lg={5} md={4} sm={12} xs={12}>
          <Paper
            className={classes.loginContainer}
            style={{ boxShadow: "none" }}
          >
            <img
              src={logo}
              style={{ maxHeight: 30, width: "203px" }}
              alt="logo"
            />
            <Typography
              sx={{ marginTop: "30px", marginBottom: "38px" }}
              variant="h3"
            >
              Reset Instructions Sent
            </Typography>
            <Typography sx={{ marginTop: "30px" }} variant="h6">
              Password Email Reset instructions Sent to your email
              account.Please check your inbox and spam folder
            </Typography>
            <div className={classes.loginContent}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <CustomButton
                  text="Login"
                  width="237px"
                  height="48px"
                  color="#FFFFFF"
                  bgColor="#8E78E1"
                  borderRadius="4px"
                  padding="12px 40px"
                  onClick={handleClick}
                />
              </div>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PasswordInstruction;
