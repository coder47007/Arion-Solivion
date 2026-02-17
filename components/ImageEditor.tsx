import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, CheckIcon } from './Icons';

interface ImageEditorProps {
    imageFile: File;
    onSave: (processedImage: string) => void;
    onCancel: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageFile, onSave, onCancel }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);

    // Edit State
    const [scale, setScale] = useState(1);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const img = new Image();
        img.src = URL.createObjectURL(imageFile);
        img.onload = () => {
            setImage(img);
            // Center image initially
            setPosition({ x: 0, y: 0 });
        };
    }, [imageFile]);

    useEffect(() => {
        if (!image || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set fixed square size for profile picture
        canvas.width = 400;
        canvas.height = 400;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply filters
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

        // Calculate center position
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        ctx.save();
        ctx.translate(centerX + position.x, centerY + position.y);
        ctx.scale(scale, scale);
        // Draw image centered
        ctx.drawImage(image, -image.width / 2, -image.height / 2);
        ctx.restore();

    }, [image, scale, brightness, contrast, saturation, position]);

    const handleSave = () => {
        if (canvasRef.current) {
            const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
            onSave(dataUrl);
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const newScale = Math.max(0.1, Math.min(5, scale - e.deltaY * 0.001));
        setScale(newScale);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-caribbean-deep border border-white/10 rounded-3xl p-6 max-w-4xl w-full shadow-2xl flex flex-col md:flex-row gap-8">

                {/* Canvas Area */}
                <div className="flex-1 flex flex-col items-center justify-center bg-black/40 rounded-2xl p-4 overflow-hidden relative">
                    <h3 className="text-cyan-100/50 uppercase tracking-widest text-xs font-bold mb-4 absolute top-4">Preview</h3>
                    <canvas
                        ref={canvasRef}
                        onWheel={handleWheel}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        className="rounded-full shadow-[0_0_50px_rgba(6,182,212,0.2)] cursor-move border-4 border-white/10"
                        style={{ maxWidth: '100%', maxHeight: '400px' }}
                    />
                    <p className="text-white/30 text-xs mt-4">Scroll to Zoom • Drag to Move</p>
                </div>

                {/* Controls Area */}
                <div className="w-full md:w-80 space-y-8 p-2">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <h2 className="text-2xl font-display font-bold text-white">Studio Editor</h2>
                        <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Zoom */}
                        <div className="space-y-2">
                            <label className="flex justify-between text-xs font-bold text-caribbean-turquoise uppercase tracking-wider">
                                <span>Zoom</span>
                                <span>{(scale * 100).toFixed(0)}%</span>
                            </label>
                            <input
                                type="range" min="0.5" max="3" step="0.1"
                                value={scale} onChange={(e) => setScale(parseFloat(e.target.value))}
                                className="w-full accent-caribbean-turquoise"
                            />
                        </div>

                        {/* Brightness */}
                        <div className="space-y-2">
                            <label className="flex justify-between text-xs font-bold text-caribbean-sun uppercase tracking-wider">
                                <span>Brightness</span>
                                <span>{brightness}%</span>
                            </label>
                            <input
                                type="range" min="0" max="200"
                                value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))}
                                className="w-full accent-caribbean-sun"
                            />
                        </div>

                        {/* Contrast */}
                        <div className="space-y-2">
                            <label className="flex justify-between text-xs font-bold text-caribbean-coral uppercase tracking-wider">
                                <span>Contrast</span>
                                <span>{contrast}%</span>
                            </label>
                            <input
                                type="range" min="0" max="200"
                                value={contrast} onChange={(e) => setContrast(parseInt(e.target.value))}
                                className="w-full accent-caribbean-coral"
                            />
                        </div>

                        {/* Saturation */}
                        <div className="space-y-2">
                            <label className="flex justify-between text-xs font-bold text-pink-500 uppercase tracking-wider">
                                <span>Saturation</span>
                                <span>{saturation}%</span>
                            </label>
                            <input
                                type="range" min="0" max="200"
                                value={saturation} onChange={(e) => setSaturation(parseInt(e.target.value))}
                                className="w-full accent-pink-500"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 font-bold hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-caribbean-turquoise to-caribbean-ocean text-white font-bold shadow-lg hover:shadow-caribbean-turquoise/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                        >
                            <CheckIcon className="w-5 h-5" /> Apply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;
