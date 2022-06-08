import React, { useState, useRef, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import AppConfig from "../../../config/app.json";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import CustomFieldInput from "../../../components/CustomField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { makeStyles, useTheme } from "@mui/styles";
import logo from "../../../assests/images/app-logo.png";
import CustomButton from "../../../components/common/Button";
import Box from "@mui/material/Box";
import { Link } from "react-router-dom";
import axiosInstance from "../../../utils/axios-instance";
import { useNavigate } from "react-router-dom";
const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.white,
    height: "100vh",
    overflow: "hidden",
  },

  loginContainer: {
    // height: "100vh",
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

const Signin = () => {
  const classes = useStyles();
  const textRef = useRef(null);
  let navigate = useNavigate();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState({});
  const [isRemember, setIsRemember] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    console.log(axiosInstance, "axiosInstance");
    const response = await axiosInstance.request({
      method: "POST",
      url: `${process.env.REACT_APP_API_BASE_URL}/login/authenticate`,
      data: {
        application_type: "desktop",
        email_address: emailAddress,
        password: password,
      },
    });
    console.log(response.data, "redsssssssss");
    if (response.data.success === true) {
      navigate("/currentproject");
    } else {
      setErrorMessage(response.data.err_msg);
      setEmailAddress("");
      setPassword("");
      if (textRef.current) {
        textRef.current.focus();
      }
    }
  };
  const handleChange = (event) => {
    setIsRemember(event.target.checked);
  };

  useEffect(() => {
    const checkSession = async () => {
      const responseJSON = await axiosInstance.request({
        method: "GET",
        url: `${process.env.REACT_APP_API_BASE_URL}login/check_session`,
      });
      const isLoggedIn = responseJSON.data.success;
      console.log(isLoggedIn, "isLoggedInisLoggedIn");
      setUser((val) => {
        return { ...val, isLoggedIn };
      });
      if (isLoggedIn) {
        navigate("/currentproject");
      }
    };
    checkSession();
  }, [setUser]);

  return (
    <Box>
      <Grid
        container
        sx={{
          display: "flex",
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
              variant="h2"
              sx={{ marginTop: "20px", marginBottom: "32px" }}
            >
              Sign in to {`${AppConfig.product_name}`}
            </Typography>
            <div className={classes.loginContent}>
              <form
                className={classes.formContent}
                noValidate
                onSubmit={handleLogin}
                autoComplete={isRemember ? "on" : "off"}
              >
                <FormControl
                  variant="standard"
                  style={{ width: "100%", marginBottom: "24px" }}
                >
                  <InputLabel shrink htmlFor="bootstrap-input">
                    <Typography variant="body2">Email</Typography>
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
                    placeholder="Enter your email"
                  />
                </FormControl>
                <FormControl
                  variant="standard"
                  sx={{ width: "100%", marginBottom: "15px" }}
                >
                  <InputLabel
                    style={{ fontSize: 20 }}
                    shrink
                    htmlFor="bootstrap-input"
                  >
                    <Typography variant="body2">Password</Typography>
                  </InputLabel>
                  <CustomFieldInput
                    variant="outlined"
                    size="small"
                    label="Password"
                    fullWidth
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    id="password"
                    placeholder="Enter your password"
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

                <Box sx={{ display: "flex", marginBottom: "40px" }}>
                  <div style={{ textAlign: "left", flex: 1 }}>
                    <Typography>
                      <FormControlLabel
                        control={
                          <Checkbox
                            onChange={handleChange}
                            checked={isRemember}
                          />
                        }
                        label="Remember me"
                      />
                    </Typography>
                  </div>
                  <Typography sx={{ paddingTop: "8px" }} variant="body1">
                    <Link to="/forgotpassword">Forgot Password?</Link>
                  </Typography>
                </Box>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <CustomButton
                    text="Cancel"
                    color="#000000"
                    bgColor="#E8E6F8"
                    borderRadius="4px"
                    padding="12px 40px"
                    onClick={() => {}}
                    marginRight="32px"
                  />
                  <CustomButton
                    text="Sign In"
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

export default Signin;
