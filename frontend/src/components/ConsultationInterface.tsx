import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import {
  Send,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  User,
  MessageSquare,
} from 'lucide-react';
import { Avatar } from './ui/avatar';
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs"
import { getMessages } from "../api/chat";
import { useRef } from "react";
import { getDoctorAppointments } from "../api/appointment";
import { getUserById } from "../api/user";

type ConsultationTab = 'chat' | 'voice';

interface Message {
  id: number;
  sender: 'patient' | 'doctor';
  text: string;
  timestamp: string;
}

export function ConsultationInterface() {
  const [activeTab, setActiveTab] = useState<ConsultationTab>('chat');
  const [activePatient, setActivePatient] = useState<any>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');

  const [meetingLink, setMeetingLink] = useState<string | null>(null);
  const stompClientRef = useRef<Client | null>(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isDoctor = user.role === "DOCTOR";

  const [realNames, setRealNames] = useState<{
  patientName?: string;
  doctorName?: string;
}>({});

  const otherUserName =
    isDoctor
      ? (realNames.patientName ?? "Patient")
      : (realNames.doctorName ?? "Doctor");

  // ✅ Load active patient
  useEffect(() => {
    const stored = localStorage.getItem("activePatient");
    if (stored) {
      setActivePatient(JSON.parse(stored));
    }
  }, []);

  // ✅ Reset messages when patient changes
  useEffect(() => {
    if (activePatient) {
      setMessages([]);
    }
  }, [activePatient]);

const handleSendMessage = () => {
  const client = stompClientRef.current;

  if (!messageInput.trim() || !client || !client.connected || !activePatient) return;

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const chatMessage = {
    appointmentId: activePatient.id,
    senderId: user.id,
    senderRole: isDoctor ? "DOCTOR" : "PATIENT",
    content: messageInput,
  };


  client.publish({
    destination: "/app/chat.send",
    body: JSON.stringify(chatMessage),
  });

  setMessageInput('');
};

useEffect(() => {
  if (!activePatient) return;

  const socket = new SockJS("http://localhost:8081/ws");

  const client = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,

  onConnect: () => {
    console.log("✅ Connected to WebSocket");
    console.log("🔥 STOMP CONNECTED SUCCESSFULLY");
    stompClientRef.current = client; // ✅ store instantly

    client.subscribe(`/topic/chat/${activePatient.id}`, (message) => {
      const received = JSON.parse(message.body);

      console.log("📩 MESSAGE RECEIVED:", received);

      setMessages((prev) => [
        ...prev,
        {
          id: received.id,
          sender: received.senderRole === "DOCTOR" ? "doctor" : "patient",
          text: received.content,
          timestamp: new Date(received.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    });
  },

    onStompError: (frame) => {
      console.error("❌ STOMP error:", frame);
    },
  });

  client.activate();

  return () => {
    if (client) {
      client.deactivate();
    }
  };
}, [activePatient]);

useEffect(() => {
  const loadMessages = async () => {
    if (!activePatient) return;

    try {
      const res = await getMessages(activePatient.id);

      const mapped = res.data.map((msg: any) => ({
        id: msg.id,
        sender: msg.senderRole === "DOCTOR" ? "doctor" : "patient",
        text: msg.content,
        timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }));

      setMessages(mapped);
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  loadMessages();
}, [activePatient]);

useEffect(() => {
  const fetchNames = async () => {
    if (!activePatient) return;

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const res = await getDoctorAppointments(user.id);

      const match = res.data.find(
        (a: any) => a.id === activePatient.id
      );

      console.log("MATCH:", match);

      if (!match) return;

      // 🔥 FETCH REAL USERS USING IDs
      const [doctorRes, patientRes] = await Promise.all([
        getUserById(match.doctorId),
        getUserById(match.patientId),
      ]);

      console.log("DOCTOR DATA:", doctorRes);
      console.log("PATIENT DATA:", patientRes);

      setRealNames({
        doctorName: doctorRes.fullName,
        patientName: patientRes.fullName,
      });

    } catch (err) {
      console.error("Failed to fetch real names", err);
    }
  };

  fetchNames();
}, [activePatient]);

  const handleStartCall = async () => {
    try {
      const res = await fetch(
        `http://localhost:8081/api/generate-meeting/${activePatient.id}`
      );

      const link = await res.text();

      setMeetingLink(link);

      // ✅ OPEN meeting
      window.open(link, "_blank");

      // ✅ SEND LINK IN CHAT (THIS IS WHERE IT GOES)
      const client = stompClientRef.current;

      if (client && client.connected) {
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        client.publish({
          destination: "/app/chat.send",
          body: JSON.stringify({
            appointmentId: activePatient.id,
            senderId: user.id,
            senderRole: isDoctor ? "DOCTOR" : "PATIENT",
            content: `Video consultation started. Join here: ${link}`,
          }),
        });
      }

    } catch (err) {
      console.error("Failed to create meeting", err);
    }
  };

  const handleEndCall = () => {
    const client = stompClientRef.current;

    if (client && client.connected && activePatient) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      client.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({
          appointmentId: activePatient.id,
          senderId: user.id,
          senderRole: isDoctor ? "DOCTOR" : "PATIENT",
          content: "Consultation ended",
        }),
      });
    }

    setMeetingLink(null);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "default";
      case "COMPLETED":
        return "outline";
      case "BOOKED":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">Consultations</h2>
        <p className="text-muted-foreground">Live patient interaction</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6  min-h-0">
        
        {/* LEFT PANEL (cleaned) */}
        <div className="lg:col-span-4">
          <Card className="p-6 text-center text-muted-foreground">
            <Card className="p-4 space-y-3">
              <h3 className="text-sm font-medium">Session Info</h3>

              {activePatient ? (
                <>
                  <p className="text-sm font-medium">
                    {otherUserName}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {isDoctor ? "Patient" : "Doctor"}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No active consultation selected
                </p>
              )}
            </Card>
          </Card>
        </div>

        {/* MAIN AREA */}
        <div className="lg:col-span-8 min-h-0 flex flex-col">
          {activePatient ? (
            <Card className="flex-1 flex flex-col min-h-0">

              {/* HEADER */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 bg-blue-600 text-white flex items-center justify-center">
                    {
                      otherUserName ? otherUserName.charAt(0) : "U"
                    }
                  </Avatar>
                  <div>
                    <h3>{otherUserName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {activePatient?.symptoms || "Consultation"}
                    </p>
                  </div>
                </div>

                <Badge variant={getStatusVariant(activePatient?.status)}>
                  {activePatient?.status}
                </Badge>
              </div>

              {/* TABS */}
              <Tabs
                value={activeTab}
                onValueChange={(v: ConsultationTab) => setActiveTab(v)}
                className="flex-1 flex flex-col h-full"
              >
                <TabsList className="mx-4 mt-4">
                  <TabsTrigger value="chat">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="voice">
                    <Phone className="w-4 h-4 mr-2" />
                    Voice
                  </TabsTrigger>
                </TabsList>

                {/* CHAT */}
                <TabsContent value="chat" className="flex-1 flex flex-col h-full">

                  <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                    
                    <ScrollArea className="flex-1">
                      <div className="h-full overflow-y-auto p-4">
                        {messages.length === 0 ? (
                          <p className="text-center text-muted-foreground">
                            No messages yet
                          </p>
                        ) : (
                          <div className="flex flex-col justify-end min-h-full space-y-3 pb-2">
                            {messages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex w-full ${
                                  (msg.sender === "doctor" && isDoctor) ||
                                  (msg.sender === "patient" && !isDoctor)
                                    ? 'justify-end'
                                    : 'justify-start'
                                }`}
                              >
                                <div
                                  className={`p-3 rounded-lg text-sm max-w-[70%] break-words ${
                                    (msg.sender === "doctor" && isDoctor) ||
                                    (msg.sender === "patient" && !isDoctor)
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-100'
                                  }`}
                                >
                                  <p className="text-xs font-medium mb-1 opacity-80">
                                    {msg.sender === "doctor" ? "Doctor" : "Patient"}
                                  </p>
                                  {msg.text}
                                  <div className="text-xs mt-1 opacity-70 text-right">
                                    {msg.timestamp}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  <div className="p-3 border-t flex gap-2 bg-background">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type message..."
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>

                </TabsContent>

                {/* VOICE */}
                <TabsContent value="voice" className="flex-1 flex items-center justify-center">
                  <div className="w-full max-w-md text-center space-y-6">

                    {!meetingLink ? (
                      <>
                        <h3 className="text-lg font-semibold">Start Video Consultation</h3>
                        <p className="text-sm text-muted-foreground">
                          Generate a secure meeting link for this session
                        </p>

                        <Button
                          className="w-full"
                          onClick={handleStartCall}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Generate Meeting Link
                        </Button>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold">Meeting Ready</h3>
                            <p className="text-green-600 text-sm">
                              Meeting started successfully
                            </p>

                        <div className="p-3 rounded-md bg-muted text-sm break-all">
                          {meetingLink}
                        </div>

                        <div className="flex gap-2 justify-center">
                          <Button onClick={() => window.open(meetingLink, "_blank")}>
                            Join Call
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => navigator.clipboard.writeText(meetingLink)}
                          >
                            Copy
                          </Button>

                          <Button
                            variant="destructive"
                            onClick={handleEndCall}
                          >
                            End
                          </Button>
                        </div>
                      </>
                    )}

                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          ) : (
            <Card className="h-[680px] flex items-center justify-center">
              <p className="text-muted-foreground">
                No active consultation
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}