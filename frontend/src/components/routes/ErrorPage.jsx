// PaginaNaoEncontrada.js
import React from 'react';
import { Link } from 'react-router-dom';

const PaginaNaoEncontrada = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Ops! Página não encontrada</h1>
      <p style={styles.text}>A página que você está procurando não existe ou foi movida.</p>
      <Link to="/">Voltar para a página inicial</Link>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    textAlign: 'center',
  },
  heading: {
    fontSize: '2rem',
    marginBottom: '1rem',
  },
  text: {
    fontSize: '1rem',
    marginBottom: '1rem',
  }
};

export default PaginaNaoEncontrada;
