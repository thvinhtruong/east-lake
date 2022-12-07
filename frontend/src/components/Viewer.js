import React, { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import styled from "styled-components";
import config from "../config/config";

const Wrapper = styled.div`
  display: block;
  margin: 0 auto;
`;

export default function Viewer() {
  const webcamRef = useRef(null);
  const [capturedImg, setCapturedImg] = useState(null);
  const [prediction, setPrediction] = useState("");

  const [isPaused, setPause] = useState(false);
  const ws = useRef(null);

  useEffect(() => {
    const client_id = Date.now();
    const url = `${config.WS_SERVER}/${client_id}`;
    console.log(url);
    ws.current = new WebSocket(url);
    ws.current.onopen = () => console.log("ws opened");
    ws.current.onclose = () => console.log("ws closed");

    return () => {
      ws.current.close();
    };
  }, []);

  useEffect(() => {
    if (!ws.current) return;

    ws.current.onmessage = (event) => {
      if (isPaused) return;
      const message = JSON.parse(event.data);
      // console.log(message);
      setCapturedImg(message.output);
      setPrediction(message.prediction);
    };
  }, [isPaused]);

  function sendMessage(msg) {
    if (!ws.current) return;

    ws.current.send(msg);
  }

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user", // Can be "environment" or "user"
  };

  const capture = useCallback(() => {
    const capturedImg = webcamRef.current.getScreenshot();
    // setCapturedImg(capturedImg);
    // console.log(capturedImg);
    sendMessage(capturedImg);
  }, [webcamRef]);

  const detect = useCallback(() => {
    setPause(false);
    const interval = setInterval(() => {
      capture();
    }, 1000);
    return () => clearInterval(interval);
  }, [capture]);

  const stop = useCallback(() => {
    setPause(true);
  })


  return (
    <Wrapper>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width="50%"
        videoConstraints={videoConstraints}

        onUserMediaError={(error) => {
          console.log(error);

          if (error.name === "NotAllowedError") {
            setPause(true);

            alert(
              "Please allow camera access to use this app"
            );
          }
        }}

  
      />



      <p>
        <button onClick={detect}>Detect</button>
      </p>

      <p>
        <button onClick={stop}>Stop</button>
      </p>
      {capturedImg && (
        <img alt="Captured image" src={capturedImg} width="50%" />
      )}

      <h3>{"Class:" + prediction && prediction}</h3>
    </Wrapper>
  );
}
