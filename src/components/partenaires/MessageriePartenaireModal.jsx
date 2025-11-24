import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import { messagesPartenairesService } from '@/api/messagesPartenaires';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function MessageriePartenaireModal({ open, onClose, partenaire }) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ['messages-partenaires', partenaire?.id],
    queryFn: async () => {
      console.log('Fetching messages for partenaire:', partenaire.id);
      const result = await messagesPartenairesService.list(partenaire.id);
      console.log('Messages received:', result);
      return result;
    },
    enabled: !!partenaire?.id && open,
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
      queryClient.invalidateQueries(['messages-partenaires', partenaire.id]);
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
      queryClient.invalidateQueries(['messages-partenaires', partenaire.id]);
      queryClient.invalidateQueries(['unread-messages-partenaires', partenaire.id]);
    }
  });

  useEffect(() => {
    if (messages.length > 0) {
      messages
        .filter(msg => msg.expediteur_type === 'partenaire' && !msg.lu)
        .forEach(msg => marquerLuMutation.mutate(msg.id));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    await sendMessageMutation.mutateAsync({
      partenaire_id: partenaire.id,
      expediteur_type: 'admin',
      expediteur_id: user?.id,
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Messagerie - {partenaire?.nom || partenaire?.societe}
            {messages.length > 0 && (
              <span className="text-sm font-normal text-slate-500">
                ({messages.length} message{messages.length > 1 ? 's' : ''})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-white rounded-lg min-h-[400px] border border-slate-200">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-red-500">
              <MessageSquare className="w-12 h-12 mb-2" />
              <p>Erreur de chargement</p>
              <p className="text-xs mt-1">{error.message}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <MessageSquare className="w-12 h-12 mb-2" />
              <p>Aucun message</p>
              <p className="text-xs mt-1">Partenaire ID: {partenaire?.id}</p>
            </div>
          ) : (
            <>
              {console.log('Rendering messages:', messages)}
              {messages.map((msg) => {
                const isAdmin = msg.expediteur_type === 'admin';
                return (
                <div
                  key={msg.id}
                  className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 shadow-sm ${
                      isAdmin
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-800 border border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isAdmin ? 'text-blue-100' : 'text-slate-400'
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
              })}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tapez votre message... (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"
            className="flex-1 min-h-[80px] resize-none"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Envoyer
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
