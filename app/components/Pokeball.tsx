import React from "react"

function PokeBall (props: any) {
  return (
    <div>
      <h2>Pokeball - {props.type} - {props.color} - {props.edition}</h2>
    </div>
  );
}

export default PokeBall;