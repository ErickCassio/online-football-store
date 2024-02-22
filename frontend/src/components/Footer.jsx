import React from 'react';

function Footer(){
    const anoAtual = new Date().getFullYear();
    return (
        <footer className="footer py-3">
            <div className='container-fluid'>
                <div className="row p-1">
                    <div className="col-sm-3 col-lg-2 col-md-2 col-5">
                        <h6>Contacta-nos</h6>
                        <a href='https://wa.me/351963089568/?text=Olá, gostaria de saber mais sobre seus produtos' target="_blank" rel="noreferrer">
                            <span>
                                <i className="fa-brands fa-whatsapp fa-xl"></i> Whatsapp
                            </span>
                        </a>
                    </div>
                    <div className="col-sm-3 col-lg-2 col-md-2 col-5">
                        <h6>Segue-nos</h6>
                        <a href="https://www.instagram.com/zzfutebolstore/" target="_blank" rel="noreferrer">
                            <span>
                                <i className="fa-brands fa-instagram fa-xl instaIcon"></i> Instagram
                            </span>
                        </a>
                    </div>  
                </div>
                </div>
                <hr/>
                <div className='mx-2 p-2 copy'>
                    <span>© {anoAtual} ZZFUTEBOLSTORE. Todos os direitos reservados.</span>
                </div>
        </footer>
    );
}

export default Footer;