import React, { Component } from 'react';

import { FaMicrophone } from 'react-icons/fa';
import { FaStop } from 'react-icons/fa';
import styles from './styles.module.css';
const audioType = 'audio/*';

class Recorder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: {},
      seconds: 0,
      isPaused: false,

      medianotFound: false,
      audios: [],
      audioBlob: null,
    };
    this.timer = 0;
    this.startTimer = this.startTimer.bind(this);
    this.countDown = this.countDown.bind(this);
  }

  handleAudioPause(e) {
    e.preventDefault();
    clearInterval(this.timer);
    this.mediaRecorder.pause();
    this.setState({ pauseRecord: true });
  }
  handleAudioStart(e) {
    e.preventDefault();
    this.startTimer();
    this.mediaRecorder.resume();
    this.setState({ pauseRecord: false });
  }

  startTimer() {
    //if (this.timer === 0 && this.state.seconds > 0) {
    this.timer = setInterval(this.countDown, 1000);
    //}
  }

  countDown() {
    // Remove one second, set state so a re-render happens.
    let seconds = this.state.seconds + 1;
    this.setState({
      time: this.secondsToTime(seconds),
      seconds: seconds,
    });

    this.props.setTime( this.secondsToTime(seconds));
  }

  secondsToTime(secs) {
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
  }

  async componentDidMount() {
    console.log(navigator.mediaDevices);
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;
    if (navigator.mediaDevices) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.chunks = [];
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };
    } else {
      this.setState({ medianotFound: true });
      console.log('Media Decives will work only with SSL.....');
    }
  }

  startRecording(e) {
        e.preventDefault();
    console.log(e);
    if(!this.props.recording){
      
    
    // wipe old data chunks
    this.chunks = [];
    // start recorder with 10ms buffer
    this.mediaRecorder.start(10);
    this.startTimer();
    // say that we're recording
        this.props.setRecording(true);

    }


  }

  stopRecording(e) {
    console.log(e);
    
    clearInterval(this.timer);
    this.setState({ time: {}, seconds: 0 });
    e.preventDefault();
    // stop the recorder
    this.mediaRecorder.stop();
    // say that we're not recording
    this.props.setRecording(false);
    //this.setState({ recording: false });
    // save the video to memory
    this.saveAudio();
  }

  handleRest() {
    this.setState({
      time: {},
      seconds: 0,
      isPaused: false,
      medianotFound: false,
      audios: [],
      audioBlob: null,
    });
    this.props.handleRest(this.state);
  }

  saveAudio() {
    // convert saved chunks to blob
    const blob = new Blob(this.chunks, { type: audioType });
    // generate video url from blob
    const audioURL = window.URL.createObjectURL(blob);
    // append videoURL to list of saved videos for rendering
    const audios = [audioURL];
    this.setState({ audios, audioBlob: blob });

    this.props.handleAudioUpload({
      url: audioURL,
      blob: blob,
      chunks: this.chunks,
      duration: this.state.time,
    });
  }

  getBotaoGravacao = () => {
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(
      navigator.userAgent
    );
    
      if (mobile) {
    
        return (
          <a onTouchStart={(e) => this.startRecording(e)} 
         onPointerUp={(e) => this.stopRecording(e)} 
            
          href=" #">

       {!this.props.recording?    <FaMicrophone className="button-record" />:    <FaStop className="button-record" />}
        
          </a>
        );
      } else {
        return (
          <a onMouseDown={(e) => this.startRecording(e)} href=" #" onMouseUp={(e) => this.stopRecording(e)} href=" #">
            
             {!this.props.recording?    <FaMicrophone className="button-record" />:    <FaStop className="button-record" />}
          </a>
        );
      }
  
  };

  render() {
    const {  audios, time, medianotFound } = this.state;
    const { showUIAudio, audioURL } = this.props;
    return !medianotFound ? (
      <div className={styles.record_section}>
        {audioURL !== null && showUIAudio ? (
          <audio controls>
            <source src={audios[0]} type="audio/ogg" />
            <source src={audios[0]} type="audio/mpeg" />
          </audio>
        ) : null}

        {this.getBotaoGravacao()}
      </div>
    ) : (
      <p style={{ color: '#fff', marginTop: 30, fontSize: 25 }}>
        Seems the site is Non-SSL
      </p>
    );
  }
}

export default Recorder;
