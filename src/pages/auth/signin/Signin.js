import React, { useState, useRef, useEffect, useMemo } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CustomFieldInput from '../../../components/CustomField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { makeStyles } from '@mui/styles';
import logo from '../../../assests/images/Layer 1-2.png';
import Box from '@mui/material/Box';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axios-instance';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import moment from 'moment';
import AppContext from '../../../AppContext';
import { getFromStore, setToStore,  } from '../../../utils/electronApi';
import { logInfo } from '../../../utils/loggerHelper';

const useStyles = makeStyles((theme) => ({
   root: {
      backgroundColor: theme.palette.white,
      height: '100vh',
      overflow: 'hidden',
   },
   loginContainer: {
      padding: '20px',
      textAlign: 'center',
   },
   loginContent: {
      [theme.breakpoints.down('sm')]: {
         padding: '80px 20px 20px 20px',
      },
   },
   formContent: {
      marginTop: -50,
      '& > *': {
         marginBottom: 10,
      },
      width: '100%',
   },
   loginButton: {
      '&:hover': {
         backgroundColor: '#A259FF',
      },
   },
}));

const sx = {
   logoImg: { maxHeight: 50, marginTop: '20px', imageRendering: 'auto', objectFit: 'cover' },
   signInLabel: {
      marginTop: '40px',
      fontSize: '25px',
      marginBottom: '-20px',
   },
   errorText: {
      display: 'flex',
      justifyContent: 'center',
      flex: 1,
   },
   rememberWrapper: { display: 'flex', alignItems: 'center', marginBottom: '40px' }
};

const Signin = () => {
   const { isOnline } = React.useContext(AppContext);

   const classes = useStyles();
   const navigate = useNavigate();
   const location = useLocation();

   const [emailAddress, setEmailAddress] = useState('');
   const [password, setPassword] = useState('');
   const [isRemember, setIsRemember] = useState(false);
   const [errorMessage, setErrorMessage] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   const [isSuccessToast, setIsSuccessToast] = useState(false);
   const [isHover, setIsHover] = useState(false);

   const loginButton = useMemo(() => ({
      backgroundColor: isHover ? '#A259FF' : '#4262FF',
      borderRadius: 20,
      padding: 6,
      fontWeight: '700',
      fontSize: 17,
      textTransform: 'none',
   }), [isHover]);

   useEffect(() => {
      checkSession();
   }, []);

   useEffect(() => {
      setIsSuccessToast(location?.state?.isSuccess);
   }, [location?.state?.isSuccess]);

   // clear the error message after 5 seconds
   useEffect(() => {
      if (errorMessage) {
         const timer = setTimeout(() => {
            setErrorMessage('');
         }, 5000);
         return () => clearTimeout(timer);
      }
   }, [errorMessage]);

   const handleLogin = async (event) => {
      if (!isOnline) {
         setErrorMessage('Please check your internet connection.');
         return;
      }

      setErrorMessage('');
      setIsLoading(true);

      const payload = {
         application_type: 'desktop',
         email_address: emailAddress,
         password: password,
         timezone_offset: moment().utcOffset(),
         isRemember
      }

      axiosInstance.post('/tracker-app/login', payload)
         .then(({ data }) => {
            (async () => {
               await setToStore('isRemember', isRemember)
               await setToStore('email', emailAddress)
               await setToStore('userId', data.user_id)
               await setToStore('token', data.token)

               logInfo('User logged in successfully:', emailAddress);
               setIsLoading(false);
               navigate('/timetracker');
            })();
         })
         .catch((error) => {
            const message = error?.response?.data?.error || 'Login Error. Please try again later.';
            logInfo('Login error:', message);
            setErrorMessage(message);
         })
         .finally(() => {
            setIsLoading(false);
         });
   };

   const checkSession = () => {
      getFromStore("isRemember")
         .then((rememberedUser) =>
            setIsRemember(rememberedUser ?? false)
         );

      getFromStore("email")
         .then((email) =>
            setEmailAddress(email ?? '')
         );

      getFromStore("token")
         .then((token) => {
            if (token) {
               logInfo('User session found. Redirecting to timetracker page');
               setIsLoading(true);
               axiosInstance.get('/tracker-app/check-session')
                  .then(() => {
                     navigate('/timetracker');
                  })
                  .catch((error) => {
                     // possible error: session expired
                     // do nothing
                     console.log('error', error);
                  })
                  .finally(() => {
                     setIsLoading(false);
                  });
            }
         });
   };

   const handleToast = () => {
      setIsSuccessToast(false);
      window.history.replaceState({}, document.title);
   };

   const triggerSignIn = (e) => {
      if (e.keyCode === 13) {
         handleLogin();
      }
   };

   return (
      <Box>
         <Grid
            sx={{
               display: 'flex',
               justifyContent: 'center',
               alignItems: 'center',
               height: '100vh',
            }}>
            <Grid item lg={5} md={4} sm={12} xs={12}>
               <Paper className={classes.loginContainer} style={{ boxShadow: 'none' }}>
                  <Snackbar
                     open={isSuccessToast}
                     anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                     onClose={handleToast}
                     autoHideDuration={4000}>
                     <Alert severity='success' color='info' sx={{ width: '100%' }}>
                        Password Reset instructions sent to your email account.
                     </Alert>
                  </Snackbar>
                  <img src={logo} style={sx.logoImg} alt='logo' />
                  <Typography variant='h2' sx={sx.signInLabel}>
                     Sign In
                  </Typography>
                  <div className={classes.loginContent}>
                     <form
                        className={classes.formContent}
                        noValidate
                        onSubmit={handleLogin}
                        autoComplete={isRemember ? 'on' : 'off'}>
                        <FormControl
                           variant='standard'
                           style={{ width: '100%', marginBottom: '24px' }}>
                           <InputLabel shrink htmlFor='bootstrap-input'>
                              <Typography variant='body2'>Email</Typography>
                           </InputLabel>
                           <CustomFieldInput
                              variant='outlined'
                              size='small'
                              label=''
                              fullWidth
                              type='email'
                              value={emailAddress}
                              onChange={(event) => setEmailAddress(event.target.value)}
                              onKeyDown={triggerSignIn}
                              id='email'
                           />
                        </FormControl>
                        <FormControl variant='standard' sx={{ width: '100%', marginBottom: '15px' }}>
                           <InputLabel style={{ fontSize: 20 }} shrink htmlFor='bootstrap-input'>
                              <Typography variant='body2'>Password</Typography>
                           </InputLabel>
                           <CustomFieldInput
                              variant='outlined'
                              size='small'
                              label='Password'
                              fullWidth
                              type='password'
                              value={password}
                              onChange={(event) => setPassword(event.target.value)}
                              onKeyDown={triggerSignIn}
                              id='password'
                           />
                        </FormControl>
                        {errorMessage && (
                           <div style={sx.errorText}>
                              <Typography style={{ color: 'red' }}>{errorMessage}</Typography>
                           </div>
                        )}

                        <Box sx={sx.rememberWrapper}>
                           <div style={{ textAlign: 'left', flex: 1 }}>
                              <Typography>
                                 <FormControlLabel
                                    control={<Checkbox onChange={(e) => setIsRemember(e.target.checked)} checked={isRemember} />}
                                    label={
                                       <Typography style={{ fontSize: 14 }}>Remember Me</Typography>
                                    }
                                 />
                              </Typography>
                           </div>
                           <Typography variant='body1'>
                              <Link
                                 to='/forgotpassword'
                                 style={{ color: 'black', textDecoration: 'none', fontSize: 14 }}>
                                 Forgot Password?
                              </Link>
                           </Typography>
                        </Box>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-20px' }}>
                           <LoadingButton
                              fullWidth
                              type='submit'
                              color='primary'
                              variant='contained'
                              onClick={handleLogin}
                              loading={isLoading}
                              style={loginButton}
                              onMouseEnter={() => setIsHover(true)}
                              onMouseLeave={() => setIsHover(false)}
                              id='workflow-dev'>
                              Sign in
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
