import React, { useRef, useState } from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import CustomFieldInput from "../../../components/CustomField";
import { makeStyles, useTheme } from "@mui/styles";
import logo from "../../../assests/images/app-logo.png";
import CustomButton from "../../../components/common/Button";
import Box from "@mui/material/Box";
import axiosInstance from "../../../utils/axios-instance";
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

const ForgotPassword = () => {
  const classes = useStyles();
  const textRef = useRef(null);
  let navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState("");
  const [emailAddress, setEmailAddress] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    const response = await axiosInstance.request({
      method: "POST",
      url: `${process.env.REACT_APP_API_BASE_URL}/accounts/forgot_password`,
      data: {
        email_address: emailAddress,
      },
    });
    if (response.data.success === true) {
      navigate("/confirmation");
    } else {
      setErrorMessage(response.data.err_msg);
      setEmailAddress("");
      if (textRef.current) {
        textRef.current.focus();
      }
    }
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
              Forgot your password?
            </Typography>
            <div className={classes.loginContent}>
              <form
                className={classes.formContent}
                noValidate
                onSubmit={handleLogin}
                autoComplete={() => {}}
              >
                <FormControl
                  variant="standard"
                  style={{ width: "100%", marginBottom: "35px" }}
                >
                  <InputLabel shrink htmlFor="bootstrap-input">
                    <Typography variant="body2">Your email</Typography>
                  </InputLabel>
                  <CustomFieldInput
                    inputRef={(el) => {
                      textRef.current = el;
                    }}
                    variant="outlined"
                    size="small"
                    label=""
                    fullWidth
                    type="email"
                    value={emailAddress}
                    onChange={(event) => setEmailAddress(event.target.value)}
                    id="email"
                    // placeholder="nat@thriveva.com"
                  />
                </FormControl>
                {errorMessage && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      flex: 1,
                    }}
                  >
                    <Typography style={{ color: "red" }}>
                      {errorMessage}
                    </Typography>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <CustomButton
                    text="Send instructions"
                    width="237px"
                    height="48px"
                    color="#FFFFFF"
                    bgColor="#8E78E1"
                    borderRadius="4px"
                    padding="12px 40px"
                    onClick={handleLogin}
                  />
                </div>
              </form>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ForgotPassword;
