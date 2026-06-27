import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React, { useEffect, useState, useContext } from 'react'
import { Text, View, ActivityIndicator } from 'react-native'
import Dashboard from '../Screens/Dashboard'
import AddProduct from '../Screens/AddProduct'
import ProductList from '../Screens/ProductList'
import AdminUsers from '../Screens/AdminUsers'
import AdminOrdersPage from '../Screens/AdminOrdersPage'
import AdminProfile from '../Screens/AdminProfile'
import Profile from '../Screens/Profile'
import Homepage from '../Screens/Home'
import Explore from '../Screens/Explore'
import CartPage from '../Screens/CartPage'
import OrderHistory from '../Screens/OrderHistory'
import UserService from '../database/UserService'
import UserContext from '../context/UserContext'

const Tab = createBottomTabNavigator();
export default function AuthStack() {
    const [users, setUser] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const { cartCount, updateCartCount, userId } = useContext(UserContext);

    useEffect(() => {
        Init();
        updateCartCount();
    }, [])

    useEffect(() => {
        updateCartCount();
    }, [userId]);

    const Init = async () => {
        try {
            const Logged = await UserService.getLoggedInUser()
            setUser(Logged);
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={{ marginTop: 10, color: '#6366F1', fontWeight: '600' }}>Loading session...</Text>
            </View>
        );
    }

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let icon = '❓';
                    if (users.role === 'ADMIN') {
                        switch (route.name) {
                            case 'Dashboard': icon = focused ? '📊' : '📉'; break;
                            case 'AddProduct': icon = focused ? '✨' : '📝'; break;
                            case 'ProductList': icon = focused ? '📦' : '🗃️'; break;
                            case 'AdminOrdersPage': icon = focused ? '🚚' : '📦'; break;
                            case 'AdminUsers': icon = focused ? '🛡️' : '👥'; break;
                            case 'AdminProfile': icon = focused ? '⚙️' : '👤'; break;
                        }
                    } else {
                        switch (route.name) {
                            case 'Homepage': icon = focused ? '🏠' : '🏚️'; break;
                            case 'Explore': icon = focused ? '🧭' : '🔍'; break;
                            case 'CartPage': icon = focused ? '🛍️' : '🛒'; break;
                            case 'OrderHistory': icon = focused ? '📦' : '📜'; break;
                            case 'Profile': icon = focused ? '👤' : '👤'; break;
                        }
                    }
                    return (
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 32,
                            height: 32,
                        }}>
                            <Text style={{
                                fontSize: 24,
                                opacity: focused ? 1 : 0.6,
                                textAlign: 'center'
                            }}>
                                {icon}
                            </Text>
                        </View>
                    );
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '700',
                    marginBottom: 8,
                    letterSpacing: 0.3
                },
                tabBarStyle: {
                    height: 70,
                    paddingTop: 10,
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#F3F4F6',
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                },
                tabBarActiveTintColor: '#6366F1',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarHideOnKeyboard: true,
            })}
        >
            {users.role === "ADMIN" ? (
                <>
                    <Tab.Screen name='Dashboard' component={Dashboard} />
                    <Tab.Screen name='AddProduct' component={AddProduct} options={{ title: 'Add' }} />
                    <Tab.Screen name='ProductList' component={ProductList} options={{ title: 'Products' }} />
                    <Tab.Screen name='AdminOrdersPage' component={AdminOrdersPage} options={{ title: 'Orders' }} />
                    <Tab.Screen name='AdminUsers' component={AdminUsers} options={{ title: 'Users' }} />
                    <Tab.Screen name='AdminProfile' component={AdminProfile} options={{ title: 'Profile' }} />
                </>) : (<>
                    <Tab.Screen name='Homepage' component={Homepage} options={{ title: 'Home' }} />
                    <Tab.Screen name='Explore' component={Explore} />
                    <Tab.Screen
                        name='CartPage'
                        component={CartPage}
                        options={{
                            title: 'Cart',
                            tabBarBadge: cartCount > 0 ? cartCount : null,
                            tabBarBadgeStyle: { backgroundColor: '#FF6B6B', fontSize: 10 }
                        }}
                    />
                    <Tab.Screen name='OrderHistory' component={OrderHistory} options={{ title: 'Orders' }} />
                    <Tab.Screen name='Profile' component={Profile} />
                </>)}
        </Tab.Navigator>
    )
}