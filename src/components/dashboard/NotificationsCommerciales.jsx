import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Check, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function NotificationsCommerciales({ notifications = [] }) {
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      const { error } = await supabase
        .from("notifications_commerciales")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications_commerciales"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async (commercialId) => {
      const { error } = await supabase
        .from("notifications_commerciales")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("commercial_id", commercialId)
        .eq("is_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications_commerciales"] });
    },
  });

  const unreadNotifications = notifications.filter(n => !n.is_read);

  const getTypeColor = (type) => {
    switch (type) {
      case "option_posee":
        return "bg-blue-100 text-blue-800";
      case "option_expiree":
        return "bg-red-100 text-red-800";
      case "option_transformee":
        return "bg-green-100 text-green-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "option_posee":
        return "Option posée";
      case "option_expiree":
        return "Option expirée";
      case "option_transformee":
        return "Vente confirmée";
      default:
        return "Notification";
    }
  };

  if (notifications.length === 0) {
    return (
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#1E40AF]">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Aucune notification pour le moment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-[#1E40AF]">
            <Bell className="w-5 h-5" />
            Notifications
            {unreadNotifications.length > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadNotifications.length}
              </Badge>
            )}
          </CardTitle>
          {unreadNotifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate(notifications[0]?.commercial_id)}
              disabled={markAllAsReadMutation.isPending}
            >
              <Check className="w-4 h-4 mr-1" />
              Tout marquer comme lu
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border transition-all ${
                notification.is_read
                  ? "bg-slate-50 border-slate-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getTypeColor(notification.type)}>
                      {getTypeLabel(notification.type)}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {format(new Date(notification.created_at), "dd MMM yyyy 'à' HH:mm", {
                        locale: fr,
                      })}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-1">
                    {notification.titre}
                  </h4>
                  <p className="text-sm text-slate-600">{notification.message}</p>
                </div>
                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsReadMutation.mutate(notification.id)}
                    disabled={markAsReadMutation.isPending}
                    className="shrink-0"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
