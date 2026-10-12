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
  const [participants, setParticipants] = useState([]);
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [facingMode, setFacingMode] = useState("user");
  
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [roomFullError, setRoomFullError] = useState(false);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // LocalStorage থেকে ইউজার নাম বা ডিফল্ট নাম
  const [myName] = useState(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("userName") || localStorage.getItem("studentName");
      if (savedUser) return savedUser;
    }
    return "Md Ibna Abid";
  });

  const myVideoRef = useRef(null);
  const streamRef = useRef(null);
  const peersRef = useRef({});

  // WebRTC STUN/TURN Servers Config
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

  // ক্যামেরা এবং মাইক স্ট্রিম ইনিশিয়ালাইজেশন
  useEffect(() => {
    async function initMedia() {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        const currentStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: true,
        });
        
        streamRef.current = currentStream;
        
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = currentStream;
        }
      } catch (err) {
        console.error("Camera/Mic permission error:", err);
      }
    }

    initMedia();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Peer Connection তৈরি ও ট্র্যাক সিঙ্ক
  const createPeerConnection = (targetSocketId, remoteUserName, socketInstance) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // লোকাল মিডিয়া ট্র্যাক অ্যাড করা
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, streamRef.current);
      });
    } else {
      // স্ট্রিম না থাকলে অন্তত Transceivers রিসিভার হিসেবে সেট রাখা
      pc.addTransceiver("video", { direction: "sendrecv" });
      pc.addTransceiver("audio", { direction: "sendrecv" });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketInstance.emit("ice-candidate", {
          target: targetSocketId,
          candidate: event.candidate,
        });
      }
    };

    // রিমোট মিডিয়া ট্র্যাক আসার সাথে সাথে স্টেট আপডেট
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        setParticipants((prev) => {
          const existing = prev.find((p) => p.socketId === targetSocketId);
          if (existing) {
            return prev.map((p) => 
              p.socketId === targetSocketId ? { ...p, stream: remoteStream, userName: remoteUserName || p.userName } : p
            );
          } else {
            return [...prev, { socketId: targetSocketId, userName: remoteUserName, stream: remoteStream }];
          }
        });
      }
    };

    return pc;
  };

  // Socket.io ইভেন্ট হুক
  useEffect(() => {
    if (!roomId) return;

    const backendUrl = "https://csthub-backend-dw3l.onrender.com"; 
    const newSocket = io(backendUrl, {
      auth: { userName: myName },
      transports: ["websocket", "polling"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
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

    return () => {
      newSocket.disconnect();
      Object.values(peersRef.current).forEach((pc) => pc.close());
    };
  }, [roomId, myName]);

  const toggleMic = () => {
    if (streamRef.current) {
      const track = streamRef.current.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsMicOn(track.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsVideoOn(track.enabled);
      }
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
        <h2 className="text-xl font-bold mb-2">রুমটি পূর্ণ</h2>
        <button onClick={() => router.push("/")} className="px-6 py-2.5 bg-indigo-600 rounded-xl text-sm font-semibold">হোমে যান</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col h-[100dvh] w-screen overflow-hidden">
      {/* Top Header */}
      <header className="h-14 bg-slate-900 border-b border-white/10 px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs text-indigo-300 font-semibold truncate max-w-[120px] sm:max-w-none">
            রুম: {roomId}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-slate-300">
            <Users className="w-3.5 h-3.5 text-indigo-400" /> {participants.length + 1} জন
          </span>
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)} 
            className="p-2 bg-indigo-600 border border-indigo-500 text-white rounded-xl relative hover:bg-indigo-500 transition-all active:scale-95"
            title="Chat Box"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex relative overflow-hidden pb-16">
        {/* Videos Grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-3 gap-3 overflow-y-auto content-start">
          {/* My Local Video Card */}
          <div className="bg-slate-900/80 rounded-2xl relative min-h-[200px] h-48 sm:h-56 overflow-hidden flex items-center justify-center border border-white/10 shadow-lg">
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
            <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-[10px] font-medium px-2 py-1 rounded-lg text-white z-10">
              {myName} (আপনি)
            </span>
          </div>

          {/* Remote Participants Video Cards */}
          {participants.map((p) => (
            <RemoteVideo key={p.socketId} participant={p} />
          ))}
        </div>

        {/* Mobile & Desktop Responsive Chat Drawer */}
        <div className={`fixed lg:absolute right-0 inset-y-0 z-50 w-full sm:w-80 bg-slate-900/95 lg:bg-slate-900/90 border-l border-white/10 flex flex-col backdrop-blur-2xl transition-transform duration-300 ${
          isChatOpen ? "translate-x-0 shadow-2xl" : "translate-x-full"
        }`}>
          <div className="h-14 px-4 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" /> স্টাডি রুম চ্যাট
            </span>
            <button 
              onClick={() => setIsChatOpen(false)} 
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
            {messages.length === 0 && (
              <p className="text-slate-500 text-center py-8 text-[11px]">কোনো মেসেজ নেই। প্রথম মেসেজ লিখুন!</p>
            )}
            {messages.map((m, idx) => (
              <div key={idx} className={`p-2.5 rounded-xl border ${
                m.sender === "System" ? "bg-amber-500/10 border-amber-500/20 text-amber-300 text-center text-[10px]" : "bg-white/5 border-white/10"
              }`}>
                {m.sender !== "System" && <span className="font-bold text-indigo-400 block mb-0.5">{m.sender}</span>}
                <p className="text-slate-200 break-words">{m.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="p-3 border-t border-white/10 flex gap-2 bg-slate-950 shrink-0 mb-14 lg:mb-0">
            <input 
              type="text" 
              value={inputMsg} 
              onChange={(e) => setInputMsg(e.target.value)} 
              placeholder="মেসেজ লিখুন..." 
              className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 rounded-xl text-white flex items-center justify-center shadow-md active:scale-95">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <footer className="h-16 bg-slate-900/95 border-t border-white/10 fixed bottom-0 left-0 right-0 flex items-center justify-center gap-3 z-40 shadow-2xl backdrop-blur-lg">
        <button onClick={toggleMic} className={`p-3 rounded-2xl border transition-all ${isMicOn ? "bg-white/10 text-white border-white/10" : "bg-rose-500/20 text-rose-400 border-rose-500/30"}`}>
          {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>
        <button onClick={toggleVideo} className={`p-3 rounded-2xl border transition-all ${isVideoOn ? "bg-white/10 text-white border-white/10" : "bg-rose-500/20 text-rose-400 border-rose-500/30"}`}>
          {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
        </button>
        <button onClick={switchCamera} className="p-3 rounded-2xl bg-white/10 border border-white/10 text-slate-300 hover:bg-white/20">
          <SwitchCamera className="w-4 h-4" />
        </button>
        <button onClick={leaveRoom} className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all">
          <PhoneOff className="w-4 h-4" /> কল কাটুন
        </button>
      </footer>
    </div>
  );
}

// Mobile Auto-Play Policy Bypass Video Component
function RemoteVideo({ participant }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElem = videoRef.current;
    if (videoElem && participant.stream) {
      videoElem.srcObject = participant.stream;

      const playVideo = () => {
        videoElem.play().catch((err) => {
          console.warn("Autoplay blocked on mobile, retrying on touch:", err);
        });
      };

      playVideo();

      // মোবাইলে টাচ করলেই ভিডিও যাতে ইনস্ট্যান্ট প্লে হয়ে যায়
      const handleUserTouch = () => {
        if (videoElem.paused) {
          playVideo();
        }
      };

      document.addEventListener("touchstart", handleUserTouch, { once: true });
      return () => {
        document.removeEventListener("touchstart", handleUserTouch);
      };
    }
  }, [participant.stream]);

  return (
    <div className="bg-slate-900/80 rounded-2xl relative min-h-[200px] h-48 sm:h-56 overflow-hidden flex items-center justify-center border border-white/10 shadow-lg">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover" 
      />
      {!participant.stream && (
        <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center">
          <span className="text-xs text-slate-400 animate-pulse">ভিডিও কানেক্ট হচ্ছে...</span>
        </div>
      )}
      <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-[10px] font-medium px-2 py-1 rounded-lg text-white z-10">
        {participant.userName || "Student"}
      </span>
    </div>
  );
}