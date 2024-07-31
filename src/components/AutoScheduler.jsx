import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";

const AutoScheduler = ({ videoData, onSchedule }) => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [scheduledTime, setScheduledTime] = useState(null);

  useEffect(() => {
    fetchPlaylists();
    fetchOptimalScheduleTime();
  }, [fetchPlaylists, fetchOptimalScheduleTime]);

  const fetchPlaylists = async () => {
    // TODO: Implement actual playlist fetching from YouTube API
    const mockPlaylists = [
      { id: 'A', name: 'Playlist A', frequency: 2, startTime: '09:00', endTime: '17:00' },
      { id: 'B', name: 'Playlist B', frequency: 1, startTime: '12:00', endTime: '20:00' },
      { id: 'C', name: 'Playlist C', frequency: 3, startTime: '15:00', endTime: '23:00' },
    ];
    setPlaylists(mockPlaylists);
  };

  const fetchOptimalScheduleTime = async () => {
    // TODO: Implement actual optimal time calculation based on analytics
    const mockOptimalTime = new Date();
    mockOptimalTime.setDate(mockOptimalTime.getDate() + 7); // Schedule a week from now
    mockOptimalTime.setHours(15, 0, 0, 0); // Set to 3 PM
    setScheduledTime(mockOptimalTime);
  };

  const handlePlaylistSelect = useCallback((playlistId) => {
    setSelectedPlaylist(playlistId);
  }, []);

  const handleSchedule = () => {
    if (selectedPlaylist && scheduledTime) {
      onSchedule(selectedPlaylist, scheduledTime);
    }
  };

  const updatePlaylistFrequency = (playlistId, newFrequency) => {
    setPlaylists(playlists.map(playlist =>
      playlist.id === playlistId ? { ...playlist, frequency: newFrequency } : playlist
    ));
  };

  const updatePlaylistTimeRange = (playlistId, startTime, endTime) => {
    setPlaylists(playlists.map(playlist =>
      playlist.id === playlistId ? { ...playlist, startTime, endTime } : playlist
    ));
  };

  const removePlaylist = (playlistId) => {
    setPlaylists(playlists.filter(playlist => playlist.id !== playlistId));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auto Scheduler</CardTitle>
        <CardDescription>Optimize your video publishing schedule</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="playlist-select">Select Playlist</Label>
          <Select onValueChange={handlePlaylistSelect}>
            <SelectTrigger id="playlist-select">
              <SelectValue placeholder="Choose a playlist" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No Playlist</SelectItem>
              {playlists.map((playlist) => (
                <SelectItem key={playlist.id} value={playlist.id}>
                  {playlist.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="scheduled-time">Optimal Scheduled Time</Label>
          <Input
            id="scheduled-time"
            type="datetime-local"
            value={scheduledTime ? scheduledTime.toISOString().slice(0, 16) : ''}
            onChange={(e) => setScheduledTime(new Date(e.target.value))}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Playlist</TableHead>
              <TableHead>Frequency (per week)</TableHead>
              <TableHead>Time Range</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playlists.map((playlist) => (
              <TableRow key={playlist.id}>
                <TableCell>{playlist.name}</TableCell>
                <TableCell>
                  <Slider
                    value={[playlist.frequency]}
                    onValueChange={(value) => updatePlaylistFrequency(playlist.id, value[0])}
                    min={1}
                    max={7}
                    step={1}
                    className="w-[100px]"
                  />
                  {playlist.frequency}/week
                </TableCell>
                <TableCell>
                  <Input
                    type="time"
                    value={playlist.startTime}
                    onChange={(e) => updatePlaylistTimeRange(playlist.id, e.target.value, playlist.endTime)}
                    className="w-24 inline-block mr-2"
                  />
                  -
                  <Input
                    type="time"
                    value={playlist.endTime}
                    onChange={(e) => updatePlaylistTimeRange(playlist.id, playlist.startTime, e.target.value)}
                    className="w-24 inline-block ml-2"
                  />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => removePlaylist(playlist.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button onClick={handleSchedule}>Set Schedule</Button>
      </CardContent>
    </Card>
  );
};

export default AutoScheduler;
