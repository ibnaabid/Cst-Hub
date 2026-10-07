"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, 
  SwitchCamera, Send, Users, MessageSquare, ShieldAlert 
} from "lucide-react";

const MAX_ROOM_LIMIT = 5; // সর্বোচ্চ ৫ জনের লিমিট

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
  
  const [myName] = useState(() => "User_" + Math.floor(1000 + Math.random() * 9000));

  const myVideoRef = useRef(null);
  const streamRef = useRef(null); // রিলোড ছাড়া ইনস্ট্যান্ট ক্যামেরা অফ করার জন্য গ্লোবাল রেফ
  const peersRef = useRef({});
  const videoRefs = useRef(new Map());
  const pendingIceCandidatesRef = useRef(new Map());

  const ICE_SERVERS = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  // 🔊 সাউন্ড এফেক্ট প্লে করার ফাংশন
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

  // ১. মিডিয়া স্ট্রিম এবং ক্যামেরা পারমিশন হ্যান্ডেলিং (streamRef সহ)
  useEffect(() => {
    async function initMedia() {
      try {
        setPermissionError(null);
        
        // পুরানো স্ট্রিম থাকলে তা বন্ধ করে নেওয়া
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        const currentStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode },
          audio: true,
        });
        
        streamRef.current = currentStream; // রেফ-এ সেভ রাখলাম
        setStream(currentStream);
        
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = currentStream;
        }
      } catch (err) {
        console.error("Camera/Mic permission denied or error:", err);
        setPermissionError("ক্যামেরা বা মাইক্রোফোনের পারমিশন পাওয়া যায়নি। ব্রাউজার সেটিংস থেকে পারমিশন অ্যালাউ করুন।");
      }
    }

    initMedia();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
        streamRef.current = null;
      }
    };
  }, [facingMode]);

  // 🛑 ট্যাব পরিবর্তন করলে বা মিনিমাইজ করলে রিলোড ছাড়াই ক্যামেরা অটো অফ ফিক্স
  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     if (document.hidden) {
  //       if (streamRef.current) {
  //         streamRef.current.getTracks().forEach((track) => {
  //           track.stop();
  //           track.enabled = false;
  //         });
  //       }
  //       if (myVideoRef.current) {
  //         myVideoRef.current.srcObject = null;
  //       }
  //     }
  //   };

  //   document.addEventListener("visibilitychange", handleVisibilityChange);
  //   return () => {
  //     document.removeEventListener("visibilitychange", handleVisibilityChange);
  //   };
  // }, []);

  // ২. Socket.io এবং WebRTC কানেকশন সেটআপ
  // ২. Socket.io এবং WebRTC কানেকশন সেটআপ
useEffect(() => {
  if (!roomId) return;

  const newSocket = io(
    "https://csthub-backend-dw3l.onrender.com",
    {
      transports: ["websocket", "polling"],
    }
  );

  setSocket(newSocket);

  newSocket.on("connect", () => {
    console.log(
      "Connected to signaling server:",
      newSocket.id
    );

    newSocket.emit("join-room", {
      roomId,
      userName: myName,
    });
  });

  newSocket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);

    setMessages((prev) => [
      ...prev,
      {
        sender: "System",
        text: "Server-এর সাথে কানেক্ট করা যাচ্ছে না। একটু পরে চেষ্টা করুন।",
      },
    ]);
  });

  // রুম ফুল
  newSocket.on("room-full", () => {
    setRoomFullError(true);
    playSound("leave");
  });

  // নতুন user
  newSocket.on(
    "user-connected",
    async ({ socketId, userName }) => {
      console.log("User connected:", socketId, userName);

      playSound("join");

      setMessages((prev) => [
        ...prev,
        {
          sender: "System",
          text: `${userName || "একজন নতুন মেম্বার"} রুমে জয়েন করেছে।`,
        },
      ]);

      const peerConnection = createPeerConnection(
        socketId,
        userName,
        newSocket
      );

      peersRef.current[socketId] = peerConnection;

      try {
        if (streamRef.current) {
          streamRef.current
            .getTracks()
            .forEach((track) => {
              peerConnection.addTrack(
                track,
                streamRef.current
              );
            });
        }

        const offer =
          await peerConnection.createOffer();

        await peerConnection.setLocalDescription(
          offer
        );

        newSocket.emit("offer", {
          target: socketId,
          offer,
          senderName: myName,
        });
      } catch (err) {
        console.error(
          "Error creating offer:",
          err
        );
      }
    }
  );

  // Offer
  newSocket.on(
    "offer",
    async ({
      sender,
      offer,
      senderName,
    }) => {
      let peerConnection =
        peersRef.current[sender];

      if (!peerConnection) {
        peerConnection =
          createPeerConnection(
            sender,
            senderName,
            newSocket
          );

        peersRef.current[sender] =
          peerConnection;
      }

      try {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );

        await processPendingIceCandidates(
          sender,
          peerConnection
        );

        if (streamRef.current) {
          streamRef.current
            .getTracks()
            .forEach((track) => {
              peerConnection.addTrack(
                track,
                streamRef.current
              );
            });
        }

        const answer =
          await peerConnection.createAnswer();

        await peerConnection.setLocalDescription(
          answer
        );

        newSocket.emit("answer", {
          target: sender,
          answer,
        });
      } catch (err) {
        console.error(
          "Error handling offer:",
          err
        );
      }
    }
  );

  // Answer
  newSocket.on(
    "answer",
    async ({ sender, answer }) => {
      const peerConnection =
        peersRef.current[sender];

      if (peerConnection) {
        try {
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(answer)
          );

          await processPendingIceCandidates(
            sender,
            peerConnection
          );
        } catch (err) {
          console.error(
            "Error handling answer:",
            err
          );
        }
      }
    }
  );

  // ICE
  newSocket.on(
    "ice-candidate",
    async ({
      sender,
      candidate,
    }) => {
      const peerConnection =
        peersRef.current[sender];

      if (!candidate) return;

      const candidateObj =
        new RTCIceCandidate(candidate);

      if (
        peerConnection &&
        peerConnection.remoteDescription
      ) {
        try {
          await peerConnection.addIceCandidate(
            candidateObj
          );
        } catch (err) {
          console.error(
            "Error adding ICE candidate:",
            err
          );
        }
      } else {
        if (
          !pendingIceCandidatesRef.current.has(
            sender
          )
        ) {
          pendingIceCandidatesRef.current.set(
            sender,
            []
          );
        }

        pendingIceCandidatesRef.current
          .get(sender)
          .push(candidateObj);
      }
    }
  );

  // User disconnect
  newSocket.on(
    "user-disconnected",
    ({ socketId, userName }) => {
      console.log(
        "User disconnected:",
        socketId
      );

      playSound("leave");

      setMessages((prev) => [
        ...prev,
        {
          sender: "System",
          text: `${userName || "একজন মেম্বার"} রুম ছেড়ে চলে গেছে।`,
        },
      ]);

      if (peersRef.current[socketId]) {
        peersRef.current[socketId].close();

        delete peersRef.current[socketId];
      }

      setParticipants((prev) =>
        prev.filter(
          (p) => p.socketId !== socketId
        )
      );

      videoRefs.current.delete(socketId);

      pendingIceCandidatesRef.current.delete(
        socketId
      );
    }
  );

  // User status
  newSocket.on(
    "user-status-changed",
    ({
      socketId,
      isAudioOn,
      isVideoOn,
    }) => {
      setParticipants((prev) =>
        prev.map((p) =>
          p.socketId === socketId
            ? {
                ...p,
                isAudioOn,
                isVideoOn,
              }
            : p
        )
      );
    }
  );

  // Chat
  newSocket.on(
    "chat-message",
    ({ sender, message }) => {
      setMessages((prev) => [
        ...prev,
        {
          sender,
          text: message,
        },
      ]);
    }
  );

  return () => {
    newSocket.disconnect();

    Object.values(
      peersRef.current
    ).forEach((pc) => {
      pc.close();
    });

    peersRef.current = {};

    pendingIceCandidatesRef.current.clear();
  };
}, [roomId, myName]);

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

  // কন্ট্রোল ফাংশনসমূহ
  const toggleMic = () => {
    playSound('click');
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);

        if (socket) {
          socket.emit("toggle-status", { roomId, isAudioOn: audioTrack.enabled, isVideoOn });
        }
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

        if (socket) {
          socket.emit("toggle-status", { roomId, isAudioOn: isMicOn, isVideoOn: videoTrack.enabled });
        }
      }
    }
  };

  const switchCamera = () => {
    playSound('click');
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  // 🚀 রুম থেকে লিভ নিলে রিলোড ছাড়াই ইনস্ট্যান্ট ক্যামেরা অফ হওয়ার লজিক
  const leaveRoom = () => {
    playSound('leave');

    // ১. সরাসরি streamRef দিয়ে সমস্ত ট্র্যাক ইনস্ট্যান্ট অফ করা
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }

    // ২. ভিডিও এলিমেন্ট ক্লিয়ার করা
    if (myVideoRef.current) {
      myVideoRef.current.srcObject = null;
    }

    // ৩. পিয়ার কানেকশন ও সকেট ক্লোজ করা
    Object.values(peersRef.current).forEach((pc) => pc.close());
    peersRef.current = {};

    if (socket) {
      socket.disconnect();
    }

    // ৪. হোম পেজে রিডাইরেক্ট
    router.push("/");
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    playSound('click');

    const msgData = { roomId, message: inputMsg, sender: myName };
    setMessages((prev) => [...prev, { sender: myName, text: inputMsg }]);
    
    if (socket) {
      socket.emit("chat-message", msgData);
    }
    setInputMsg("");
  };

  // রুম ফুল হলে
  if (roomFullError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-slate-100 p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold mb-2">রুমটি পূর্ণ (Room Full)</h2>
        <p className="text-sm text-slate-400 mb-6">এই স্টাডি রুমে সর্বোচ্চ ৫ জন যুক্ত হতে পারে। বর্তমানে রুমটি পূর্ণ রয়েছে।</p>
        <button 
          onClick={() => { playSound('click'); router.push("/"); }}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition"
        >
          হোমে ফিরে যান
        </button>
      </div>
    );
  }

  const totalMembers = participants.length + 1;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 overflow-hidden">
      {/* HEADER */}
      <header className="h-16 bg-slate-900/60 backdrop-blur-lg border-b border-white/10 px-6 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <h1 className="text-sm font-semibold tracking-wide text-indigo-300">স্টাডি রুম: {roomId}</h1>
        </div>
        <div className="flex items-center gap-2 text-xs bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl backdrop-blur-md">
          <Users className="w-4 h-4 text-indigo-400" />
          <span>{totalMembers} / {MAX_ROOM_LIMIT} জন উপস্থিত</span>
        </div>
      </header>

      {/* PERMISSION ERROR ALERT */}
      {permissionError && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 py-3 flex items-center gap-3 text-rose-400 text-xs shrink-0">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{permissionError}</span>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* VIDEO GRID */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto content-start">
          {/* My Video */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl relative overflow-hidden min-h-[230px] flex items-center justify-center shadow-2xl backdrop-blur-md">
            <video
              ref={myVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
            />
            {!isVideoOn && (
              <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center">
                <span className="text-xs text-slate-400 font-medium">ক্যামেরা অফ আছে</span>
              </div>
            )}
            
            <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-white bg-black/50 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
                {myName} (আপনি)
              </span>
              <div className="flex items-center gap-1.5 bg-black/50 px-2 py-1 rounded-lg backdrop-blur-md border border-white/10">
                {isMicOn ? (
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <MicOff className="w-3.5 h-3.5 text-rose-500" />
                )}
                {isVideoOn ? (
                  <Video className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <VideoOff className="w-3.5 h-3.5 text-rose-500" />
                )}
              </div>
            </div>
          </div>

          {/* Participant Videos */}
          {participants.map((participant) => (
            <ParticipantVideo 
              key={participant.socketId} 
              participant={participant} 
              videoRefs={videoRefs} 
            />
          ))}
        </div>

        {/* CHAT SIDEBAR */}
        <div className="w-80 bg-slate-900/40 border border-white/10 rounded-2xl hidden lg:flex flex-col overflow-hidden backdrop-blur-xl shadow-2xl">
          <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-white/5">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-200">রুম চ্যাট ও নোটিফিকেশন</h2>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((message, index) => (
              <div key={index} className={`p-2.5 rounded-xl border ${
                message.sender === "System" 
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-300 text-center text-[11px]" 
                  : "bg-white/5 border-white/10"
              }`}>
                {message.sender !== "System" && (
                  <span className="text-[10px] font-bold text-indigo-400 block mb-0.5">{message.sender}</span>
                )}
                <p className="text-xs text-slate-300">{message.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex gap-2 bg-white/5">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="মেসেজ লিখো..."
              className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shrink-0 shadow-lg shadow-indigo-600/30"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* CONTROLS FOOTER */}
      <footer className="h-20 bg-slate-900/80 backdrop-blur-2xl border-t border-white/10 px-4 sm:px-6 flex items-center justify-center gap-3 shrink-0 shadow-2xl">
        <button
          onClick={toggleMic}
          className={`p-3.5 rounded-2xl border transition flex items-center justify-center shadow-lg ${
            isMicOn
              ? "bg-white/10 border-white/10 text-white hover:bg-white/20"
              : "bg-rose-500/20 border-rose-500/30 text-rose-400 hover:bg-rose-500/30"
          }`}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3.5 rounded-2xl border transition flex items-center justify-center shadow-lg ${
            isVideoOn
              ? "bg-white/10 border-white/10 text-white hover:bg-white/20"
              : "bg-rose-500/20 border-rose-500/30 text-rose-400 hover:bg-rose-500/30"
          }`}
        >
          {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        <button
          onClick={switchCamera}
          className="p-3.5 rounded-2xl bg-white/10 border border-white/10 text-slate-300 hover:bg-white/20 transition flex items-center justify-center shadow-lg"
        >
          <SwitchCamera className="w-5 h-5" />
        </button>

        <button
          onClick={leaveRoom}
          className="px-5 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition flex items-center gap-2 shadow-lg shadow-rose-600/30"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
}

/* PARTICIPANT VIDEO COMPONENT */
function ParticipantVideo({ participant, videoRefs }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
      videoRefs.current.set(participant.socketId, videoRef.current);
    }
  }, [participant.stream, participant.socketId, videoRefs]);

  const isAudioOn = participant.isAudioOn !== false;
  const isVideoOn = participant.isVideoOn !== false;

  return (
    <div className="bg-slate-900/80 border border-white/10 rounded-2xl relative overflow-hidden min-h-[230px] flex items-center justify-center shadow-2xl backdrop-blur-md">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`absolute inset-0 w-full h-full object-cover ${!isVideoOn ? "hidden" : ""}`}
      />
      {!isVideoOn && (
        <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center">
          <span className="text-xs text-slate-400 font-medium">ক্যামেরা অফ আছে</span>
        </div>
      )}
      
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-white bg-black/50 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
          {participant.userName || "রিমোট ইউজার"}
        </span>
        <div className="flex items-center gap-1.5 bg-black/50 px-2 py-1 rounded-lg backdrop-blur-md border border-white/10">
          {isAudioOn ? (
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <MicOff className="w-3.5 h-3.5 text-rose-500" />
          )}
          {isVideoOn ? (
            <Video className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <VideoOff className="w-3.5 h-3.5 text-rose-500" />
          )}
        </div>
      </div>
    </div>
  );
}