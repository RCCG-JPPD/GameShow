import React from "react";
import TeamSelection from "../components/buzz/TeamSelection.jsx";
import BuzzButton from "../components/buzz/BuzzButton.jsx";

export default function Buzz() {
  const team = localStorage.getItem("team");
  return team ? <BuzzButton team={team}/> : <TeamSelection />;
}
