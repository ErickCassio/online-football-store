import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import storeLogo from '../images/MainPage/storeLogo2.png';

function Dropdown(){
    const [isOpen, setIsOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
      setIsOpen(!isOpen);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const getProductsNames = () => {
        // Contexto do webpack para importar os arquivos da pasta Banner
        const productSRC = require.context('../images/MainPage/Banner', false, /\.(jpe?g)$/);

        // Obtém uma lista de todos os caminhos relativos dos arquivos correspondentes
        const paths = productSRC.keys();

        // Extrai apenas os nomes dos arquivos dos caminhos relativos
        const fileNames = paths.map(path => {
            // Separa o caminho usando '/' como delimitador e pega o último elemento
            const pathParts = path.split('/');
            const fileNameWithExtension = pathParts[pathParts.length - 1];

            // Remove a extensão do arquivo
            const fileName = fileNameWithExtension.replace(/\.[^/.]+$/, '');

            return fileName;
        });
        return fileNames;
    };

    return (
        <div>
            <li className="nav-item">
                <button className="icon-button navButton" onClick={toggleMenu}>
                    <i className="fa-solid fa-bars"></i>
                </button>
            </li>
            {/*Menu lateral / SideBar*/}
            {isOpen && <div className="transparent-half" onClick={handleClose}></div>}
            <div className={`blue-half ${isOpen ? "open" : "close"}`}>
                <div className='row m-0'>
                    <div className='col-12 p-2' style={{backgroundColor: "#152C40", color: "white"}}>
                        <Link to="/" className="linkSemEstilo">
                            <img src={storeLogo} alt="Logo" className="menuImgLogo me-2" />
                            <a className="menuLogo mb-0" href="/">ZZFUTEBOLSTORE</a>
                        </Link>
                    </div>
                
                    <div className='col-12 p-2 px-3 produtos'>
                        <Link to="/" className="linkSemEstilo"><h6 className='m-0'><i class="fa-solid fa-house"></i> Página inicial</h6></Link>
                    </div>
                    <hr className='m-0'/>
                    <div className='col-12 p-2 px-3 d-flex justify-content-between produtos' onClick={handleMenu}>
                        <h6 className='m-0'><i class="fa-solid fa-shirt"></i> Produtos</h6>
                        <i className="fa-solid fa-angle-down mt-1"></i>
                    </div>
                    <hr className='m-0'/>
                    {menuOpen && <div className="p-0">
                        {getProductsNames().map((name, index) => (
                        <div key={index} className='p-0s'>
                            <Link to={`/collections/${name}`} className="linkSemEstilo"><div className="col-12 px-3 produtos">{name}</div></Link>
                            <hr className='m-0'/>
                        </div>
                        ))}
                    </div>}
                </div>
            </div>
        </div>
    );
}

export default Dropdown;