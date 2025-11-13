import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2, X } from "lucide-react";

export default function DeleteConfirmDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  title, 
  description,
  itemName,
  warningMessage,
  isDeleting = false 
}) {
  const [confirmText, setConfirmText] = useState("");
  const isConfirmed = confirmText.toLowerCase() === "supprimer";

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
      setConfirmText("");
    }
  };

  const handleClose = () => {
    setConfirmText("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2 text-xl">
            <AlertTriangle className="w-6 h-6" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-slate-600 pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
            <p className="font-semibold text-slate-800 mb-2">{itemName}</p>
            {warningMessage && (
              <div className="space-y-2 mt-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{warningMessage}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-semibold">
              Pour confirmer la suppression, tapez <span className="font-mono text-red-600">SUPPRIMER</span>
            </Label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="SUPPRIMER"
              className="font-mono uppercase"
              autoComplete="off"
            />
          </div>

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800">
              ⚠️ <strong>Attention :</strong> Cette action est <strong>irréversible</strong>. 
              Toutes les données associées seront définitivement perdues.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isDeleting}
          >
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!isConfirmed || isDeleting}
            className={`${
              isConfirmed 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-slate-300 cursor-not-allowed'
            } text-white`}
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer définitivement
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}