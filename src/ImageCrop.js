import React, { useRef, useState, useCallback, useEffect } from 'react'
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ImageCrop = () => {

    const imgRef = useRef();

    const canvasRef = useRef();

    const [image, setImage] = useState(null);

    const [crop, setCrop] = useState({ aspect: 1 }); // or any other desired aspect ratio

    const [croppedImage, setCroppedImage] = useState(null);

    const handleImageChanged = (event) => {
        const { files } = event.target;
        if (files && files.length > 0) {
            const reader = new FileReader();
            reader.readAsDataURL(files[0]);
            reader.addEventListener("load", () => {
                setImage(reader.result);

                const img = new Image();
                img.src = reader.result;
                img.onload = () => {
                    setCrop({ aspect: img.width / img.height });
                };
            });
        }
    };


    const handleOnLoad = useCallback((event) => {
        imgRef.current = event.target; // Set imgRef after image loads
    }, []);


    const saveImage = () => {
        if (!croppedImage || !canvasRef.current) return;
        canvasRef.current.toBlob((blob) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'cropped.png';
            link.click();
            window.URL.revokeObjectURL(url);
            canvasRef.current = null;
        });
    }

    const clear = () => {
        setImage(null);
        setCroppedImage(null);
        setCrop({ aspect: 9 / 16 });
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    useEffect(() => {
        if (!croppedImage || !imgRef.current) return;

        const canvas = canvasRef.current;
        const rc_image = imgRef.current;
        const crop = croppedImage;

        const scaleX = rc_image.naturalWidth / rc_image.width;
        const scaleY = rc_image.naturalHeight / rc_image.height;

        const pixelRatio = window.devicePixelRatio;

        const dImgWid = crop.width * scaleX;
        const dImgHei = crop.height * scaleY;

        canvas.width = dImgWid * pixelRatio;
        canvas.height = dImgHei * pixelRatio;

        const ctx = canvas.getContext('2d');

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = 'high';
        ctx.imageSmoothingEnabled = true;

        ctx.drawImage(
            rc_image,
            crop.x * scaleX,
            crop.y * scaleY,
            dImgWid,
            dImgHei,
            0,
            0,
            dImgWid,
            dImgHei
        );
    }, [croppedImage]);

    return (
        <div>
            <div>
                <input
                    type="file"
                    accept='image/*'
                    ref={imgRef}
                    onChange={(e) => handleImageChanged(e)}
                />
                <button onClick={clear}>Clear</button>
                {croppedImage && <button onClick={saveImage}>Save</button>}
            </div>
            <div>
                {image &&
                    <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        onComplete={(c) => {
                            setCroppedImage(c);
                        }}
                        minWidth={100}
                        minHeight={100}
                        grid={[10, 10]}
                    >
                        <img
                            src={image}
                            alt="Crop me"
                            onLoad={handleOnLoad}
                            style={{
                                width: '100%',
                                height: '100%'
                            }}
                        />
                    </ReactCrop>

                }
            </div>
            <div>
                {croppedImage && (
                    <>
                        <canvas ref={canvasRef}></canvas>
                    </>
                )}
            </div>
        </div>
    )
}

export default ImageCrop
