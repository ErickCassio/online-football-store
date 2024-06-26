import React, { useEffect, useState } from 'react';
import { getCartItems, removeItemFromCart } from '../../utils/storage';
import { useParams, useSearchParams, Navigate } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
    setCartItems(getCartItems());
    }, []);

    const handleRemoveFromCart = (itemId) => {
    removeItemFromCart(itemId);
    setCartItems(getCartItems()); // Atualiza a lista de itens no estado após remover o item
    };

    return (
        <div>
            <Header/>
            <div>
                <h2>Itens no Carrinho</h2>
                {cartItems.length === 0 ? (
                    <p>O carrinho está vazio.</p>
                ) : (
                    <ul>
                    {cartItems.map((item) => (
                        <li key={item.id}>
                        {item.name} - Quantidade: {item.quantity} - R$ {item.price * item.quantity}
                        <button onClick={() => handleRemoveFromCart(item.id)}>Remover</button>
                        </li>
                    ))}
                    </ul>
                )}
            </div>
            <Footer/>
        </div>
    );
}

export default Cart;