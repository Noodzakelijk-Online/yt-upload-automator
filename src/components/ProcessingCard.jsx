import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const ProcessingCard = ({ progress }) => (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle>Processing Video</CardTitle>
      <CardDescription>Automating video upload process</CardDescription>
    </CardHeader>
    <CardContent>
      <Progress value={progress} className="w-full" />
      <p className="text-sm text-center mt-2">Progress: {Math.round(progress)}%</p>
    </CardContent>
  </Card>
);

export default ProcessingCard;