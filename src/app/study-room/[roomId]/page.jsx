"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { io } from "socket.io-client";
import { Mic, MicOff, Video, VideoOff, MessageSquare, PhoneOff, Copy, Check } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const SOCKET_SERVER_URL = "https://csthub-backend.vercel.app";

const configuration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ],
};

export default function StudyRoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId;
  const topic = searchParams.get("topic") || "General Discussion";
  const subject = searchParams.get("subject") || "Study Session";

  const [socket, setSocket] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "System", text: `Welcome to CST HUB Study Room! Topic: ${topic}` },
  ]);
  const [inputMsg, setInputMsg] = useState("");

  const userVideoRef = useRef(null);
  const peerVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);

  // Peer Connection তৈরির ফাংশন
  const createPeerConnection = (remoteSocketId, socketInstance) => {
    const pc = new RTCPeerConnection(configuration);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketInstance.emit("ice-candidate", {
          target: remoteSocketId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      console.log("Received remote track");
      if (peerVideoRef.current) {
        peerVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        toast.error("Connection lost");
      }
    };

    return pc;
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        // 1. Camera + Mic
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!mounted) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = mediaStream;
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = mediaStream;
        }

        // 2. Socket
        const localUser = localStorage.getItem("currentUser");
        const parsedUser = localUser ? JSON.parse(localUser) : null;
        const userId = parsedUser?.id || "user-" + Math.random().toString(36).substring(7);

        const newSocket = io(SOCKET_SERVER_URL, {
          extraHeaders: { "user-id": userId },
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        newSocket.on("connect", () => {
          console.log("Connected:", newSocket.id);
          newSocket.emit("join-study-room", roomId);
        });

        // 3. New user joined → create offer
        newSocket.on("user-connected", async ({ socketId: remoteSocketId }) => {
          toast.success("নতুন একজন শিক্ষার্থী যুক্ত হয়েছে!");
          console.log("Creating offer for:", remoteSocketId);

          if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
          }

          const pc = createPeerConnection(remoteSocketId, newSocket);
          peerConnectionRef.current = pc;

          mediaStream.getTracks().forEach((track) => {
            pc.addTrack(track, mediaStream);
          });

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          newSocket.emit("offer", {
            target: remoteSocketId,
            offer,
          });
        });

        // 4. Receive Offer → send Answer
        newSocket.on("offer", async ({ offer, caller }) => {
          console.log("Received offer from:", caller);

          if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
          }

          const pc = createPeerConnection(caller, newSocket);
          peerConnectionRef.current = pc;

          mediaStream.getTracks().forEach((track) => {
            pc.addTrack(track, mediaStream);
          });

          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          newSocket.emit("answer", {
            target: caller,
            answer,
          });
        });

        // 5. Receive Answer
        newSocket.on("answer", async ({ answer }) => {
          console.log("Received answer");
          if (peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(
              new RTCSessionDescription(answer)
            );
          }
        });

        // 6. ICE Candidate
        newSocket.on("ice-candidate", async ({ candidate }) => {
          if (peerConnectionRef.current && candidate) {
            try {
              await peerConnectionRef.current.addIceCandidate(
                new RTCIceCandidate(candidate)
              );
            } catch (e) {
              console.error("Error adding ICE candidate", e);
            }
          }
        });

        // 7. User left
        newSocket.on("user-disconnected", () => {
          toast("শিক্ষার্থী রুম ছেড়ে চলে গেছে।", { icon: "👋" });
          if (peerVideoRef.current) {
            peerVideoRef.current.srcObject = null;
          }
          if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
          }
        });

        // 8. Chat message receive
        newSocket.on("chat-message", ({ sender, text }) => {
          setMessages((prev) => [...prev, { sender, text }]);
        });
      } catch (err) {
        console.error("Camera/Mic error:", err);
        toast.error("ক্যামেরা বা মাইক্রোফোন এক্সেস পাওয়া যায়নি!");
      }
    };

    init();

    // Cleanup
    return () => {
      mounted = false;

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId]);

  // Handlers
  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    toast.success("Room ID কপি করা হয়েছে! বন্ধুদের পাঠিয়ে দাও।");
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicOn;
        setIsMicOn(!isMicOn);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
      }
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !socket) return;

    const message = { sender: "You", text: inputMsg.trim() };
    setMessages((prev) => [...prev, message]);

    // Real-time chat
    socket.emit("chat-message", {
      roomId,
      text: inputMsg.trim(),
    });

    setInputMsg("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xs sm:text-sm font-bold text-white">
              📚 {subject}: {topic}
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[10px] text-slate-400">
              Room ID:{" "}
              <span className="text-indigo-400 font-mono font-semibold">{roomId}</span>
            </p>
            <button
              onClick={handleCopyRoomId}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all flex items-center gap-1 text-[10px] border border-slate-700"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied" : "Copy ID"}</span>
            </button>
          </div>
        </div>

        <Link
          href="/study-room"
          className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold hover:bg-rose-500/20 transition-all flex items-center gap-1.5"
        >
          <PhoneOff className="w-3.5 h-3.5" />
          <span>Leave</span>
        </Link>
      </header>

      {/* Main */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 p-4 sm:p-6 gap-4 overflow-hidden">
        {/* Videos */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
          {/* My Video */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center min-h-[220px]">
            <video
              ref={userVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
            />
            <div className="absolute bottom-3 left-3 z-20">
              <span className="text-xs font-semibold text-white bg-slate-950/70 px-2.5 py-1 rounded-lg backdrop-blur-md">
                You (Host)
              </span>
            </div>
          </div>

          {/* Peer Video */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center min-h-[220px]">
            <video
              ref={peerVideoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 z-20">
              <span className="text-xs font-semibold text-white bg-slate-950/70 px-2.5 py-1 rounded-lg backdrop-blur-md">
                Participant
              </span>
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[300px] lg:h-auto overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 flex items-center gap-2 text-xs font-semibold text-slate-200">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>Study Discussion Chat</span>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60"
              >
                <span className="font-bold text-indigo-400 block mb-0.5">{m.sender}</span>
                <p className="text-slate-300">{m.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask a question..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Controls */}
      <div className="h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-4 shrink-0">
        <button
          onClick={toggleMic}
          className={`p-3.5 rounded-2xl border transition-all ${
            isMicOn
              ? "bg-slate-800 border-slate-700 text-white"
              : "bg-rose-500/20 border-rose-500/30 text-rose-400"
          }`}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3.5 rounded-2xl border transition-all ${
            isVideoOn
              ? "bg-slate-800 border-slate-700 text-white"
              : "bg-rose-500/20 border-rose-500/30 text-rose-400"
          }`}
        >
          {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        <Link
          href="/study-room"
          className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg shadow-rose-600/30"
        >
          <PhoneOff className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}