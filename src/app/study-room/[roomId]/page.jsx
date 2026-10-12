"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, 
  SwitchCamera, Send, Users, MessageSquare, ShieldAlert, X 
} from "lucide-react";

export default function CleanStudyRoom() {
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
  const [roomFullError, setRoomFullError] = useState(false);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // ডাইনামিক রিয়েল ইউজারনেম (লোকালস্টোরেজ বা ডিফল্ট থেকে নাম নেওয়া)
  const [myName] = useState(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("userName") || localStorage.getItem("studentName");
      if (savedUser) return savedUser;
    }
    return "Md Ibna Abid"; // চাইলে এখানে আপনার প্রফেশনাল নাম বা ডিফল্ট নাম থাকবে
  });

  const myVideoRef = useRef(null);
  const streamRef = useRef(null);
  const peersRef = useRef({});

  const ICE_SERVERS = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      {
        urls: "turn:openrelay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turn:openrelay.metered.ca:443",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
    ],
  };

  useEffect(() => {
    async function initMedia() {
      try {
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
        alert("Camera ba Microphone-er permission paowa jayni!");
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

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, streamRef.current);
      });
    }

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
          return [...prev, { socketId: targetSocketId, userName: remoteUserName, stream: remoteStream }];
        }
      });
    };

    return pc;
  };

  useEffect(() => {
    if (!roomId) return;

    const backendUrl = "https://csthub-backend-dw3l.onrender.com"; 
    const newSocket = io(backendUrl, {
      auth: { userName: myName },
      transports: ["websocket", "polling"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to socket:", newSocket.id);
      newSocket.emit("join-study-room", roomId);
    });

    newSocket.on("room-full", () => {
      setRoomFullError(true);
    });

    newSocket.on("room-users", async ({ users }) => {
      const otherUsers = users.filter((u) => u.socketId !== newSocket.id);
      
      setParticipants((prev) => {
        otherUsers.forEach(async (user) => {
          if (!peersRef.current[user.socketId]) {
            const pc = createPeerConnection(user.socketId, user.userName, newSocket);
            peersRef.current[user.socketId] = pc;

            try {
              const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
              });
              await pc.setLocalDescription(offer);
              newSocket.emit("offer", { target: user.socketId, offer, senderName: myName });
            } catch (err) {
              console.error("Error creating offer:", err);
            }
          }
        });

        return otherUsers.map((u) => {
          const existing = prev.find((p) => p.socketId === u.socketId);
          return {
            socketId: u.socketId,
            userName: u.userName,
            stream: existing ? existing.stream : null,
          };
        });
      });
    });

    newSocket.on("user-connected", ({ socketId, userName }) => {
      setMessages((prev) => [...prev, { sender: "System", text: `${userName || "Keu ekjon"} room-e eseche.` }]);
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
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    newSocket.on("ice-candidate", async ({ candidate, sender }) => {
      const pc = peersRef.current[sender];
      if (pc && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    newSocket.on("user-disconnected", ({ socketId, userName }) => {
      setMessages((prev) => [...prev, { sender: "System", text: `${userName || "Keu ekjon"} chole geche.` }]);

      if (peersRef.current[socketId]) {
        peersRef.current[socketId].close();
        delete peersRef.current[socketId];
      }

      setParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
    });

    newSocket.on("chat-message", ({ sender, text }) => {
      setMessages((prev) => [...prev, { sender, text }]);
    });

    return () => {
      newSocket.disconnect();
      Object.values(peersRef.current).forEach((pc) => pc.close());
    };
  }, [roomId, myName]);

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

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const leaveRoom = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
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

  if (roomFullError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-white p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Room-ti purno</h2>
        <button onClick={() => router.push("/")} className="px-6 py-2.5 bg-indigo-600 rounded-xl text-sm font-semibold">Home-e jan</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col h-screen overflow-hidden">
      <header className="h-14 bg-slate-900 border-b border-white/10 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></div>
          <span className="text-xs text-indigo-300 font-semibold">Room: {roomId}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-slate-300">
            <Users className="w-3.5 h-3.5 text-indigo-400" /> {participants.length + 1} jon
          </span>
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)} 
            className="p-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 rounded-xl lg:hidden relative"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex relative overflow-hidden pb-20">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-3 gap-3 overflow-y-auto content-start">
          <div className="bg-slate-900/80 rounded-2xl relative min-h-[200px] overflow-hidden flex items-center justify-center border border-white/10 shadow-lg">
            <video 
              ref={myVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`absolute inset-0 w-full h-full object-cover ${facingMode === "user" ? "-scale-x-100" : ""}`} 
            />
            {!isVideoOn && (
              <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center">
                <span className="text-xs text-slate-400">Camera Off</span>
              </div>
            )}
            <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-[10px] font-medium px-2 py-1 rounded-lg text-white">
              {myName} (Apni)
            </span>
          </div>

          {participants.map((p) => (
            <RemoteVideo key={p.socketId} participant={p} />
          ))}
        </div>

        <div className={`absolute lg:relative inset-y-0 right-0 z-50 w-80 sm:w-80 bg-slate-900/95 lg:bg-slate-900/40 border-l border-white/10 flex flex-col backdrop-blur-xl transition-transform duration-300 ${
          isChatOpen ? "translate-x-0 shadow-2xl" : "translate-x-full lg:translate-x-0"
        }`}>
          <div className="h-12 px-4 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Room Chat
            </span>
            <button onClick={() => setIsChatOpen(false)} className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg bg-white/5">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
            {messages.map((m, idx) => (
              <div key={idx} className={`p-2.5 rounded-xl border ${
                m.sender === "System" ? "bg-amber-500/10 border-amber-500/20 text-amber-300 text-center text-[10px]" : "bg-white/5 border-white/10"
              }`}>
                {m.sender !== "System" && <span className="font-bold text-indigo-400 block mb-0.5">{m.sender}</span>}
                <p className="text-slate-300">{m.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="p-2.5 border-t border-white/10 flex gap-2 bg-slate-950 shrink-0">
            <input 
              type="text" 
              value={inputMsg} 
              onChange={(e) => setInputMsg(e.target.value)} 
              placeholder="Message likhun..." 
              className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <button type="submit" className="bg-indigo-600 px-3.5 py-2 rounded-xl text-white flex items-center justify-center shadow-md">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      <footer className="h-16 bg-slate-900/95 border-t border-white/10 fixed bottom-0 left-0 right-0 flex items-center justify-center gap-3 z-40 shadow-2xl">
        <button onClick={toggleMic} className={`p-3 rounded-2xl border ${isMicOn ? "bg-white/10 text-white" : "bg-rose-500/20 text-rose-400 border-rose-500/30"}`}>
          {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>
        <button onClick={toggleVideo} className={`p-3 rounded-2xl border ${isVideoOn ? "bg-white/10 text-white" : "bg-rose-500/20 text-rose-400 border-rose-500/30"}`}>
          {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
        </button>
        <button onClick={switchCamera} className="p-3 rounded-2xl bg-white/10 border border-white/10 text-slate-300">
          <SwitchCamera className="w-4 h-4" />
        </button>
        <button onClick={leaveRoom} className="px-4 py-2.5 bg-rose-600 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-lg">
          <PhoneOff className="w-4 h-4" /> Kol Katun
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
      const playPromise = ref.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Remote video play error:", error);
        });
      }
    }
  }, [participant.stream]);

  return (
    <div className="bg-slate-900/80 rounded-2xl relative min-h-[200px] overflow-hidden flex items-center justify-center border border-white/10 shadow-lg">
      <video ref={ref} autoPlay playsInline muted={false} className="absolute inset-0 w-full h-full object-cover" />
      <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-[10px] font-medium px-2 py-1 rounded-lg text-white">
        {participant.userName || "Student"}
      </span>
    </div>
  );
}