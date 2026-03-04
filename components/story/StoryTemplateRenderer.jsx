import ImageFrame from './ImageFrame';

export default function StoryTemplateRenderer({ stageRef, story, selectedLayer, setSelectedLayer, startTransform, scale, openImagePicker, patchImageFrame }) {
  return (
    <div className="story-stage" ref={stageRef}>
      {story.background.type === 'image' ? <img src={story.background.src} alt="Story background" className="story-bg" /> : null}
      {story.background.overlay ? <span className="story-overlay" style={{ background: story.background.overlay }} /> : null}

      {story.shapes.map((shape) => (
        <button
              key={shape.id}
              type="button"
              className={`story-shape ${selectedLayer.type === 'shape' && selectedLayer.id === shape.id ? 'active' : ''}`}
              onClick={() => setSelectedLayer({ type: 'shape', id: shape.id })}
              onPointerDown={(event) => startTransform(event, 'shape', shape.id, 'drag', shape)}
              style={{
            left: `${shape.x * scale}px`,
            top: `${shape.y * scale}px`,
            width: `${shape.width * scale}px`,
            height: `${shape.height * scale}px`,
            background: shape.color,
            opacity: shape.opacity,
            borderRadius: `${shape.radius * scale}px`,
                transform: `rotate(${shape.rotation || 0}deg)`
              }}
            >
              {selectedLayer.type === 'shape' && selectedLayer.id === shape.id ? (
                <>
                  <span className="transform-handle rotate" onPointerDown={(event) => startTransform(event, 'shape', shape.id, 'rotate', shape)} />
                  <span className="transform-handle resize" onPointerDown={(event) => startTransform(event, 'shape', shape.id, 'resize', shape)} />
                </>
              ) : null}
            </button>
          ))}

      <button
        type="button"
        className={`story-image-frame ${selectedLayer.type === 'image' ? 'active' : ''}`}
        onClick={() => setSelectedLayer({ type: 'image', id: 'story-image' })}
        onPointerDownCapture={(event) => {
          if (!event.altKey) {
            return;
          }
          setSelectedLayer({ type: 'image', id: 'story-image' });
          startTransform(event, 'image', 'story-image', 'drag', story.image.box);
        }}
        style={{
          left: `${story.image.box.x * scale}px`,
          top: `${story.image.box.y * scale}px`,
          width: `${story.image.box.width * scale}px`,
          height: `${story.image.box.height * scale}px`,
          transform: `rotate(${story.image.box.rotation || 0}deg)`
        }}
      >
        <ImageFrame
          src={story.image.src}
          frameWidth={story.image.box.width}
          frameHeight={story.image.box.height}
          frame={story.image.frame}
          selected={selectedLayer.type === 'image'}
          scale={scale}
          onChange={(nextFrame) => patchImageFrame?.(nextFrame)}
          onRequestSelect={() => setSelectedLayer({ type: 'image', id: 'story-image' })}
          onRequestUpload={openImagePicker}
        />

        {selectedLayer.type === 'image' ? (
          <>
            <span className="transform-handle rotate" onPointerDown={(event) => startTransform(event, 'image', 'story-image', 'rotate', story.image.box)} />
            <span className="transform-handle resize" onPointerDown={(event) => startTransform(event, 'image', 'story-image', 'resize', story.image.box)} />
          </>
        ) : null}
      </button>

      {story.assets.map((asset) => (
        <button
          key={asset.id}
          type="button"
          className={`story-decor ${selectedLayer.type === 'asset' && selectedLayer.id === asset.id ? 'active' : ''}`}
          onClick={() => setSelectedLayer({ type: 'asset', id: asset.id })}
          onPointerDown={(event) => startTransform(event, 'asset', asset.id, 'drag', asset)}
          style={{
            left: `${asset.x * scale}px`,
            top: `${asset.y * scale}px`,
            width: `${asset.width * scale}px`,
            height: `${asset.height * scale}px`,
            transform: `rotate(${asset.rotation || 0}deg)`
          }}
        >
          <img src={asset.src} alt={asset.name} draggable={false} />
          {selectedLayer.type === 'asset' && selectedLayer.id === asset.id ? (
            <>
              <span className="transform-handle rotate" onPointerDown={(event) => startTransform(event, 'asset', asset.id, 'rotate', asset)} />
              <span className="transform-handle resize" onPointerDown={(event) => startTransform(event, 'asset', asset.id, 'resize', asset)} />
            </>
          ) : null}
        </button>
      ))}

      {story.textLayers.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`story-text ${selectedLayer.type === 'text' && selectedLayer.id === item.id ? 'active' : ''}`}
          onClick={() => setSelectedLayer({ type: 'text', id: item.id })}
          onPointerDown={(event) => {
            setSelectedLayer({ type: 'text', id: item.id });
            startTransform(event, 'text', item.id, 'drag', item);
          }}
          style={{
            left: `${item.x * scale}px`,
            top: `${item.y * scale}px`,
            width: `${item.width * scale}px`,
            fontSize: `${Math.max(14, item.size * scale)}px`,
            fontFamily: `"${item.fontFamily}", sans-serif`,
            color: item.color,
            fontWeight: item.weight,
            fontStyle: item.italic ? 'italic' : 'normal',
            textAlign: item.align,
            cursor: 'move'
          }}
        >
          {item.text}
        </button>
      ))}

      {story.emojis.map((emoji) => (
        <button
          key={emoji.id}
          type="button"
          className={`story-emoji ${selectedLayer.type === 'emoji' && selectedLayer.id === emoji.id ? 'active' : ''}`}
          onClick={() => setSelectedLayer({ type: 'emoji', id: emoji.id })}
          onPointerDown={(event) => startTransform(event, 'emoji', emoji.id, 'drag', emoji)}
          style={{
            left: `${emoji.x * scale}px`,
            top: `${emoji.y * scale}px`,
            fontSize: `${Math.max(16, emoji.size * scale)}px`,
            transform: `rotate(${emoji.rotation || 0}deg)`
          }}
        >
          {emoji.char}
          {selectedLayer.type === 'emoji' && selectedLayer.id === emoji.id ? (
            <>
              <span className="transform-handle rotate" onPointerDown={(event) => startTransform(event, 'emoji', emoji.id, 'rotate', emoji)} />
              <span className="transform-handle resize" onPointerDown={(event) => startTransform(event, 'emoji', emoji.id, 'resize', emoji)} />
            </>
          ) : null}
        </button>
      ))}
    </div>
  );
}
