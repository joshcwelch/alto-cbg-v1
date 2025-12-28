type CardPreviewProps = {
  position: { x: number; y: number };
  artSrc: string;
  name: string;
  text: string;
  cost: number;
  attack?: number;
  health?: number;
  type: "MINION" | "SPELL";
};

const CardPreview = ({
  position,
  artSrc,
  name,
  text,
  cost,
  attack,
  health,
  type,
}: CardPreviewProps) => {
  const nameLength = name.length;
  const nameSize =
    nameLength > 22 ? 10 : nameLength > 18 ? 11 : nameLength > 14 ? 12 : 13;
  const textLength = text.length;
  const textSize =
    textLength > 120 ? 9 : textLength > 90 ? 10 : textLength > 60 ? 11 : 12;

  return (
    <div className="card-preview is-visible" style={{ left: position.x, top: position.y }}>
      <span className="card-preview__glow" aria-hidden="true" />
      <img className="card-preview__art" src={artSrc} alt={name} draggable={false} />
      <img
        className="card-preview__frame"
        src={
          type === "SPELL"
            ? "/assets/cards/frames/card-front-spell.PNG"
            : "/assets/cards/frames/card-front.PNG"
        }
        alt=""
        draggable={false}
      />
      <span className="card-preview__cost">{cost}</span>
      <span className="card-preview__name" style={{ fontSize: `${nameSize}px` }}>
        {name}
      </span>
      <span className="card-preview__text" style={{ fontSize: `${textSize}px` }}>
        {text}
      </span>
      {type === "MINION" && (
        <>
          <span className="card-preview__attack">{attack ?? 0}</span>
          <span className="card-preview__health">{health ?? 0}</span>
        </>
      )}
    </div>
  );
};

export default CardPreview;
