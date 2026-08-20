import { useState } from "react";
import { BellPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { REMINDER_OPTIONS, type ChurchEvent } from "@/data/church";
import { useChurchStore } from "@/lib/church-store";

export function ReminderDialog({
  event,
  trigger,
}: {
  event: ChurchEvent;
  trigger?: React.ReactNode;
}) {
  const { addReminder } = useChurchStore();
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState("7");

  const label =
    REMINDER_OPTIONS.find((o) => String(o.value) === choice)?.label ?? "7 days before";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="lg">
            <BellPlus className="size-5" aria-hidden="true" /> Add Reminder
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Set a reminder</DialogTitle>
          <DialogDescription className="text-base">
            {event.title} — {event.dateDisplay}
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={choice} onValueChange={setChoice} className="gap-3 py-2">
          {REMINDER_OPTIONS.map((option) => (
            <Label
              key={option.value}
              htmlFor={`reminder-${event.id}-${option.value}`}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 text-base font-medium has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary-soft"
            >
              <RadioGroupItem
                id={`reminder-${event.id}-${option.value}`}
                value={String(option.value)}
              />
              {option.label}
            </Label>
          ))}
        </RadioGroup>

        {!event.exactDate && (
          <p className="rounded-xl bg-accent p-3 text-sm text-accent-foreground">
            The official calendar lists this as “{event.dateDisplay}”. Your reminder is based on the
            start of that period and will be updated once the exact date is confirmed.
          </p>
        )}

        <DialogFooter>
          <Button variant="ghost" size="lg" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            size="lg"
            onClick={() => {
              addReminder(event.id, Number(choice));
              setOpen(false);
              toast.success("Reminder Set", {
                description:
                  Number(choice) === 0
                    ? `You will be reminded on the day of ${event.title}.`
                    : `You will be reminded ${label.replace(" before", "")} before ${event.title}.`,
              });
            }}
          >
            Set reminder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
