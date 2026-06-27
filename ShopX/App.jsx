import { StyleSheet} from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import UserService from './src/database/UserService'
import ProductService from './src/database/ProductService'

import UserProvider from './src/context/UserProvider'
import RootNavigator from './src/navigation/RootNavigator';
 

const App = () => {

 return (
  <UserProvider>
    <RootNavigator/>
    </UserProvider>
  )
}

export default App

const styles = StyleSheet.create({})