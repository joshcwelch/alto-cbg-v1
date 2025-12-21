import { useGameContext } from "../GameRoot";

const BoardCursor = () => {
  const { cursor, cursorState } = useGameContext();

  return (
    <div
      className="board-cursor"
      style={{
        transform: `translate(${cursor.x - 32}px, ${cursor.y - 32}px)`,
        opacity: cursor.visible ? 1 : 0,
      }}
    >
      <img
        className={`board-cursor__icon ${cursorState === "default" ? "is-active" : ""}`}
        src="/assets/ui/cursor-pointer-64.png"
        srcSet="/assets/ui/cursor-pointer-64.png 1x, /assets/ui/cursor-pointer.png 2x"
        alt=""
      />
      <img
        className={`board-cursor__icon ${cursorState === "hover" ? "is-active" : ""}`}
        src="/assets/ui/cursor-open-hand-64.png"
        srcSet="/assets/ui/cursor-open-hand-64.png 1x, /assets/ui/cursor-open-hand.png 2x"
        alt=""
      />
      <img
        className={`board-cursor__icon ${cursorState === "dragging" ? "is-active" : ""}`}
        src="/assets/ui/cursor-grabbing-hand-64.png"
        srcSet="/assets/ui/cursor-grabbing-hand-64.png 1x, /assets/ui/cursor-grabbing-hand.png 2x"
        alt=""
      />
    </div>
  );
};

export default BoardCursor;
