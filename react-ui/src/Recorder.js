import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FaMicrophone } from "react-icons/fa";
import { FaStop } from "react-icons/fa";
import useSound from "use-sound";

import startSound from "./assets/start.mp3";
import endSound from "./assets/roger.mp3";

import styles from "./styles.module.css";
const audioType = "audio/*";
let chunks = [];
let timer = 0;
let seconds = 0;

const Recorder = (props) => {
  const [time, setTime] = useState({});
  const [playStart] = useSound(startSound);
  const [playEnd] = useSound(endSound);

  const [medianotFound, setMedianotFound] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(false);

  useEffect(() => {
    async function getMedia() {
      navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;

      if (navigator.mediaDevices) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        let mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };
        setMediaRecorder(mediaRecorder);
      } else {
        setMedianotFound(true);

        console.log("Media Devices will work only with SSL.....");
      }
    }
    getMedia();
  }, []);

  const startTimer = () => {
    timer = setInterval(countDown, 1000);
  };

  const countDown = () => {
    // Remove one second, set state so a re-render happens.
    seconds = seconds + 1;

    props.setTime(secondsToTime(seconds));
  };

  const secondsToTime = (secs) => {
    let hours = Math.floor(secs / (60 * 60));

    let divisor_for_minutes = secs % (60 * 60);
    let minutes = Math.floor(divisor_for_minutes / 60);

    let divisor_for_seconds = divisor_for_minutes % 60;
    let seconds = Math.ceil(divisor_for_seconds);

    let obj = {
      h: hours,
      m: minutes,
      s: seconds,
    };
    return obj;
  };

  const startRecording = (e) => {
    playStart();
    setTimeout(() => {
      if (!props.recording) {
        // wipe old data chunks
        chunks = [];
        // start recorder with 10ms buffer
        mediaRecorder.start(10);
        startTimer();
        // say that we're recording
        props.setRecording(true);
      }
    }, 700);
  };

  const stopRecording = (e) => {
    clearInterval(timer);
    setTime({});

    if (mediaRecorder.state === "recording") {
      // stop the recorder
      mediaRecorder.stop();
    }

    // say that we're not recording
    props.setRecording(false);
    //this.setState({ recording: false });
    // save the video to memory

    if (seconds > 0 && seconds < 31) {
      saveAudio();

      playEnd();
    }
    if (seconds > 30) {
      props.setAlertMaxSize(true);
    }
    seconds = 0;
  };

  const saveAudio = () => {
    // convert saved chunks to blob
    const blob = new Blob(chunks, { type: audioType });
    // generate video url from blob
    const audioURL = window.URL.createObjectURL(blob);
    // append videoURL to list of saved videos for rendering
    // const audios = [audioURL];
    // this.setState({ audios, audioBlob: blob });

    props.handleAudioUpload({
      url: audioURL,
      blob: blob,
      chunks: chunks,
      duration: time,
    });
  };

  const getBotaoGravacao = () => {
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(
      navigator.userAgent
    );

    if (mobile) {
      return (
        <button aria-label="Inicia/Termina Gravação" className="button-record">
          {!props.recording ? (
            <FaMicrophone
              onTouchStart={(e) => startRecording(e)}
              onPointerUp={(e) => stopRecording(e)}
            />
          ) : (
            <FaStop
              onTouchStart={(e) => startRecording(e)}
              onPointerUp={(e) => stopRecording(e)}
            />
          )}
        </button>
      );
    } else {
      return (
        <button
          aria-label="Inicia/Termina Gravação"
          className="button-record"
          onMouseDown={(e) => startRecording(e)}
          onMouseUp={(e) => stopRecording(e)}
        >
          {!props.recording ? <FaMicrophone /> : <FaStop />}
        </button>
      );
    }
  };

  return !medianotFound ? (
    <div className={styles.record_section}>{getBotaoGravacao()}</div>
  ) : (
    <p style={{ color: "#fff", marginTop: 30, fontSize: 25 }}>
      Seems the site is Non-SSL
    </p>
  );
};

Recorder.propTypes = {
  recording: PropTypes.bool.isRequired,
  setRecording: PropTypes.func,
  setTime: PropTypes.func,
  handleAudioUpload: PropTypes.func,
  handleReset: PropTypes.func,
  audioURL: PropTypes.string,
  showUIAudio: PropTypes.bool,
  setAlertMaxSize: PropTypes.func,
};

export default Recorder;
