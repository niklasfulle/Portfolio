
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
      <div className="background-stars" />
      <div className="background-sparkle background-sparkle--one" />
      <div className="background-sparkle background-sparkle--two" />
      <div className="background-sparkle background-sparkle--three" />
      <div className="shooting-star shooting-star--one" />
      <div className="shooting-star shooting-star--two" />
    </div>
  );
};

export default Background;
