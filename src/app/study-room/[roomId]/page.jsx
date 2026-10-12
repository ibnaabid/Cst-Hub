"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Send, Users, MessageSquare, X } from "lucide-react";

export default function CleanStudyRoom() {
  const { roomId } = useParams();
  const router = useRouter();

  const [socket, setSocket] = useState(null);
  const [stream, setStream] = useState(null);
  const [participants, setParticipants] = useState([]);
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [myName] = useState(() => "Student_" + Math.floor(100 + Math.random() * 900));

  const myVideoRef = useRef(null);
  const peersRef = useRef({});
  const streamRef = useRef(null);

  const ICE_SERVERS = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  // ১. মিডিয়া এবং সকেট কানেকশন ইনিশিয়ালাইজেশন
  useEffect(() => {
    if (!roomId) return;

    async function init() {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = localStream;
        setStream(localStream);
        if (myVideoRef.current) myVideoRef.current.srcObject = localStream;

        const newSocket = io("https://csthub-backend-dw3l.onrender.com", {
          transports: ["websocket", "polling"],
        });
        setSocket(newSocket);

        newSocket.on("connect", () => {
          newSocket.emit("join-study-room", roomId);
        });

        newSocket.on("room-users", async ({ users }) => {
          users.forEach(async (user) => {
            if (user.socketId === newSocket.id) return;
            const pc = createPeerConnection(user.socketId, user.userName, newSocket);
            peersRef.current[user.socketId] = pc;
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            newSocket.emit("offer", { target: user.socketId, offer });
          });
        });

        newSocket.on("user-connected", async ({ socketId, userName }) => {
          setMessages((prev) => [...prev, { sender: "System", text: `${userName || "কেউ একজন"} রুমে এসেছে।` }]);
        });

        newSocket.on("offer", async ({ offer, caller, callerUserName }) => {
          let pc = peersRef.current[caller];
          if (!pc) {
            pc = createPeerConnection(caller, callerUserName, newSocket);
            peersRef.current[caller] = pc;
          }
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          newSocket.emit("answer", { target: caller, answer });
        });

        newSocket.on("answer", async ({ answer, responder }) => {
          const pc = peersRef.current[responder];
          if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
        });

        newSocket.on("ice-candidate", async ({ candidate, sender }) => {
          const pc = peersRef.current[sender];
          if (pc && candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
        });

        newSocket.on("user-disconnected", ({ socketId, userName }) => {
          setMessages((prev) => [...prev, { sender: "System", text: `${userName || "কেউ একজন"} চলে গেছে।` }]);
          if (peersRef.current[socketId]) {
            peersRef.current[socketId].close();
            delete peersRef.current[socketId];
          }
          setParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
        });

        newSocket.on("chat-message", ({ sender, text }) => {
          setMessages((prev) => [...prev, { sender, text }]);
        });

      } catch (err) {
        console.error("Media error:", err);
        alert("ক্যামেরা বা মাইক্রোফোনের পারমিশন পাওয়া যায়নি!");
      }
    }

    init();

    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      Object.values(peersRef.current).forEach(pc => pc.close());
    };
  }, [roomId]);

  const createPeerConnection = (targetSocketId, remoteName, sock) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => pc.addTrack(track, streamRef.current));
    }

    pc.onicecandidate = (e) => {
      if (e.candidate) sock.emit("ice-candidate", { target: targetSocketId, candidate: e.candidate });
    };

    pc.ontrack = (e) => {
      const remoteStream = e.streams[0];
      setParticipants((prev) => {
        const exist = prev.find(p => p.socketId === targetSocketId);
        if (exist) {
          return prev.map(p => p.socketId === targetSocketId ? { ...p, stream: remoteStream } : p);
        }
        return [...prev, { socketId: targetSocketId, userName: remoteName, stream: remoteStream }];
      });
    };

    return pc;
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const track = streamRef.current.getAudioTracks()[0];
      track.enabled = !track.enabled;
      setIsMicOn(track.enabled);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      track.enabled = !track.enabled;
      setIsVideoOn(track.enabled);
    }
  };

  const leaveRoom = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (socket) socket.disconnect();
    router.push("/");
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    socket.emit("chat-message", { roomId, text: inputMsg });
    setMessages((prev) => [...prev, { sender: myName, text: inputMsg }]);
    setInputMsg("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="h-14 bg-slate-900 border-b border-white/10 px-4 flex items-center justify-between shrink-0">
        <span className="text-xs text-indigo-400 font-bold">Room: {roomId}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white/10 px-2 py-1 rounded-lg flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {participants.length + 1}
          </span>
          <button onClick={() => setIsChatOpen(!isChatOpen)} className="p-2 bg-indigo-600/30 rounded-xl lg:hidden">
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex relative overflow-hidden pb-20">
        {/* Videos */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 p-3 gap-3 overflow-y-auto content-start">
          <div className="bg-slate-900 rounded-xl relative min-h-[200px] overflow-hidden flex items-center justify-center border border-white/10">
            <video ref={myVideoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover -scale-x-100" />
            <span className="absolute bottom-2 left-2 bg-black/60 text-[10px] px-2 py-0.5 rounded">{myName} (আপনি)</span>
          </div>
          {participants.map((p) => (
            <RemoteVideo key={p.socketId} participant={p} />
          ))}
        </div>

        {/* Chat Panel */}
        <div className={`absolute lg:relative inset-y-0 right-0 z-50 w-72 bg-slate-900 border-l border-white/10 flex flex-col transition-transform ${
          isChatOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}>
          <div className="p-3 border-b border-white/10 flex justify-between items-center">
            <span className="text-xs font-bold text-indigo-300">চ্যাট</span>
            <button onClick={() => setIsChatOpen(false)} className="lg:hidden"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
            {messages.map((m, idx) => (
              <div key={idx} className={`p-2 rounded-lg ${m.sender === "System" ? "bg-amber-500/10 text-amber-300 text-center text-[10px]" : "bg-white/5"}`}>
                {m.sender !== "System" && <span className="font-bold text-indigo-400 block mb-0.5">{m.sender}</span>}
                {m.text}
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} className="p-2 border-t border-white/10 flex gap-1 bg-slate-950">
            <input 
              type="text" 
              value={inputMsg} 
              onChange={(e) => setInputMsg(e.target.value)} 
              placeholder="মেসেজ..." 
              className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
            />
            <button type="submit" className="bg-indigo-600 px-3 py-1.5 rounded-lg"><Send className="w-3.5 h-3.5" /></button>
          </form>
        </div>
      </div>

      {/* Footer Controls */}
      <footer className="h-16 bg-slate-900 border-t border-white/10 fixed bottom-0 left-0 right-0 flex items-center justify-center gap-3 z-50">
        <button onClick={toggleMic} className={`p-3 rounded-xl ${isMicOn ? "bg-white/10" : "bg-rose-500/20 text-rose-400"}`}>
          {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>
        <button onClick={toggleVideo} className={`p-3 rounded-xl ${isVideoOn ? "bg-white/10" : "bg-rose-500/20 text-rose-400"}`}>
          {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
        </button>
        <button onClick={leaveRoom} className="px-4 py-2.5 bg-rose-600 rounded-xl font-bold flex items-center gap-1">
          <PhoneOff className="w-4 h-4" /> কল কাটুন
        </button>
      </footer>
    </div>
  );
}

function RemoteVideo({ participant }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && participant.stream) {
      ref.current.srcObject = participant.stream;
      ref.current.play().catch(e => console.log(e));
    }
  }, [participant.stream]);

  return (
    <div className="bg-slate-900 rounded-xl relative min-h-[200px] overflow-hidden flex items-center justify-center border border-white/10">
      <video ref={ref} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
      <span className="absolute bottom-2 left-2 bg-black/60 text-[10px] px-2 py-0.5 rounded">{participant.userName || "Student"}</span>
    </div>
  );
}