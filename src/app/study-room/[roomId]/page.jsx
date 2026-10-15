// ```jsx
"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  SwitchCamera,
  Send,
  Users,
  MessageSquare,
  ShieldAlert,
  X,
  LoaderCircle,
  Wifi,
} from "lucide-react";

const BACKEND_URL = "https://csthub-backend-dw3l.onrender.com";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
  iceCandidatePoolSize: 10,
};

export default function CleanStudyRoom() {
  const params = useParams();
  const router = useRouter();

  const roomId = Array.isArray(params?.roomId)
    ? params.roomId[0]
    : params?.roomId;

  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [myName, setMyName] = useState("Student");

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [facingMode, setFacingMode] = useState("user");

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [roomFullError, setRoomFullError] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaError, setMediaError] = useState("");
  const [connectionStatus, setConnectionStatus] =
    useState("Connecting...");
  const [isConnected, setIsConnected] = useState(false);

  const myVideoRef = useRef(null);
  const streamRef = useRef(null);
  const socketRef = useRef(null);
  const peersRef = useRef({});
  const pendingCandidatesRef = useRef({});
  const messageEndRef = useRef(null);
  const mountedRef = useRef(false);
  const joinedRef = useRef(false);
  const leavingRef = useRef(false);
  const makingOfferRef = useRef({});

  // Load the current student.
  useEffect(() => {
    try {
      const saved =
        localStorage.getItem("currentUser") ||
        sessionStorage.getItem("currentUser");

      const user = saved ? JSON.parse(saved) : null;

      const name =
        localStorage.getItem("userName") ||
        localStorage.getItem("studentName") ||
        user?.name ||
        user?.fullName;

      if (name) setMyName(String(name).trim());
    } catch (error) {
      console.error("Could not load student name:", error);
    }
  }, []);

  const addSystemMessage = useCallback((text) => {
    setMessages((previous) => [
      ...previous,
      {
        id: `${Date.now()}-${Math.random()}`,
        sender: "System",
        text,
      },
    ]);
  }, []);

  const attachLocalStream = useCallback(() => {
    const video = myVideoRef.current;
    const stream = streamRef.current;

    if (!video || !stream) return;

    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }

    video.play().catch(() => {});
  }, []);

  // Start local camera/microphone once.
  useEffect(() => {
    let cancelled = false;
    let acquiredStream = null;

    async function startMedia() {
      setMediaLoading(true);
      setMediaError("");

      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            "Camera access requires HTTPS and a supported browser."
          );
        }

        acquiredStream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: facingMode },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
            },
          });

        if (cancelled) {
          acquiredStream.getTracks().forEach((track) => track.stop());
          return;
        }

        const oldStream = streamRef.current;
        streamRef.current = acquiredStream;

        acquiredStream.getAudioTracks().forEach((track) => {
          track.enabled = isMicOn;
        });

        acquiredStream.getVideoTracks().forEach((track) => {
          track.enabled = isVideoOn;
        });

        attachLocalStream();

        // Replace existing sender tracks when switching cameras.
        for (const pc of Object.values(peersRef.current)) {
          if (pc.signalingState === "closed") continue;

          for (const track of acquiredStream.getTracks()) {
            const sender = pc
              .getSenders()
              .find((item) => item.track?.kind === track.kind);

            try {
              if (sender) {
                await sender.replaceTrack(track);
              } else {
                pc.addTrack(track, acquiredStream);
              }
            } catch (error) {
              console.error("Could not replace media track:", error);
            }
          }
        }

        if (oldStream && oldStream !== acquiredStream) {
          oldStream.getTracks().forEach((track) => track.stop());
        }
      } catch (error) {
        console.error("Media error:", error);

        if (!cancelled) {
          const message =
            error.name === "NotAllowedError"
              ? "Camera ও microphone permission দিন। Browser settings-এ permission পরীক্ষা করুন।"
              : error.name === "NotFoundError"
                ? "Camera বা microphone পাওয়া যায়নি।"
                : error.name === "NotReadableError"
                  ? "Camera অন্য application ব্যবহার করছে। অন্য application বন্ধ করে আবার চেষ্টা করুন।"
                  : error.message || "Camera চালু করা যায়নি।";

          setMediaError(message);
        }
      } finally {
        if (!cancelled) setMediaLoading(false);
      }
    }

    startMedia();

    return () => {
      cancelled = true;

      if (acquiredStream && streamRef.current !== acquiredStream) {
        acquiredStream.getTracks().forEach((track) => track.stop());
      }
    };
    // The stream is recreated only when switching cameras.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  useEffect(() => {
    attachLocalStream();
  }, [attachLocalStream, mediaLoading]);

  useEffect(() => {
    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = isMicOn;
    });
  }, [isMicOn]);

  useEffect(() => {
    streamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = isVideoOn;
    });
  }, [isVideoOn]);

  const createPeerConnection = useCallback(
    (remoteId, remoteName, socket) => {
      const existing = peersRef.current[remoteId];

      if (existing && existing.signalingState !== "closed") {
        return existing;
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);

      peersRef.current[remoteId] = pc;
      pendingCandidatesRef.current[remoteId] = [];

      const localStream = streamRef.current;

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }

      pc.onicecandidate = (event) => {
        if (event.candidate && socket.connected) {
          socket.emit("ice-candidate", {
            target: remoteId,
            candidate: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        let remoteStream = event.streams?.[0];

        if (!remoteStream) {
          remoteStream = new MediaStream([event.track]);
        }

        setParticipants((previous) => {
          const found = previous.some(
            (person) => person.socketId === remoteId
          );

          if (found) {
            return previous.map((person) =>
              person.socketId === remoteId
                ? {
                    ...person,
                    userName: remoteName || person.userName,
                    stream: remoteStream,
                  }
                : person
            );
          }

          return [
            ...previous,
            {
              socketId: remoteId,
              userName: remoteName || "Student",
              stream: remoteStream,
            },
          ];
        });
      };

      pc.onconnectionstatechange = () => {
        console.log(
          "Peer state:",
          remoteId,
          pc.connectionState
        );

        if (pc.connectionState === "connected") {
          setConnectionStatus("Video connected");
        } else if (pc.connectionState === "failed") {
          setConnectionStatus("Video connection failed");
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log(
          "ICE state:",
          remoteId,
          pc.iceConnectionState
        );
      };

      return pc;
    },
    []
  );

  const flushCandidates = useCallback(async (remoteId) => {
    const pc = peersRef.current[remoteId];

    if (!pc?.remoteDescription) return;

    const candidates = pendingCandidatesRef.current[remoteId] || [];
    pendingCandidatesRef.current[remoteId] = [];

    for (const candidate of candidates) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Queued ICE candidate failed:", error);
      }
    }
  }, []);

  const addCandidate = useCallback(async (remoteId, candidateData) => {
    if (!candidateData) return;

    const pc = peersRef.current[remoteId];

    if (!pc || pc.signalingState === "closed") return;

    if (!pc.remoteDescription) {
      if (!pendingCandidatesRef.current[remoteId]) {
        pendingCandidatesRef.current[remoteId] = [];
      }

      pendingCandidatesRef.current[remoteId].push(candidateData);
      return;
    }

    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidateData));
    } catch (error) {
      console.error("ICE candidate failed:", error);
    }
  }, []);

  // Socket connection and signaling.
  useEffect(() => {
    if (!roomId || !myName) return;

    mountedRef.current = true;
    leavingRef.current = false;

    const socket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      auth: { userName: myName },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnectionStatus("Joining room...");
      socket.emit("join-study-room", roomId);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket error:", error.message);
      setConnectionStatus("Server connection error");
    });

    socket.on("disconnect", () => {
      joinedRef.current = false;
      setIsConnected(false);
      setConnectionStatus("Reconnecting...");
    });

    socket.on("study-room-error", ({ message } = {}) => {
      setMediaError(message || "Study Room error.");
    });

    socket.on("room-full", () => setRoomFullError(true));

    socket.on("room-users", ({ users = [] } = {}) => {
      joinedRef.current = true;
      setIsConnected(true);
      setConnectionStatus("Room connected");

      const others = users.filter(
        (user) => user.socketId !== socket.id
      );

      setParticipants((previous) =>
        others.map((user) => {
          const old = previous.find(
            (person) => person.socketId === user.socketId
          );

          return {
            socketId: user.socketId,
            userName: user.userName || "Student",
            stream: old?.stream || null,
          };
        })
      );

      /*
       * Deterministic offer rule:
       * The participant with the lexicographically smaller socket ID
       * initiates. This reduces simultaneous-offer collisions.
       */
      for (const user of others) {
        if (!user.socketId) continue;

        if (socket.id.localeCompare(user.socketId) > 0) continue;
        if (peersRef.current[user.socketId]) continue;

        void (async () => {
          try {
            const pc = createPeerConnection(
              user.socketId,
              user.userName,
              socket
            );

            makingOfferRef.current[user.socketId] = true;

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit("offer", {
              target: user.socketId,
              offer: pc.localDescription,
              senderName: myName,
            });
          } catch (error) {
            console.error("Offer creation failed:", error);
          } finally {
            makingOfferRef.current[user.socketId] = false;
          }
        })();
      }
    });

    socket.on("user-connected", ({ socketId, userName } = {}) => {
      if (!socketId || socketId === socket.id) return;

      addSystemMessage(`${userName || "Student"} joined the room.`);

      setParticipants((previous) => {
        if (previous.some((person) => person.socketId === socketId)) {
          return previous;
        }

        return [
          ...previous,
          {
            socketId,
            userName: userName || "Student",
            stream: null,
          },
        ];
      });
    });

    socket.on(
      "offer",
      async ({ offer, caller, callerUserName, senderName } = {}) => {
        if (!caller || !offer) return;

        try {
          let pc = peersRef.current[caller];

          if (!pc || pc.signalingState === "closed") {
            pc = createPeerConnection(
              caller,
              callerUserName || senderName || "Student",
              socket
            );
          }

          // Handle a colliding offer by recreating the peer connection.
          if (
            pc.signalingState !== "stable" &&
            makingOfferRef.current[caller]
          ) {
            pc.ontrack = null;
            pc.onicecandidate = null;
            pc.close();
            delete peersRef.current[caller];

            pc = createPeerConnection(
              caller,
              callerUserName || senderName || "Student",
              socket
            );
          }

          await pc.setRemoteDescription(
            new RTCSessionDescription(offer)
          );

          await flushCandidates(caller);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit("answer", {
            target: caller,
            answer: pc.localDescription,
          });
        } catch (error) {
          console.error("Offer handling failed:", error);
        }
      }
    );

    socket.on(
      "answer",
      async ({ answer, responder } = {}) => {
        if (!responder || !answer) return;

        const pc = peersRef.current[responder];

        if (!pc || pc.signalingState === "closed") return;

        try {
          await pc.setRemoteDescription(
            new RTCSessionDescription(answer)
          );

          await flushCandidates(responder);
        } catch (error) {
          console.error("Answer handling failed:", error);
        }
      }
    );

    socket.on(
      "ice-candidate",
      ({ candidate, sender } = {}) => {
        if (sender && candidate) {
          void addCandidate(sender, candidate);
        }
      }
    );

    socket.on("user-disconnected", ({ socketId, userName } = {}) => {
      if (!socketId) return;

      addSystemMessage(`${userName || "Student"} left the room.`);

      const pc = peersRef.current[socketId];

      if (pc) {
        pc.ontrack = null;
        pc.onicecandidate = null;
        pc.close();
        delete peersRef.current[socketId];
      }

      delete pendingCandidatesRef.current[socketId];
      delete makingOfferRef.current[socketId];

      setParticipants((previous) =>
        previous.filter((person) => person.socketId !== socketId)
      );
    });

    socket.on("chat-message", ({ sender, text } = {}) => {
      if (!text) return;

      setMessages((previous) => [
        ...previous,
        {
          id: `${Date.now()}-${Math.random()}`,
          sender: sender || "Student",
          text,
        },
      ]);
    });

    return () => {
      mountedRef.current = false;
      socket.removeAllListeners();
      socket.disconnect();

      Object.values(peersRef.current).forEach((pc) => {
        pc.ontrack = null;
        pc.onicecandidate = null;
        pc.close();
      });

      peersRef.current = {};
      pendingCandidatesRef.current = {};
      makingOfferRef.current = {};

      if (socketRef.current === socket) socketRef.current = null;

      setParticipants([]);
    };
  }, [
    roomId,
    myName,
    createPeerConnection,
    flushCandidates,
    addCandidate,
    addSystemMessage,
  ]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  const toggleMic = () => {
    const tracks = streamRef.current?.getAudioTracks() || [];

    if (!tracks.length) {
      setMediaError("Microphone পাওয়া যায়নি।");
      return;
    }

    const next = !isMicOn;
    tracks.forEach((track) => (track.enabled = next));
    setIsMicOn(next);
  };

  const toggleVideo = () => {
    const tracks = streamRef.current?.getVideoTracks() || [];

    if (!tracks.length) {
      setMediaError("Camera পাওয়া যায়নি।");
      return;
    }

    const next = !isVideoOn;
    tracks.forEach((track) => (track.enabled = next));
    setIsVideoOn(next);
  };

  const switchCamera = () => {
    setFacingMode((previous) =>
      previous === "user" ? "environment" : "user"
    );
  };

  const leaveRoom = () => {
    leavingRef.current = true;

    Object.values(peersRef.current).forEach((pc) => pc.close());
    peersRef.current = {};

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    router.push("/");
  };

  const sendMessage = (event) => {
    event.preventDefault();

    const text = inputMsg.trim();
    const socket = socketRef.current;

    if (!text || !socket?.connected) return;

    // Backend echoes to all members, including the sender.
    // Do not add an optimistic copy to avoid duplicate messages.
    socket.emit("chat-message", { roomId, text });
    setInputMsg("");
  };

  if (roomFullError) {
    return (
      <main className="fixed inset-0 z-[9999] flex min-h-[100dvh] flex-col items-center justify-center bg-slate-950 p-6 text-center text-white">
        <ShieldAlert className="mb-4 h-14 w-14 text-rose-500" />
        <h2 className="mb-2 text-xl font-bold">Room is full</h2>
        <p className="mb-5 text-sm text-slate-400">
          এই Study Room-এ আর participant যোগ করা যাচ্ছে না।
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold"
        >
          Go Home
        </button>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 z-[9999] flex h-[100dvh] w-screen flex-col overflow-hidden bg-slate-950 text-white">
      {/* Study Room header */}
      <header className="z-30 flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-slate-900 px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              isConnected ? "bg-emerald-400" : "bg-amber-400"
            }`}
          />

          <div className="min-w-0">
            <p className="max-w-[48vw] truncate text-xs font-bold text-indigo-300 sm:max-w-none">
              CST HUB · {roomId}
            </p>
            <p className="flex items-center gap-1 text-[10px] text-slate-400">
              <Wifi className="h-3 w-3" />
              {connectionStatus}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs">
            <Users className="h-3.5 w-3.5 text-indigo-400" />
            {participants.length + 1}
          </span>

          <button
            type="button"
            onClick={() => setIsChatOpen((previous) => !previous)}
            aria-label="Toggle chat"
            className="relative rounded-xl bg-indigo-600 p-2.5 hover:bg-indigo-500"
          >
            <MessageSquare className="h-4 w-4" />
            {messages.length > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-400" />
            )}
          </button>
        </div>
      </header>

      {/* Video workspace */}
      <section className="relative flex min-h-0 flex-1 overflow-hidden">
        <div
          className={`grid min-h-0 flex-1 content-start gap-2 overflow-y-auto p-2 sm:gap-3 sm:p-4 ${
            participants.length === 0
              ? "grid-cols-1"
              : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
          }`}
        >
          <VideoTile
            stream={streamRef.current}
            videoRef={myVideoRef}
            name={`${myName} (You)`}
            isLocal
            isVideoOn={isVideoOn}
            facingMode={facingMode}
            loading={mediaLoading}
          />

          {participants.map((participant) => (
            <RemoteVideo
              key={participant.socketId}
              participant={participant}
            />
          ))}
        </div>

        {/* Mobile and desktop chat drawer */}
        {isChatOpen && (
          <button
            type="button"
            aria-label="Close chat overlay"
            onClick={() => setIsChatOpen(false)}
            className="absolute inset-0 z-30 bg-black/50 lg:hidden"
          />
        )}

        <aside
          className={`absolute inset-y-0 right-0 z-40 flex w-full flex-col border-l border-white/10 bg-slate-900 shadow-2xl transition-transform duration-300 sm:w-80 ${
            isChatOpen ? "translate-x-0" : "translate-x-full"
          }`}
          aria-hidden={!isChatOpen}
        >
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">
            <span className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <MessageSquare className="h-4 w-4" />
              Study Room Chat
            </span>

            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              aria-label="Close chat"
              className="rounded-lg bg-white/10 p-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-3 text-xs">
            {messages.length === 0 && (
              <p className="py-6 text-center text-slate-500">
                Conversation শুরু করুন।
              </p>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`break-words rounded-xl border p-2.5 ${
                  message.sender === "System"
                    ? "border-amber-500/20 bg-amber-500/10 text-center text-amber-300"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {message.sender !== "System" && (
                  <span className="mb-1 block font-bold text-indigo-400">
                    {message.sender}
                  </span>
                )}
                <p className="whitespace-pre-wrap text-slate-200">
                  {message.text}
                </p>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>

          <form
            onSubmit={sendMessage}
            className="flex shrink-0 gap-2 border-t border-white/10 p-3"
          >
            <input
              value={inputMsg}
              onChange={(event) => setInputMsg(event.target.value)}
              placeholder="Write a message..."
              aria-label="Chat message"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-xs outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim() || !isConnected}
              aria-label="Send message"
              className="rounded-xl bg-indigo-600 px-3 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </aside>
      </section>

      {/* Error banner */}
      {mediaError && (
        <div className="absolute bottom-[76px] left-2 right-2 z-[10000] flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-950 p-3 text-xs text-rose-100 sm:bottom-20 sm:left-auto sm:right-4 sm:max-w-sm">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
          <p className="flex-1">{mediaError}</p>
          <button
            type="button"
            onClick={() => setMediaError("")}
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Fixed footer controls */}
      <footer className="z-50 flex h-[68px] shrink-0 items-center justify-center gap-2 border-t border-white/10 bg-slate-900 px-2 pb-[env(safe-area-inset-bottom)] shadow-2xl sm:h-[76px] sm:gap-3">
        <ControlButton
          label={isMicOn ? "Mute microphone" : "Turn microphone on"}
          active={isMicOn}
          onClick={toggleMic}
        >
          {isMicOn ? (
            <Mic className="h-4 w-4" />
          ) : (
            <MicOff className="h-4 w-4" />
          )}
        </ControlButton>

        <ControlButton
          label={isVideoOn ? "Turn camera off" : "Turn camera on"}
          active={isVideoOn}
          onClick={toggleVideo}
        >
          {isVideoOn ? (
            <Video className="h-4 w-4" />
          ) : (
            <VideoOff className="h-4 w-4" />
          )}
        </ControlButton>

        <ControlButton
          label="Switch camera"
          active
          onClick={switchCamera}
        >
          <SwitchCamera className="h-4 w-4" />
        </ControlButton>

        <button
          type="button"
          onClick={leaveRoom}
          className="flex h-11 items-center gap-1.5 rounded-xl bg-rose-600 px-3 text-xs font-bold hover:bg-rose-500 sm:px-4"
        >
          <PhoneOff className="h-4 w-4" />
          <span className="hidden sm:inline">Leave Room</span>
          <span className="sm:hidden">Leave</span>
        </button>
      </footer>
    </main>
  );
}

function ControlButton({ children, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition ${
        active
          ? "border-white/10 bg-white/10 text-white hover:bg-white/15"
          : "border-rose-500/30 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
      }`}
    >
      {children}
    </button>
  );
}

function VideoTile({
  stream,
  videoRef,
  name,
  isLocal = false,
  isVideoOn = true,
  facingMode = "user",
  loading = false,
}) {
  return (
    <div className="relative flex h-[min(48vh,360px)] min-h-[210px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-lg sm:h-[min(45vh,400px)]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        onLoadedMetadata={(event) => {
          event.currentTarget.play().catch(() => {});
        }}
        className={`absolute inset-0 h-full w-full object-cover ${
          isLocal && facingMode === "user" ? "-scale-x-100" : ""
        }`}
      />

      {loading && isLocal && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-slate-950/90">
          <LoaderCircle className="h-6 w-6 animate-spin text-indigo-400" />
          <span className="text-xs text-slate-400">
            Camera starting...
          </span>
        </div>
      )}

      {isLocal && !isVideoOn && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950">
          <VideoOff className="h-8 w-8 text-slate-500" />
          <span className="ml-2 text-xs text-slate-400">
            Camera Off
          </span>
        </div>
      )}

      {!stream && !loading && isLocal && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950">
          <span className="text-xs text-slate-400">
            Camera unavailable
          </span>
        </div>
      )}

      <span className="absolute left-2 top-2 z-20 max-w-[85%] truncate rounded-lg bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-md">
        {name}
      </span>
    </div>
  );
}

function RemoteVideo({ participant }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const stream = participant.stream;

    if (!video || !stream) return;

    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }

    video.play().catch((error) => {
      console.warn("Remote video playback failed:", error);
    });

    return () => {
      if (video.srcObject === stream) {
        video.srcObject = null;
      }
    };
  }, [participant.stream]);

  return (
    <div className="relative flex h-[min(48vh,360px)] min-h-[210px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-lg sm:h-[min(45vh,400px)]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        onLoadedMetadata={(event) => {
          event.currentTarget.play().catch(() => {});
        }}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {!participant.stream && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-slate-950/90">
          <LoaderCircle className="h-5 w-5 animate-spin text-indigo-400" />
          <span className="text-xs text-slate-400">
            Waiting for video...
          </span>
        </div>
      )}

      <span className="absolute left-2 top-2 z-20 max-w-[85%] truncate rounded-lg bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-md">
        {participant.userName || "Student"}
      </span>
    </div>
  );
}
