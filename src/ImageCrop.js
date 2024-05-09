import React, { useRef, useState, useCallback, useEffect } from 'react'
import ReactCrop from 'react-image-crop';

const ImageCrop = () => {

    const imgRef = useRef();

    const canvasRef = useRef();

    const [image, setImage] = useState(null);

    const [crop, setCrop] = useState({ aspect: 9 / 16 });

    const [croppedImage, setCroppedImage] = useState(null);

    const handleImageChanged = (event) => {

        const { files } = event.target;
        if (files || files.length > 0) {
            const reader = new FileReader();
            reader.readAsDataURL(files[0]);
            reader.addEventListener("load", () => {
                setImage(reader.result);
                // console.log(reader.result);

            });
        }
        // console.log(image);
    };
    console.log(croppedImage);

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
        console.log(imgRef.current);

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
            crop.x,
            crop.y,
            dImgWid,
            dImgHei,
            0,
            0,
            dImgWid,
            dImgHei
        );
        // console.log(canvas.toDataURL());
    }, [croppedImage])

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
            </div>
            <div>
                {image &&
                    <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        onComplete={(c) => setCroppedImage(c)}

                    >
                        <img src={image} alt="Crop me" onLoad={handleOnLoad} />
                    </ReactCrop>
                }
            </div>
            <div>
                {croppedImage && (
                    <>
                        <canvas ref={canvasRef}></canvas>
                        <button onClick={saveImage}>Save</button>

                    </>
                )}
            </div>
        </div>
    )
}

export default ImageCrop
