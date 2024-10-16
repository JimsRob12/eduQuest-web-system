import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface KickedDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KickedDialog({ isOpen, onClose }: KickedDialogProps) {
  const navigate = useNavigate();

  const handleClose = () => {
    onClose();
    navigate("/student/dashboard");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="dark:text-white">
        <DialogHeader>
          <DialogTitle>You have been removed from the game</DialogTitle>
          <DialogDescription>
            The game owner has removed you from this game session. You will be
            redirected to your dashboard.
          </DialogDescription>
        </DialogHeader>
        <Button onClick={handleClose}>OK</Button>
      </DialogContent>
    </Dialog>
  );
}
