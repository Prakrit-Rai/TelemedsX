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

type CallStatus = 'idle' | 'calling' | 'active';
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

  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [isMuted, setIsMuted] = useState(false);

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
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      sender: 'doctor',
      text: messageInput,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput('');
  };

  const handleStartCall = () => {
    setCallStatus('calling');
    setTimeout(() => {
      setCallStatus('active');
    }, 1500);
  };

  const handleEndCall = () => {
    setCallStatus('idle');
    setIsMuted(false);
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

      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL (cleaned) */}
        <div className="lg:col-span-4">
          <Card className="p-6 text-center text-muted-foreground">
            Active consultation will appear here
          </Card>
        </div>

        {/* MAIN AREA */}
        <div className="lg:col-span-8">
          {activePatient ? (
            <Card className="h-[680px] flex flex-col">

              {/* HEADER */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 bg-blue-600 text-white flex items-center justify-center">
                    {activePatient?.name?.charAt(0) || "P"}
                  </Avatar>
                  <div>
                    <h3>{activePatient?.name}</h3>
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
                className="flex-1 flex flex-col"
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
                <TabsContent value="chat" className="flex-1 flex flex-col">

                  <ScrollArea className="flex-1 p-4">
                    {messages.length === 0 ? (
                      <p className="text-center text-muted-foreground">
                        No messages yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${
                              msg.sender === 'doctor'
                                ? 'justify-end'
                                : 'justify-start'
                            }`}
                          >
                            <div
                              className={`p-3 rounded-lg text-sm ${
                                msg.sender === 'doctor'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100'
                              }`}
                            >
                              {msg.text}
                              <div className="text-xs mt-1 opacity-70">
                                {msg.timestamp}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  <div className="p-4 border-t flex gap-2">
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
                  <div className="text-center space-y-6">

                    {callStatus === 'idle' && (
                      <>
                        <h3>Call {activePatient?.name}</h3>
                        <Button onClick={handleStartCall}>
                          <Phone className="w-4 h-4 mr-2" />
                          Start Call
                        </Button>
                      </>
                    )}

                    {callStatus === 'calling' && (
                      <h3>Calling {activePatient?.name}...</h3>
                    )}

                    {callStatus === 'active' && (
                      <>
                        <h3>Connected with {activePatient?.name}</h3>
                        <div className="flex gap-3 justify-center">
                          <Button onClick={() => setIsMuted(!isMuted)}>
                            {isMuted ? <MicOff /> : <Mic />}
                          </Button>
                          <Button variant="destructive" onClick={handleEndCall}>
                            <PhoneOff />
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