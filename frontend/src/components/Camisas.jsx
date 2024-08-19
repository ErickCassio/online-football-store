import React from "react";
import { useNavigate } from "react-router-dom";

function Camisas(props) {
  const navigate = useNavigate();
  return (
    <div
      className="camisa m-3"
      onClick={() => {
        navigate(`/product/${props.tShirtId}`);
      }}
    >
      <img
        className="img-fluid camisaImg"
        src={props.imgSrc}
        alt={props.altText}
      ></img>
      <hr className="linha mt-0 mb-2"></hr>
      <h6>{props.tShirtName}</h6>
      <p>
        <b>€{props.tShirtPrice}</b>
      </p>
    </div>
  );
}

export default Camisas;
