import React from 'react'
import { MenuIcon } from '../../assests/icons/SvgIcons';
import logo from '../../assests/images/Layer 1-2.png';
import { MenuItem, Menu } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { checkForUpdate, deleteFromStore } from '../../utils/electronApi';
import TrackerContext from './TrackerContext';
import { logInfo } from '../../utils/loggerHelper';
import { stopBackgroundService } from './background-service';
import AppContext from '../../AppContext';

export default function Header() {
    const navigate = useNavigate();
    const { setErrorMessage } = React.useContext(AppContext);
    const { logout, activeProjectId } = React.useContext(TrackerContext);

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const [loading, setLoading] = React.useState(false);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleUserLogout = async () => {
        logInfo('User logged out');

        const proceedToLogout = async () => {
            handleClose();
            // remove token from store
            await deleteFromStore("token")
            // navigate to login page
            navigate('/');
        }

        if (activeProjectId > 0) {
            await stopBackgroundService();
            logout(proceedToLogout)
        } else {
            proceedToLogout();
        }
    };

    const handleCheckForUpdate = async () => {
        setLoading(true);
        setErrorMessage('Checking for update. Please wait...');
        handleClose();
        checkForUpdate()
            .then((res) => {
                if (!res)
                    setErrorMessage('Error in checking for update');
            })
            .catch(() => {
                setErrorMessage('Error in checking for update');
            })
            .finally(() => {
                setLoading(false);
            });
    }

    return (
        <>
            <img
                src={logo}
                style={{
                    maxHeight: 30,
                    marginBottom: '20px',
                    marginTop: '20px',
                    imageRendering: 'auto',
                    objectFit: 'cover'
                }}
                alt='logo'
            />
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    textAlign: 'right',
                    top: 10,
                    right: 10,
                    cursor: 'pointer',
                }}
            >
                <div onClick={handleClick} style={{ position: 'absolute', top: 0, right: 0 }}>
                    <MenuIcon   />
                </div>
            </div>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                <MenuItem onClick={handleCheckForUpdate} disabled={loading} title={loading ? 'Please wait': ''}>Check for update</MenuItem>
                <MenuItem onClick={handleUserLogout}>Logout</MenuItem>
            </Menu>
        </>
    )
}