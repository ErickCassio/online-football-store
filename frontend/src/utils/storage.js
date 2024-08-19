// src/utils/storage.js

// Adds an item to the cart
export const addItemToCart = (item) => {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Checks if the item is already in the cart by productId, size, and price
  const existingItemIndex = cart.findIndex(cartItem => 
      cartItem.productId === item.productId && 
      cartItem.size === item.size && 
      cartItem.price === item.price &&
      cartItem.customDetails === item.customDetails
  );

  if (existingItemIndex !== -1) {
      // If the item already exists, increment the quantity by item.quantity
      cart[existingItemIndex].quantity += item.quantity;
  } else {
      // If the item does not exist, add it to the cart with the specified quantity
      cart.push({ ...item });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
};
  
// Removes a specific item from the cart by id
export const removeItemFromCart = (index) => {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  if (index >= 0 && index < cart.length) { // Check if the index is valid
    cart.splice(index, 1); // Remove the item at the specified index
  }

  localStorage.setItem('cart', JSON.stringify(cart));
};

export const increaseItemQuantity = (index) => {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  if (index >= 0 && index < cart.length) { // Check if the index is valid
    cart[index].quantity += 1; // Increment the quantity by 1
  }

  localStorage.setItem('cart', JSON.stringify(cart));
};

// Decreases the quantity of a specific item in the cart by index
export const decreaseItemQuantity = (index) => {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  if (index >= 0 && index < cart.length) { // Check if the index is valid
    if (cart[index].quantity > 1) {
      cart[index].quantity -= 1; // Decrement the quantity by 1
    } else {
      cart.splice(index, 1); // Remove the item if quantity is 1
    }
  }

  localStorage.setItem('cart', JSON.stringify(cart));
};

// Gets all items from the cart
export const getCartItems = () => {
  return JSON.parse(localStorage.getItem('cart')) || [];
};

// Gets the total quantity of items in the cart
export const getCartCount = () => {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  return cart.reduce((total, item) => total + item.quantity, 0);
};
