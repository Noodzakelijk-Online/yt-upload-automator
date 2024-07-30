import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

const RetroactiveUpdate = () => {
  const [videos, setVideos] = useState([
    { id: 1, title: 'Video 1', needsUpdate: true },
    { id: 2, title: 'Video 2', needsUpdate: false },
    { id: 3, title: 'Video 3', needsUpdate: true },
  ]);

  const handleUpdateVideos = () => {
    // TODO: Implement actual update logic
    console.log('Updating videos:', videos.filter(v => v.needsUpdate));
  };

  const toggleVideoUpdate = (id) => {
    setVideos(videos.map(v => v.id === id ? { ...v, needsUpdate: !v.needsUpdate } : v));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Retroactive Video Updates</CardTitle>
        <CardDescription>Apply new features to your existing videos.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Needs Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map((video) => (
              <TableRow key={video.id}>
                <TableCell>{video.title}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={video.needsUpdate}
                    onCheckedChange={() => toggleVideoUpdate(video.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button onClick={handleUpdateVideos} className="mt-4">Update Selected Videos</Button>
      </CardContent>
    </Card>
  );
};

export default RetroactiveUpdate;
