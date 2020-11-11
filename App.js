import React, { useState } from 'react';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { AppLoading } from 'expo';
import * as Font from 'expo-font';
import ReduxThunk from 'redux-thunk';
// redux thunk will allow us to write asynchronous code on our ACTION CREATORS (not reducers though)

// import enhancer to use react native debugger and redux tools
// put it inside the store
import { composeWithDevTools } from 'redux-devtools-extension';

// import ShopNavigator from './navigation/ShopNavigation';
import AppNavigator from './navigation/AppNavigator';

// import all the reducers
import ProductsReducer from './store/reducers/productsReducer';
import CartsReducer from './store/reducers/cartsReducer';
import OrdersReducer from './store/reducers/ordersReducer';
import AuthReducer from './store/reducers/authReducer';

// make root reducer
const rootReducer = combineReducers({
  products: ProductsReducer,
  carts: CartsReducer,
  orders: OrdersReducer,
  auth: AuthReducer,
});

const store = createStore(rootReducer, applyMiddleware(ReduxThunk)); //, composeWithDevTools());

const fetchFonts = () => {
  return Font.loadAsync({
    'open-sans': require('./assets/fonts/OpenSans-Regular.ttf'),
    'open-sans-bold': require('./assets/fonts/OpenSans-Bold.ttf'),
  });
};

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false);

  if (!fontLoaded) {
    return (
      <AppLoading
        startAsync={fetchFonts}
        onFinish={() => {
          setFontLoaded(true);
        }}
      />
    );
  }

  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}
