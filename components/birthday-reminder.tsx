import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  date_of_birth: string;
  daysAway: number;
  daysAwayLabel: string;
}

interface BirthdayReminderProps {
  upcomingBirthdays: User[];
  daysAhead?: number;
}

export function BirthdayReminder({
  upcomingBirthdays,
  daysAhead = 4,
}: BirthdayReminderProps) {
  if (upcomingBirthdays.length === 0) {
    return null;
  }

  return (
    <Card className="mb-8 shadow">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 font-montserrat text-primary">
          <CalendarDays />
          <span>Upcoming Birthdays (Next {daysAhead} Days)</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {upcomingBirthdays.map((user) => (
            <div key={user.id} className="flex items-start space-x-3">
              <CalendarDays className="text-[#4a5a3a] shrink-0" />
              <div>
                <p className="font-medium capitalize">
                  {user.name}{" "}
                  <span className="text-sm text-accent">
                    ({user.daysAwayLabel})
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
