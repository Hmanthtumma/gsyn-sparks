import React, { useEffect, useRef, useState } from "react";
import { FilesetResolver, FaceLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";

const HiddenCamEmotion = ({ onEmotionDetected }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [emotion, setEmotion] = useState("Detecting...");
  let faceLandmarker;

  const initMediaPipe = async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: "GPU",
      },
      outputFaceBlendshapes: false,
      runningMode: "VIDEO",
    });

    startVideo();
  };

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current.play();
            detectFaces();
          } catch (err) {
            console.error("Video play error:", err);
          }
        };
      })
      .catch((err) => console.error("Camera error:", err));
  };

  const detectFaces = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const drawLoop = async () => {
      if (!videoRef.current.paused && !videoRef.current.ended) {
        const results = await faceLandmarker.detectForVideo(videoRef.current, Date.now());

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (results?.faceLandmarks?.length > 0) {
          const drawingUtils = new DrawingUtils(ctx);
          for (const landmarks of results.faceLandmarks) {
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, {
              color: "#00FF00",
              lineWidth: 1,
            });

            const detectedEmotion = getEmotionFromLandmarks(landmarks);
            setEmotion(detectedEmotion);

            // Pass the detected emotion to the parent component
            if (onEmotionDetected) {
              onEmotionDetected(detectedEmotion);
            }

            // If the user is sleepy, alert the user to stay awake
            if (detectedEmotion === "Sleepy 😴") {
              alert("Don't sleep, listen!");
            }
          }
        }

        requestAnimationFrame(drawLoop);
      }
    };

    drawLoop();
  };

  const getEmotionFromLandmarks = (landmarks) => {
    const topLip = landmarks[13];
    const bottomLip = landmarks[14];
    const leftEye = landmarks[159];
    const bottomEye = landmarks[145];

    const mouthGap = Math.abs(bottomLip.y - topLip.y);
    const eyeOpen = Math.abs(bottomEye.y - leftEye.y);

    if (mouthGap > 0.05 && eyeOpen > 0.03) return "Happy 😊";
    if (eyeOpen < 0.01) return "Sleepy 😴";
    if (mouthGap < 0.02) return "Neutral 😐";
    return "Thinking 🤔";
  };

  useEffect(() => {
    initMediaPipe();
  }, []);

  return (
    <div>
      <video ref={videoRef} width="0" height="0" muted style={{ display: "none" }} />
      <canvas ref={canvasRef} width="0" height="0" style={{ display: "none" }} />
      {emotion && (
        <div
          style={{
            position: "fixed",
            bottom: "10px",
            right: "10px",
            background: "rgba(0,0,0,0.6)",
            color: "#fff",
            padding: "4px 10px",
            borderRadius: "10px",
            fontSize: "0.8rem",
            zIndex: 9999,
          }}
        >
          {emotion}
        </div>
      )}
    </div>
  );
};

export default HiddenCamEmotion;
