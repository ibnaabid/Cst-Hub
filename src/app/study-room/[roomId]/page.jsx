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
} from "lucide-react";

const BACKEND_URL = "https://csthub-backend-dw3l.onrender.com";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
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

  const [myName, setMyName] = useState("Student");

  const myVideoRef = useRef(null);
  const streamRef = useRef(null);
  const socketRef = useRef(null);
  const peersRef = useRef({});
  const pendingCandidatesRef = useRef({});
  const mountedRef = useRef(false);
  const joinedRef = useRef(false);
  const messageEndRef = useRef(null);
  const makingOfferRef = useRef({});

  // Load current student's name.
  useEffect(() => {
    try {
      const currentUser =
        localStorage.getItem("currentUser") ||
        sessionStorage.getItem("currentUser");

      let parsedUser = null;

      if (currentUser) {
        parsedUser = JSON.parse(currentUser);
      }

      const savedName =
        localStorage.getItem("userName") ||
        localStorage.getItem("studentName") ||
        parsedUser?.name ||
        parsedUser?.fullName;

      if (savedName) {
        setMyName(savedName);
      }
    } catch (error) {
      console.error("Unable to load student name:", error);
    }
  }, []);

  // Keep the latest local stream attached to the local video.
  const attachLocalStream = useCallback(() => {
    if (myVideoRef.current && streamRef.current) {
      myVideoRef.current.srcObject = streamRef.current;
      myVideoRef.current.play().catch(() => {});
    }
  }, []);

  // Get camera and microphone permission.
  useEffect(() => {
    let cancelled = false;
    let currentStream = null;

    async function initMedia() {
      setMediaLoading(true);
      setMediaError("");

      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            "Camera access is unavailable. Open the site over HTTPS."
          );
        }

        currentStream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: facingMode },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: true,
          });

        if (cancelled) {
          currentStream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = currentStream;

        currentStream.getAudioTracks().forEach((track) => {
          track.enabled = isMicOn;
        });

        currentStream.getVideoTracks().forEach((track) => {
          track.enabled = isVideoOn;
        });

        attachLocalStream();

        // If peer connections already exist, replace their tracks.
        Object.values(peersRef.current).forEach((pc) => {
          const senders = pc.getSenders();

          currentStream.getTracks().forEach((track) => {
            const sender = senders.find(
              (item) => item.track?.kind === track.kind
            );

            if (sender) {
              sender.replaceTrack(track).catch(console.error);
            } else if (pc.signalingState !== "closed") {
              pc.addTrack(track, currentStream);
            }
          });
        });
      } catch (error) {
        console.error("Camera/microphone error:", error);

        if (!cancelled) {
          setMediaError(
            error.name === "NotAllowedError"
              ? "Camera/microphone permission দিন, তারপর আবার চেষ্টা করুন।"
              : error.name === "NotFoundError"
                ? "এই device-এ camera বা microphone পাওয়া যায়নি।"
                : error.message ||
                  "Camera চালু করা যায়নি। আবার চেষ্টা করুন।"
          );
        }
      } finally {
        if (!cancelled) {
          setMediaLoading(false);
        }
      }
    }

    initMedia();

    return () => {
      cancelled = true;

      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }

      if (streamRef.current === currentStream) {
        streamRef.current = null;
      }
    };
    // Camera is restarted when facingMode changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  // Update local video element when React mounts it.
  useEffect(() => {
    attachLocalStream();
  }, [attachLocalStream, mediaLoading]);

  // Keep microphone and camera state in sync with their tracks.
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

  // Create one peer connection per remote participant.
  const createPeerConnection = useCallback(
    (remoteSocketId, remoteUserName, socketInstance) => {
      const existing = peersRef.current[remoteSocketId];

      if (existing && existing.signalingState !== "closed") {
        return existing;
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);

      peersRef.current[remoteSocketId] = pc;
      pendingCandidatesRef.current[remoteSocketId] = [];

      const localStream = streamRef.current;

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }

      pc.onicecandidate = (event) => {
        if (event.candidate && socketInstance.connected) {
          socketInstance.emit("ice-candidate", {
            target: remoteSocketId,
            candidate: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        const remoteStream =
          event.streams?.[0] || new MediaStream([event.track]);

        setParticipants((previous) => {
          const existingParticipant = previous.find(
            (participant) =>
              participant.socketId === remoteSocketId
          );

          if (existingParticipant) {
            return previous.map((participant) =>
              participant.socketId === remoteSocketId
                ? {
                    ...participant,
                    userName:
                      remoteUserName ||
                      participant.userName ||
                      "Student",
                    stream: remoteStream,
                  }
                : participant
            );
          }

          return [
            ...previous,
            {
              socketId: remoteSocketId,
              userName: remoteUserName || "Student",
              stream: remoteStream,
            },
          ];
        });
      };

      pc.onconnectionstatechange = () => {
        console.log(
          "Peer connection:",
          remoteSocketId,
          pc.connectionState
        );

        if (pc.connectionState === "connected") {
          setConnectionStatus("Connected");
        }

        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "disconnected"
        ) {
          console.warn(
            "Peer connection problem:",
            remoteSocketId,
            pc.connectionState
          );
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log(
          "ICE state:",
          remoteSocketId,
          pc.iceConnectionState
        );
      };

      return pc;
    },
    []
  );

  // Add remote ICE candidates after remote description is available.
  const addRemoteCandidate = useCallback(
    async (senderId, candidateData) => {
      const pc = peersRef.current[senderId];

      if (!pc || pc.signalingState === "closed") return;

      try {
        const candidate = new RTCIceCandidate(candidateData);

        if (pc.remoteDescription) {
          await pc.addIceCandidate(candidate);
        } else {
          if (!pendingCandidatesRef.current[senderId]) {
            pendingCandidatesRef.current[senderId] = [];
          }

          pendingCandidatesRef.current[senderId].push(candidate);
        }
      } catch (error) {
        console.error("ICE candidate error:", error);
      }
    },
    []
  );

  const flushPendingCandidates = useCallback(async (socketId) => {
    const pc = peersRef.current[socketId];
    const pending = pendingCandidatesRef.current[socketId] || [];

    if (!pc?.remoteDescription) return;

    pendingCandidatesRef.current[socketId] = [];

    for (const candidate of pending) {
      try {
        await pc.addIceCandidate(candidate);
      } catch (error) {
        console.error("Pending ICE candidate error:", error);
      }
    }
  }, []);

  // Socket.IO room connection and WebRTC signaling.
  useEffect(() => {
    if (!roomId || !myName) return;

    mountedRef.current = true;
    joinedRef.current = false;

    const socketInstance = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1000,
      auth: { userName: myName },
    });

    socketRef.current = socketInstance;

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
      setConnectionStatus("Joining room...");

      socketInstance.emit("join-study-room", roomId);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      setConnectionStatus("Connection error");
    });

    socketInstance.on("disconnect", () => {
      setConnectionStatus("Reconnecting...");
      setIsConnected(false);
      joinedRef.current = false;
    });

    socketInstance.on("room-full", () => {
      setRoomFullError(true);
    });

    // Support backends that emit a room member list.
    socketInstance.on("room-users", async (payload = {}) => {
      const users = Array.isArray(payload.users)
        ? payload.users
        : [];

      joinedRef.current = true;
      setIsConnected(true);
      setConnectionStatus("Connected");

      const otherUsers = users.filter(
        (user) => user.socketId !== socketInstance.id
      );

      setParticipants((previous) =>
        otherUsers.map((user) => {
          const existing = previous.find(
            (participant) =>
              participant.socketId === user.socketId
          );

          return {
            socketId: user.socketId,
            userName: user.userName || "Student",
            stream: existing?.stream || null,
          };
        })
      );

      // Existing members initiate offers to the newly joined member.
      for (const user of otherUsers) {
        if (!user.socketId || peersRef.current[user.socketId]) {
          continue;
        }

        try {
          const pc = createPeerConnection(
            user.socketId,
            user.userName,
            socketInstance
          );

          makingOfferRef.current[user.socketId] = true;

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socketInstance.emit("offer", {
            target: user.socketId,
            offer: pc.localDescription,
            senderName: myName,
          });
        } catch (error) {
          console.error("Create offer error:", error);
        } finally {
          makingOfferRef.current[user.socketId] = false;
        }
      }
    });

    // This event is emitted when another participant joins.
    socketInstance.on(
      "user-connected",
      async ({ socketId, userName } = {}) => {
        if (!socketId || socketId === socketInstance.id) return;

        addSystemMessage(`${userName || "Student"} joined the room.`);

        setParticipants((previous) => {
          if (
            previous.some(
              (participant) => participant.socketId === socketId
            )
          ) {
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

        /*
         * The backend must provide a consistent signaling flow.
         * If the backend also sends room-users, that handler creates
         * offers to existing participants.
         */
      }
    );

    socketInstance.on(
      "offer",
      async ({ offer, caller, sender, senderName, callerUserName } = {}) => {
        const remoteSocketId = caller || sender;

        if (!remoteSocketId || !offer) {
          console.warn("Invalid offer payload received.");
          return;
        }

        try {
          const pc = createPeerConnection(
            remoteSocketId,
            senderName || callerUserName || "Student",
            socketInstance
          );

          await pc.setRemoteDescription(
            new RTCSessionDescription(offer)
          );

          await flushPendingCandidates(remoteSocketId);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socketInstance.emit("answer", {
            target: remoteSocketId,
            answer: pc.localDescription,
          });
        } catch (error) {
          console.error("Offer/answer negotiation failed:", error);
        }
      }
    );

    socketInstance.on(
      "answer",
      async ({ answer, responder, sender, caller } = {}) => {
        const remoteSocketId = responder || sender || caller;

        if (!remoteSocketId || !answer) {
          console.warn("Invalid answer payload received.");
          return;
        }

        const pc = peersRef.current[remoteSocketId];

        if (!pc || pc.signalingState === "closed") return;

        try {
          await pc.setRemoteDescription(
            new RTCSessionDescription(answer)
          );

          await flushPendingCandidates(remoteSocketId);
        } catch (error) {
          console.error("Set remote answer failed:", error);
        }
      }
    );

    socketInstance.on(
      "ice-candidate",
      ({ candidate, sender, caller } = {}) => {
        const remoteSocketId = sender || caller;

        if (remoteSocketId && candidate) {
          addRemoteCandidate(remoteSocketId, candidate);
        }
      }
    );

    socketInstance.on(
      "user-disconnected",
      ({ socketId, userName } = {}) => {
        if (!socketId) return;

        addSystemMessage(
          `${userName || "Student"} left the room.`
        );

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
          previous.filter(
            (participant) => participant.socketId !== socketId
          )
        );
      }
    );

    socketInstance.on("chat-message", (payload = {}) => {
      const sender = payload.sender || payload.userName || "Student";
      const text = payload.text || payload.message || "";

      if (!text) return;

      setMessages((previous) => [
        ...previous,
        {
          id: `${Date.now()}-${Math.random()}`,
          sender,
          text,
        },
      ]);
    });

    return () => {
      mountedRef.current = false;

      socketInstance.removeAllListeners();
      socketInstance.disconnect();

      Object.values(peersRef.current).forEach((pc) => {
        pc.ontrack = null;
        pc.onicecandidate = null;
        pc.close();
      });

      peersRef.current = {};
      pendingCandidatesRef.current = {};
      makingOfferRef.current = {};

      if (socketRef.current === socketInstance) {
        socketRef.current = null;
      }

      setParticipants([]);
    };
  }, [
    roomId,
    myName,
    createPeerConnection,
    addRemoteCandidate,
    flushPendingCandidates,
    addSystemMessage,
  ]);

  // Scroll chat to the latest message.
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  const toggleMic = () => {
    const tracks = streamRef.current?.getAudioTracks() || [];

    if (!tracks.length) {
      setMediaError("Microphone পাওয়া যায়নি। Permission পরীক্ষা করুন।");
      return;
    }

    const nextState = !isMicOn;

    tracks.forEach((track) => {
      track.enabled = nextState;
    });

    setIsMicOn(nextState);
  };

  const toggleVideo = () => {
    const tracks = streamRef.current?.getVideoTracks() || [];

    if (!tracks.length) {
      setMediaError("Camera পাওয়া যায়নি। Permission পরীক্ষা করুন।");
      return;
    }

    const nextState = !isVideoOn;

    tracks.forEach((track) => {
      track.enabled = nextState;
    });

    setIsVideoOn(nextState);
  };

  const switchCamera = () => {
    setFacingMode((previous) =>
      previous === "user" ? "environment" : "user"
    );
  };

  const leaveRoom = () => {
    Object.values(peersRef.current).forEach((pc) => pc.close());
    peersRef.current = {};

    if (socketRef.current) {
      socketRef.current.emit("leave-study-room", roomId);
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
    const socketInstance = socketRef.current;

    if (!text || !socketInstance?.connected) return;

    socketInstance.emit("chat-message", {
      roomId,
      sender: myName,
      text,
    });

    // Optimistic local message. Avoid duplicates if backend echoes to sender.
    setMessages((previous) => [
      ...previous,
      {
        id: `${Date.now()}-${Math.random()}`,
        sender: myName,
        text,
      },
    ]);

    setInputMsg("");
  };

  if (roomFullError) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-slate-950 p-6 text-center text-white">
        <ShieldAlert className="mb-4 h-16 w-16 text-rose-500" />
        <h2 className="mb-2 text-xl font-bold">Room is full</h2>
        <p className="mb-5 text-sm text-slate-400">
          এই Study Room-এ আর participant যোগ করা যাচ্ছে না।
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold hover:bg-indigo-500"
        >
          Go Home
        </button>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 z-50 flex h-[100dvh] w-screen flex-col overflow-hidden bg-slate-950 text-white">
      {/* Header */}
      <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-slate-900 px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              isConnected
                ? "animate-pulse bg-emerald-500"
                : "bg-amber-400"
            }`}
          />

          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-indigo-300">
              Room: {roomId}
            </p>
            <p className="text-[10px] text-slate-400">
              {connectionStatus}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-slate-300">
            <Users className="h-3.5 w-3.5 text-indigo-400" />
            {participants.length + 1}
          </span>

          <button
            type="button"
            onClick={() => setIsChatOpen((previous) => !previous)}
            aria-label="Toggle chat"
            className="relative rounded-lg border border-indigo-500 bg-indigo-600 p-2 text-white transition hover:bg-indigo-500"
          >
            <MessageSquare className="h-4 w-4" />
            {messages.length > 0 && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-rose-400 ring-2 ring-slate-900" />
            )}
          </button>
        </div>
      </header>

      {/* Workspace */}
      <section className="relative flex min-h-0 flex-1 overflow-hidden">
        <div
          className={`grid min-h-0 flex-1 content-start gap-3 overflow-y-auto p-3 ${
            participants.length === 0
              ? "grid-cols-1"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {/* Local video */}
          <VideoTile
            stream={streamRef.current}
            videoRef={myVideoRef}
            name={`${myName} (You)`}
            isLocal
            isVideoOn={isVideoOn}
            facingMode={facingMode}
            loading={mediaLoading}
          />

          {/* Remote participants */}
          {participants.map((participant) => (
            <RemoteVideo
              key={participant.socketId}
              participant={participant}
            />
          ))}
        </div>

        {/* Chat drawer */}
        <aside
          className={`fixed inset-y-14 right-0 z-50 flex w-full flex-col border-l border-white/10 bg-slate-900 shadow-2xl transition-transform duration-300 sm:w-80 lg:absolute lg:inset-y-0 lg:z-30 lg:bg-slate-900/95 ${
            isChatOpen ? "translate-x-0" : "translate-x-full"
          }`}
          aria-hidden={!isChatOpen}
        >
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-white/5 px-4">
            <span className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <MessageSquare className="h-4 w-4" />
              Study Room Chat
            </span>

            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              aria-label="Close chat"
              className="rounded-lg bg-white/10 p-1.5 text-slate-400 hover:text-white"
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
                    ? "border-amber-500/20 bg-amber-500/10 text-center text-[10px] text-amber-300"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {message.sender !== "System" && (
                  <span className="mb-0.5 block font-bold text-indigo-400">
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
            className="flex shrink-0 gap-2 border-t border-white/10 bg-slate-950 p-3"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(event) => setInputMsg(event.target.value)}
              placeholder="Write a message..."
              aria-label="Chat message"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
            />

            <button
              type="submit"
              disabled={!inputMsg.trim() || !isConnected}
              aria-label="Send message"
              className="flex items-center justify-center rounded-xl bg-indigo-600 px-3 text-white shadow-md transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </aside>
      </section>

      {/* Media error banner */}
      {mediaError && (
        <div className="absolute bottom-[76px] left-3 right-3 z-[60] flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-950/95 p-3 text-xs text-rose-200 shadow-xl sm:left-auto sm:right-4 sm:max-w-sm">
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

      {/* Footer controls */}
      <footer className="z-40 flex h-16 shrink-0 items-center justify-center gap-2 border-t border-white/10 bg-slate-900/95 px-2 shadow-2xl backdrop-blur-lg sm:gap-3">
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
          className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-3 text-xs font-bold text-white shadow-lg transition hover:bg-rose-500 sm:px-4"
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
    <div className="relative flex h-[220px] min-h-[200px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-lg sm:h-[280px] lg:h-[320px]">
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
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-slate-950/80">
          <LoaderCircle className="h-6 w-6 animate-spin text-indigo-400" />
          <span className="text-xs text-slate-400">
            Camera starting...
          </span>
        </div>
      )}

      {isLocal && !isVideoOn && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/95">
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
    const videoElement = videoRef.current;

    if (!videoElement || !participant.stream) return;

    if (videoElement.srcObject !== participant.stream) {
      videoElement.srcObject = participant.stream;
    }

    videoElement.play().catch((error) => {
      console.warn("Remote video autoplay blocked:", error);
    });

    return () => {
      if (videoElement.srcObject === participant.stream) {
        videoElement.srcObject = null;
      }
    };
  }, [participant.stream]);

  return (
    <div className="relative flex h-[220px] min-h-[200px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-lg sm:h-[280px] lg:h-[320px]">
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
