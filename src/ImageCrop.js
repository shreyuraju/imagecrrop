import React, { useRef, useState, useCallback, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ImageCrop = () => {
    const imgRef = useRef(null);
    const canvasRef = useRef(null);

    const [image, setImage] = useState(null);
    const [crop, setCrop] = useState({ aspect: 1 });
    const [croppedImage, setCroppedImage] = useState(null);
    const [anchorEls, setAnchorEls] = useState([null, null]); // Individual anchorEl state for each button
    const [popovers, setPopovers] = useState([false, false]); // Individual popover state for each button

    const handleImageChanged = (index, event) => {
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
            const newAnchorEls = [...anchorEls];
            newAnchorEls[index] = event.currentTarget; // Set anchorEl for the clicked button
            setAnchorEls(newAnchorEls);
        }
    };

    const handleOnLoad = useCallback((event) => {
        imgRef.current = event.target;
    }, []);

    const saveImage = (fileName, i) => {
        if (!croppedImage || !canvasRef.current) return;

        canvasRef.current.toBlob((blob) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${fileName}.png`;
            link.click();
            window.URL.revokeObjectURL(url);
        });
        clear(i)
    };

    const clear = (index) => {
        setImage(null);
        setCroppedImage(null);
        setCrop({ aspect: 1 });
        const newPopovers = [...popovers];
        newPopovers[index] = false;
        setPopovers(newPopovers);
        const fileInput = document.getElementById(`fileInput${index}`);
        if (fileInput) {
            fileInput.value = '';
        }
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = 0; // Clear the canvas
            canvas.height = 0; // Clear the canvas
        }
    };

    const handleClose = (index) => {
        const newPopovers = [...popovers];
        newPopovers[index] = false;
        setPopovers(newPopovers);
        const newAnchorEls = [...anchorEls];
        newAnchorEls[index] = null;
        setAnchorEls(newAnchorEls);
        clear(index);
    };

    const handleButtonClick = (event, index) => {
        const newPopovers = [...popovers];
        newPopovers[index] = true;
        setPopovers(newPopovers);
        const newAnchorEls = [...anchorEls];
        newAnchorEls[index] = event.currentTarget;
        setAnchorEls(newAnchorEls);
        const fileInput = document.getElementById(`fileInput${index}`);
        if (fileInput) fileInput.click();
    };

    useEffect(() => {
        if (!croppedImage || !imgRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const image = imgRef.current;
        const { width, height, x, y } = croppedImage;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const pixelRatio = window.devicePixelRatio;

        canvas.width = width * scaleX * pixelRatio;
        canvas.height = height * scaleY * pixelRatio;

        const ctx = canvas.getContext('2d');
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            image,
            x * scaleX,
            y * scaleY,
            width * scaleX,
            height * scaleY,
            0,
            0,
            width * scaleX,
            height * scaleY
        );
    }, [croppedImage]);

    return (
        <div>
            <Button
                variant="contained"
                onClick={(e) => handleButtonClick(e, 0)}
            >
                Upload Question Image
            </Button>
            <input
                type="file"
                id="fileInput0"
                accept="image/*"
                onChange={(e) => handleImageChanged(0, e)}
                hidden
            />
            <Popover
                open={popovers[0]}
                anchorEl={anchorEls[0]}
                onClose={() => handleClose(0)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <Typography sx={{ p: 2, maxWidth: 1440 }}>
                    <div>
                        <div>
                            <Button onClick={() => clear(0)}>Clear</Button>
                            {croppedImage && (
                                <Button onClick={() => saveImage('quesImg',0)}>
                                    Upload Crop
                                </Button>
                            )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', overflow: 'hidden' }}>
                            <div style={{ width: '200%', position: 'relative' }}>
                                {image && (
                                    <ReactCrop
                                        crop={crop}
                                        onChange={setCrop}
                                        onComplete={setCroppedImage}
                                        // minWidth={100}
                                        // minHeight={100}
                                        grid={[10, 10]}
                                        style={{ width: '100%', height: 'auto' }}
                                    >
                                        <img
                                            src={image}
                                            alt="Crop me"
                                            onLoad={handleOnLoad}
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </ReactCrop>
                                )}
                            </div>
                            <div style={{ width: '60%', overflow: 'hidden', marginLeft: '10px', position: 'relative' }}>

                                {croppedImage && <>Cropped Image<canvas ref={(canvas) => { canvasRef.current = canvas; }} style={{ width: '100%', height: 'auto' }}></canvas></>}
                            </div>
                        </div>
                    </div>
                </Typography>
            </Popover>

            <Button
                variant="contained"
                onClick={(e) => handleButtonClick(e, 1)}
            >
                Upload Question Image
            </Button>
            <input
                type="file"
                id="fileInput1"
                accept="image/*"
                onChange={(e) => handleImageChanged(1, e)}
                hidden
            />
            <Popover
                open={popovers[1]}
                anchorEl={anchorEls[1]}
                onClose={() => handleClose(1)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <Typography sx={{ p: 2, maxWidth: 1440 }}>
                    <div>
                        <div>
                            <Button onClick={() => clear(1)}>Clear</Button>
                            {croppedImage && (
                                <Button onClick={() => saveImage('expImg',1)}>
                                    Upload Crop
                                </Button>
                            )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', overflow: 'hidden' }}>
                            <div style={{ width: '200%', position: 'relative' }}>
                                {image && (
                                    <ReactCrop
                                        crop={crop}
                                        onChange={setCrop}
                                        onComplete={setCroppedImage}
                                        // minWidth={100}
                                        // minHeight={100}
                                        grid={[10, 10]}
                                        style={{ width: '100%', height: 'auto' }}
                                    >
                                        <img
                                            src={image}
                                            alt="Crop me"
                                            onLoad={handleOnLoad}
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </ReactCrop>
                                )}
                            </div>
                            <div style={{ width: '60%', overflow: 'hidden', marginLeft: '10px', position: 'relative' }}>

                                {croppedImage && <>Cropped Image<canvas ref={(canvas) => { canvasRef.current = canvas; }} style={{ width: '100%', height: 'auto' }}></canvas></>}
                            </div>
                        </div>
                    </div>
                </Typography>
            </Popover>
        </div>
    );
};

export default ImageCrop;