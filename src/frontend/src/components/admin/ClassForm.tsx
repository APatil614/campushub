import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateClass, useUpdateClass } from "@/hooks/useQueries";
import { type ClassSlot, DAY_LABELS, DayOfWeek, WEEKDAYS } from "@/types";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ClassFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided the form edits this slot; otherwise it creates a new one. */
  classSlot?: ClassSlot | null;
}

/** Create/edit dialog for a weekly class slot. */
export function ClassForm({ open, onOpenChange, classSlot }: ClassFormProps) {
  const isEditing = !!classSlot;
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const isPending = createClass.isPending || updateClass.isPending;

  const [subject, setSubject] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(DayOfWeek.monday);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");
  const [instructor, setInstructor] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSubject(classSlot?.subject ?? "");
    setDayOfWeek(classSlot?.dayOfWeek ?? DayOfWeek.monday);
    setStartTime(classSlot?.startTime ?? "");
    setEndTime(classSlot?.endTime ?? "");
    setRoom(classSlot?.room ?? "");
    setInstructor(classSlot?.instructor ?? "");
    setError(null);
  }, [open, classSlot]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!subject.trim() || !startTime || !endTime) {
      setError("Subject, start time, and end time are required.");
      return;
    }
    if (endTime <= startTime) {
      setError("The end time must be after the start time.");
      return;
    }
    setError(null);
    const input = {
      subject: subject.trim(),
      dayOfWeek,
      startTime,
      endTime,
      room: room.trim(),
      instructor: instructor.trim(),
    };
    const onError = (cause: unknown) => {
      setError(
        cause instanceof Error ? cause.message : "Could not save the class.",
      );
    };
    if (isEditing && classSlot) {
      updateClass.mutate(
        { id: classSlot.id, input },
        {
          onSuccess: () => {
            toast.success("Class updated");
            onOpenChange(false);
          },
          onError,
        },
      );
    } else {
      createClass.mutate(input, {
        onSuccess: () => {
          toast.success("Class added");
          onOpenChange(false);
        },
        onError,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="class_form.dialog"
        className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditing ? "Edit class" : "New class"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the class details and save your changes."
              : "Add a class slot to the weekly timetable."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="class-subject">Subject</Label>
            <Input
              id="class-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Advanced Mathematics"
              data-ocid="class_form.subject_input"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="class-day">Day</Label>
              <Select
                value={dayOfWeek}
                onValueChange={(value) => setDayOfWeek(value as DayOfWeek)}
              >
                <SelectTrigger
                  id="class-day"
                  className="w-full"
                  data-ocid="class_form.day_select"
                >
                  <SelectValue placeholder="Choose a day" />
                </SelectTrigger>
                <SelectContent>
                  {WEEKDAYS.map((day) => (
                    <SelectItem key={day} value={day}>
                      {DAY_LABELS[day]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="class-room">Room</Label>
              <Input
                id="class-room"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. B-204"
                data-ocid="class_form.room_input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class-start">Start time</Label>
              <Input
                id="class-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                data-ocid="class_form.start_input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class-end">End time</Label>
              <Input
                id="class-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                data-ocid="class_form.end_input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class-instructor">Instructor</Label>
            <Input
              id="class-instructor"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              placeholder="e.g. Dr. Rivera"
              data-ocid="class_form.instructor_input"
            />
          </div>

          {error ? (
            <p
              role="alert"
              data-ocid="class_form.error_state"
              className="text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="class_form.cancel_button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="class_form.submit_button"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {isEditing ? "Save changes" : "Add class"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
