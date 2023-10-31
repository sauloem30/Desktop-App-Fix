import React, { useRef, useState } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CustomFieldInput from '../../../components/CustomField';
import { makeStyles } from '@mui/styles';
import logo from '../../../assests/images/app-new-logo.png';
import Box from '@mui/material/Box';
import axiosInstance from '../../../utils/axios-instance';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

const useStyles = makeStyles((theme) => ({
   root: {
      backgroundColor: theme.palette.white,
      height: '100vh',
      overflow: 'hidden',
      width: '900px',
   },
   backButton: {
      cursor: 'pointer',
      position: 'fixed',
      top: '8px ',
      left: '8px',
      borderRadius: '20px',
      width: '35px',
      height: '35px',
      fontSize: '14px',
      display: 'flex',
      color: '#4262FF',
      alignItems: 'center',
   },
   loginContainer: {
      padding: '40px 20px',
      textAlign: 'center',
   },
   loginContent: {
      [theme.breakpoints.down('sm')]: {
         padding: '80px 20px 20px 20px',
      },
   },
   formContent: {
      marginTop: -10,
      '& > *': {
         marginBottom: 10,
      },
      width: '100%',
   },
}));

const ForgotPassword = () => {
   const classes = useStyles();
   const textRef = useRef(null);
   let navigate = useNavigate();

   const [errorMessage, setErrorMessage] = useState('');
   const [emailAddress, setEmailAddress] = useState('');
   const [success, setSuccess] = useState(false);
   const [isHover, setIsHover] = useState(false);

   function validateEmail(email) {
      var re = /\S+@\S+\.\S+/;
      return re.test(email);
   }

   const handleLogin = async (event) => {
      const validEmail = validateEmail(emailAddress);
      event.preventDefault();
      if (!validEmail) {
         setErrorMessage('Please fill a valid Email');
      } else {
         setErrorMessage('');

         const response = await axiosInstance.request({
            method: 'POST',
            url: `${process.env.REACT_APP_API_BASE_URL}/accounts/forgot_password`,
            data: {
               email_address: emailAddress,
            },
         });
         if (response.data.success === true) {
            // navigate("/confirmation");
            navigate('/', {
               state: {
                  isSuccess: true,
               },
            });
            setSuccess(true);
         } else {
            setErrorMessage(response.data.err_msg);
            setEmailAddress('');
            if (textRef.current) {
               textRef.current.focus();
            }
         }
      }
   };

   const handleMouseEnter = () => {
      setIsHover(true);
   };

   const handleMouseLeave = () => {
      setIsHover(false);
   };

   const loginButton = {
      backgroundColor: isHover ? '#A259FF' : '#4262FF',
      borderRadius: 20,
      padding: 6,
      fontWeight: '700',
      fontSize: 17,
      textTransform: 'none',
      color: '#fff',
   };

   return (
      <Box>
         <Grid
            container
            sx={{
               justifyContent: 'center',
               alignItems: 'center',
               height: '100vh',
            }}>
            <Grid item lg={5} md={4} sm={12} xs={12}>
               <Paper className={classes.loginContainer} style={{ boxShadow: 'none' }}>
                  <img src={logo} style={{ maxHeight: 30 }} alt='logo' />
                  <Typography sx={{ marginTop: '30px', marginBottom: '38px' }} variant='h3'>
                     Reset Password
                  </Typography>
                  <div className={classes.loginContent}>
                     <form className={classes.formContent} noValidate onSubmit={handleLogin}>
                        <FormControl
                           variant='standard'
                           style={{ width: '100%', marginBottom: '35px' }}>
                           <InputLabel shrink htmlFor='bootstrap-input'>
                              <Typography variant='body2'>Your email</Typography>
                           </InputLabel>
                           <CustomFieldInput
                              inputRef={(el) => {
                                 textRef.current = el;
                              }}
                              variant='outlined'
                              size='small'
                              label=''
                              fullWidth
                              type='email'
                              value={emailAddress}
                              onChange={(event) => setEmailAddress(event.target.value)}
                              id='email'
                           />
                        </FormControl>
                        {errorMessage && (
                           <div
                              style={{
                                 display: 'flex',
                                 justifyContent: 'center',
                                 flex: 1,
                              }}>
                              <Typography style={success ? { color: 'green' } : { color: 'red' }}>
                                 {errorMessage}
                              </Typography>
                           </div>
                        )}
                     </form>
                     <Button
                        fullWidth
                        type='submit'
                        color='primary'
                        variant='contained'
                        style={loginButton}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onClick={handleLogin}>
                        Send Reset Link
                     </Button>
                  </div>
               </Paper>
            </Grid>
         </Grid>
         <Box className={classes.backButton} onClick={() => navigate(-1)}>
            <ArrowBackIosNewIcon htmlColor='#4262FF' />
            Back
         </Box>
      </Box>
   );
};

export default ForgotPassword;
