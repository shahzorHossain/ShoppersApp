import AsyncStorage from '@react-native-async-storage/async-storage';

export const AUTHENTICATE = 'AUTHENTICATE';
export const LOGOUT = 'LOGOUT';
export const SET_DID_TRY_AL = 'SET_DID_TRY_AL';

let timer;

export const setDidTryAL = () => {
  return { type: SET_DID_TRY_AL };
};

export const authenticate = (userId, token, expiryTime) => {
  return (dispatch) => {
    dispatch(setLogoutTimer(expiryTime));
    dispatch({ type: AUTHENTICATE, userId: userId, token: token });
  };
};

export const signup = (email, password) => {
  return async (dispatch) => {
    const response = await fetch(
      'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDAUuex5PSI7DcANFTs9xkKtSCDhEcn38I',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true,
        }),
      }
    );

    if (!response.ok) {
      const errorResData = await response.json();
      const errorId = errorResData.error.message;
      let message = 'Something went wrong!';
      if (errorId === 'EMAIL_EXISTS') {
        message = 'Email exists already!';
      }
      throw new Error(message);
    }

    const resData = await response.json();
    // console.log(resData);

    dispatch(
      authenticate(
        resData.idToken,
        resData.localId,
        parseInt(resData.expiresIn) * 1000
      )
    );
    const expirationDate = new Date(
      new Date().getTime() + parseInt(resData.expiresIn) * 1000
    );
    saveDataToStorage(resData.idToken, resData.localId, expirationDate);
  };
};

export const login = (email, password) => {
  return async (dispatch) => {
    const response = await fetch(
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDAUuex5PSI7DcANFTs9xkKtSCDhEcn38I',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true,
        }),
      }
    );

    if (!response.ok) {
      const errorResData = await response.json();
      const errorId = errorResData.error.message;
      let message = 'Something went wrong!';
      if (errorId === 'EMAIL_NOT_FOUND') {
        message = 'Email could not be found!';
      } else if (errorId === 'INVALID_PASSWORD') {
        message = 'Password is invalid';
      }
      throw new Error(message);
    }

    const resData = await response.json();
    // console.log(resData);

    dispatch(
      authenticate(
        resData.idToken,
        resData.localId,
        parseInt(resData.expiresIn) * 1000
      )
    );

    const expirationDate = new Date(
      new Date().getTime() + parseInt(resData.expiresIn) * 1000
    );
    saveDataToStorage(resData.idToken, resData.localId, expirationDate); // to store the login info into our device
  };
};

export const logout = () => {
  clearLogoutTimer();
  AsyncStorage.removeItem('userData');

  return { type: LOGOUT };
};

// for auto logout

const clearLogoutTimer = () => {
  if (timer) {
    clearTimeout(timer);
  }
};
const setLogoutTimer = (expirationTime) => {
  return (dispatch) => {
    timer = setTimeout(() => {
      dispatch(logout());
    }, expirationTime);
  };
};

// for auto login
const saveDataToStorage = async (token, userId, expirationDate) => {
  try {
    await AsyncStorage.setItem(
      'userData',
      JSON.stringify({
        token: token,
        userId: userId,
        expiryDate: expirationDate.toISOString(),
      })
    );
  } catch (err) {
    console.error(err);
  }
};
