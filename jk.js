import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import ThreeDCanvas from './Mugeditor.js';
import "./Ui.css"

const FabricCanvas = ({ onCanvasChange }) => {
  const canvasElementRef = useRef(null); // Ref for the HTMLCanvasElement
  const fabricCanvasRef = useRef(null);  // Ref for the Fabric.js canvas instance
  const [texture, setTexture] = useState(null); // State to store the canvas texture
  const [selectedImage, setSelectedImage] = useState(null);
  const [inputText, setInputText] = useState('');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(40);
  const [textColor, setTextColor] = useState('#000000');
  const [textAlign, setTextAlign] = useState('left');
  const [imageSizeOption, setImageSizeOption] = useState('full');
   // Editing properties
   const [brightness, setBrightness] = useState(0);
   const [contrast, setContrast] = useState(0);
   const [saturation, setSaturation] = useState(0);
   const [grayscale, setGrayscale] = useState(0);


  useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasElementRef.current, {
      width: 1024,  // Adjust the width to match 3D canvas
      height: 1024, 
    });
    fabricCanvasRef.current = fabricCanvas;

    fabricCanvas.on('object:modified', updateCanvasTexture);
    fabricCanvas.on('object:added', updateCanvasTexture);
    fabricCanvas.on('selection:created', handleObjectSelection);
    fabricCanvas.on('selection:updated', handleObjectSelection);


    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  
  const updateCanvasTexture = () => {
    const fabricCanvas = fabricCanvasRef.current;
  
    // Create a new temporary canvas to flip the image horizontally
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = fabricCanvas.width;
    tempCanvas.height = fabricCanvas.height;
    const ctx = tempCanvas.getContext('2d');
  
    // Draw the fabric canvas content on the temp canvas, flipping horizontally
    ctx.translate(fabricCanvas.width, 0);
    ctx.scale(-1, 1);  // Flip horizontally
    ctx.drawImage(fabricCanvas.getElement(), 0, 0);
  
    // Get the flipped image as a high-resolution Data URL
    const flippedDataUrl = tempCanvas.toDataURL({
      format: 'png',
      multiplier: 10,  // Increase multiplier for higher resolution output
    });
  
    setTexture(flippedDataUrl);  // Set the flipped texture as the source
    if (onCanvasChange) {
      onCanvasChange(flippedDataUrl);
    }
  };
  
  
  

  const handleImageSizeOptionChange = (e) => {
    setImageSizeOption(e.target.value);
  };
  
  

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (f) => {
      fabric.Image.fromURL(f.target.result, (img) => {
        if (imageSizeOption === 'full') {
          // Scale the image to cover the entire canvas (full layout)
          img.set({
            left: 0,
            top: 0,
            scaleX: fabricCanvasRef.current.width / img.width,
            scaleY: fabricCanvasRef.current.height / img.height,
            selectable: true,
            hasControls: true,
          });
        } else if (imageSizeOption === 'logo') {
          // Keep the image small (logo size), allowing user to drag it around
          img.set({
            left: 100,
            top: 100,
            scaleX: 0.3,  // You can adjust the scale to define logo size
            scaleY: 0.3,
            selectable: true,
            hasControls: true,
          });
        }
  
        fabricCanvasRef.current.add(img);
        fabricCanvasRef.current.setActiveObject(img);
        fabricCanvasRef.current.renderAll();
        setSelectedImage(img);  // Set the selected image for editing
      });
    };
    reader.readAsDataURL(file);
  };

  

  
  const handleAddText = () => {
    const text = new fabric.Textbox(inputText, {
      left: fabricCanvasRef.current.width / 2, // Center the text horizontally
      top: fabricCanvasRef.current.height / 2, // Center the text vertically
      originX: 'center', // Set origin to center to align properly
      originY: 'center',
      fontFamily,
      fontSize,
      fill: textColor,
      textAlign,
      selectable: true,
      hasControls: true,
    });
  
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
    updateCanvasTexture(); // Update the 3D model texture
  };

  const handleObjectSelection = (e) => {
    const activeObject = e.target;
    if (activeObject && activeObject.type === 'image') {
      setSelectedImage(activeObject);
    } else {
      setSelectedImage(null);
    }
  };

    // Apply filters to the selected image
    const applyFilters = () => {
      if (selectedImage) {
        selectedImage.filters = [];
  
        // Apply brightness
        const brightnessFilter = new fabric.Image.filters.Brightness({
          brightness: brightness / 100,
        });
        selectedImage.filters.push(brightnessFilter);
  
        // Apply contrast
        const contrastFilter = new fabric.Image.filters.Contrast({
          contrast: contrast / 100,
        });
        selectedImage.filters.push(contrastFilter);
  
        // Apply saturation
        const saturationFilter = new fabric.Image.filters.Saturation({
          saturation: saturation / 100,
        });
        selectedImage.filters.push(saturationFilter);
  
        // Apply grayscale
        if (grayscale) {
          const grayscaleFilter = new fabric.Image.filters.Grayscale();
          selectedImage.filters.push(grayscaleFilter);
        }
  
        selectedImage.applyFilters();
        fabricCanvasRef.current.renderAll();
      }
    };
  
    // Handlers for sliders
    const handleBrightnessChange = (e) => {
      setBrightness(parseInt(e.target.value, 10));
      applyFilters();
    };
  
    const handleContrastChange = (e) => {
      setContrast(parseInt(e.target.value, 10));
      applyFilters();
    };
  
    const handleSaturationChange = (e) => {
      setSaturation(parseInt(e.target.value, 10));
      applyFilters();
    };
  
    const handleGrayscaleChange = (e) => {
      setGrayscale(e.target.checked ? 1 : 0);
      applyFilters();
    };

  

    const handleRotateImage = (angle) => {
      const activeObject = fabricCanvasRef.current.getActiveObject();
      if (activeObject && activeObject.type === 'image') {
        activeObject.rotate(angle);
        fabricCanvasRef.current.renderAll();
      }
    };
    
    const applyBlendMode = (mode) => {
      const activeObject = fabricCanvasRef.current.getActiveObject();
      if (activeObject && activeObject.type === 'image') {
        activeObject.filters.push(
          new fabric.Image.filters.BlendColor({
            color: '#FF0000', // Blend color
            mode,             // Blend mode: e.g., "multiply", "screen", etc.
            alpha: 0.5,       // Opacity of the blend
          })
        );
        activeObject.applyFilters();
        fabricCanvasRef.current.renderAll();
      }
    };

  

  const handleUpdateTextProperties = () => {
    const activeObject = fabricCanvasRef.current.getActiveObject();
    
    if (activeObject && activeObject.type === 'textbox') {
      activeObject.set({
        fontFamily,
        fontSize,
        fill: textColor,
        textAlign,
      });
      fabricCanvasRef.current.renderAll();
    }
  };

  return (
    <div className="container">
     
        {/* 3D Model on the left */}
        <ThreeDCanvas textureUrl={texture} />
        
        <div className="fabric-canvas-wrapper">
     
          <canvas ref={canvasElementRef} style={{ border: '2px solid black' }} /> 
          
          <div className="control-panel">
            <input type="file" onChange={handleFileUpload} accept="image/*" />

            {selectedImage && (
              <div className="editing-controls">
                <div>
                  <label>Brightness:</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={brightness}
                    onChange={handleBrightnessChange}
                  />
                </div>

                <div>
                  <label>Contrast:</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={contrast}
                    onChange={handleContrastChange}
                  />
                </div>

                <div>
                  <label>Saturation:</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={saturation}
                    onChange={handleSaturationChange}
                  />
                </div>

                <div>
                  <label>Grayscale:</label>
                  <input
                    type="checkbox"
                    checked={!!grayscale}
                    onChange={handleGrayscaleChange}
                  />
                </div>
              </div>
            )}



<button onClick={() => handleRotateImage(45)}>Rotate 45°</button>

<select onChange={(e) => applyBlendMode(e.target.value)}>
  <option value="multiply">Multiply</option>
  <option value="screen">Screen</option>
  <option value="overlay">Overlay</option>
</select>
        
            <div>
      <label>Image Size Option:</label>
      <select onChange={handleImageSizeOptionChange}>
        <option value="full">Full Layout</option>
        <option value="logo">Logo Size</option>
      </select>
    </div>
            
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text"
            />
            
            <div>
              <label>Font Family: </label>
              <select
                value={fontFamily}
                onChange={(e) => {
                  setFontFamily(e.target.value);
                  handleUpdateTextProperties();
                }}
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
              </select>
              
              <label>Font Size: </label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => {
                  setFontSize(parseInt(e.target.value));
                  handleUpdateTextProperties();
                }}
              />
              
              <label>Text Color: </label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => {
                  setTextColor(e.target.value);
                  handleUpdateTextProperties();
                }}
              />
              
              <label>Text Align: </label>
              <select
                value={textAlign}
                onChange={(e) => {
                  setTextAlign(e.target.value);
                  handleUpdateTextProperties();
                }}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <button onClick={handleAddText}>Add Text</button>
          </div>
        </div>
      </div>
    
  );
};

export default FabricCanvas;