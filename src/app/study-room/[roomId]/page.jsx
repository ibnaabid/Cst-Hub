"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, 
  SwitchCamera, Send, Users, MessageSquare, ShieldAlert, X 
} from "lucide-react";

const MAX_ROOM_LIMIT = 5;

export default function StudyRoomPage() {
  const { roomId } = useParams();
  const router = useRouter();

  const [socket, setSocket] = useState(null);
  const [stream, setStream] = useState(null);
  const [participants, setParticipants] = useState([]);
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [facingMode, setFacingMode] = useState("user");
  
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [permissionError, setPermissionError] = useState(null);
  const [roomFullError, setRoomFullError] = useState(false);
  
  // মোবাইল চ্যাট ওপেন/ক্লোজ করার স্টেট
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const [myName] = useState(() => "User_" + Math.floor(1000 + Math.random() * 9000));

  const myVideoRef = useRef(null);
  const streamRef = useRef(null); 
  const peersRef = useRef({});
  const videoRefs = useRef(new Map());
  const pendingIceCandidatesRef = useRef(new Map());

  const ICE_SERVERS = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  const playSound = (type) => {
    try {
      let audio;
      if (type === 'click') {
        audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
      } else if (type === 'join') {
        audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      } else if (type === 'leave') {
        audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
      }
      audio.volume = 0.4;
      audio.play().catch((e) => console.log("Audio play blocked:", e));
    } catch (err) {
      console.log("Sound error:", err);
    }
  };

  useEffect(() => {
    async function initMedia() {
      try {
        setPermissionError(null);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        const currentStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode },
          audio: true,
        });
        
        streamRef.current = currentStream;
        setStream(currentStream);
        
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = currentStream;
        }
      } catch (err) {
        console.error("Camera/Mic permission denied:", err);
        setPermissionError("ক্যামেরা বা মাইক্রোফোনের পারমিশন পাওয়া যায়নি।");
      }
    }

    initMedia();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const createPeerConnection = (targetSocketId, remoteUserName, socketInstance) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketInstance.emit("ice-candidate", {
          target: targetSocketId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      setParticipants((prev) => {
        const existing = prev.find((p) => p.socketId === targetSocketId);
        if (existing) {
          return prev.map((p) => p.socketId === targetSocketId ? { ...p, stream: remoteStream } : p);
        } else {
          return [...prev, { socketId: targetSocketId, userName: remoteUserName, stream: remoteStream, isAudioOn: true, isVideoOn: true }];
        }
      });
    };

    return pc;
  };

  const processPendingIceCandidates = async (sender, pc) => {
    const candidates = pendingIceCandidatesRef.current.get(sender);
    if (candidates && candidates.length > 0) {
      for (const candidate of candidates) {
        try {
          await pc.addIceCandidate(candidate);
        } catch (err) {
          console.error("Error adding pending ICE candidate", err);
        }
      }
      pendingIceCandidatesRef.current.delete(sender);
    }
  };

  useEffect(() => {
    if (!roomId) return;

    const newSocket = io("https://csthub-backend-dw3l.onrender.com", {
      transports: ["websocket", "polling"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected:", newSocket.id);
      newSocket.emit("join-room", { roomId, userName: myName });
    });

    newSocket.on("room-full", () => {
      setRoomFullError(true);
      playSound("leave");
    });

    newSocket.on("user-connected", async ({ socketId, userName }) => {
      playSound("join");
      setMessages((prev) => [...prev, { sender: "System", text: `${userName || "মেম্বার"} রুমে জয়েন করেছে।` }]);

      const peerConnection = createPeerConnection(socketId, userName, newSocket);
      peersRef.current[socketId] = peerConnection;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          peerConnection.addTrack(track, streamRef.current);
        });
      }

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      newSocket.emit("offer", { target: socketId, offer, senderName: myName });
    });

    newSocket.on("offer", async ({ sender, offer, senderName }) => {
      let peerConnection = peersRef.current[sender];
      if (!peerConnection) {
        peerConnection = createPeerConnection(sender, senderName, newSocket);
        peersRef.current[sender] = peerConnection;
      }

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      await processPendingIceCandidates(sender, peerConnection);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          peerConnection.addTrack(track, streamRef.current);
        });
      }

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      newSocket.emit("answer", { target: sender, answer });
    });

    newSocket.on("answer", async ({ sender, answer }) => {
      const peerConnection = peersRef.current[sender];
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        await processPendingIceCandidates(sender, peerConnection);
      }
    });

    newSocket.on("ice-candidate", async ({ sender, candidate }) => {
      const peerConnection = peersRef.current[sender];
      if (!candidate) return;

      const candidateObj = new RTCIceCandidate(candidate);
      if (peerConnection && peerConnection.remoteDescription) {
        await peerConnection.addIceCandidate(candidateObj);
      } else {
        if (!pendingIceCandidatesRef.current.has(sender)) {
          pendingIceCandidatesRef.current.set(sender, []);
        }
        pendingIceCandidatesRef.current.get(sender).push(candidateObj);
      }
    });

    newSocket.on("user-disconnected", ({ socketId, userName }) => {
      playSound("leave");
      setMessages((prev) => [...prev, { sender: "System", text: `${userName || "মেম্বার"} চলে গেছে।` }]);

      if (peersRef.current[socketId]) {
        peersRef.current[socketId].close();
        delete peersRef.current[socketId];
      }

      setParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
    });

    newSocket.on("user-status-changed", ({ socketId, isAudioOn, isVideoOn }) => {
      setParticipants((prev) =>
        prev.map((p) => p.socketId === socketId ? { ...p, isAudioOn, isVideoOn } : p)
      );
    });

    newSocket.on("chat-message", ({ sender, message }) => {
      setMessages((prev) => [...prev, { sender, text: message }]);
    });

    return () => {
      newSocket.disconnect();
      Object.values(peersRef.current).forEach((pc) => pc.close());
    };
  }, [roomId, myName]);

  const toggleMic = () => {
    playSound('click');
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
        if (socket) socket.emit("toggle-status", { roomId, isAudioOn: audioTrack.enabled, isVideoOn });
      }
    }
  };

  const toggleVideo = () => {
    playSound('click');
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
        if (socket) socket.emit("toggle-status", { roomId, isAudioOn: isMicOn, isVideoOn: videoTrack.enabled });
      }
    }
  };

  const switchCamera = () => {
    playSound('click');
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const leaveRoom = () => {
    playSound('leave');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (socket) socket.disconnect();
    router.push("/");
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    playSound('click');

    const msgData = { roomId, message: inputMsg, sender: myName };
    setMessages((prev) => [...prev, { sender: myName, text: inputMsg }]);
    if (socket) socket.emit("chat-message", msgData);
    setInputMsg("");
  };

  if (roomFullError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-white p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">রুমটি পূর্ণ</h2>
        <button onClick={() => router.push("/")} className="px-6 py-2.5 bg-indigo-600 rounded-xl text-sm font-semibold">হোমে যান</button>
      </div>
    );
  }

  return (
   
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative">
      {/* <header className="h-16 bg-slate-900/80 border-b border-white/10 px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-40"> */}
      <header className="h-16 bg-slate-900/80 border-b border-white/10 px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <h1 className="text-xs sm:text-sm font-semibold text-indigo-300">রুম: {roomId}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>{participants.length + 1} জন</span>
          </div>
          {/* মোবাইলের জন্য চ্যাট টগল বাটন */}
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-300 lg:hidden relative"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row p-3 sm:p-4 gap-4 relative">
        {/* ভিডিও গ্রিড */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl relative overflow-hidden min-h-[220px] flex items-center justify-center shadow-xl">
            <video
              ref={myVideoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${facingMode === "user" ? "-scale-x-100" : ""}`}
            />
            {!isVideoOn && (
              <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center">
                <span className="text-xs text-slate-400">ক্যামেরা অফ</span>
              </div>
            )}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
              <span className="text-[10px] font-semibold text-white bg-black/50 px-2 py-1 rounded-lg backdrop-blur-md">
                {myName} (আপনি)
              </span>
            </div>
          </div>

          {participants.map((participant) => (
            <ParticipantVideo key={participant.socketId} participant={participant} />
          ))}
        </div>

        {/* চ্যাট সেকশন (ডেস্কটপে সাইডবার, মোবাইলে পপআপ ড্রয়ার) */}
        <div className={`fixed lg:relative inset-y-0 right-0 z-50 w-80 bg-slate-900/95 lg:bg-slate-900/40 border-l lg:border border-white/10 flex flex-col backdrop-blur-2xl transition-transform duration-300 ${
          isChatOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}>
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-200">রুম চ্যাট</h2>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 max-h-[calc(100vh-200px)] lg:max-h-[500px]">
            {messages.map((msg, index) => (
              <div key={index} className={`p-2.5 rounded-xl border ${
                msg.sender === "System" ? "bg-amber-500/10 border-amber-500/20 text-amber-300 text-center text-[11px]" : "bg-white/5 border-white/10"
              }`}>
                {msg.sender !== "System" && <span className="text-[10px] font-bold text-indigo-400 block mb-0.5">{msg.sender}</span>}
                <p className="text-xs text-slate-300">{msg.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex gap-2 bg-white/5">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="মেসেজ লিখুন..."
              className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <button type="submit" className="bg-indigo-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-lg">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* ফুটার কন্ট্রোল */}
      <footer className="h-20 bg-slate-900/90 border-t border-white/10 px-4 flex items-center justify-center gap-3 shrink-0 shadow-2xl sticky bottom-0 z-40">
        <button onClick={toggleMic} className={`p-3.5 rounded-2xl border ${isMicOn ? "bg-white/10 text-white" : "bg-rose-500/20 text-rose-400"}`}>
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>
        <button onClick={toggleVideo} className={`p-3.5 rounded-2xl border ${isVideoOn ? "bg-white/10 text-white" : "bg-rose-500/20 text-rose-400"}`}>
          {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>
        <button onClick={switchCamera} className="p-3.5 rounded-2xl bg-white/10 text-slate-300">
          <SwitchCamera className="w-5 h-5" />
        </button>
        <button onClick={leaveRoom} className="px-5 py-3.5 rounded-2xl bg-rose-600 text-white font-semibold">
          <PhoneOff className="w-5 h-5" />
        </button>
      </footer>
    </div>
  
  );
}