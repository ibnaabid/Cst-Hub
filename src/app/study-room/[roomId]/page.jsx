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
  Camera,
} from "lucide-react";

import toast from "react-hot-toast";

/* =====================================================
   SOCKET SERVER
===================================================== */

const SOCKET_SERVER_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

/* =====================================================
   ROOM LIMIT
===================================================== */

const MAX_ROOM_USERS = 5;

/* =====================================================
   WEBRTC
===================================================== */

const rtcConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
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
  const topic = searchParams.get("topic") || "General Discussion";
  const subject = searchParams.get("subject") || "Study Session";

  /* =====================================================
     STATE
  ===================================================== */

  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [facingMode, setFacingMode] = useState("user");
  const [isConnected, setIsConnected] = useState(false);
  const [hasMedia, setHasMedia] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isRoomFull, setIsRoomFull] = useState(false);
  const [participants, setParticipants] = useState();
  const [messages, setMessages] = useState([
    {
      sender: "System",
      text: `Welcome to CST HUB Study Room! Topic: ${topic}`,
      system: true,
    },
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [isStartingMedia, setIsStartingMedia] = useState(false);

  /* =====================================================
     REFS
  ===================================================== */

  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef(new Map());
  const pendingIceCandidatesRef = useRef(new Map());
  const participantsRef = useRef(new Map());
  const videoRefs = useRef(new Map());
  const userVideoRef = useRef(null);

  const userInfoRef = useRef({
    userId: "",
    userName: "Student",
  });

  /* =====================================================
     GET CURRENT USER
  ===================================================== */

  const getCurrentUser = () => {
    try {
      const raw =
        localStorage.getItem("currentUser") ||
        sessionStorage.getItem("currentUser");

      if (raw) {
        return JSON.parse(raw);
      }
    } catch (error) {
      console.error("User parse error:", error);
    }
    return null;
  };

  /* =====================================================
     STOP LOCAL STREAM
  ===================================================== */

  const stopLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (userVideoRef.current) {
      userVideoRef.current.srcObject = null;
    }
    setHasMedia(false);
  }, []);

  /* =====================================================
     CLOSE PEER
  ===================================================== */

  const closePeerConnection = useCallback((socketId) => {
    const pc = peerConnectionsRef.current.get(socketId);
    if (pc) {
      pc.close();
      peerConnectionsRef.current.delete(socketId);
    }

    const video = videoRefs.current.get(socketId);
    if (video) {
      video.srcObject = null;
    }
    videoRefs.current.delete(socketId);
  }, []);

  /* =====================================================
     CREATE PEER CONNECTION
  ===================================================== */

  const createPeerConnection = useCallback(
    (remoteSocketId, socketInstance) => {
      const oldPc = peerConnectionsRef.current.get(remoteSocketId);
      if (oldPc) return oldPc;

      const pc = new RTCPeerConnection(rtcConfiguration);
      peerConnectionsRef.current.set(remoteSocketId, pc);

      // ICE Candidate
      pc.onicecandidate = (event) => {
        if (!event.candidate) return;
        socketInstance.emit("ice-candidate", {
          target: remoteSocketId,
          candidate: event.candidate,
        });
      };

      // Remote Track
      pc.ontrack = (event) => {
        console.log(
          "🎥 Remote track received:",
          remoteSocketId,
          event.track.kind
        );

        let participant = participantsRef.current.get(remoteSocketId);

        if (!participant) {
          participant = {
            socketId: remoteSocketId,
            userId: "",
            userName: "Student",
            stream: new MediaStream(),
          };
        }

        if (!participant.stream) {
          participant.stream = new MediaStream();
        }

        const alreadyAdded = participant.stream
          .getTracks()
          .some((track) => track.id === event.track.id);

        if (!alreadyAdded) {
          participant.stream.addTrack(event.track);
        }

        event.track.onended = () => {
          const current = participantsRef.current.get(remoteSocketId);
          if (!current?.stream) return;

          const remainingTracks = current.stream
            .getTracks()
            .filter((track) => track.readyState !== "ended");

          current.stream = new MediaStream(remainingTracks);
          participantsRef.current.set(remoteSocketId, current);
          setParticipants(Array.from(participantsRef.current.values()));
        };

        participantsRef.current.set(remoteSocketId, participant);
        setParticipants(Array.from(participantsRef.current.values()));
      };

      // Connection State
      pc.onconnectionstatechange = () => {
        console.log(
          `WebRTC ${remoteSocketId}:`,
          pc.connectionState,
          "| ICE:",
          pc.iceConnectionState
        );

        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "closed"
        ) {
          closePeerConnection(remoteSocketId);
          participantsRef.current.delete(remoteSocketId);
          setParticipants(Array.from(participantsRef.current.values()));
        }
      };

      // Local Tracks add করা
      const stream = localStreamRef.current;
      if (stream) {
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });
      }

      return pc;
    },
    [closePeerConnection]
  );

  /* =====================================================
     CREATE OFFER
  ===================================================== */

  const createOfferForUser = useCallback(
    async (remoteSocketId) => {
      const socket = socketRef.current;
      if (!socket || !socket.connected) return;

      let pc = peerConnectionsRef.current.get(remoteSocketId);
      if (!pc) {
        pc = createPeerConnection(remoteSocketId, socket);
      }

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("offer", {
          target: remoteSocketId,
          offer,
        });

        console.log("📤 Offer sent to:", remoteSocketId);
      } catch (error) {
        console.error("Offer error:", error);
      }
    },
    [createPeerConnection]
  );

  /* =====================================================
     START CAMERA (Improved)
  ===================================================== */

  const startCamera = useCallback(async (mode = "user") => {
    setIsStartingMedia(true);

    try {
      // আগের stream বন্ধ করা
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      localStreamRef.current = mediaStream;
      setHasMedia(true);
      setIsVideoOn(true);
      setIsMicOn(true);

      if (userVideoRef.current) {
        userVideoRef.current.srcObject = mediaStream;
      }

      // Existing peer connections-এ track replace করা
      peerConnectionsRef.current.forEach((pc) => {
        const videoTrack = mediaStream.getVideoTracks()[0];
        const audioTrack = mediaStream.getAudioTracks()[0];

        const videoSender = pc
          .getSenders()
          .find((s) => s.track?.kind === "video");
        const audioSender = pc
          .getSenders()
          .find((s) => s.track?.kind === "audio");

        if (videoSender && videoTrack) {
          videoSender.replaceTrack(videoTrack);
        } else if (videoTrack) {
          pc.addTrack(videoTrack, mediaStream);
        }

        if (audioSender && audioTrack) {
          audioSender.replaceTrack(audioTrack);
        } else if (audioTrack) {
          pc.addTrack(audioTrack, mediaStream);
        }
      });

      toast.success("ক্যামেরা ও মাইক্রোফোন চালু হয়েছে");
      return mediaStream;
    } catch (cameraError) {
      console.error("Camera Error:", cameraError.name, cameraError.message);

      // শুধু Audio চেষ্টা করা
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });

        localStreamRef.current = audioStream;
        setHasMedia(true);
        setIsVideoOn(false);
        setIsMicOn(true);

        if (userVideoRef.current) {
          userVideoRef.current.srcObject = audioStream;
        }

        toast("ক্যামেরা পাওয়া যায়নি — শুধু মাইক্রোফোন চালু হয়েছে", {
          icon: "🎤",
        });

        return audioStream;
      } catch (audioError) {
        console.error("Audio Error:", audioError);

        setHasMedia(false);
        setIsVideoOn(false);
        setIsMicOn(false);

        // বাংলায় স্পষ্ট error দেখানো
        if (cameraError.name === "NotAllowedError") {
          toast.error(
            "ক্যামেরা/মাইক পারমিশন দেওয়া হয়নি। ব্রাউজারের সেটিংস থেকে Allow করো।"
          );
        } else if (cameraError.name === "NotFoundError") {
          toast.error("এই ডিভাইসে কোনো ক্যামেরা পাওয়া যায়নি");
        } else if (cameraError.name === "NotReadableError") {
          toast.error(
            "ক্যামেরা অন্য অ্যাপ ব্যবহার করছে (Zoom/Teams বন্ধ করো)"
          );
        } else if (cameraError.name === "OverconstrainedError") {
          toast.error("ক্যামেরা সেটিংস সাপোর্ট করে না");
        } else {
          toast.error(`মিডিয়া এরর: ${cameraError.name}`);
        }

        return null;
      }
    } finally {
      setIsStartingMedia(false);
    }
  }, []);

  /* =====================================================
     SWITCH CAMERA
  ===================================================== */

  const switchCamera = async () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    const stream = await startCamera(newMode);

    if (stream) {
      setFacingMode(newMode);
      toast.success(
        newMode === "user" ? "ফ্রন্ট ক্যামেরা চালু" : "ব্যাক ক্যামেরা চালু"
      );
    }
  };

  /* =====================================================
     INITIALIZE ROOM
  ===================================================== */

  useEffect(() => {
    if (!roomId) return;

    let mounted = true;
    let socketInstance = null;

    const initRoom = async () => {
      const currentUser = getCurrentUser();

      const userId =
        currentUser?._id ||
        currentUser?.id ||
        `guest-${Math.random().toString(36).slice(2, 10)}`;

      const userName =
        currentUser?.name ||
        currentUser?.fullName ||
        currentUser?.username ||
        "Student";

      userInfoRef.current = { userId, userName };

      // IMPORTANT: Do not request camera/microphone permission automatically.
      // The user can join the room first and enable media from the controls.
      if (!mounted) return;

      socketInstance = io(SOCKET_SERVER_URL, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        auth: {
          userId,
          userName,
        },
      });

      socketRef.current = socketInstance;

      // CONNECT
      socketInstance.on("connect", () => {
        console.log("🔌 Socket connected:", socketInstance.id);
        setIsConnected(true);
        socketInstance.emit("join-study-room", roomId);
      });

      socketInstance.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setIsConnected(false);
        toast.error("স্ট্যাডি সার্ভারের সাথে কানেক্ট হয়নি");
      });

      // ROOM FULL
      socketInstance.on("room-full", ({ maxUsers }) => {
        setIsRoomFull(true);
        toast.error(`রুম ফুল! সর্বোচ্চ ${maxUsers} জন থাকতে পারবে`);
      });

      socketInstance.on("room-error", ({ message }) => {
        toast.error(message || "রুমে জয়েন করা যায়নি");
      });

      // EXISTING USERS
      socketInstance.on("room-users", async ({ users, count }) => {
        console.log("👥 Existing users:", users);
        setParticipantCount(count);

        users.forEach((user) => {
          participantsRef.current.set(user.socketId, {
            socketId: user.socketId,
            userId: user.userId,
            userName: user.userName || "Student",
            stream: null,
          });
        });

        setParticipants(Array.from(participantsRef.current.values()));

        for (const user of users) {
          await createOfferForUser(user.socketId);
        }
      });

      // NEW USER
      socketInstance.on(
        "user-connected",
        ({ socketId, userId, userName }) => {
          console.log("👤 New student:", userName, socketId);

          participantsRef.current.set(socketId, {
            socketId,
            userId,
            userName: userName || "Student",
            stream: null,
          });

          setParticipants(Array.from(participantsRef.current.values()));
        }
      );

      // OFFER
      socketInstance.on(
        "offer",
        async ({ offer, caller, callerUserId, callerUserName }) => {
          console.log("📨 Offer from:", callerUserName, caller);

          if (!participantsRef.current.has(caller)) {
            participantsRef.current.set(caller, {
              socketId: caller,
              userId: callerUserId || "",
              userName: callerUserName || "Student",
              stream: null,
            });
          }

          setParticipants(Array.from(participantsRef.current.values()));

          let pc = peerConnectionsRef.current.get(caller);
          if (!pc) {
            pc = createPeerConnection(caller, socketInstance);
          }

          try {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));

            const queuedCandidates =
              pendingIceCandidatesRef.current.get(caller) || [];

            for (const candidate of queuedCandidates) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
              } catch (iceError) {
                console.warn("Queued ICE error:", iceError);
              }
            }

            pendingIceCandidatesRef.current.delete(caller);

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socketInstance.emit("answer", {
              target: caller,
              answer,
            });

            console.log("✅ Answer sent to:", caller);
          } catch (error) {
            console.error("Offer handling error:", error);
          }
        }
      );

      // ANSWER
      socketInstance.on("answer", async ({ answer, responder, answerer }) => {
        try {
          const remoteSocketId = responder || answerer;

          if (!remoteSocketId || !answer) return;

          const pc = peerConnectionsRef.current.get(remoteSocketId);
          if (!pc) return;

          if (pc.signalingState !== "have-local-offer") {
            console.warn("Unexpected signaling state:", pc.signalingState);
            return;
          }

          await pc.setRemoteDescription(new RTCSessionDescription(answer));

          const queuedCandidates =
            pendingIceCandidatesRef.current.get(remoteSocketId) || [];

          for (const candidate of queuedCandidates) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (iceError) {
              console.warn("Queued ICE error:", iceError);
            }
          }

          pendingIceCandidatesRef.current.delete(remoteSocketId);

          console.log("✅ Answer set from:", remoteSocketId);
        } catch (error) {
          console.error("Answer error:", error);
        }
      });

      // ICE
      socketInstance.on("ice-candidate", async ({ candidate, sender }) => {
        if (!candidate || !sender) return;

        const pc = peerConnectionsRef.current.get(sender);

        // ICE can arrive before setRemoteDescription(). Queue it instead of
        // dropping it, otherwise the UI can remain stuck on "Connecting...".
        if (!pc || !pc.remoteDescription) {
          const queue =
            pendingIceCandidatesRef.current.get(sender) || [];

          queue.push(candidate);
          pendingIceCandidatesRef.current.set(sender, queue);
          return;
        }

        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.warn("ICE add error:", error);
        }
      });

      // USER DISCONNECTED
      socketInstance.on("user-disconnected", ({ socketId, userName }) => {
        console.log("👋 User left:", userName);

        closePeerConnection(socketId);
        participantsRef.current.delete(socketId);
        setParticipants(Array.from(participantsRef.current.values()));

        toast(`${userName || "Student"} রুম ছেড়ে চলে গেছে`, {
          icon: "👋",
        });
      });

      // ROOM COUNT
      socketInstance.on("room-user-count", ({ count }) => {
        setParticipantCount(count);
      });

      // CHAT
      socketInstance.on("chat-message", ({ sender, text }) => {
        setMessages((prev) => [
          ...prev,
          { sender: sender || "Student", text },
        ]);
      });
    };

    initRoom();

    return () => {
      mounted = false;

      if (socketInstance) {
        socketInstance.emit("leave-study-room");
        socketInstance.disconnect();
      }

      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
      pendingIceCandidatesRef.current.clear();
      participantsRef.current.clear();
      videoRefs.current.clear();

      stopLocalStream();
    };
  }, [
    roomId,
    startCamera,
    createPeerConnection,
    createOfferForUser,
    closePeerConnection,
    stopLocalStream,
  ]);

  /* =====================================================
     COPY ROOM ID
  ===================================================== */

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      toast.success("Room ID কপি করা হয়েছে!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Room ID কপি করা যায়নি");
    }
  };

  /* =====================================================
     MIC TOGGLE
  ===================================================== */

  const toggleMic = () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return;

    const newState = !isMicOn;
    audioTrack.enabled = newState;
    setIsMicOn(newState);
  };

  /* =====================================================
     VIDEO TOGGLE
  ===================================================== */

  const toggleVideo = () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;

    const newState = !isVideoOn;
    videoTrack.enabled = newState;
    setIsVideoOn(newState);
  };

  /* =====================================================
     CHAT
  ===================================================== */

  const handleSendMessage = (event) => {
    event.preventDefault();

    const message = inputMsg.trim();
    if (!message) return;

    const socket = socketRef.current;
    const currentUser = userInfoRef.current;

    setMessages((prev) => [
      ...prev,
      { sender: "You", text: message },
    ]);

    if (socket && socket.connected) {
      socket.emit("chat-message", {
        roomId,
        text: message,
        sender: currentUser.userName,
      });
    }

    setInputMsg("");
  };

  /* =====================================================
     LEAVE
  ===================================================== */

  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit("leave-study-room");
      socketRef.current.disconnect();
    }

    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
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

          <h1 className="text-xl font-bold mb-2">Study Room Full</h1>
          <p className="text-sm text-slate-400 mb-6">
            এই রুমে সর্বোচ্চ {MAX_ROOM_USERS} জন স্টুডেন্ট থাকতে পারবে।
          </p>

          <button
            onClick={() => router.push("/study-room")}
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
      {/* HEADER */}
      <header className="h-16 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
              }`}
            />
            <h1 className="text-xs sm:text-sm font-bold text-white truncate">
              📚 {subject}: {topic}
            </h1>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] text-slate-400">
              Room ID:{" "}
              <span className="text-indigo-400 font-mono font-semibold">
                {roomId}
              </span>
            </p>

            <button
              onClick={handleCopyRoomId}
              className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1 text-[10px] border border-slate-700"
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              {copied ? "Copied" : "Copy ID"}
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
            {participantCount}/{MAX_ROOM_USERS}
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

      {/* MAIN */}
      <div className="flex-1 p-4 sm:p-6 overflow-auto">
        {/* VIDEO GRID */}
        <div
          className={`grid gap-4 ${
            participants.length + 1 <= 2
              ? "grid-cols-1 md:grid-cols-2"
              : participants.length + 1 <= 4
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {/* MY VIDEO */}
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl relative overflow-hidden min-h-[230px]">
            {hasMedia && isVideoOn ? (
              <video
                ref={userVideoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover ${
                  facingMode === "user" ? "-scale-x-100" : ""
                }`}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                <div className="text-center text-slate-500">
                  <VideoOff className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Camera Off</p>

                  {/* ম্যানুয়ালি ক্যামেরা চালু করার বাটন */}
                  {!hasMedia && (
                    <button
                      onClick={() => startCamera("user")}
                      disabled={isStartingMedia}
                      className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg flex items-center gap-2 mx-auto disabled:opacity-50"
                    >
                      <Camera className="w-4 h-4" />
                      {isStartingMedia ? "চালু হচ্ছে..." : "ক্যামেরা চালু করো"}
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="absolute top-3 left-3 z-20">
              <span className="text-[10px] font-semibold text-white bg-indigo-600/80 px-2.5 py-1 rounded-lg backdrop-blur-md">
                {userInfoRef?.current?.userName}
              </span>
            </div>

            {!isMicOn && (
              <div className="absolute top-3 right-3 z-20 bg-rose-500/20 border border-rose-500/30 p-2 rounded-lg">
                <MicOff className="w-3.5 h-3.5 text-rose-400" />
              </div>
            )}
          </div>

          {/* OTHER PARTICIPANTS */}
          {participants.map((participant) => (
            <ParticipantVideo
              key={participant.socketId}
              participant={participant}
              videoRefs={videoRefs}
            />
          ))}

          {/* WAITING */}
          {participantCount === 1 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl min-h-[230px] flex items-center justify-center">
              <div className="text-center text-slate-600">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs">অন্য স্টুডেন্টের জন্য অপেক্ষা করছে...</p>
                <p className="text-[10px] text-slate-700 mt-1">
                  রুমে সর্বোচ্চ {MAX_ROOM_USERS} জন থাকতে পারবে
                </p>
              </div>
            </div>
          )}
        </div>

        {/* CHAT */}
        <div className="mt-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col min-h-[300px] overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Study Discussion</span>
            </div>
            <span className="text-[10px] text-slate-500">
              {messages.length} messages
            </span>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 max-h-[300px]">
            {messages.map((message, index) => (
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
                    message.system ? "text-emerald-400" : "text-indigo-400"
                  }`}
                >
                  {message.sender}
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {message.text}
                </p>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-slate-800 flex gap-2"
          >
            <input
              type="text"
              placeholder="Discuss your study..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim()}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="min-h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-2 sm:gap-4 px-3 py-3 shrink-0">
        <button
          onClick={toggleMic}
          disabled={!hasMedia}
          className={`p-3.5 rounded-2xl border transition-all disabled:opacity-40 ${
            isMicOn
              ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
              : "bg-rose-500/20 border-rose-500/30 text-rose-400"
          }`}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleVideo}
          disabled={!hasMedia}
          className={`p-3.5 rounded-2xl border transition-all disabled:opacity-40 ${
            isVideoOn
              ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
              : "bg-rose-500/20 border-rose-500/30 text-rose-400"
          }`}
        >
          {isVideoOn ? (
            <Video className="w-5 h-5" />
          ) : (
            <VideoOff className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={switchCamera}
          disabled={!hasMedia}
          className="p-3.5 rounded-2xl border bg-slate-800 border-slate-700 text-white hover:bg-indigo-600/20 hover:border-indigo-500/40 transition-all disabled:opacity-40"
          title="Switch Front / Back Camera"
        >
          <SwitchCamera className="w-5 h-5" />
        </button>

        <button
          onClick={leaveRoom}
          className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg shadow-rose-600/30"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   PARTICIPANT VIDEO COMPONENT
========================================================= */

function ParticipantVideo({ participant, videoRefs }) {
  const localVideoRef = useRef(null);

  useEffect(() => {
    const videoElement = localVideoRef.current;

    videoRefs.current.set(participant.socketId, videoElement);

    if (videoElement && participant.stream) {
      videoElement.srcObject = participant.stream;
      videoElement.play().catch(() => {
        // Browser autoplay policies may block play until user interaction.
      });
    }

    return () => {
      if (videoElement) {
        videoElement.srcObject = null;
      }
      videoRefs.current.delete(participant.socketId);
    };
  }, [participant.socketId, participant.stream, videoRefs]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden min-h-[230px]">
      {participant.stream ? (
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-slate-600">
            <div className="w-14 h-14 rounded-full bg-slate-800 mx-auto flex items-center justify-center mb-3">
              <Users className="w-7 h-7 opacity-50" />
            </div>
            <p className="text-xs">Connecting...</p>
          </div>
        </div>
      )}

      <div className="absolute top-3 left-3 z-20">
        <span className="text-[10px] font-semibold text-white bg-slate-950/75 px-2.5 py-1 rounded-lg backdrop-blur-md">
          👤 {participant.userName || "Student"}
        </span>
      </div>
    </div>
  );
}