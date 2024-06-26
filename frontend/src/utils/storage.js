// src/utils/storage.js

// Adiciona um item ao carrinho
export const addItemToCart = (item) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Verifica se o item já está no carrinho pelo id
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex !== -1) {
      // Se o item já existe, incrementa a quantidade
      cart[existingItemIndex].quantity++;
    } else {
      // Se o item não existe, adiciona ao carrinho com quantidade inicial 1
      cart.push({ ...item, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
  };
  
  // Remove um item específico do carrinho pelo id
  export const removeItemFromCart = (itemId) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
  };
  
  // Obtém todos os itens do carrinho
  export const getCartItems = () => {
    return JSON.parse(localStorage.getItem('cart')) || [];
  };
  
  // Obtém a quantidade de itens no carrinho
  export const getCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    return cart.reduce((total, item) => total + item.quantity, 0);
  };
  