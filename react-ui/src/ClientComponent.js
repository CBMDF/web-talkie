import React, { useEffect, useState } from "react";
import ReactAudioPlayer from "react-audio-player";
import Recorder from "./Recorder";

import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";

import {
  initiateSocket,
  disconnectSocket,
  subscribeToChat,
  sendMessage,
  subscribeToQtd,
  subscribeToError,
  subscribeToReconnect,
  person,
} from "./Socket";

export default function ClientComponent() {
  const rooms = [1, 2, 3];
  const [room, setRoom] = useState(rooms[0]);
  const [chat, setChat] = useState([]);
  const [conectado, setConectado] = useState(false);
  const [qtdCanal, setQtdCanal] = useState(0);
  const [time, setTime] = useState({});
  const [online, setOnline] = useState(window.navigator.onLine);

  const [recording, setRecording] = useState(false);

  const [audioDetails, setAudioDetails] = useState({
    url: null,
    blob: null,
    chunks: null,
    duration: {
      h: 0,
      m: 0,
      s: 0,
    },
    played: false,
  });

  useEffect(() => {
    if (room) {
      initiateSocket(room);
      setConectado(true);
    }
    window.addEventListener("offline", handleNetworkChange);
    window.addEventListener("online", handleNetworkChange);

    subscribeToChat((err, data) => {
      if (err) {
        console.log(err);
        return;
      }

      if (person !== data.person) {
        data.message.played = false;
      } else {
        data.message.played = true;
        data.message.samePerson = true;
      }

      setChat((oldChats) => [data.message, ...oldChats]);
    });

    subscribeToQtd((err, data) => {
      if (err) {
        console.log(err);
        return;
      }

      // console.log('data', data);
      setQtdCanal(data.length);
    });

    subscribeToError((err, data) => {
      if (err) {
        return;
      }

      console.log("data2", data);
      setConectado(false);
    });

    subscribeToReconnect((err, data) => {
      if (err) {
        return;
      }

      setConectado(true);
    });
    return () => {
      disconnectSocket(room);
      setConectado(false);
      window.removeEventListener("offline", handleNetworkChange);
      window.removeEventListener("online", handleNetworkChange);
    };
  }, [room]);

  let handleNetworkChange = () => {
    setOnline(window.navigator.onLine);
  };

  let handleAudioUpload = (file) => {
    console.log(file);
    sendMessage(room, file);

    //  handleReset();

    // socket.disconnect();
  };
  let handleReset = () => {
    const reset = {
      url: null,
      blob: null,
      chunks: null,
      duration: {
        h: 0,
        m: 0,
        s: 0,
      },
    };
    setAudioDetails(reset);
    //this.setState({ audioDetails: reset });
  };

  //console.log('audioResposta', audioResposta);

  const getUltimosCincoAudios = () => {
    if (recording) {
      return;
    }

    if (chat.length > 0) {
      let arrayAudio = chat.map((audio, i) => {
        if (i > 3) {
          // eslint-disable-next-line
          return;
        }
        let autoPlay = false;
        if (!audio.played) {
          autoPlay = true;
          chat[i].played = true;
        }

        const blob = new Blob(audio.chunks, { type: "audio/*" });
        // generate video url from blob
        const audioURL = window.URL.createObjectURL(blob);

        let float = "left";

        if (chat[i].samePerson) {
          float = "right";
        }

        return (
          <div style={{ float: float }} key={Math.random()}>
            <ReactAudioPlayer
              key={audioURL}
              src={audioURL}
              autoPlay={autoPlay}
              controls
            />
          </div>
        );
      });

      console.log(arrayAudio);
      return arrayAudio;
    }
  };

  const setRooms = (r) => {
    setRoom(r);
    handleReset();
    setChat([]);
  };

  const getConectado = () => {
    if (conectado) {
      return "Conectado";
    } else {
      return "Desconectado";
    }
  };

  return (
    <React.Fragment>
      <div id="wrapper" onContextMenu={(e) => e.preventDefault()}>
        <div id="device-case">
          <div id="brand"></div>
          <div id="lcd-display">
            {online ? "bla" : "blu"}
            <div id="battery">
              Tempo gravação:
              {time.m !== undefined
                ? `${time.m <= 9 ? "0" + time.m : time.m}`
                : "00"}
              :
              {time.s !== undefined
                ? `${time.s <= 9 ? "0" + time.s : time.s}`
                : "00"}
            </div>
            <div id="status">{getConectado()}</div>
            <div id="users">{qtdCanal} usuário(s)</div>
            <div id="channel">Canal {room}</div>
          </div>
          <div className="buttons-container">
            <ul>
              <li
                onClick={() => {
                  if (room < 90) {
                    setRooms(room + 1);
                  }
                }}
              >
                <KeyboardArrowUpIcon
                  style={{ color: "#c0c0c0", fontSize: "300%" }}
                />
              </li>
              <li
                onClick={() => {
                  if (room > 1) {
                    setRooms(room - 1);
                  }
                }}
              >
                <KeyboardArrowDownIcon
                  style={{ color: "#c0c0c0", fontSize: "300%" }}
                />
              </li>

              {rooms.map((r, i) => (
                <li
                  className="fa fa-angle-up"
                  onClick={() => setRooms(r)}
                  key={i}
                >
                  {/* eslint-disable-next-line */}
                  <a href="#">{r}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Recorder
              record={true}
              title={"CBMDF Recording"}
              audioURL={audioDetails.url}
              showUIAudio
              handleAudioUpload={(data) => handleAudioUpload(data)}
              handleReset={() => handleReset()}
              recording={recording}
              setRecording={setRecording}
              time={time}
              setTime={setTime}
            />
          </div>
          <div id="audio-history">{getUltimosCincoAudios()}</div>
        </div>
      </div>
    </React.Fragment>
  );
}
