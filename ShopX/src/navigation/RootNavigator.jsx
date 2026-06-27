import { StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import LoginPage from '../Screens/LoginPage'
import RegisterPage from '../Screens/Register'
import AuthStack from '../navigation/AuthStack'
import CategotyWiseItem from '../Screens/CategotyWiseItem'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import UserService from '../database/UserService'
import ProductService from '../database/ProductService'
import CartService from '../database/CartService'
import OrderService from '../database/OrderService'
import OrderItemService from '../database/OrderItemService'
import Invoice from '../Screens/Invoice'
import UserContext from '../context/UserContext'
import EditProfile from '../Screens/EditProfile'
import ItemDetails from '../Components/ItemDetails'

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const [initialRoute, setInitialRoute] = useState(null);
  const { userId, setUserId } = useContext(UserContext)

  useEffect(() => {
    Init();
  }, [])

  const Init = async () => {
    await UserService.createUserTable();
    await ProductService.createTable();
    await CartService.createCartTable();
    await OrderService.createOrderTable();
    await OrderItemService.createOrderItemTable();
    await UserService.createDefaultAdmin();

    const logged = await UserService.getLoggedInUser();
    setUserId(logged?.id);
    if (logged?.is_logged_in === 1) {
      setInitialRoute("AuthStack")
    }
    else {
      setInitialRoute("LoginPage")
    }
  }

  if (!initialRoute) {
    return null
  }
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
        <Stack.Screen name="LoginPage" component={LoginPage} />
        <Stack.Screen name="RegisterPage" component={RegisterPage} />
        <Stack.Screen name="AuthStack" component={AuthStack} />
        <Stack.Screen name="CategotyWiseItem" component={CategotyWiseItem} />
        <Stack.Screen name="Invoice" component={Invoice} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="ItemDetails" component={ItemDetails} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default RootNavigator

const styles = StyleSheet.create({})