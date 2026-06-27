import React, { useState, useEffect } from 'react'
import UserContext from './UserContext';
import CartService from '../database/CartService';

const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = async () => {
    if (userId) {
      const items = await CartService.getUserCart(userId);
      setCartCount(items.length);
    } else {
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();
  }, [userId]);

  return (
    //Store Data in Value  it is Available Other Component
    <UserContext.Provider value={{ userId, setUserId, cartCount, updateCartCount }}>
      {children}
    </UserContext.Provider>
  )
}

export default UserProvider