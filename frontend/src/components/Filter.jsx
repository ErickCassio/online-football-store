import React, { useState, useEffect } from 'react';
import teams from '../products/teams.json';

const Filter = (props) => {
    const types = ["Kit Infantil", "Bobojaco", "Baby Body", "Corta Vento", "Manga Longa", "Retrô", "Shorts", "Versão Feminina", "Versão Jogador", "Versão Torcedor"];
  
    useEffect(() => {
      if (props.selectedTypes.length > 0 || props.selectedTeams.length > 0) {
        const filteredProducts = props.originalProducts.name.reduce((filtered, name, index) => {
          const product = { name, url: props.originalProducts.url[index] };
          // Verifica se o produto atende aos critérios de equipe selecionados, se houver
          const teamFilter = props.selectedTeams.length === 0 || props.selectedTeams.some(team => name.includes(team));
          // Verifica se o produto atende aos critérios de tipo selecionados, se houver
          const typeFilter = props.selectedTypes.length === 0 || props.selectedTypes.some(type => name.includes(type));
          // Se o produto atender aos critérios de equipe e tipo, adiciona-o ao array filtrado
          if (teamFilter && typeFilter) {
            filtered.push(product);
          }
          return filtered;
        }, []);
        props.onFilterChange(filteredProducts);
        props.onFilterStateChange(true);
      }
      else if (props.selectedTypes.length === 0 && props.selectedTeams.length === 0) {
        props.onFilterStateChange(false);
      }
    }, [props.selectedTypes, props.selectedTeams]); // Atualize sempre que os filtros mudarem
  
    const handleTeamFilter = (teamName) => {
      if (props.selectedTeams.includes(teamName)) {
        props.setSelectedTeams(props.selectedTeams.filter(selectedTeam => selectedTeam !== teamName));
      } else {
        props.setSelectedTeams([...props.selectedTeams, teamName]);
      }
    };
  
    const handleTypeFilter = (type) => {
      if (props.selectedTypes.includes(type)) {
        props.setSelectedTypes(props.selectedTypes.filter(selectedType => selectedType !== type));
      } else {
        props.setSelectedTypes([...props.selectedTypes, type]);
      }
    };
  
    return (
      <div className="position-fixed w-100 h-100 d-flex justify-content-center align-items-center" style={{ top: "0%", left: "0%", zIndex: '0', background: 'rgba(0, 0, 0, 0.5)' }} onClick={props.menuState}>
        <div className="bg-light px-5 py-3" style={{ maxHeight: '65vh', overflowY: 'auto', zIndex: '1' }} onClick={(e) => e.stopPropagation()}>
          <h4 >Filtrar por Time:</h4>
          <ul className="list-unstyled">
            {teams[props.liga].map((team, index) => (
              <li key={index}>
                <label>
                  <input
                    type="checkbox"
                    checked={props.selectedTeams.includes(team)}
                    onChange={() => handleTeamFilter(team)}
                  />
                  {" " + team}
                </label>
              </li>
            ))}
          </ul>
          <h4>Filtrar por Tipo:</h4>
          <ul className="list-unstyled">
            {types.map((type, index) => (
              <li key={index}>
                <label>
                  <input
                    type="checkbox"
                    checked={props.selectedTypes.includes(type)}
                    onChange={() => handleTypeFilter(type)}
                  />
                  {" " + type}
                </label>
              </li>
            ))}
          </ul>
          <button className="btn btn-secondary" onClick={props.menuState}>
            Fechar
          </button>
        </div>
      </div>
    );
  }
  

export default Filter;