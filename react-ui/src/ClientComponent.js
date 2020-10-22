import React, { useEffect, useState } from "react";
import TuneIcon from "@material-ui/icons/Tune";
import ReactAudioPlayer from "react-audio-player";
import Recorder from "./Recorder";
import useSound from "use-sound";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Alert from "@material-ui/lab/Alert";
import DialogTitle from "@material-ui/core/DialogTitle";
import rogerSound from "./assets/roger.mp3";
import TextField from "@material-ui/core/TextField";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Collapse from "@material-ui/core/Collapse";
import CloseIcon from "@material-ui/icons/Close";
import { makeStyles } from "@material-ui/core/styles";
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

let chats = [];

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
}));
export default function ClientComponent() {
  const classes = useStyles();
  const [playRoger] = useSound(rogerSound, { volume: 1 });
  const rooms = [1, 2, 3];
  const [room, setRoom] = useState(rooms[0]);
  const [chat, setChat] = useState([]);
  const [conectado, setConectado] = useState(false);
  const [qtdCanal, setQtdCanal] = useState(0);
  const [time, setTime] = useState({});
  const [online, setOnline] = useState(window.navigator.onLine);
  const [alertMaxSize, setAlertMaxSize] = useState(false);
  const [open, setOpen] = React.useState(
    localStorage.getItem("apelido") ? true : false
  );
  const [recording, setRecording] = useState(false);
  const [apelido, setApelido] = useState(
    localStorage.getItem("apelido") === null
      ? localStorage.getItem("apelido")
      : ""
  );

  console.log(localStorage.getItem("apelido"));
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
    localStorage.setItem("apelido", null);
  };
  const handleClose = () => {
    setOpen(false);
    localStorage.setItem("apelido", apelido);
  };
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
    function pollDOM(message) {
      if (!isPlaying()) {
        // Do something with el]
        setChat((oldChats) => [message, ...oldChats]);
        chats.unshift(message);
      } else {
        setTimeout(() => {
          pollDOM(message);
        }, 500); // try again in 300 milliseconds
      }
    }
    subscribeToChat((err, data) => {
      console.log(data);
      if (err) {
        console.log(err);
        return;
      }
      data.message.apelido = data.apelido;

      if (person !== data.person) {
        data.message.played = false;
      } else {
        data.message.played = true;
        data.message.samePerson = true;
      }
      pollDOM(data.message);
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

      setQtdCanal(0);
      setConectado(false);
    });

    subscribeToReconnect((err, data) => {
      if (err) {
        return;
      }

      setConectado(true);
    }, room);
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
    sendMessage(room, file, apelido);

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

  const audioGain = (e) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioElement = document.getElementById(e.target.id);
    const gainNode = audioCtx.createGain();
    const source = audioCtx.createMediaElementSource(audioElement);
    source.connect(gainNode);
    gainNode.gain.setValueAtTime(2, audioCtx.currentTime);
    gainNode.connect(audioCtx.destination);
  };

  const isPlaying = () => {
    let isPlaying = false;
    /* eslint-disable-next-line */
    chats.map((audio) => {
      if (audio.played === false) {
        isPlaying = true;
      }
    });

    return isPlaying;
  };

  const onEnded = (e) => {
    playRoger();

    chats[e.srcElement.id].played = true;
  };

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
        }

        const blob = new Blob(audio.chunks, { type: "audio/*" });
        // generate video url from blob
        const audioURL = window.URL.createObjectURL(blob);

        let float = "left";
        let audioBorderClass = "";
        let nickNameClass = "";
        let apresentacaoApelido;
        if (chat[i].samePerson) {
          float = "right";
          audioBorderClass = "samePerson";
        } else {
          apresentacaoApelido = audio.apelido ? audio.apelido : "Sem apelido";
          nickNameClass = "nickName";
        }

        return (
          <div style={{ float: float }} key={Math.random()}>
            <div className={nickNameClass}>{apresentacaoApelido}</div>
            <ReactAudioPlayer
              onPlay={audioGain}
              onEnded={onEnded}
              key={audioURL}
              src={audioURL}
              autoPlay={autoPlay}
              controls={true}
              volume={1.0}
              id={i.toString()}
              className={audioBorderClass}
            />
          </div>
        );
      });

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
      <Dialog
        open={open}
        onClose={handleCancel}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Configurações</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="meuApelido"
            label="Informe o apelido"
            type="text"
            fullWidth
            value={apelido}
            onChange={(e) => setApelido(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleClose} color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
      <div id="wrapper" onContextMenu={(e) => e.preventDefault()}>
        <div id="device-case">
          <Collapse in={alertMaxSize}>
            <Alert
              severity="error"
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setAlertMaxSize(false);
                  }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              A gravação não pode ultrapassar de 30 segundos.
            </Alert>
          </Collapse>
          <div id="brand">
            {" "}
            <TuneIcon
              style={{ fontSize: 40, float: "left" }}
              onClick={handleClickOpen}
            />
          </div>
          <div id="lcd-display" className={online ? "" : "offline"}>
            <div id="status">{getConectado()}</div>
            <div id="users">{qtdCanal} usuário(s)</div>
            <div id="channel">Canal {room}</div>
            <div id="record">
              Gravação:
              {time.m !== undefined
                ? `${time.m <= 9 ? "0" + time.m : time.m}`
                : "00"}
              :
              {time.s !== undefined
                ? `${time.s <= 9 ? "0" + time.s : time.s}`
                : "00"}
            </div>
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
              setAlertMaxSize={setAlertMaxSize}
            />
          </div>
          <div id="audio-history">{getUltimosCincoAudios()}</div>
        </div>
      </div>
    </React.Fragment>
  );
}
