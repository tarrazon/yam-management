import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageSquare, Loader2, Mail, CheckCheck } from "lucide-react";
import { messagesPartenairesService } from '@/api/messagesPartenaires';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { Badge } from "@/components/ui/badge";

export default function MessageriePartenaire() {
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then((user) => {
      console.log('Current user:', user);
      setCurrentUser(user);
    });
  }, []);

  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ['messages-partenaires', currentUser?.partenaire_id],
    queryFn: async () => {
      console.log('Fetching messages for partenaire_id:', currentUser.partenaire_id);
      const result = await messagesPartenairesService.list(currentUser.partenaire_id);
      console.log('Messages received:', result);
      return result;
    },
    enabled: !!currentUser?.partenaire_id,
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (error) {
      console.error('Error loading messages:', error);
      toast.error('Erreur lors du chargement des messages');
    }
  }, [error]);

  const sendMessageMutation = useMutation({
    mutationFn: (messageData) => messagesPartenairesService.create(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages-partenaires', currentUser.partenaire_id]);
      setMessage('');
      toast.success('Message envoyé');
    },
    onError: (error) => {
      console.error('Erreur lors de l\'envoi:', error);
      toast.error('Erreur lors de l\'envoi du message');
    }
  });

  const marquerLuMutation = useMutation({
    mutationFn: (id) => messagesPartenairesService.marquerLu(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages-partenaires', currentUser.partenaire_id]);
      queryClient.invalidateQueries(['unread-messages-partenaires', currentUser.partenaire_id]);
    }
  });

  const messagesNonLus = messages.filter(msg => msg.expediteur_type === 'admin' && !msg.lu).length;

  const marquerTousLus = () => {
    const messagesNonLusItems = messages.filter(msg => msg.expediteur_type === 'admin' && !msg.lu);
    messagesNonLusItems.forEach(msg => marquerLuMutation.mutate(msg.id));
    if (messagesNonLusItems.length > 0) {
      toast.success(`${messagesNonLusItems.length} message${messagesNonLusItems.length > 1 ? 's' : ''} marqué${messagesNonLusItems.length > 1 ? 's' : ''} comme lu${messagesNonLusItems.length > 1 ? 's' : ''}`);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !currentUser?.partenaire_id) return;

    await sendMessageMutation.mutateAsync({
      partenaire_id: currentUser.partenaire_id,
      expediteur_type: 'partenaire',
      expediteur_id: currentUser?.id,
      message: message.trim(),
      lu: false
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1E40AF] flex items-center gap-3">
            <MessageSquare className="w-8 h-8" />
            Messagerie
          </h1>
          <p className="text-slate-500 mt-1">Échangez avec l'équipe administrative</p>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-white">
            <CardTitle className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Conversation
                {messages.length > 0 && (
                  <span className="text-sm font-normal text-slate-500">
                    ({messages.length} message{messages.length > 1 ? 's' : ''})
                  </span>
                )}
                {messagesNonLus > 0 && (
                  <Badge className="bg-red-500 text-white">
                    {messagesNonLus} non lu{messagesNonLus > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              {messagesNonLus > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={marquerTousLus}
                  className="text-xs"
                >
                  <CheckCheck className="w-4 h-4 mr-1" />
                  Marquer tout comme lu
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col h-[600px]">
              <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-slate-50 rounded-lg mb-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-full text-red-500">
                    <MessageSquare className="w-16 h-16 mb-4" />
                    <p className="text-lg">Erreur de chargement</p>
                    <p className="text-sm mt-1">{error.message}</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <MessageSquare className="w-16 h-16 mb-4" />
                    <p className="text-lg">Aucun message</p>
                    <p className="text-sm mt-1">Envoyez votre premier message</p>
                    <p className="text-xs mt-1 text-slate-300">Partenaire ID: {currentUser?.partenaire_id}</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isPartenaire = msg.expediteur_type === 'partenaire';
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isPartenaire ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-4 shadow-sm ${
                            isPartenaire
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-slate-800 border border-slate-200'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                              <p
                                className={`text-xs mt-2 ${
                                  isPartenaire ? 'text-blue-100' : 'text-slate-400'
                                }`}
                              >
                                {new Date(msg.created_at).toLocaleString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex gap-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message... (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"
                  className="flex-1 min-h-[100px] resize-none"
                />
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 h-auto px-6"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Envoyer
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
