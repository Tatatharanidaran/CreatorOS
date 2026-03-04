const EMOJIS = ['🎉', '🎂', '🎈', '🥳', '🎁', '✨', '💖', '🔥', '📣', '💬', '🚀', '🤍'];

export default function EmojiSelector({ onPick }) {
  return (
    <div className="emoji-grid">
      {EMOJIS.map((emoji) => (
        <button key={emoji} type="button" className="emoji-btn" onClick={() => onPick(emoji)}>
          {emoji}
        </button>
      ))}
    </div>
  );
}
