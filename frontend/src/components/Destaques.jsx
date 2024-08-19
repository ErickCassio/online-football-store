import React, { useEffect, useState } from "react";
import Camisas from "./Camisas.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Destaques(props) {
  const navigate = useNavigate();
  const [tShirt, setTShirt] = useState([]);

  useEffect(() => {
    const collectProductInfo = async () => {
      let auxTShirt = [];
      for (let index = 0; index < props.tShirt.length; index++) {
        const response = await axios.get(
          `http://localhost:5000/api/searchById/${props.tShirt[index]}`
        );
        if (response.data.length > 0) {
          auxTShirt.push(response.data);
        }
      }
      setTShirt(auxTShirt);
    };
    collectProductInfo();
  }, [props.tShirt]);

  useEffect(() => {
    console.log("Teste: " + tShirt);
  }, [tShirt]);

  const handleShowMore = () => {
    if (props.nomeLiga.length > 0) {
      navigate(`/collections/${props.nomeLiga}`);
    }
    return true;
  };
  return (
    <div className="container text-center">
      <div className="row">
        <div className="col">
          <img className="img-fluid mb-3" src={props.bannerURL} alt="ligas" />
        </div>
      </div>
      <div className="row">
        {tShirt.length > 0 ? (
          <>
            {tShirt.map((item) =>
              item.map((itemAux) => (
                <div className="col-lg-3 col-md-4 col-sm-4 col-6 p-0">
                  <Camisas
                    imgSrc={itemAux.url}
                    tShirtName={itemAux.name}
                    tShirtPrice={itemAux.price}
                    tShirtId={itemAux.id}
                  />
                </div>
              ))
            )}
          </>
        ) : null}
      </div>
      <button
        type="button"
        className="btn btn-primary btn-sm m-3"
        style={{ background: "#152C40" }}
        onClick={handleShowMore}
      >
        Ver mais
      </button>
    </div>
  );
}

export default Destaques;
