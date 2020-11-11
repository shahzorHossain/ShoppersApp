import React, { useState, useEffect, useCallback, useReducer } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { useDispatch, useSelector } from 'react-redux';
import CustomHeaderButton from '../../components/UI/HeaderButton';
import Input from '../../components/UI/Input';

import * as productsAction from '../../store/actions/productsAction';

const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';
// useReducer is used when you have complex and connected state with one big reducer
// you can create it inside the component but it doesnt need to unless you need props
// this way it wont re render every cycle and help performance
const formReducer = (state, action) => {
  if (action.type === FORM_INPUT_UPDATE) {
    const updatedValues = {
      ...state.inputValues,
      [action.inputIdentifier]: action.value,
    };
    const updatedValidities = {
      ...state.inputValidites,
      [action.inputIdentifier]: action.validity,
    };
    let formIsValid = true;
    for (const key in updatedValidities) {
      formIsValid = formIsValid && updatedValidities[key];
    }
    return {
      ...state,
      inputValues: updatedValues,
      inputValidites: updatedValidities,
      isFormValid: formIsValid,
    };
  }
  return state;
};

const EditProductScreen = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const dispatch = useDispatch();
  const prodId = props.route.params ? props.route.params.productId : null;
  const editedProduct = useSelector((state) =>
    state.products.userProducts.find((prod) => prod.id === prodId)
  );

  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      title: editedProduct ? editedProduct.title : '',
      imgURL: editedProduct ? editedProduct.imgUrl : '',
      description: editedProduct ? editedProduct.description : '',
      price: '',
    },
    inputValidites: {
      title: editedProduct ? true : false,
      imgURL: editedProduct ? true : false,
      description: editedProduct ? true : false,
      price: editedProduct ? true : false,
    },
    isFormValid: editedProduct ? true : false,
  });

  // to check for any error
  useEffect(() => {
    if (error) {
      Alert.alert('An error occurred!', error, [{ text: 'Okay' }]);
    }
  }, [error]);

  const submitHandler = useCallback(async () => {
    if (!formState.isFormValid) {
      Alert.alert('Wrong input!', 'Please check the errors in the form', [
        { text: 'Okay' },
      ]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      if (editedProduct) {
        await dispatch(
          productsAction.updateProduct(
            prodId,
            formState.inputValues.title,
            formState.inputValues.description,
            formState.inputValues.imgURL
          )
        );
      } else {
        await dispatch(
          productsAction.createProduct(
            formState.inputValues.title,
            formState.inputValues.description,
            formState.inputValues.imgURL,
            +formState.inputValues.price
          )
        ); // +price converts price from string to number
      }
      props.navigation.goBack();
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  }, [dispatch, prodId, formState]); // this function ensures its not recreated after rerendering and avoiding infinite loop

  useEffect(() => {
    props.navigation.setOptions({
      headerRight: () => (
        <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
          <Item
            title='Save'
            iconName={
              Platform.OS === 'android' ? 'md-checkmark' : 'ios-checkmark'
            }
            onPress={submitHandler}
          />
        </HeaderButtons>
      ),
    });
  }, [submitHandler]);

  const inputChangeHandler = useCallback(
    (inputIdentifier, inputValue, inputValidity) => {
      dispatchFormState({
        type: FORM_INPUT_UPDATE,
        value: inputValue,
        validity: inputValidity,
        inputIdentifier: inputIdentifier,
      });
    },
    [dispatchFormState]
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior='padding'
      keyboardVerticalOffset={100}
    >
      <ScrollView>
        <View style={styles.form}>
          <Input
            id='title'
            label='Title'
            errorText='Please enter a valid title'
            keyboardType='default'
            autoCapitalize='sentences'
            autoCorrect
            returnKeyType='next'
            onInputChange={inputChangeHandler}
            initialValue={editedProduct ? editedProduct.title : ''}
            initiallyValid={!!editedProduct}
            required
          />

          <Input
            id='imgURL'
            label='Image Url'
            errorText='Please enter a valid URL'
            keyboardType='default'
            returnKeyType='next'
            onInputChange={inputChangeHandler}
            initialValue={editedProduct ? editedProduct.imgUrl : ''}
            initiallyValid={!!editedProduct}
            required
          />

          {editedProduct ? null : (
            <Input
              id='price'
              label='Price'
              errorText='Please enter a valid price'
              keyboardType='decimal-pad'
              returnKeyType='next'
              onInputChange={inputChangeHandler}
              required
              min={0.1}
            />
          )}

          <Input
            id='description'
            label='Description'
            errorText='Please enter a valid description'
            keyboardType='default'
            autoCapitalize='sentences'
            autoCorrect
            multiline
            numberOfLine={3}
            onInputChange={inputChangeHandler}
            initialValue={editedProduct ? editedProduct.description : ''}
            initiallyValid={!!editedProduct}
            required
            minLength={5}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export const screenOptions = (navData) => {
  const routeParams = navData.route.params ? navData.route.params : {};
  return {
    headerTitle: routeParams.productId ? 'Edit Product' : 'Add Product',
  };
};

const styles = StyleSheet.create({
  form: {
    margin: 20,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default EditProductScreen;
