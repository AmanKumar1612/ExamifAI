/* global faceapi */
import React, { useEffect, useRef, useState } from 'react';

const FaceRecognition = ({ onAuthenticated }) => {
  const videoRef = useRef();
  const [status, setStatus] = useState("Initializing...");

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => {
        console.error("Camera access error:", err);
        setStatus("Camera access denied.");
      });
  };

  const waitForFaceApi = (callback) => {
    const check = () => {
      if (window.faceapi) {
        callback(window.faceapi);
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  };

  const loadLabeledImages = (faceapi, callback) => {
    const label = "Aman";
    const imgUrl = `/reference/${label}.jpg`;

    faceapi.fetchImage(imgUrl).then((img) => {
      faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()
        .then((detection) => {
          if (!detection) {
            throw new Error("No face found in reference image");
          }
          const descriptor = new faceapi.LabeledFaceDescriptors(label, [detection.descriptor]);
          callback(descriptor);
        })
        .catch((err) => {
          console.error("Error processing reference image:", err);
          setStatus("Reference face processing failed.");
        });
    });
  };

  useEffect(() => {
    waitForFaceApi((faceapi) => {
      setStatus("Loading face detection models...");

      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
      ]).then(() => {
        startVideo();

        loadLabeledImages(faceapi, (labeledDescriptors) => {
          const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

          videoRef.current.addEventListener('play', () => {
            setStatus("Detecting face...");
            const canvas = faceapi.createCanvasFromMedia(videoRef.current);
            document.body.append(canvas);

            const displaySize = {
              width: videoRef.current.width,
              height: videoRef.current.height
            };
            faceapi.matchDimensions(canvas, displaySize);

            const interval = setInterval(() => {
              faceapi
                .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptors()
                .then((detections) => {
                  const resized = faceapi.resizeResults(detections, displaySize);
                  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                  faceapi.draw.drawDetections(canvas, resized);

                  if (detections.length > 0) {
                    const bestMatch = faceMatcher.findBestMatch(detections[0].descriptor);
                    setStatus(`Detected: ${bestMatch.label}`);

                    if (bestMatch.label === "Aman") {
                      clearInterval(interval);
                      canvas.remove();
                      setStatus("Face verified! Starting exam...");
                      onAuthenticated();
                    } else {
                      setStatus("Face not recognized.");
                    }
                  }
                });
            }, 1000);
          });
        });
      }).catch((err) => {
        console.error("Model loading failed:", err);
        setStatus("Model loading failed.");
      });
    });
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: 40 }}>
      <h2>Face Authentication</h2>
      <p>{status}</p>
      <video ref={videoRef} autoPlay muted width="480" height="360" />
    </div>
  );
};

export default FaceRecognition;
