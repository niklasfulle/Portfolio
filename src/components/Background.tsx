import React from "react";

const Background = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="background-orb background-orb--1" />
      <div className="background-orb background-orb--2" />
      <div className="background-orb background-orb--3" />
      <div className="background-orb background-orb--4" />
      <div className="background-orb background-orb--5" />
      <div className="background-orb background-orb--6" />
    </div>
  );
};

export default Background;
