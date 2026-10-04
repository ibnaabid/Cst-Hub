"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useParams,
  useSearchParams,
  useRouter,
} from "next/navigation";

import { io } from "socket.io-client";

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  PhoneOff,
  Copy,
  Check,
  SwitchCamera,
  Users,
  Send,
  Wifi,
  WifiOff,
} from "lucide-react";

import toast from "react-hot-toast";

/* =====================================================
   SOCKET SERVER
===================================================== */

/*
  LOCAL:
  http://localhost:8000

  PRODUCTION:
  এখানে Render/Railway backend URL দিবে।

  IMPORTANT:
  Vercel URL ব্যবহার করবে না যদি সেখানে persistent
  Socket.IO server না থাকে।
*/

const SOCKET_SERVER_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:8000";

/* =====================================================
   WEBRTC CONFIG
===================================================== */

const rtcConfiguration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    {
      urls: "stun:global.stun.twilio.com:3478",
    },
  ],
};

/* =====================================================
   COMPONENT
===================================================== */

export default function StudyRoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomId = String(params.roomId || "");

  const topic =
    searchParams.get("topic") || "General Discussion";

  const subject =
    searchParams.get("subject") || "Study Session";

  /* =====================================================
     STATES
  ===================================================== */

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const [facingMode, setFacingMode] = useState("user");

  const [isConnected, setIsConnected] = useState(false);

  const [hasMedia, setHasMedia] = useState(false);

  const [participantCount, setParticipantCount] = useState(1);

  const [copied, setCopied] = useState(false);

  const [isRoomFull, setIsRoomFull] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: "System",
      text: `Welcome to CST HUB Study Room! Topic: ${topic}`,
      system: true,
    },
  ]);

  const [inputMsg, setInputMsg] = useState("");

  /* =====================================================
     REFS
  ===================================================== */

  const socketRef = useRef(null);

  const localStreamRef = useRef(null);

  const peerConnectionRef = useRef(null);

  const remoteSocketIdRef = useRef(null);

  const userVideoRef = useRef(null);

  const peerVideoRef = useRef(null);

  /* =====================================================
     CLEAN MEDIA
  ===================================================== */

  const stopLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      localStreamRef.current = null;
    }

    if (userVideoRef.current) {
      userVideoRef.current.srcObject = null;
    }

    setHasMedia(false);
  }, []);

  /* =====================================================
     CREATE PEER CONNECTION
  ===================================================== */

  const createPeerConnection = useCallback(
    (remoteSocketId, socketInstance) => {
      const pc = new RTCPeerConnection(
        rtcConfiguration
      );

      remoteSocketIdRef.current = remoteSocketId;

      /* =========================
         LOCAL ICE
      ========================= */

      pc.onicecandidate = (event) => {
        if (!event.candidate) {
          return;
        }

        socketInstance.emit("ice-candidate", {
          target: remoteSocketId,
          candidate: event.candidate,
        });
      };

      /* =========================
         REMOTE TRACK
      ========================= */

      pc.ontrack = (event) => {
        console.log("Remote track received");

        if (peerVideoRef.current) {
          peerVideoRef.current.srcObject =
            event.streams[0];
        }
      };

      /* =========================
         CONNECTION STATE
      ========================= */

      pc.onconnectionstatechange = () => {
        console.log(
          "WebRTC:",
          pc.connectionState
        );

        if (
          pc.connectionState === "connected"
        ) {
          toast.success("Student connected!");
        }

        if (
          pc.connectionState === "failed"
        ) {
          toast.error(
            "Video connection failed"
          );
        }

        if (
          pc.connectionState ===
            "disconnected" ||
          pc.connectionState === "closed"
        ) {
          if (peerVideoRef.current) {
            peerVideoRef.current.srcObject =
              null;
          }
        }
      };

      return pc;
    },
    []
  );

  /* =====================================================
     ADD LOCAL TRACKS
  ===================================================== */

  const addLocalTracks = useCallback(
    (pc) => {
      const stream =
        localStreamRef.current;

      if (!stream) {
        return;
      }

      const existingSenders =
        pc.getSenders();

      stream.getTracks().forEach((track) => {
        const alreadyExists =
          existingSenders.some(
            (sender) =>
              sender.track?.kind ===
              track.kind
          );

        if (!alreadyExists) {
          pc.addTrack(track, stream);
        }
      });
    },
    []
  );

  /* =====================================================
     START CAMERA
  ===================================================== */

  const startCamera = useCallback(
    async (mode = "user") => {
      try {
        /*
          Stop previous camera
        */

        if (localStreamRef.current) {
          localStreamRef.current
            .getTracks()
            .forEach((track) =>
              track.stop()
            );
        }

        /*
          Get new camera
        */

        const mediaStream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: {
                facingMode: {
                  ideal: mode,
                },
                width: {
                  ideal: 1280,
                },
                height: {
                  ideal: 720,
                },
              },
              audio: true,
            }
          );

        localStreamRef.current =
          mediaStream;

        setHasMedia(true);

        setIsVideoOn(true);

        setIsMicOn(true);

        /*
          Show own video
        */

        if (userVideoRef.current) {
          userVideoRef.current.srcObject =
            mediaStream;
        }

        /*
          Existing WebRTC connection
        */

        const pc =
          peerConnectionRef.current;

        if (pc) {
          const videoTrack =
            mediaStream.getVideoTracks()[0];

          const audioTrack =
            mediaStream.getAudioTracks()[0];

          const videoSender =
            pc
              .getSenders()
              .find(
                (sender) =>
                  sender.track?.kind ===
                  "video"
              );

          const audioSender =
            pc
              .getSenders()
              .find(
                (sender) =>
                  sender.track?.kind ===
                  "audio"
              );

          /*
            Replace video
          */

          if (
            videoSender &&
            videoTrack
          ) {
            await videoSender.replaceTrack(
              videoTrack
            );
          } else if (videoTrack) {
            pc.addTrack(
              videoTrack,
              mediaStream
            );
          }

          /*
            Replace audio
          */

          if (
            audioSender &&
            audioTrack
          ) {
            await audioSender.replaceTrack(
              audioTrack
            );
          } else if (audioTrack) {
            pc.addTrack(
              audioTrack,
              mediaStream
            );
          }
        }

        return mediaStream;
      } catch (cameraError) {
        console.warn(
          "Camera failed:",
          cameraError
        );

        /*
          Try audio only
        */

        try {
          const audioStream =
            await navigator.mediaDevices.getUserMedia(
              {
                video: false,
                audio: true,
              }
            );

          localStreamRef.current =
            audioStream;

          setHasMedia(true);

          setIsVideoOn(false);

          setIsMicOn(true);

          if (userVideoRef.current) {
            userVideoRef.current.srcObject =
              audioStream;
          }

          toast(
            "Camera পাওয়া যায়নি — শুধু microphone চালু হয়েছে",
            {
              icon: "🎤",
            }
          );

          return audioStream;
        } catch (audioError) {
          console.warn(
            "Audio failed:",
            audioError
          );

          setHasMedia(false);

          setIsVideoOn(false);

          setIsMicOn(false);

          toast.error(
            "Camera/Microphone permission পাওয়া যায়নি"
          );

          return null;
        }
      }
    },
    []
  );

  /* =====================================================
     SWITCH FRONT / BACK CAMERA
  ===================================================== */

  const switchCamera = async () => {
    const newMode =
      facingMode === "user"
        ? "environment"
        : "user";

    const stream =
      await startCamera(newMode);

    if (stream) {
      setFacingMode(newMode);

      toast.success(
        newMode === "user"
          ? "Front camera চালু হয়েছে"
          : "Back camera চালু হয়েছে"
      );
    }
  };

  /* =====================================================
     INITIALIZE ROOM
  ===================================================== */

  useEffect(() => {
    if (!roomId) {
      return;
    }

    let mounted = true;

    let socketInstance = null;

    const initRoom = async () => {
      /*
        1. Camera
      */

      await startCamera("user");

      if (!mounted) {
        return;
      }

      /*
        2. Socket
      */

      socketInstance = io(
        SOCKET_SERVER_URL,
        {
          transports: [
            "websocket",
            "polling",
          ],

          reconnection: true,

          reconnectionAttempts: 5,

          reconnectionDelay: 1000,
        }
      );

      socketRef.current =
        socketInstance;

      /* =========================
         CONNECT
      ========================= */

      socketInstance.on(
        "connect",
        () => {
          console.log(
            "Socket connected:",
            socketInstance.id
          );

          setIsConnected(true);

          toast.success(
            "Study server connected"
          );

          socketInstance.emit(
            "join-study-room",
            roomId
          );
        }
      );

      /* =========================
         CONNECT ERROR
      ========================= */

      socketInstance.on(
        "connect_error",
        (error) => {
          console.error(
            "Socket connection error:",
            error
          );

          setIsConnected(false);

          toast.error(
            "Study server connection failed"
          );
        }
      );

      /* =========================
         ROOM FULL
      ========================= */

      socketInstance.on(
        "room-full",
        () => {
          setIsRoomFull(true);

          toast.error(
            "এই Study Room ইতিমধ্যে full!"
          );
        }
      );

      /* =========================
         ROOM USERS
      ========================= */

      socketInstance.on(
        "room-users",
        ({ users }) => {
          console.log(
            "Existing users:",
            users
          );

          setParticipantCount(
            users.length + 1
          );

          /*
            IMPORTANT:

            Existing user will receive
            user-connected and create offer.

            New user waits for offer.
          */
        }
      );

      /* =========================
         USER CONNECTED
      ========================= */

      socketInstance.on(
        "user-connected",
        async ({
          socketId: remoteSocketId,
        }) => {
          console.log(
            "New student:",
            remoteSocketId
          );

          remoteSocketIdRef.current =
            remoteSocketId;

          setParticipantCount(2);

          toast.success(
            "নতুন একজন student যুক্ত হয়েছে!"
          );

          /*
            Create peer
          */

          if (
            peerConnectionRef.current
          ) {
            peerConnectionRef.current.close();
          }

          const pc =
            createPeerConnection(
              remoteSocketId,
              socketInstance
            );

          peerConnectionRef.current =
            pc;

          /*
            Add camera/mic
          */

          addLocalTracks(pc);

          /*
            Create offer
          */

          const offer =
            await pc.createOffer();

          await pc.setLocalDescription(
            offer
          );

          socketInstance.emit(
            "offer",
            {
              target: remoteSocketId,
              offer,
            }
          );
        }
      );

      /* =========================
         OFFER RECEIVED
      ========================= */

      socketInstance.on(
        "offer",
        async ({
          offer,
          caller,
        }) => {
          console.log(
            "Offer received"
          );

          remoteSocketIdRef.current =
            caller;

          if (
            peerConnectionRef.current
          ) {
            peerConnectionRef.current.close();
          }

          const pc =
            createPeerConnection(
              caller,
              socketInstance
            );

          peerConnectionRef.current =
            pc;

          /*
            Add local tracks
          */

          addLocalTracks(pc);

          /*
            Remote description
          */

          await pc.setRemoteDescription(
            new RTCSessionDescription(
              offer
            )
          );

          /*
            Create answer
          */

          const answer =
            await pc.createAnswer();

          await pc.setLocalDescription(
            answer
          );

          socketInstance.emit(
            "answer",
            {
              target: caller,
              answer,
            }
          );
        }
      );

      /* =========================
         ANSWER
      ========================= */

      socketInstance.on(
        "answer",
        async ({ answer }) => {
          const pc =
            peerConnectionRef.current;

          if (!pc) {
            return;
          }

          try {
            await pc.setRemoteDescription(
              new RTCSessionDescription(
                answer
              )
            );
          } catch (error) {
            console.error(
              "Answer error:",
              error
            );
          }
        }
      );

      /* =========================
         ICE
      ========================= */

      socketInstance.on(
        "ice-candidate",
        async ({
          candidate,
        }) => {
          const pc =
            peerConnectionRef.current;

          if (!pc || !candidate) {
            return;
          }

          try {
            await pc.addIceCandidate(
              new RTCIceCandidate(
                candidate
              )
            );
          } catch (error) {
            console.error(
              "ICE candidate error:",
              error
            );
          }
        }
      );

      /* =========================
         USER DISCONNECTED
      ========================= */

      socketInstance.on(
        "user-disconnected",
        () => {
          toast(
            "অন্য student room ছেড়ে চলে গেছে",
            {
              icon: "👋",
            }
          );

          setParticipantCount(1);

          if (
            peerVideoRef.current
          ) {
            peerVideoRef.current.srcObject =
              null;
          }

          if (
            peerConnectionRef.current
          ) {
            peerConnectionRef.current.close();

            peerConnectionRef.current =
              null;
          }

          remoteSocketIdRef.current =
            null;
        }
      );

      /* =========================
         ROOM COUNT
      ========================= */

      socketInstance.on(
        "room-user-count",
        ({ count }) => {
          setParticipantCount(count);
        }
      );

      /* =========================
         CHAT
      ========================= */

      socketInstance.on(
        "chat-message",
        ({ sender, text }) => {
          setMessages((previous) => [
            ...previous,
            {
              sender:
                sender || "Student",
              text,
            },
          ]);
        }
      );
    };

    initRoom();

    /* =========================
       CLEANUP
    ========================= */

    return () => {
      mounted = false;

      if (socketInstance) {
        socketInstance.emit(
          "leave-study-room"
        );

        socketInstance.disconnect();
      }

      if (
        peerConnectionRef.current
      ) {
        peerConnectionRef.current.close();

        peerConnectionRef.current =
          null;
      }

      stopLocalStream();

      if (peerVideoRef.current) {
        peerVideoRef.current.srcObject =
          null;
      }
    };
  }, [
    roomId,
    startCamera,
    createPeerConnection,
    addLocalTracks,
    stopLocalStream,
  ]);

  /* =====================================================
     COPY ROOM ID
  ===================================================== */

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(
        roomId
      );

      setCopied(true);

      toast.success(
        "Room ID কপি করা হয়েছে!"
      );

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast.error(
        "Room ID copy করা যায়নি"
      );
    }
  };

  /* =====================================================
     MIC
  ===================================================== */

  const toggleMic = () => {
    const stream =
      localStreamRef.current;

    if (!stream) {
      return;
    }

    const audioTrack =
      stream.getAudioTracks()[0];

    if (!audioTrack) {
      return;
    }

    const newState = !isMicOn;

    audioTrack.enabled = newState;

    setIsMicOn(newState);
  };

  /* =====================================================
     VIDEO
  ===================================================== */

  const toggleVideo = () => {
    const stream =
      localStreamRef.current;

    if (!stream) {
      return;
    }

    const videoTrack =
      stream.getVideoTracks()[0];

    if (!videoTrack) {
      return;
    }

    const newState = !isVideoOn;

    videoTrack.enabled = newState;

    setIsVideoOn(newState);
  };

  /* =====================================================
     CHAT
  ===================================================== */

  const handleSendMessage = (event) => {
    event.preventDefault();

    const message =
      inputMsg.trim();

    if (!message) {
      return;
    }

    const socket =
      socketRef.current;

    /*
      নিজের chat immediately দেখাও
    */

    setMessages((previous) => [
      ...previous,
      {
        sender: "You",
        text: message,
      },
    ]);

    /*
      Other student-কে পাঠাও
    */

    if (
      socket &&
      socket.connected
    ) {
      socket.emit(
        "chat-message",
        {
          roomId,
          sender: "Student",
          text: message,
        }
      );
    }

    setInputMsg("");
  };

  /* =====================================================
     LEAVE
  ===================================================== */

  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit(
        "leave-study-room"
      );

      socketRef.current.disconnect();
    }

    if (
      peerConnectionRef.current
    ) {
      peerConnectionRef.current.close();
    }

    stopLocalStream();

    router.push("/study-room");
  };

  /* =====================================================
     ROOM FULL UI
  ===================================================== */

  if (isRoomFull) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-5">
            <Users className="w-8 h-8 text-rose-400" />
          </div>

          <h1 className="text-xl font-bold mb-2">
            Study Room Full
          </h1>

          <p className="text-sm text-slate-400 mb-6">
            এই room-এ ইতিমধ্যে ২ জন student আছে।
          </p>

          <button
            onClick={() =>
              router.push(
                "/study-room"
              )
            }
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition font-semibold"
          >
            Back to Study Room
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="h-16 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-rose-500"
              }`}
            />

            <h1 className="text-xs sm:text-sm font-bold text-white truncate">
              📚 {subject}: {topic}
            </h1>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] text-slate-400">
              Room ID:
              {" "}
              <span className="text-indigo-400 font-mono font-semibold">
                {roomId}
              </span>
            </p>

            <button
              onClick={
                handleCopyRoomId
              }
              className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1 text-[10px] border border-slate-700"
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}

              <span>
                {copied
                  ? "Copied"
                  : "Copy ID"}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-800/70 border border-slate-700 px-2.5 py-1.5 rounded-lg">
            {isConnected ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
            )}

            {participantCount}/2
          </div>

          <button
            onClick={leaveRoom}
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold hover:bg-rose-500/20 transition flex items-center gap-1.5"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>Leave</span>
          </button>
        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 p-4 sm:p-6 gap-4 overflow-auto">
        {/* =================================================
            VIDEOS
        ================================================= */}

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* =================================================
              MY VIDEO
          ================================================= */}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center min-h-[250px]">
            {hasMedia &&
            isVideoOn ? (
              <video
                ref={userVideoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover ${
                  facingMode ===
                  "user"
                    ? "-scale-x-100"
                    : ""
                }`}
              />
            ) : (
              <div className="text-center text-slate-500">
                <VideoOff className="w-10 h-10 mx-auto mb-2 opacity-50" />

                <p className="text-xs">
                  Camera Off
                </p>
              </div>
            )}

            <div className="absolute top-3 left-3 z-20">
              <span className="text-[10px] font-semibold text-white bg-slate-950/70 px-2.5 py-1 rounded-lg backdrop-blur-md">
                You
                {" "}
                {hasMedia
                  ? `(${
                      facingMode ===
                      "user"
                        ? "Front"
                        : "Back"
                    })`
                  : "(Chat only)"}
              </span>
            </div>

            {!isMicOn &&
              hasMedia && (
                <div className="absolute top-3 right-3 z-20 bg-rose-500/20 border border-rose-500/30 p-2 rounded-lg">
                  <MicOff className="w-3.5 h-3.5 text-rose-400" />
                </div>
              )}
          </div>

          {/* =================================================
              REMOTE VIDEO
          ================================================= */}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center min-h-[250px]">
            <video
              ref={peerVideoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />

            {!participantCount ||
              participantCount === 1 ? (
              <div className="text-center text-slate-600">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />

                <p className="text-xs">
                  Waiting for another student...
                </p>
              </div>
            ) : null}

            <div className="absolute top-3 left-3 z-20">
              <span className="text-[10px] font-semibold text-white bg-slate-950/70 px-2.5 py-1 rounded-lg backdrop-blur-md">
                Participant
              </span>
            </div>
          </div>
        </div>

        {/* =================================================
            CHAT
        ================================================= */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col min-h-[350px] lg:min-h-0 overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <MessageSquare className="w-4 h-4 text-indigo-400" />

              <span>
                Study Discussion
              </span>
            </div>

            <span className="text-[10px] text-slate-500">
              {messages.length} messages
            </span>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
            {messages.map(
              (message, index) => (
                <div
                  key={`${index}-${message.text}`}
                  className={`p-2.5 rounded-xl border ${
                    message.system
                      ? "bg-indigo-500/5 border-indigo-500/10"
                      : "bg-slate-950/50 border-slate-800/60"
                  }`}
                >
                  <span
                    className={`font-bold block mb-0.5 text-[10px] ${
                      message.system
                        ? "text-emerald-400"
                        : "text-indigo-400"
                    }`}
                  >
                    {message.sender}
                  </span>

                  <p className="text-slate-300 text-xs leading-relaxed">
                    {message.text}
                  </p>
                </div>
              )
            )}
          </div>

          <form
            onSubmit={
              handleSendMessage
            }
            className="p-3 border-t border-slate-800 flex gap-2"
          >
            <input
              type="text"
              placeholder="Discuss your study..."
              value={inputMsg}
              onChange={(event) =>
                setInputMsg(
                  event.target.value
                )
              }
              className="flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            />

            <button
              type="submit"
              disabled={
                !inputMsg.trim()
              }
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* =================================================
          CONTROLS
      ================================================= */}

      <div className="min-h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-2 sm:gap-4 px-3 py-3 shrink-0">
        {/* MIC */}

        <button
          onClick={
            toggleMic
          }
          disabled={!hasMedia}
          className={`p-3.5 rounded-2xl border transition-all disabled:opacity-40 ${
            isMicOn
              ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
              : "bg-rose-500/20 border-rose-500/30 text-rose-400"
          }`}
          title={
            isMicOn
              ? "Mute"
              : "Unmute"
          }
        >
          {isMicOn ? (
            <Mic className="w-5 h-5" />
          ) : (
            <MicOff className="w-5 h-5" />
          )}
        </button>

        {/* VIDEO */}

        <button
          onClick={
            toggleVideo
          }
          disabled={!hasMedia}
          className={`p-3.5 rounded-2xl border transition-all disabled:opacity-40 ${
            isVideoOn
              ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
              : "bg-rose-500/20 border-rose-500/30 text-rose-400"
          }`}
          title={
            isVideoOn
              ? "Turn camera off"
              : "Turn camera on"
          }
        >
          {isVideoOn ? (
            <Video className="w-5 h-5" />
          ) : (
            <VideoOff className="w-5 h-5" />
          )}
        </button>

        {/* SWITCH CAMERA */}

        <button
          onClick={
            switchCamera
          }
          disabled={!hasMedia}
          className="p-3.5 rounded-2xl border bg-slate-800 border-slate-700 text-white hover:bg-indigo-600/20 hover:border-indigo-500/40 transition-all disabled:opacity-40"
          title="Switch Front / Back Camera"
        >
          <SwitchCamera className="w-5 h-5" />
        </button>

        {/* LEAVE */}

        <button
          onClick={leaveRoom}
          className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg shadow-rose-600/30"
          title="Leave Room"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}