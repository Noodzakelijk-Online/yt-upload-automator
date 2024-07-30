import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

const ScheduleUpload = ({ onSchedule }) => {
  const [date, setDate] = useState(new Date());

  const handleDateSelect = (newDate) => {
    setDate(newDate);
    onSchedule(newDate);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Upload</CardTitle>
        <CardDescription>Choose when to publish your video.</CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          className="rounded-md border"
        />
      </CardContent>
    </Card>
  );
};

export default ScheduleUpload;
