import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EXPLANATIONS } from "@/data/explanations";
import { BookOpen } from "lucide-react";

export default function ExplanationDialog({ argument, open, onOpenChange }) {
  if (!argument) return null;
  const explanation = EXPLANATIONS[argument] || "Explicação não disponível para este argumento.";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-600 text-base">
            <BookOpen className="w-5 h-5 shrink-0" /> Por que isso é equivocado?
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="bg-rose-50 border-2 border-rose-200 rounded-xl px-4 py-3">
            <p className="font-bold text-slate-800 text-sm italic">"{argument}"</p>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{explanation}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}