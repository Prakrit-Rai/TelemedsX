import { useState } from 'react';
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
  Video,
  VideoOff,
  User,
  Calendar,
  Clock,
  Plus,
  Search,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { Avatar } from './ui/avatar';

type ConsultationStatus = 'upcoming' | 'ongoing' | 'completed';
type CallStatus = 'idle' | 'calling' | 'active';

interface Message {
  id: number;
  sender: 'patient' | 'doctor';
  text: string;
  timestamp: string;
}

export function ConsultationInterface() {
  const [activeTab, setActiveTab] = useState<'chat' | 'voice'>('chat');
  const [selectedConsultation, setSelectedConsultation] = useState<number | null>(1);
  const [messageInput, setMessageInput] = useState('');
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'doctor',
      text: 'Hello! How can I help you today?',
      timestamp: '10:00 AM',
    },
    {
      id: 2,
      sender: 'patient',
      text: 'I have been experiencing headaches for the past 2 days.',
      timestamp: '10:01 AM',
    },
    {
      id: 3,
      sender: 'doctor',
      text: 'I understand. Can you describe the type of headache? Is it throbbing, sharp, or dull?',
      timestamp: '10:02 AM',
    },
    {
      id: 4,
      sender: 'patient',
      text: 'It feels like a throbbing pain, mostly on the left side of my head.',
      timestamp: '10:03 AM',
    },
  ]);

  const consultations = [
    {
      id: 1,
      doctor: 'Dr. Sita Patel',
      specialization: 'General Medicine',
      date: '2026-01-15',
      time: '10:00 AM',
      status: 'ongoing' as ConsultationStatus,
      avatar: 'SP',
      lastMessage: 'It feels like a throbbing pain...',
    },
    {
      id: 2,
      doctor: 'Dr. Hari Thapa',
      specialization: 'Cardiology',
      date: '2026-01-18',
      time: '2:30 PM',
      status: 'upcoming' as ConsultationStatus,
      avatar: 'HT',
      lastMessage: null,
    },
    {
      id: 3,
      doctor: 'Dr. Ram Sharma',
      specialization: 'Dermatology',
      date: '2026-01-05',
      time: '11:00 AM',
      status: 'completed' as ConsultationStatus,
      avatar: 'RS',
      lastMessage: 'Apply the cream twice daily.',
    },
  ];

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: 'patient',
        text: messageInput,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMessage]);
      setMessageInput('');

      // Simulate doctor response
      setTimeout(() => {
        const doctorResponse: Message = {
          id: messages.length + 2,
          sender: 'doctor',
          text: 'Thank you for that information. Let me review your symptoms.',
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, doctorResponse]);
      }, 1500);
    }
  };

  const handleStartCall = () => {
    setCallStatus('calling');
    setTimeout(() => {
      setCallStatus('active');
    }, 2000);
  };

  const handleEndCall = () => {
    setCallStatus('idle');
    setIsMuted(false);
  };

  const selectedConsultationData = consultations.find((c) => c.id === selectedConsultation);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2">Consultations</h2>
          <p className="text-muted-foreground">Connect with doctors via text or voice</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Consultation
        </Button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Consultations List */}
        <div className="lg:col-span-4">
          <Card className="p-4">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search consultations..." className="pl-10" />
              </div>
            </div>

            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {consultations.map((consultation) => (
                  <Card
                    key={consultation.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedConsultation === consultation.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedConsultation(consultation.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12 bg-blue-600 text-white flex items-center justify-center">
                        {consultation.avatar}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm truncate">{consultation.doctor}</h4>
                          <Badge
                            variant={
                              consultation.status === 'ongoing'
                                ? 'default'
                                : consultation.status === 'upcoming'
                                  ? 'secondary'
                                  : 'outline'
                            }
                            className="text-xs"
                          >
                            {consultation.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{consultation.specialization}</p>
                        {consultation.lastMessage && (
                          <p className="text-xs text-muted-foreground truncate">{consultation.lastMessage}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(consultation.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                          <Clock className="w-3 h-3 ml-2" />
                          {consultation.time}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Chat/Voice Interface */}
        <div className="lg:col-span-8">
          {selectedConsultationData ? (
            <Card className="h-[680px] flex flex-col">
              {/* Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 bg-blue-600 text-white flex items-center justify-center">
                      {selectedConsultationData.avatar}
                    </Avatar>
                    <div>
                      <h3>{selectedConsultationData.doctor}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedConsultationData.specialization}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      selectedConsultationData.status === 'ongoing'
                        ? 'default'
                        : selectedConsultationData.status === 'upcoming'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {selectedConsultationData.status}
                  </Badge>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'chat' | 'voice')} className="flex-1 flex flex-col">
                <TabsList className="mx-4 mt-4">
                  <TabsTrigger value="chat" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Text Chat
                  </TabsTrigger>
                  <TabsTrigger value="voice" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Voice Call
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] ${
                              message.sender === 'patient'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            } rounded-lg p-3`}
                          >
                            <p className="text-sm">{message.text}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.sender === 'patient' ? 'text-blue-100' : 'text-gray-500'
                              }`}
                            >
                              {message.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <div className="p-4 border-t">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                      className="flex gap-2"
                    >
                      <Input
                        placeholder="Type your message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" size="icon">
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </TabsContent>

                <TabsContent value="voice" className="flex-1 flex flex-col items-center justify-center">
                  <div className="text-center space-y-6">
                    {callStatus === 'idle' && (
                      <>
                        <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                          <Phone className="w-16 h-16 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="mb-2">Ready to call {selectedConsultationData.doctor}?</h3>
                          <p className="text-muted-foreground">
                            Make sure you're in a quiet place with good internet connection
                          </p>
                        </div>
                        <Button size="lg" onClick={handleStartCall} className="rounded-full px-8">
                          <Phone className="w-5 h-5 mr-2" />
                          Start Voice Call
                        </Button>
                      </>
                    )}

                    {callStatus === 'calling' && (
                      <>
                        <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                          <Phone className="w-16 h-16 text-white" />
                        </div>
                        <div>
                          <h3 className="mb-2">Calling {selectedConsultationData.doctor}...</h3>
                          <p className="text-muted-foreground">Please wait</p>
                        </div>
                      </>
                    )}

                    {callStatus === 'active' && (
                      <>
                        <div className="w-32 h-32 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                          <User className="w-16 h-16 text-white" />
                        </div>
                        <div>
                          <h3 className="mb-2">Connected with {selectedConsultationData.doctor}</h3>
                          <p className="text-muted-foreground">Call in progress - 02:34</p>
                        </div>
                        <div className="flex gap-4">
                          <Button
                            size="lg"
                            variant={isMuted ? 'destructive' : 'secondary'}
                            onClick={() => setIsMuted(!isMuted)}
                            className="rounded-full"
                          >
                            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                          </Button>
                          <Button
                            size="lg"
                            variant="destructive"
                            onClick={handleEndCall}
                            className="rounded-full px-8"
                          >
                            <PhoneOff className="w-5 h-5 mr-2" />
                            End Call
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
              <div className="text-center text-muted-foreground">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select a consultation to start chatting</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
