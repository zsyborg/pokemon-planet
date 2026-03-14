"use client";
import PokeBall from "../components/Pokeball";

export default function Player() {

let colors = ["Red", "Blue", "Green", "Yellow"];


  return (
    <div>
      <PokeBall edition="First" type="Normal" color={colors[2]} />
      <PokeBall edition="First" type="Great Ball" color={colors[1]} />
    </div>
  );
}