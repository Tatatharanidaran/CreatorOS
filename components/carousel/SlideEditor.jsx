'use client';

import FontSelector from '../design/FontSelector';
import TextStylePresets from '../design/TextStylePresets';

export default function SlideEditor({ slide, onChange }) {
  if (!slide) {
    return null;
  }

  function patch(data) {
    onChange({ ...slide, ...data });
  }

  function patchTextBox(data) {
    onChange({ ...slide, textBox: { ...slide.textBox, ...data } });
  }

  function patchImageBox(data) {
    onChange({ ...slide, imageBox: { ...slide.imageBox, ...data } });
  }

  function patchTextStyle(data) {
    onChange({ ...slide, textStyle: { ...slide.textStyle, ...data } });
  }

  function uploadImage(event, key) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      patch({ [key]: `${reader.result || ''}` });
    };
    reader.readAsDataURL(file);
  }

  function removeImage(key) {
    patch({ [key]: '' });
  }

  return (
    <div className="slide-editor">
      <h3>Text settings</h3>
      <label>
        Slide title
        <input value={slide.title} onChange={(event) => patch({ title: event.target.value })} />
      </label>
      <label>
        Slide content
        <textarea rows={4} value={slide.body} onChange={(event) => patch({ body: event.target.value })} />
      </label>

      <FontSelector value={slide.textStyle.fontFamily} onChange={(fontFamily) => patchTextStyle({ fontFamily })} />

      <TextStylePresets onApply={(values) => patchTextStyle(values)} />

      <div className="editor-grid">
        <label>
          Text Size
          <input
            type="range"
            min={24}
            max={96}
            value={slide.textStyle.fontSize}
            onChange={(event) => patchTextStyle({ fontSize: Number(event.target.value) })}
          />
        </label>
        <label>
          Text Weight
          <input
            type="range"
            min={300}
            max={900}
            step={100}
            value={slide.textStyle.fontWeight}
            onChange={(event) => patchTextStyle({ fontWeight: Number(event.target.value) })}
          />
        </label>
        <label>
          Text Color
          <input type="color" value={slide.textStyle.color} onChange={(event) => patchTextStyle({ color: event.target.value })} />
        </label>
        <label>
          Alignment
          <select value={slide.textStyle.align} onChange={(event) => patchTextStyle({ align: event.target.value })}>
            <option value="left">Left</option>
            <option value="center">Center</option>
          </select>
        </label>
      </div>

      <div className="toggle-row">
        <label>
          <input
            type="checkbox"
            checked={slide.textStyle.italic}
            onChange={(event) => patchTextStyle({ italic: event.target.checked })}
          />
          Italic
        </label>
        <label>
          <input
            type="checkbox"
            checked={slide.textStyle.uppercase}
            onChange={(event) => patchTextStyle({ uppercase: event.target.checked })}
          />
          Uppercase
        </label>
        <label>
          <input
            type="checkbox"
            checked={slide.textStyle.gradient}
            onChange={(event) => patchTextStyle({ gradient: event.target.checked })}
          />
          Gradient
        </label>
        <label>
          <input
            type="checkbox"
            checked={slide.textStyle.highlight}
            onChange={(event) => patchTextStyle({ highlight: event.target.checked })}
          />
          Highlight
        </label>
      </div>

      <h3>Background</h3>
      <label>
        Background color
        <input type="color" value={slide.backgroundColor} onChange={(event) => patch({ backgroundColor: event.target.value })} />
      </label>

      <div className="editor-grid">
        <div>
          <label>
            Background image
            <input type="file" accept="image/*" onChange={(event) => uploadImage(event, 'backgroundImage')} />
          </label>
          <button
            type="button"
            className="copy-btn"
            onClick={() => removeImage('backgroundImage')}
            disabled={!slide.backgroundImage}
          >
            Remove background
          </button>
        </div>
        <div>
          <label>
            Slide image
            <input type="file" accept="image/*" onChange={(event) => uploadImage(event, 'imageSrc')} />
          </label>
          <button type="button" className="copy-btn" onClick={() => removeImage('imageSrc')} disabled={!slide.imageSrc}>
            Remove slide image
          </button>
        </div>
      </div>

      <h3>Image settings</h3>
      <div className="editor-grid">
        <label>
          Image X
          <input type="range" min={0} max={980} value={slide.imageBox.x} onChange={(event) => patchImageBox({ x: Number(event.target.value) })} />
        </label>
        <label>
          Image Y
          <input type="range" min={0} max={980} value={slide.imageBox.y} onChange={(event) => patchImageBox({ y: Number(event.target.value) })} />
        </label>
        <label>
          Image Width
          <input
            type="range"
            min={120}
            max={1080}
            value={slide.imageBox.width}
            onChange={(event) => patchImageBox({ width: Number(event.target.value) })}
          />
        </label>
        <label>
          Image Height
          <input
            type="range"
            min={120}
            max={1080}
            value={slide.imageBox.height}
            onChange={(event) => patchImageBox({ height: Number(event.target.value) })}
          />
        </label>
      </div>

      <h3>Text box position</h3>
      <div className="editor-grid">
        <label>
          Text X
          <input type="range" min={0} max={980} value={slide.textBox.x} onChange={(event) => patchTextBox({ x: Number(event.target.value) })} />
        </label>
        <label>
          Text Y
          <input type="range" min={40} max={1020} value={slide.textBox.y} onChange={(event) => patchTextBox({ y: Number(event.target.value) })} />
        </label>
        <label>
          Text Width
          <input type="range" min={200} max={1040} value={slide.textBox.width} onChange={(event) => patchTextBox({ width: Number(event.target.value) })} />
        </label>
        <label>
          Text Height
          <input type="range" min={100} max={980} value={slide.textBox.height} onChange={(event) => patchTextBox({ height: Number(event.target.value) })} />
        </label>
      </div>
    </div>
  );
}
