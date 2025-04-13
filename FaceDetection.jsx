import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const FaceDetect = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [expression, setExpression] = useState("Detecting...");

  // Load models from public/models
  const loadModels = async () => {
    const MODEL_URL = "/models"; // Use relative path for Vite
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
  };

  // Start webcam
  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => {
        console.error("Error starting video: ", err);
      });
  };

  // Detect expressions
  const detectFace = async () => {
    const video = videoRef.current;
    if (!video || video.readyState !== 4) return;

    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    const canvas = canvasRef.current;
    const displaySize = {
      width: video.videoWidth,
      height: video.videoHeight,
    };

    faceapi.matchDimensions(canvas, displaySize);

    const resized = faceapi.resizeResults(detections, displaySize);

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resized);
    faceapi.draw.drawFaceExpressions(canvas, resized);

    if (detections.length > 0) {
      const expr = detections[0].expressions;
      const sorted = Object.entries(expr).sort((a, b) => b[1] - a[1]);
      setExpression(sorted[0][0]);
    } else {
      setExpression("No face");
    }
  };

  useEffect(() => {
    loadModels().then(startVideo);

    const interval = setInterval(() => {
      detectFace();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>🧠 Expression: {expression}</h2>
      <div style={{ position: "relative", display: "inline-block" }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          width="400"
          height="300"
          style={{ borderRadius: "12px" }}
        />
        <canvas
          ref={canvasRef}
          width="400"
          height="300"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            borderRadius: "12px",
          }}
        />
      </div>
    </div>
  );
};

export default FaceDetect;
