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
import { Link, useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axios-instance";
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';





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
    marginTop: -50,
    "& > *": {
      marginBottom: 10,
    },
    width: "100%",
  },

}));

const Signin = (props) => {
  const classes = useStyles();
  const textRef = useRef(null);
  let navigate = useNavigate();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState({});
  const [isRemember, setIsRemember] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccessToast, setIsSuccessToast] = React.useState(false)
  const location = useLocation();

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);
    const response = await axiosInstance.request({
      method: "POST",
      url: `${process.env.REACT_APP_API_BASE_URL}/login/authenticate`,
      data: {
        application_type: "desktop",
        email_address: emailAddress,
        password: password,
      },
    });
    if (response.data.success === true) {
      setIsLoading(false)
      navigate("/timetracker");
    } else {
      setErrorMessage(response.data.err_msg);
      setEmailAddress("");
      setIsLoading(false)
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
    setIsSuccessToast(location?.state?.isSuccess)
  }, [location?.state?.isSuccess])

  useEffect(() => {
    const checkSession = async () => {
      const responseJSON = await axiosInstance.request({
        method: "GET",
        url: `${process.env.REACT_APP_API_BASE_URL}/login/check_session`,
      });
      console.log(responseJSON);
      const isLoggedIn = responseJSON.data.success;
      setUser((val) => {
        return { ...val, isLoggedIn };
      });
      if (isLoggedIn) {
        navigate("/timetracker");

      }
    };
    checkSession();
  }, [setUser]);

  const handleToast = () => {
    setIsSuccessToast(false)
    window.history.replaceState({}, document.title)
  }

  return (
    <Box>
      <Grid

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
            <Snackbar open={isSuccessToast}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              onClose={handleToast} autoHideDuration={4000} >
              <Alert severity="success" color="info" sx={{ width: '100%' }}>
                Password Reset instructions sent to your email
                account.
              </Alert>
            </Snackbar>

            <img
              src={logo}
              style={{ maxHeight: 30, marginTop: '20px' }}
              alt="logo"
            />
            <Typography
              variant="h2"
              sx={{ marginTop: "20px", fontSize: '30px', marginBottom: "-20px" }}
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
                  <Typography sx={{ paddingTop: "10px" }} variant="body1">
                    <Link to="/forgotpassword" style={{ color: 'black', textDecoration: 'none', fontSize: '14px' }} >Forgot Password?</Link>
                  </Typography>
                </Box>
                <div style={{ display: "flex", justifyContent: "center", marginTop: '-20px' }}>

                  <CustomButton
                    text="Cancel"
                    color="#000000"
                    bgColor="#E8E6F8"
                    borderRadius="4px"
                    width="120px"
                    onClick={() => { }}
                    marginRight="32px"
                  />
           
                  <LoadingButton
                    color="secondary"
                    style={{ backgroundColor: "#8E78E1", width: "120px" , color:"white" }}
                    onClick={handleLogin}
                    // loading={loading}
                    loading={isLoading}
                    loadingPosition="center"
                    // startIcon={<SaveIcon />}
                    variant="contained"
                  >
                    Sign In
                  </LoadingButton>
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
