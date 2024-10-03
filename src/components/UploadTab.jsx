import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const UploadTab = ({ handleVideoUpload }) => (
  <Card>
    <CardHeader>
      <CardTitle>Step 1: Upload Video</CardTitle>
      <CardDescription>Select your video file to begin the automation process.</CardDescription>
    </CardHeader>
    <CardContent>
      <Label htmlFor="video-upload">Choose video file</Label>
      <Input id="video-upload" type="file" accept="video/*" onChange={handleVideoUpload} className="mt-2" />
    </CardContent>
  </Card>
);

export default UploadTab;